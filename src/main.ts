import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Express } from 'express';

async function createApp() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://nest-js-jwt-postgre-sql-mp2vi8eo3-naderfkihhassens-projects.vercel.app',
    ],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());
  await app.init();

  return app;
}

/**
 * Local development server
 */
async function bootstrap(): Promise<void> {
  const app = await createApp();
  await app.listen(process.env.PORT || 3000);
}

if (process.env.NODE_ENV !== 'production') {
  void bootstrap();
}

/**
 * Vercel serverless handler
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const app = await createApp();

  const server = app.getHttpAdapter().getInstance() as Express;

  server(req, res);
}
