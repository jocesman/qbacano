import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS
  app.enableCors({
    origin: true, // 👈 PERMITE TODOS (dinámico)
    credentials: true,
  });

  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Sabores Q\'Bacano API')
    .setDescription('API para gestión de productos y pedidos por WhatsApp')
    .setVersion('1.0')
    .addTag('products')
    .addTag('orders')
    .addTag('whatsapp')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Servidor corriendo en: http://localhost:${port}`);
  console.log(`Documentación Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();