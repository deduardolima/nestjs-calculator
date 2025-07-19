# Aplicação de Calculadoras com Arquitetura Hexagonal

Esta aplicação implementa diversas calculadoras financeiras utilizando NestJS com arquitetura hexagonal.

## Calculadoras Implementadas

### 1. Calculadora de Combustível
- **Consumo Médio**: Cálculo baseado em km/l ou l/100km.
- **Distância Total**: Entrada do usuário para a distância da viagem.
- **Preço do Combustível**: Entrada para o custo por litro.
- **Custo Total da Viagem**: Calcule o custo total multiplicando distância, consumo e preço do combustível.
- **Utilidade**: Ideal para motoristas de aplicativo, como Uber, para calcular o custo das viagens.

### 2. Calculadora de Percentuais
- **Cálculo de Aumento/Desconto**: Calcule o valor após um determinado aumento ou desconto percentual.
- **Porcentagem de um Número**: Encontre que porcentagem um número representa de outro.
- **Diferença Percentual**: Calcule a variação percentual entre dois números.
- **Utilidade**: Ampla aplicação para uso pessoal e profissional.

### 3. Calculadora de Dívida
- **Saldo de Dívida**: Entrada de dívida total e taxa de juros.
- **Pagamento Mensal**: Calcule pagamento mensal fixo.
- **Tempo para Quitar Dívida**: Estimativa de tempo para quitação com base nos pagamentos mensais.
- **Utilidade**: Ajuda no planejamento financeiro e na quitação de débitos.

### 4. Calculadora de Economias/Investimentos
- **Aporte Inicial**: Valor inicial do investimento.
- **Deposito Regular**: Valores e frequência de depósitos adicionais.
- **Taxa de Retorno**: Taxa de juros anual esperada.
- **Período de Investimento**: Tempo que o dinheiro ficará investido.
- **Valor Futuro Estimado**: Projeção do total acumulado ao final do período.
- **Utilidade**: Ideal para planejamento a longo prazo de economias e aposentadoria.

### 5. Calculadora de Financiamento/Empréstimo
- **Montante do Empréstimo**: Valor total do financiamento.
- **Taxa de Juros**: Juros aplicáveis.
- **Período do Empréstimo**: Quantidade de meses para amortização.
- **Pagamento Mensal**: Calcule o valor das parcelas mensais.
- **Utilidade**: Facilita a compreensão de financiamentos de carros, imóveis, etc.

## Arquitetura Hexagonal

A aplicação segue a arquitetura hexagonal (também conhecida como Ports and Adapters):

- **Domain**: Contém os modelos de domínio com a lógica de negócio
- **Application**: Contém os serviços e portas (interfaces) da aplicação
- **Infrastructure**: Contém os adaptadores (controllers, repositories) e configurações

## Como executar

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Executar em produção
npm run start
```

## Endpoints da API

A documentação completa da API está disponível através do Swagger em:
http://localhost:3000/api

### Exemplos de uso

#### Calculadora de Combustível
```bash
# Calcular consumo médio
curl -X POST http://localhost:3000/calculators/fuel/average-consumption \
  -H "Content-Type: application/json" \
  -d '{"distance": 350, "fuelUsed": 30, "isKmPerLiter": true}'

# Calcular custo total da viagem
curl -X POST http://localhost:3000/calculators/fuel/total-cost \
  -H "Content-Type: application/json" \
  -d '{"distance": 500, "consumption": 12, "fuelPrice": 5.79, "isKmPerLiter": true}'
```

#### Calculadora de Percentuais
```bash
# Calcular valor após aumento/desconto
curl -X POST http://localhost:3000/calculators/percentage/percentage-change \
  -H "Content-Type: application/json" \
  -d '{"value": 1000, "percentage": 15, "isIncrease": true}'
```

#### Calculadora de Dívida
```bash
# Calcular pagamento mensal
curl -X POST http://localhost:3000/calculators/debt/monthly-payment \
  -H "Content-Type: application/json" \
  -d '{"totalDebt": 10000, "annualInterestRate": 12.5, "months": 36}'
```