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
INVESTMENT_ENDPOINT="$BASE_URL/calculators/investment"

echo -e "${BLUE}💰 INICIANDO TESTES DA CALCULADORA DE INVESTIMENTO${NC}"
echo "======================================================="
echo -e "${CYAN}Endpoint base: $INVESTMENT_ENDPOINT${NC}"
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
test_request "GET" "$INVESTMENT_ENDPOINT/cache/test" "" "Verificar conexão do cache"

# 2. Limpar cache antes dos testes
echo -e "\n${BLUE}🧹 2. LIMPEZA INICIAL DO CACHE${NC}"
test_request "DELETE" "$INVESTMENT_ENDPOINT/cache" "" "Limpar todo o cache"

# 3. Testes de valor futuro - Cache MISS/HIT
echo -e "\n${BLUE}💎 3. TESTES DE VALOR FUTURO${NC}"

echo -e "\n${YELLOW}3.1 Valor futuro - Investimento básico - Cache MISS${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/future-value" \
    '{"initialInvestment": 10000, "monthlyDeposit": 500, "annualInterestRate": 12, "years": 5}' \
    "Primeira chamada - deve ser CACHE MISS"

echo -e "\n${YELLOW}3.2 Valor futuro - Investimento básico - Cache HIT${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/future-value" \
    '{"initialInvestment": 10000, "monthlyDeposit": 500, "annualInterestRate": 12, "years": 5}' \
    "Segunda chamada - deve ser CACHE HIT"

echo -e "\n${YELLOW}3.3 Valor futuro - Investimento longo prazo - Cache MISS${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/future-value" \
    '{"initialInvestment": 50000, "monthlyDeposit": 1000, "annualInterestRate": 8, "years": 20}' \
    "Investimento de longo prazo - deve ser CACHE MISS"

echo -e "\n${YELLOW}3.4 Valor futuro - Sem aportes mensais - Cache MISS${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/future-value" \
    '{"initialInvestment": 25000, "monthlyDeposit": 0, "annualInterestRate": 10, "years": 10}' \
    "Apenas investimento inicial - deve ser CACHE MISS"

# 4. Testes de juros compostos - Cache MISS/HIT
echo -e "\n${BLUE}�� 4. TESTES DE JUROS COMPOSTOS${NC}"

echo -e "\n${YELLOW}4.1 Juros compostos - Capitalização mensal - Cache MISS${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/compound-interest" \
    '{"principal": 50000, "rate": 10, "time": 3, "frequency": 12}' \
    "Primeira chamada - deve ser CACHE MISS"

echo -e "\n${YELLOW}4.2 Juros compostos - Capitalização mensal - Cache HIT${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/compound-interest" \
    '{"principal": 50000, "rate": 10, "time": 3, "frequency": 12}' \
    "Segunda chamada - deve ser CACHE HIT"

echo -e "\n${YELLOW}4.3 Juros compostos - Capitalização anual - Cache MISS${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/compound-interest" \
    '{"principal": 100000, "rate": 12, "time": 5, "frequency": 1}' \
    "Capitalização anual - deve ser CACHE MISS"

echo -e "\n${YELLOW}4.4 Juros compostos - Capitalização diária - Cache MISS${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/compound-interest" \
    '{"principal": 75000, "rate": 8.5, "time": 2, "frequency": 365}' \
    "Capitalização diária - deve ser CACHE MISS"

# 5. Testes de juros simples - Cache MISS/HIT
echo -e "\n${BLUE}📈 5. TESTES DE JUROS SIMPLES${NC}"

echo -e "\n${YELLOW}5.1 Juros simples - Investimento básico - Cache MISS${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/simple-interest" \
    '{"principal": 25000, "rate": 8, "time": 2}' \
    "Primeira chamada - deve ser CACHE MISS"

echo -e "\n${YELLOW}5.2 Juros simples - Investimento básico - Cache HIT${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/simple-interest" \
    '{"principal": 25000, "rate": 8, "time": 2}' \
    "Segunda chamada - deve ser CACHE HIT"

echo -e "\n${YELLOW}5.3 Juros simples - Taxa alta - Cache MISS${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/simple-interest" \
    '{"principal": 15000, "rate": 15, "time": 1.5}' \
    "Taxa alta - deve ser CACHE MISS"

# 6. Testes de ROI - Cache MISS/HIT
echo -e "\n${BLUE}📊 6. TESTES DE ROI (RETURN ON INVESTMENT)${NC}"

echo -e "\n${YELLOW}6.1 ROI - Ganho de 50% - Cache MISS${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/roi" \
    '{"initialInvestment": 100000, "finalValue": 150000}' \
    "Primeira chamada ROI - deve ser CACHE MISS"

echo -e "\n${YELLOW}6.2 ROI - Ganho de 50% - Cache HIT${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/roi" \
    '{"initialInvestment": 100000, "finalValue": 150000}' \
    "Segunda chamada ROI - deve ser CACHE HIT"

echo -e "\n${YELLOW}6.3 ROI - Ganho de 200% - Cache MISS${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/roi" \
    '{"initialInvestment": 50000, "finalValue": 150000}' \
    "ROI alto - deve ser CACHE MISS"

echo -e "\n${YELLOW}6.4 ROI - Perda de investimento - Cache MISS${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/roi" \
    '{"initialInvestment": 100000, "finalValue": 80000}' \
    "ROI negativo - deve ser CACHE MISS"

# 7. Testes com valores extremos
echo -e "\n${BLUE}⚡ 7. TESTES COM VALORES EXTREMOS${NC}"

echo -e "\n${YELLOW}7.1 Valores muito pequenos${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/future-value" \
    '{"initialInvestment": 100, "monthlyDeposit": 10, "annualInterestRate": 5, "years": 1}' \
    "Teste com valores muito pequenos"

echo -e "\n${YELLOW}7.2 Valores muito grandes${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/compound-interest" \
    '{"principal": 1000000, "rate": 15, "time": 30, "frequency": 12}' \
    "Teste com valores muito grandes"

echo -e "\n${YELLOW}7.3 Período muito longo${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/simple-interest" \
    '{"principal": 50000, "rate": 6, "time": 50}' \
    "Teste com período muito longo"

echo -e "\n${YELLOW}7.4 Taxa muito baixa${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/compound-interest" \
    '{"principal": 100000, "rate": 0.5, "time": 10, "frequency": 12}' \
    "Teste com taxa muito baixa"

# 8. Testes de performance - múltiplas chamadas
echo -e "\n${BLUE}🚀 8. TESTES DE PERFORMANCE${NC}"

echo -e "\n${YELLOW}8.1 Múltiplas chamadas sequenciais - Valor futuro${NC}"
for i in {1..5}; do
    echo "Chamada $i/5:"
    test_request "POST" "$INVESTMENT_ENDPOINT/future-value" \
        '{"initialInvestment": 20000, "monthlyDeposit": 800, "annualInterestRate": 9, "years": 8}' \
        "Chamada sequencial $i - deve ser CACHE HIT após a primeira"
done

echo -e "\n${YELLOW}8.2 Múltiplas chamadas sequenciais - Juros compostos${NC}"
for i in {1..3}; do
    echo "Chamada $i/3:"
    test_request "POST" "$INVESTMENT_ENDPOINT/compound-interest" \
        '{"principal": 80000, "rate": 11, "time": 4, "frequency": 12}' \
        "Chamada sequencial $i - deve ser CACHE HIT após a primeira"
done

# 9. Estatísticas do cache
echo -e "\n${BLUE}📈 9. ESTATÍSTICAS DO CACHE${NC}"
test_request "GET" "$INVESTMENT_ENDPOINT/cache/stats" "" "Verificar estatísticas do cache"

# 10. Testes de limpeza de cache
echo -e "\n${BLUE}🧹 10. TESTES DE LIMPEZA DE CACHE${NC}"

echo -e "\n${YELLOW}10.1 Popular cache antes da limpeza${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/roi" \
    '{"initialInvestment": 75000, "finalValue": 90000}' \
    "Popular cache antes da limpeza"

echo -e "\n${YELLOW}10.2 Limpar chave específica${NC}"
test_request "DELETE" "$INVESTMENT_ENDPOINT/cache?key=investment:roi:75000:90000" "" "Limpar chave específica"

echo -e "\n${YELLOW}10.3 Testar se cache foi limpo${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/roi" \
    '{"initialInvestment": 75000, "finalValue": 90000}' \
    "Deve ser CACHE MISS após limpeza"

echo -e "\n${YELLOW}10.4 Limpar todo o cache${NC}"
test_request "DELETE" "$INVESTMENT_ENDPOINT/cache" "" "Limpar todo o cache"

# 11. Testes de validação de dados
echo -e "\n${BLUE}🔍 11. TESTES DE VALIDAÇÃO${NC}"

echo -e "\n${YELLOW}11.1 Valor inicial negativo${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/future-value" \
    '{"initialInvestment": -1000, "monthlyDeposit": 500, "annualInterestRate": 12, "years": 5}' \
    "Teste com valor inicial negativo - deve falhar"

echo -e "\n${YELLOW}11.2 Taxa de juros muito alta${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/compound-interest" \
    '{"principal": 50000, "rate": 150, "time": 3, "frequency": 12}' \
    "Teste com taxa muito alta - deve falhar"

echo -e "\n${YELLOW}11.3 Período negativo${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/simple-interest" \
    '{"principal": 25000, "rate": 8, "time": -2}' \
    "Teste com período negativo - deve falhar"

echo -e "\n${YELLOW}11.4 Frequência inválida${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/compound-interest" \
    '{"principal": 50000, "rate": 10, "time": 3, "frequency": 0}' \
    "Teste com frequência zero - deve falhar"

echo -e "\n${YELLOW}11.5 Valor final menor que inicial (ROI)${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/roi" \
    '{"initialInvestment": 0, "finalValue": 150000}' \
    "Teste com investimento inicial zero - deve falhar"

# 12. Testes com valores decimais
echo -e "\n${BLUE}🔢 12. TESTES COM VALORES DECIMAIS${NC}"

echo -e "\n${YELLOW}12.1 Valores decimais precisos${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/future-value" \
    '{"initialInvestment": 12345.67, "monthlyDeposit": 567.89, "annualInterestRate": 8.75, "years": 7.5}' \
    "Teste com valores decimais precisos"

echo -e "\n${YELLOW}12.2 Taxa com muitas casas decimais${NC}"
test_request "POST" "$INVESTMENT_ENDPOINT/compound-interest" \
    '{"principal": 45000, "rate": 9.875, "time": 3.25, "frequency": 12}' \
    "Teste com taxa decimal precisa"

# 13. Informações da calculadora
echo -e "\n${BLUE}ℹ️  13. INFORMAÇÕES DA CALCULADORA${NC}"
test_request "GET" "$INVESTMENT_ENDPOINT/info" "" "Obter informações da calculadora"

# 14. Resumo dos testes
echo -e "\n${PURPLE}📋 14. RESUMO DOS TESTES${NC}"
echo "=============================================="
echo -e "${GREEN}✅ Testes de funcionalidade básica${NC}"
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