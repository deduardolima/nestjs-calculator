import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Calculadoras Financeiras API')
  .setDescription(`
  API para diversas calculadoras financeiras com funcionalidades úteis para planejamento financeiro.
  
  ## Calculadoras disponíveis
  
  ### 1. Calculadora de Combustível
  - Cálculo de consumo médio (km/l ou l/100km)
  - Cálculo do custo total de viagem
  - Ideal para motoristas de aplicativo, como Uber, para calcular o custo das viagens
  
  ### 2. Calculadora de Percentuais
  - Cálculo de aumento/desconto percentual
  - Cálculo de porcentagem de um número em relação a outro
  - Cálculo de diferença percentual entre dois números
  
  ### 3. Calculadora de Dívida
  - Cálculo de pagamento mensal fixo
  - Estimativa de tempo para quitação da dívida
  
  ### 4. Calculadora de Economias/Investimentos
  - Cálculo do valor futuro de investimentos com aportes regulares
  
  ### 5. Calculadora de Financiamento/Empréstimo
  - Cálculo de pagamento mensal
  - Cálculo do pagamento total
  - Cálculo do total de juros
  `)
  .setVersion('1.0')
  .setContact('Suporte', 'https://exemplo.com/suporte', 'suporte@exemplo.com')
  .build();