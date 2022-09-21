import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const { APP_PORT } = process.env;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      skipMissingProperties: false,
      transform: true,
    }),
  );

  app.enableCors({
    origin: ['http://localhost:3000', 'https://*.eu.ngrok.io'],
    credentials: true,
  });

  await app.listen(APP_PORT);
}
bootstrap();
