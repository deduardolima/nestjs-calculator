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
LOAN_ENDPOINT="$BASE_URL/calculators/loan"

echo -e "${BLUE}💳 INICIANDO TESTES DA CALCULADORA DE EMPRÉSTIMO${NC}"
echo "======================================================="
echo -e "${CYAN}Endpoint base: $LOAN_ENDPOINT${NC}"
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
test_request "GET" "$LOAN_ENDPOINT/cache/test" "" "Verificar conexão do cache"

# 2. Limpar cache antes dos testes
echo -e "\n${BLUE}🧹 2. LIMPEZA INICIAL DO CACHE${NC}"
test_request "DELETE" "$LOAN_ENDPOINT/cache" "" "Limpar todo o cache"

# 3. Testes de parcela mensal - Cache MISS/HIT
echo -e "\n${BLUE}💰 3. TESTES DE PARCELA MENSAL${NC}"

echo -e "\n${YELLOW}3.1 Parcela mensal - Financiamento imobiliário - Cache MISS${NC}"
test_request "POST" "$LOAN_ENDPOINT/monthly-payment" \
    '{"loanAmount": 300000, "annualInterestRate": 8.5, "loanTermInYears": 30}' \
    "Primeira chamada - deve ser CACHE MISS"

echo -e "\n${YELLOW}3.2 Parcela mensal - Financiamento imobiliário - Cache HIT${NC}"
test_request "POST" "$LOAN_ENDPOINT/monthly-payment" \
    '{"loanAmount": 300000, "annualInterestRate": 8.5, "loanTermInYears": 30}' \
    "Segunda chamada - deve ser CACHE HIT"

echo -e "\n${YELLOW}3.3 Parcela mensal - Empréstimo pessoal - Cache MISS${NC}"
test_request "POST" "$LOAN_ENDPOINT/monthly-payment" \
    '{"loanAmount": 50000, "annualInterestRate": 15, "loanTermInYears": 5}' \
    "Empréstimo pessoal - deve ser CACHE MISS"

echo -e "\n${YELLOW}3.4 Parcela mensal - Financiamento de veículo - Cache MISS${NC}"
test_request "POST" "$LOAN_ENDPOINT/monthly-payment" \
    '{"loanAmount": 80000, "annualInterestRate": 12, "loanTermInYears": 7}' \
    "Financiamento de veículo - deve ser CACHE MISS"

# 4. Testes de total de juros - Cache MISS/HIT
echo -e "\n${BLUE}📊 4. TESTES DE TOTAL DE JUROS${NC}"

echo -e "\n${YELLOW}4.1 Total de juros - Financiamento imobiliário - Cache MISS${NC}"
test_request "POST" "$LOAN_ENDPOINT/total-interest" \
    '{"loanAmount": 300000, "annualInterestRate": 8.5, "loanTermInYears": 30}' \
    "Primeira chamada - deve ser CACHE MISS"

echo -e "\n${YELLOW}4.2 Total de juros - Financiamento imobiliário - Cache HIT${NC}"
test_request "POST" "$LOAN_ENDPOINT/total-interest" \
    '{"loanAmount": 300000, "annualInterestRate": 8.5, "loanTermInYears": 30}' \
    "Segunda chamada - deve ser CACHE HIT"

echo -e "\n${YELLOW}4.3 Total de juros - Empréstimo curto prazo - Cache MISS${NC}"
test_request "POST" "$LOAN_ENDPOINT/total-interest" \
    '{"loanAmount": 20000, "annualInterestRate": 18, "loanTermInYears": 2}' \
    "Empréstimo curto prazo - deve ser CACHE MISS"

echo -e "\n${YELLOW}4.4 Total de juros - Taxa zero - Cache MISS${NC}"
test_request "POST" "$LOAN_ENDPOINT/total-interest" \
    '{"loanAmount": 100000, "annualInterestRate": 0, "loanTermInYears": 5}' \
    "Empréstimo sem juros - deve ser CACHE MISS"

# 5. Testes de tabela de amortização - Cache MISS/HIT
echo -e "\n${BLUE}📋 5. TESTES DE TABELA DE AMORTIZAÇÃO${NC}"

echo -e "\n${YELLOW}5.1 Amortização - Empréstimo pequeno - Cache MISS${NC}"
test_request "POST" "$LOAN_ENDPOINT/amortization-schedule" \
    '{"loanAmount": 10000, "annualInterestRate": 10, "loanTermInYears": 2}' \
    "Primeira chamada - deve ser CACHE MISS"

echo -e "\n${YELLOW}5.2 Amortização - Empréstimo pequeno - Cache HIT${NC}"
test_request "POST" "$LOAN_ENDPOINT/amortization-schedule" \
    '{"loanAmount": 10000, "annualInterestRate": 10, "loanTermInYears": 2}' \
    "Segunda chamada - deve ser CACHE HIT"

echo -e "\n${YELLOW}5.3 Amortização - Financiamento médio - Cache MISS${NC}"
test_request "POST" "$LOAN_ENDPOINT/amortization-schedule" \
    '{"loanAmount": 150000, "annualInterestRate": 9, "loanTermInYears": 15}' \
    "Financiamento médio prazo - deve ser CACHE MISS"

# 6. Testes de capacidade de empréstimo - Cache MISS/HIT
echo -e "\n${BLUE}🏠 6. TESTES DE CAPACIDADE DE EMPRÉSTIMO${NC}"

echo -e "\n${YELLOW}6.1 Capacidade - Renda alta - Cache MISS${NC}"
test_request "POST" "$LOAN_ENDPOINT/loan-capacity" \
    '{"monthlyIncome": 15000, "monthlyExpenses": 5000, "annualInterestRate": 8.5, "loanTermInYears": 30}' \
    "Primeira chamada - deve ser CACHE MISS"

echo -e "\n${YELLOW}6.2 Capacidade - Renda alta - Cache HIT${NC}"
test_request "POST" "$LOAN_ENDPOINT/loan-capacity" \
    '{"monthlyIncome": 15000, "monthlyExpenses": 5000, "annualInterestRate": 8.5, "loanTermInYears": 30}' \
    "Segunda chamada - deve ser CACHE HIT"

echo -e "\n${YELLOW}6.3 Capacidade - Renda média com ratio customizado - Cache MISS${NC}"
test_request "POST" "$LOAN_ENDPOINT/loan-capacity" \
    '{"monthlyIncome": 8000, "monthlyExpenses": 3000, "annualInterestRate": 10, "loanTermInYears": 20, "debtToIncomeRatio": 0.35}' \
    "Ratio customizado - deve ser CACHE MISS"

echo -e "\n${YELLOW}6.4 Capacidade - Renda baixa - Cache MISS${NC}"
test_request "POST" "$LOAN_ENDPOINT/loan-capacity" \
    '{"monthlyIncome": 3000, "monthlyExpenses": 2000, "annualInterestRate": 12, "loanTermInYears": 10}' \
    "Renda baixa - deve ser CACHE MISS"

# 7. Testes com valores extremos
echo -e "\n${BLUE}⚡ 7. TESTES COM VALORES EXTREMOS${NC}"

echo -e "\n${YELLOW}7.1 Empréstimo muito pequeno${NC}"
test_request "POST" "$LOAN_ENDPOINT/monthly-payment" \
    '{"loanAmount": 1000, "annualInterestRate": 5, "loanTermInYears": 1}' \
    "Teste com valor muito pequeno"

echo -e "\n${YELLOW}7.2 Empréstimo muito grande${NC}"
test_request "POST" "$LOAN_ENDPOINT/total-interest" \
    '{"loanAmount": 2000000, "annualInterestRate": 6, "loanTermInYears": 35}' \
    "Teste com valor muito grande"

echo -e "\n${YELLOW}7.3 Taxa muito alta${NC}"
test_request "POST" "$LOAN_ENDPOINT/monthly-payment" \
    '{"loanAmount": 100000, "annualInterestRate": 45, "loanTermInYears": 10}' \
    "Teste com taxa muito alta"

echo -e "\n${YELLOW}7.4 Prazo muito longo${NC}"
test_request "POST" "$LOAN_ENDPOINT/total-interest" \
    '{"loanAmount": 500000, "annualInterestRate": 7, "loanTermInYears": 50}' \
    "Teste com prazo muito longo"

# 8. Testes de performance - múltiplas chamadas
echo -e "\n${BLUE}🚀 8. TESTES DE PERFORMANCE${NC}"

echo -e "\n${YELLOW}8.1 Múltiplas chamadas sequenciais - Parcela mensal${NC}"
for i in {1..5}; do
    echo "Chamada $i/5:"
    test_request "POST" "$LOAN_ENDPOINT/monthly-payment" \
        '{"loanAmount": 250000, "annualInterestRate": 9.5, "loanTermInYears": 25}' \
        "Chamada sequencial $i - deve ser CACHE HIT após a primeira"
done

echo -e "\n${YELLOW}8.2 Múltiplas chamadas sequenciais - Total de juros${NC}"
for i in {1..3}; do
    echo "Chamada $i/3:"
    test_request "POST" "$LOAN_ENDPOINT/total-interest" \
        '{"loanAmount": 180000, "annualInterestRate": 11, "loanTermInYears": 20}' \
        "Chamada sequencial $i - deve ser CACHE HIT após a primeira"
done

# 9. Estatísticas do cache
echo -e "\n${BLUE}📈 9. ESTATÍSTICAS DO CACHE${NC}"
test_request "GET" "$LOAN_ENDPOINT/cache/stats" "" "Verificar estatísticas do cache"

# 10. Testes de limpeza de cache
echo -e "\n${BLUE}🧹 10. TESTES DE LIMPEZA DE CACHE${NC}"

echo -e "\n${YELLOW}10.1 Popular cache antes da limpeza${NC}"
test_request "POST" "$LOAN_ENDPOINT/monthly-payment" \
    '{"loanAmount": 120000, "annualInterestRate": 7.5, "loanTermInYears": 15}' \
    "Popular cache antes da limpeza"

echo -e "\n${YELLOW}10.2 Limpar chave específica${NC}"
test_request "DELETE" "$LOAN_ENDPOINT/cache?key=loan:monthly_payment:120000:7.5:15" "" "Limpar chave específica"

echo -e "\n${YELLOW}10.3 Testar se cache foi limpo${NC}"
test_request "POST" "$LOAN_ENDPOINT/monthly-payment" \
    '{"loanAmount": 120000, "annualInterestRate": 7.5, "loanTermInYears": 15}' \
    "Deve ser CACHE MISS após limpeza"

echo -e "\n${YELLOW}10.4 Limpar todo o cache${NC}"
test_request "DELETE" "$LOAN_ENDPOINT/cache" "" "Limpar todo o cache"

# 11. Testes de validação de dados
echo -e "\n${BLUE}🔍 11. TESTES DE VALIDAÇÃO${NC}"

echo -e "\n${YELLOW}11.1 Valor do empréstimo negativo${NC}"
test_request "POST" "$LOAN_ENDPOINT/monthly-payment" \
    '{"loanAmount": -50000, "annualInterestRate": 8, "loanTermInYears": 10}' \
    "Teste com valor negativo - deve falhar"

echo -e "\n${YELLOW}11.2 Taxa de juros muito alta${NC}"
test_request "POST" "$LOAN_ENDPOINT/total-interest" \
    '{"loanAmount": 100000, "annualInterestRate": 60, "loanTermInYears": 5}' \
    "Teste com taxa muito alta - deve falhar"

echo -e "\n${YELLOW}11.3 Prazo muito longo${NC}"
test_request "POST" "$LOAN_ENDPOINT/monthly-payment" \
    '{"loanAmount": 200000, "annualInterestRate": 8, "loanTermInYears": 60}' \
    "Teste com prazo muito longo - deve falhar"

echo -e "\n${YELLOW}11.4 Renda menor que gastos${NC}"
test_request "POST" "$LOAN_ENDPOINT/loan-capacity" \
    '{"monthlyIncome": 3000, "monthlyExpenses": 4000, "annualInterestRate": 8, "loanTermInYears": 20}' \
    "Teste com gastos maiores que renda - deve funcionar mas mostrar capacidade baixa"

echo -e "\n${YELLOW}11.5 Ratio de dívida muito alto${NC}"
test_request "POST" "$LOAN_ENDPOINT/loan-capacity" \
    '{"monthlyIncome": 5000, "monthlyExpenses": 2000, "annualInterestRate": 8, "loanTermInYears": 20, "debtToIncomeRatio": 0.6}' \
    "Teste com ratio muito alto - deve falhar"

# 12. Testes com valores decimais
echo -e "\n${BLUE}🔢 12. TESTES COM VALORES DECIMAIS${NC}"

echo -e "\n${YELLOW}12.1 Valores decimais precisos${NC}"
test_request "POST" "$LOAN_ENDPOINT/monthly-payment" \
    '{"loanAmount": 123456.78, "annualInterestRate": 8.375, "loanTermInYears": 12.5}' \
    "Teste com valores decimais precisos"

echo -e "\n${YELLOW}12.2 Capacidade com valores decimais${NC}"
test_request "POST" "$LOAN_ENDPOINT/loan-capacity" \
    '{"monthlyIncome": 7850.50, "monthlyExpenses": 2345.75, "annualInterestRate": 9.125, "loanTermInYears": 18.5, "debtToIncomeRatio": 0.32}' \
    "Teste de capacidade com decimais"

# 13. Informações da calculadora
echo -e "\n${BLUE}ℹ️  13. INFORMAÇÕES DA CALCULADORA${NC}"
test_request "GET" "$LOAN_ENDPOINT/info" "" "Obter informações da calculadora"

# 14. Resumo dos testes
echo -e "\n${PURPLE}📋 14. RESUMO DOS TESTES${NC}"
echo "=============================================="
echo -e "${GREEN}✅ Testes de parcela mensal${NC}"
echo -e "${GREEN}✅ Testes de total de juros${NC}"
echo -e "${GREEN}✅ Testes de tabela de amortização${NC}"
echo -e "${GREEN}✅ Testes de capacidade de empréstimo${NC}"
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