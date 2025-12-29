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
  try {
    // Handle CORS preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    const nestApp = await bootstrap();
    const server = nestApp.getHttpAdapter().getInstance();
    return server(req, res);
  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    });
  }
};