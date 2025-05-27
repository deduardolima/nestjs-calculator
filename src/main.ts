import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './infrastructure/config/app.module';
import { swaggerConfig } from './infrastructure/config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuração de validação global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  // Configuração do Swagger
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  
  // Configuração de CORS
  app.enableCors();
  
  await app.listen(3000);
  console.log('Aplicação rodando em: http://localhost:3000');
  console.log('Documentação da API disponível em: http://localhost:3000/api');
}
bootstrap();