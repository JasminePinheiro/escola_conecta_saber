import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import * as dotenv from 'dotenv';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Escola Conecta Saber API')
    .setDescription('API de Blogging Educacional com autenticação JWT e controle de permissões')
    .setVersion('1.0')
    .addTag('auth', 'Autenticação e gerenciamento de usuários')
    .addTag('posts', 'Gestão de posts educacionais')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Insira o JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`API running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
