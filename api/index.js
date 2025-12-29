const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { ValidationPipe } = require('@nestjs/common');

let app;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    
    app.enableCors({
      origin: '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  }
  return app;
}

module.exports = async (req, res) => {
  const app = await bootstrap();
  const server = app.getHttpAdapter().getInstance();
  return server(req, res);
};