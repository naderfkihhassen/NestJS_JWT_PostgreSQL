import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for your frontend domain
  app.enableCors({
    origin: [
      'http://localhost:5500',
      'https://your-frontend-domain.vercel.app',
    ],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT || 3000);
}

bootstrap();

// Export for Vercel
export default async (req, res) => {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.init();
  const server = app.getHttpAdapter().getInstance();
  return server(req, res);
};
