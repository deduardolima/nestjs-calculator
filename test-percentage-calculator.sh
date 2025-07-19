#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
PERCENTAGE_ENDPOINT="$BASE_URL/calculators/percentage"

echo -e "${BLUE}📊 INICIANDO TESTES DA CALCULADORA DE PORCENTAGEM${NC}"
echo "======================================================="
echo -e "${CYAN}Endpoint base: $PERCENTAGE_ENDPOINT${NC}"
echo "======================================================="

# Função para fazer requisições e medir tempo
test_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\n${YELLOW}📋 Teste: $description${NC}"
    echo "Endpoint: $method $endpoint"
    if [ ! -z "$data" ]; then
        echo "Dados: $data"
    fi
    
    start_time=$(date +%s%N)
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$endpoint")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE "$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$endpoint")
    fi
    end_time=$(date +%s%N)
    
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✅ Sucesso (${http_code}) - ${duration}ms${NC}"
        echo "Resposta: $response_body" | jq . 2>/dev/null || echo "$response_body"
    else
        echo -e "${RED}❌ Erro (${http_code}) - ${duration}ms${NC}"
        echo "Resposta: $response_body"
    fi
    
    return $http_code
}

# 1. Testar conexão do cache
echo -e "\n${BLUE}🔗 1. TESTE DE CONEXÃO DO CACHE${NC}"
test_request "GET" "$PERCENTAGE_ENDPOINT/cache/test" "" "Verificar conexão do cache"

# 2. Limpar cache antes dos testes
echo -e "\n${BLUE}🧹 2. LIMPEZA INICIAL DO CACHE${NC}"
test_request "DELETE" "$PERCENTAGE_ENDPOINT/cache" "" "Limpar todo o cache"

# 3. Testes de cálculo de percentual - Cache MISS/HIT
echo -e "\n${BLUE}📊 3. TESTES DE CÁLCULO DE PERCENTUAL${NC}"

echo -e "\n${YELLOW}3.1 Calcular 15% de 1000 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/calculate" \
    '{"value": 1000, "percentage": 15}' \
    "Primeira chamada - deve ser CACHE MISS"

echo -e "\n${YELLOW}3.2 Calcular 15% de 1000 - Cache HIT${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/calculate" \
    '{"value": 1000, "percentage": 15}' \
    "Segunda chamada - deve ser CACHE HIT"

echo -e "\n${YELLOW}3.3 Calcular 25% de 800 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/calculate" \
    '{"value": 800, "percentage": 25}' \
    "Percentual diferente - deve ser CACHE MISS"

echo -e "\n${YELLOW}3.4 Calcular 0% de 500 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/calculate" \
    '{"value": 500, "percentage": 0}' \
    "Percentual zero - deve ser CACHE MISS"

echo -e "\n${YELLOW}3.5 Calcular 100% de 250 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/calculate" \
    '{"value": 250, "percentage": 100}' \
    "Percentual 100% - deve ser CACHE MISS"

# 4. Testes de percentual de um valor - Cache MISS/HIT
echo -e "\n${BLUE}🔢 4. TESTES DE PERCENTUAL REPRESENTATIVO${NC}"

echo -e "\n${YELLOW}4.1 Que % 250 representa de 1000 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/percentage-of" \
    '{"part": 250, "total": 1000}' \
    "Primeira chamada - deve ser CACHE MISS"

echo -e "\n${YELLOW}4.2 Que % 250 representa de 1000 - Cache HIT${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/percentage-of" \
    '{"part": 250, "total": 1000}' \
    "Segunda chamada - deve ser CACHE HIT"

echo -e "\n${YELLOW}4.3 Que % 75 representa de 300 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/percentage-of" \
    '{"part": 75, "total": 300}' \
    "Valores diferentes - deve ser CACHE MISS"

echo -e "\n${YELLOW}4.4 Que % 150 representa de 150 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/percentage-of" \
    '{"part": 150, "total": 150}' \
    "Parte igual ao total - deve ser CACHE MISS"

# 5. Testes de variação percentual - Cache MISS/HIT
echo -e "\n${BLUE}📈 5. TESTES DE VARIAÇÃO PERCENTUAL${NC}"

echo -e "\n${YELLOW}5.1 Variação de 100 para 120 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/percentage-change" \
    '{"oldValue": 100, "newValue": 120}' \
    "Primeira chamada - deve ser CACHE MISS"

echo -e "\n${YELLOW}5.2 Variação de 100 para 120 - Cache HIT${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/percentage-change" \
    '{"oldValue": 100, "newValue": 120}' \
    "Segunda chamada - deve ser CACHE HIT"

echo -e "\n${YELLOW}5.3 Variação de 200 para 150 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/percentage-change" \
    '{"oldValue": 200, "newValue": 150}' \
    "Variação negativa - deve ser CACHE MISS"

echo -e "\n${YELLOW}5.4 Variação de 50 para 50 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/percentage-change" \
    '{"oldValue": 50, "newValue": 50}' \
    "Sem variação - deve ser CACHE MISS"

echo -e "\n${YELLOW}5.5 Variação de 10 para 30 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/percentage-change" \
    '{"oldValue": 10, "newValue": 30}' \
    "Variação grande - deve ser CACHE MISS"

# 6. Testes de valor a partir de percentual - Cache MISS/HIT
echo -e "\n${BLUE}💰 6. TESTES DE VALOR A PARTIR DE PERCENTUAL${NC}"

echo -e "\n${YELLOW}6.1 Se 25% = 50, quanto é 100% - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/value-from-percentage" \
    '{"percentage": 25, "percentageValue": 50}' \
    "Primeira chamada - deve ser CACHE MISS"

echo -e "\n${YELLOW}6.2 Se 25% = 50, quanto é 100% - Cache HIT${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/value-from-percentage" \
    '{"percentage": 25, "percentageValue": 50}' \
    "Segunda chamada - deve ser CACHE HIT"

echo -e "\n${YELLOW}6.3 Se 80% = 400, quanto é 100% - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/value-from-percentage" \
    '{"percentage": 80, "percentageValue": 400}' \
    "Percentual alto - deve ser CACHE MISS"

echo -e "\n${YELLOW}6.4 Se 5% = 25, quanto é 100% - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/value-from-percentage" \
    '{"percentage": 5, "percentageValue": 25}' \
    "Percentual baixo - deve ser CACHE MISS"

# 7. Testes de desconto - Cache MISS/HIT
echo -e "\n${BLUE}💸 7. TESTES DE DESCONTO${NC}"

echo -e "\n${YELLOW}7.1 Desconto de 20% em R\$ 100 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/discount" \
    '{"originalPrice": 100, "discountPercentage": 20}' \
    "Primeira chamada - deve ser CACHE MISS"

echo -e "\n${YELLOW}7.2 Desconto de 20% em R\$ 100 - Cache HIT${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/discount" \
    '{"originalPrice": 100, "discountPercentage": 20}' \
    "Segunda chamada - deve ser CACHE HIT"

echo -e "\n${YELLOW}7.3 Desconto de 50% em R\$ 200 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/discount" \
    '{"originalPrice": 200, "discountPercentage": 50}' \
    "Desconto alto - deve ser CACHE MISS"

echo -e "\n${YELLOW}7.4 Desconto de 10% em R\$ 1500 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/discount" \
    '{"originalPrice": 1500, "discountPercentage": 10}' \
    "Valor alto - deve ser CACHE MISS"

# 8. Testes de markup - Cache MISS/HIT
echo -e "\n${BLUE}📈 8. TESTES DE MARKUP/ACRÉSCIMO${NC}"

echo -e "\n${YELLOW}8.1 Markup de 50% em R\$ 80 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/markup" \
    '{"originalPrice": 80, "markupPercentage": 50}' \
    "Primeira chamada - deve ser CACHE MISS"

echo -e "\n${YELLOW}8.2 Markup de 50% em R\$ 80 - Cache HIT${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/markup" \
    '{"originalPrice": 80, "markupPercentage": 50}' \
    "Segunda chamada - deve ser CACHE HIT"

echo -e "\n${YELLOW}8.3 Markup de 100% em R\$ 60 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/markup" \
    '{"originalPrice": 60, "markupPercentage": 100}' \
    "Markup 100% - deve ser CACHE MISS"

echo -e "\n${YELLOW}8.4 Markup de 25% em R\$ 400 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/markup" \
    '{"originalPrice": 400, "markupPercentage": 25}' \
    "Valor alto - deve ser CACHE MISS"

# 9. Testes de margem de lucro - Cache MISS/HIT
echo -e "\n${BLUE}🧮 9. TESTES DE MARGEM DE LUCRO${NC}"

echo -e "\n${YELLOW}9.1 Margem: Receita R\$ 1000, Custo R\$ 600 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/profit-margin" \
    '{"revenue": 1000, "cost": 600}' \
    "Primeira chamada - deve ser CACHE MISS"

echo -e "\n${YELLOW}9.2 Margem: Receita R\$ 1000, Custo R\$ 600 - Cache HIT${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/profit-margin" \
    '{"revenue": 1000, "cost": 600}' \
    "Segunda chamada - deve ser CACHE HIT"

echo -e "\n${YELLOW}9.3 Margem: Receita R\$ 500, Custo R\$ 450 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/profit-margin" \
    '{"revenue": 500, "cost": 450}' \
    "Margem baixa - deve ser CACHE MISS"

echo -e "\n${YELLOW}9.4 Margem: Receita R\$ 800, Custo R\$ 900 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/profit-margin" \
    '{"revenue": 800, "cost": 900}' \
    "Prejuízo - deve ser CACHE MISS"

echo -e "\n${YELLOW}9.5 Margem: Receita R\$ 2000, Custo R\$ 800 - Cache MISS${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/profit-margin" \
    '{"revenue": 2000, "cost": 800}' \
    "Margem alta - deve ser CACHE MISS"

# 10. Testes com valores extremos
echo -e "\n${BLUE}⚡ 10. TESTES COM VALORES EXTREMOS${NC}"

echo -e "\n${YELLOW}10.1 Percentual muito alto (500%)${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/calculate" \
    '{"value": 100, "percentage": 500}' \
    "Teste com percentual muito alto"

echo -e "\n${YELLOW}10.2 Valores muito pequenos${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/percentage-of" \
    '{"part": 0.01, "total": 0.1}' \
    "Teste com valores muito pequenos"

echo -e "\n${YELLOW}10.3 Valores muito grandes${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/calculate" \
    '{"value": 1000000, "percentage": 15}' \
    "Teste com valores muito grandes"

echo -e "\n${YELLOW}10.4 Variação extrema${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/percentage-change" \
    '{"oldValue": 1, "newValue": 1000}' \
    "Teste com variação extrema"

# 11. Testes de performance - múltiplas chamadas
echo -e "\n${BLUE}🚀 11. TESTES DE PERFORMANCE${NC}"

echo -e "\n${YELLOW}11.1 Múltiplas chamadas sequenciais - Cálculo percentual${NC}"
for i in {1..5}; do
    echo "Chamada $i/5:"
    test_request "POST" "$PERCENTAGE_ENDPOINT/calculate" \
        '{"value": 1200, "percentage": 18}' \
        "Chamada sequencial $i - deve ser CACHE HIT após a primeira"
done

echo -e "\n${YELLOW}11.2 Múltiplas chamadas sequenciais - Desconto${NC}"
for i in {1..3}; do
    echo "Chamada $i/3:"
    test_request "POST" "$PERCENTAGE_ENDPOINT/discount" \
        '{"originalPrice": 350, "discountPercentage": 30}' \
        "Chamada sequencial $i - deve ser CACHE HIT após a primeira"
done

# 12. Estatísticas do cache
echo -e "\n${BLUE}📈 12. ESTATÍSTICAS DO CACHE${NC}"
test_request "GET" "$PERCENTAGE_ENDPOINT/cache/stats" "" "Verificar estatísticas do cache"

# 13. Testes de limpeza de cache
echo -e "\n${BLUE}🧹 13. TESTES DE LIMPEZA DE CACHE${NC}"

echo -e "\n${YELLOW}13.1 Popular cache antes da limpeza${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/markup" \
    '{"originalPrice": 150, "markupPercentage": 40}' \
    "Popular cache antes da limpeza"

echo -e "\n${YELLOW}13.2 Limpar chave específica${NC}"
test_request "DELETE" "$PERCENTAGE_ENDPOINT/cache?key=percentage:markup:150:40" "" "Limpar chave específica"

echo -e "\n${YELLOW}13.3 Testar se cache foi limpo${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/markup" \
    '{"originalPrice": 150, "markupPercentage": 40}' \
    "Deve ser CACHE MISS após limpeza"

echo -e "\n${YELLOW}13.4 Limpar todo o cache${NC}"
test_request "DELETE" "$PERCENTAGE_ENDPOINT/cache" "" "Limpar todo o cache"

# 14. Testes de validação de dados
echo -e "\n${BLUE}🔍 14. TESTES DE VALIDAÇÃO${NC}"

echo -e "\n${YELLOW}14.1 Percentual muito alto${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/calculate" \
    '{"value": 100, "percentage": 1500}' \
    "Teste com percentual muito alto - deve falhar"

echo -e "\n${YELLOW}14.2 Percentual negativo${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/calculate" \
    '{"value": 100, "percentage": -10}' \
    "Teste com percentual negativo - deve falhar"

echo -e "\n${YELLOW}14.3 Total zero na divisão${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/percentage-of" \
    '{"part": 50, "total": 0}' \
    "Teste com total zero - deve falhar"

echo -e "\n${YELLOW}14.4 Valor inicial zero na variação${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/percentage-change" \
    '{"oldValue": 0, "newValue": 100}' \
    "Teste com valor inicial zero - deve falhar"

echo -e "\n${YELLOW}14.5 Percentual zero no cálculo inverso${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/value-from-percentage" \
    '{"percentage": 0, "percentageValue": 50}' \
    "Teste com percentual zero - deve falhar"

echo -e "\n${YELLOW}14.6 Desconto maior que 100%${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/discount" \
    '{"originalPrice": 100, "discountPercentage": 150}' \
    "Teste com desconto maior que 100% - deve falhar"

echo -e "\n${YELLOW}14.7 Receita zero na margem${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/profit-margin" \
    '{"revenue": 0, "cost": 100}' \
    "Teste com receita zero - deve falhar"

# 15. Testes com valores decimais
echo -e "\n${BLUE}🔢 15. TESTES COM VALORES DECIMAIS${NC}"

echo -e "\n${YELLOW}15.1 Valores decimais precisos${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/calculate" \
    '{"value": 1234.56, "percentage": 12.75}' \
    "Teste com valores decimais precisos"

echo -e "\n${YELLOW}15.2 Percentual com muitas casas decimais${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/percentage-of" \
    '{"part": 33.333, "total": 100}' \
    "Teste com valores decimais complexos"

echo -e "\n${YELLOW}15.3 Desconto com decimais${NC}"
test_request "POST" "$PERCENTAGE_ENDPOINT/discount" \
    '{"originalPrice": 99.99, "discountPercentage": 15.5}' \
    "Teste de desconto com decimais"

# 16. Informações da calculadora
echo -e "\n${BLUE}ℹ️  16. INFORMAÇÕES DA CALCULADORA${NC}"
test_request "GET" "$PERCENTAGE_ENDPOINT/info" "" "Obter informações da calculadora"

# 17. Resumo dos testes
echo -e "\n${PURPLE}📋 17. RESUMO DOS TESTES${NC}"
echo "=============================================="
echo -e "${GREEN}✅ Testes de cálculo de percentual${NC}"
echo -e "${GREEN}✅ Testes de percentual representativo${NC}"
echo -e "${GREEN}✅ Testes de variação percentual${NC}"
echo -e "${GREEN}✅ Testes de valor a partir de percentual${NC}"
echo -e "${GREEN}✅ Testes de desconto${NC}"
echo -e "${GREEN}✅ Testes de markup/acréscimo${NC}"
echo -e "${GREEN}✅ Testes de margem de lucro${NC}"
echo -e "${GREEN}✅ Testes de cache (MISS/HIT)${NC}"
echo -e "${GREEN}✅ Testes de performance${NC}"
echo -e "${GREEN}✅ Testes de validação${NC}"
echo -e "${GREEN}✅ Testes de valores extremos${NC}"
echo -e "${GREEN}✅ Testes de limpeza de cache${NC}"
echo -e "${GREEN}✅ Testes com valores decimais${NC}"

echo -e "\n${GREEN}🎉 TESTES CONCLUÍDOS!${NC}"
echo "=============================================="
echo -e "${CYAN}Para ver logs detalhados do cache, execute:${NC}"
echo -e "${YELLOW}docker-compose logs -f calculator-api | grep -E "(Cache|MISS|HIT|💾|✅|❌)"${NC}"
echo "=============================================="
echo -e "${PURPLE}🏆 PROJETO COMPLETO! TODAS AS 5 CALCULADORAS IMPLEMENTADAS!${NC}"
echo "=============================================="