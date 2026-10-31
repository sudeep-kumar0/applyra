import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('ApplyraBootstrap');
  const app = await NestFactory.create(AppModule);

  // Global API Prefix: /api/v1/...
  app.setGlobalPrefix('api/v1');

  // Input Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Global Exception Sanitizer (no stack traces to client)
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  // CORS configuration
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);

  logger.log(`===============================================`);
  logger.log(`🚀 Applyra Backend REST API running on port ${port}`);
  logger.log(`📍 Base API URL: http://localhost:${port}/api/v1`);
  logger.log(`🛡️ CORS configured for: ${frontendUrl}`);
  logger.log(`===============================================`);
}

bootstrap();
