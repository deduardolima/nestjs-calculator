#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
FUEL_ENDPOINT="$BASE_URL/calculators/fuel"

echo -e "${BLUE}🧪 INICIANDO TESTES DA CALCULADORA DE COMBUSTÍVEL${NC}"
echo "=================================================="

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
test_request "GET" "$FUEL_ENDPOINT/cache/test" "" "Verificar conexão do cache"

# 2. Limpar cache antes dos testes
echo -e "\n${BLUE}�� 2. LIMPEZA INICIAL DO CACHE${NC}"
test_request "DELETE" "$FUEL_ENDPOINT/cache" "" "Limpar todo o cache"

# 3. Testes de consumo médio - Cache MISS
echo -e "\n${BLUE}📊 3. TESTES DE CONSUMO MÉDIO${NC}"

echo -e "\n${YELLOW}3.1 Consumo médio km/l - Cache MISS${NC}"
test_request "POST" "$FUEL_ENDPOINT/average-consumption" \
    '{"distance": 350, "fuelUsed": 30, "isKmPerLiter": true}' \
    "Primeira chamada - deve ser CACHE MISS"

echo -e "\n${YELLOW}3.2 Consumo médio km/l - Cache HIT${NC}"
test_request "POST" "$FUEL_ENDPOINT/average-consumption" \
    '{"distance": 350, "fuelUsed": 30, "isKmPerLiter": true}' \
    "Segunda chamada - deve ser CACHE HIT"

echo -e "\n${YELLOW}3.3 Consumo médio l/100km - Cache MISS${NC}"
test_request "POST" "$FUEL_ENDPOINT/average-consumption" \
    '{"distance": 350, "fuelUsed": 30, "isKmPerLiter": false}' \
    "Teste com l/100km - deve ser CACHE MISS"

echo -e "\n${YELLOW}3.4 Consumo médio l/100km - Cache HIT${NC}"
test_request "POST" "$FUEL_ENDPOINT/average-consumption" \
    '{"distance": 350, "fuelUsed": 30, "isKmPerLiter": false}' \
    "Repetir l/100km - deve ser CACHE HIT"

# 4. Testes de custo total - Cache MISS/HIT
echo -e "\n${BLUE}💰 4. TESTES DE CUSTO TOTAL${NC}"

echo -e "\n${YELLOW}4.1 Custo total km/l - Cache MISS${NC}"
test_request "POST" "$FUEL_ENDPOINT/total-cost" \
    '{"distance": 400, "consumption": 12, "fuelPrice": 6.8, "isKmPerLiter": true}' \
    "Primeira chamada custo - deve ser CACHE MISS"

echo -e "\n${YELLOW}4.2 Custo total km/l - Cache HIT${NC}"
test_request "POST" "$FUEL_ENDPOINT/total-cost" \
    '{"distance": 400, "consumption": 12, "fuelPrice": 6.8, "isKmPerLiter": true}' \
    "Segunda chamada custo - deve ser CACHE HIT"

echo -e "\n${YELLOW}4.3 Custo total l/100km - Cache MISS${NC}"
test_request "POST" "$FUEL_ENDPOINT/total-cost" \
    '{"distance": 400, "consumption": 8.5, "fuelPrice": 6.8, "isKmPerLiter": false}' \
    "Custo com l/100km - deve ser CACHE MISS"

echo -e "\n${YELLOW}4.4 Custo total l/100km - Cache HIT${NC}"
test_request "POST" "$FUEL_ENDPOINT/total-cost" \
    '{"distance": 400, "consumption": 8.5, "fuelPrice": 6.8, "isKmPerLiter": false}' \
    "Repetir l/100km - deve ser CACHE HIT"

# 5. Testes com valores extremos
echo -e "\n${BLUE}⚡ 5. TESTES COM VALORES EXTREMOS${NC}"

echo -e "\n${YELLOW}5.1 Valores muito pequenos${NC}"
test_request "POST" "$FUEL_ENDPOINT/average-consumption" \
    '{"distance": 1, "fuelUsed": 0.1, "isKmPerLiter": true}' \
    "Teste com valores muito pequenos"

echo -e "\n${YELLOW}5.2 Valores muito grandes${NC}"
test_request "POST" "$FUEL_ENDPOINT/total-cost" \
    '{"distance": 10000, "consumption": 5, "fuelPrice": 15.99, "isKmPerLiter": true}' \
    "Teste com valores muito grandes"

echo -e "\n${YELLOW}5.3 Valores decimais${NC}"
test_request "POST" "$FUEL_ENDPOINT/average-consumption" \
    '{"distance": 123.45, "fuelUsed": 9.87, "isKmPerLiter": true}' \
    "Teste com valores decimais"

# 6. Testes de performance
echo -e "\n${BLUE}🚀 6. TESTES DE PERFORMANCE${NC}"

echo -e "\n${YELLOW}6.1 Múltiplas chamadas sequenciais${NC}"
for i in {1..5}; do
    echo "Chamada $i/5:"
    test_request "POST" "$FUEL_ENDPOINT/total-cost" \
        '{"distance": 500, "consumption": 10, "fuelPrice": 7.2, "isKmPerLiter": true}' \
        "Chamada sequencial $i - deve ser CACHE HIT após a primeira"
done

# 7. Estatísticas do cache
echo -e "\n${BLUE}📈 7. ESTATÍSTICAS DO CACHE${NC}"
test_request "GET" "$FUEL_ENDPOINT/cache/stats" "" "Verificar estatísticas do cache"

# 8. Testes de limpeza de cache
echo -e "\n${BLUE}🧹 8. TESTES DE LIMPEZA DE CACHE${NC}"

echo -e "\n${YELLOW}8.1 Fazer uma chamada para popular cache${NC}"
test_request "POST" "$FUEL_ENDPOINT/average-consumption" \
    '{"distance": 200, "fuelUsed": 15, "isKmPerLiter": true}' \
    "Popular cache antes da limpeza"

echo -e "\n${YELLOW}8.2 Limpar cache específico${NC}"
test_request "DELETE" "$FUEL_ENDPOINT/cache?key=fuel:avg_consumption:200:15:true" "" "Limpar chave específica"

echo -e "\n${YELLOW}8.3 Testar se cache foi limpo${NC}"
test_request "POST" "$FUEL_ENDPOINT/average-consumption" \
    '{"distance": 200, "fuelUsed": 15, "isKmPerLiter": true}' \
    "Deve ser CACHE MISS após limpeza"

echo -e "\n${YELLOW}8.4 Limpar todo o cache${NC}"
test_request "DELETE" "$FUEL_ENDPOINT/cache" "" "Limpar todo o cache"

# 9. Testes de validação de dados
echo -e "\n${BLUE}🔍 9. TESTES DE VALIDAÇÃO${NC}"

echo -e "\n${YELLOW}9.1 Teste com dados inválidos${NC}"
test_request "POST" "$FUEL_ENDPOINT/average-consumption" \
    '{"distance": 0, "fuelUsed": 30, "isKmPerLiter": true}' \
    "Teste com distância zero"

echo -e "\n${YELLOW}9.2 Teste com combustível zero${NC}"
test_request "POST" "$FUEL_ENDPOINT/total-cost" \
    '{"distance": 400, "consumption": 12, "fuelPrice": 0, "isKmPerLiter": true}' \
    "Teste com preço zero"

# 10. Informações da calculadora
echo -e "\n${BLUE}ℹ️  10. INFORMAÇÕES DA CALCULADORA${NC}"
test_request "GET" "$FUEL_ENDPOINT/info" "" "Obter informações da calculadora"

echo -e "\n${GREEN}🎉 TESTES CONCLUÍDOS!${NC}"
echo "=================================================="