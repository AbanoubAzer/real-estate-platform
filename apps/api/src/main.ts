import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'], // Suppress verbose debug in prod
  });

  // ── Security ─────────────────────────────────────────────────────────────
  // Helmet sets secure HTTP headers (XSS, clickjacking, MIME sniffing, etc.)
  app.use(helmet({
    crossOriginEmbedderPolicy: false, // Allow images from Unsplash etc.
  }));

  // Restrict CORS to known origins only
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ── Performance ───────────────────────────────────────────────────────────
  // Gzip compression for all responses
  app.use(compression());

  // ── Input Validation ─────────────────────────────────────────────────────
  // Global validation pipe — reject malformed payloads automatically
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // Strip unknown properties from DTOs
    forbidNonWhitelisted: true, // Throw 400 if unknown props are sent
    transform: true,        // Auto-convert types (e.g. string → number)
    transformOptions: { enableImplicitConversion: true },
  }));

  // ── API Prefix ────────────────────────────────────────────────────────────
  // All routes are accessible without prefix for now (frontend uses /properties etc.)

  await app.listen(process.env.PORT ?? 3333);
  console.log(`🚀 API running on: http://localhost:${process.env.PORT ?? 3333}`);
  console.log(`🔒 Helmet + CORS + Compression active`);
}
bootstrap();
