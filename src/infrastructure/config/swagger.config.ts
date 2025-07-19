import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Calculadoras Financeiras API')
  .setDescription(`
  API para diversas calculadoras financeiras com funcionalidades úteis para planejamento financeiro.`)
  .setVersion('1.0')
  .build();