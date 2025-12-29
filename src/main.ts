import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

export async function createApp() {
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { cors: true },
  );

  app.enableCors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.init();
  return expressApp;
}

// For local development
async function bootstrap() {
  const expressApp = await createApp();
  const port = process.env.PORT || 3000;
  expressApp.listen(port, () => {
    console.log(`Application is running on port ${port}`);
  });
}

// Only run bootstrap if not in serverless mode
if (require.main === module) {
  void bootstrap();
}
