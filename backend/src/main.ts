import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { Reflector } from '@nestjs/core';
import { createCsrfMiddleware } from './common/middleware/csrf.middleware';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { CacheControlInterceptor } from './common/interceptors/cache-control.interceptor';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);
  const logger = new Logger('Bootstrap');

  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
  // Support comma-separated list of allowed origins (e.g. production + preview URLs)
  const allowedOrigins = frontendUrl.split(',').map((url) => url.trim());

  const isLocalhostOrigin = (origin: string) => /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
  // Vercel preview URLs are always <project-name>-<hash/branch>-<scope>.vercel.app —
  // requiring the project-name prefix (rather than trusting *any* .vercel.app origin)
  // means an attacker would have to name their own Vercel project "movec-store..."
  // specifically, not just deploy anything, before this origin would be trusted.
  const isProjectPreviewOrigin = (origin: string) => /^https:\/\/movec-store(-[a-z0-9-]+)?\.vercel\.app$/i.test(origin);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (isProjectPreviewOrigin(origin) || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // In dev, allow any localhost port — Vite auto-increments (5173, 5174, ...) when the
      // preferred port is busy, so pinning to one exact port breaks on every collision.
      if (configService.get<string>('NODE_ENV') !== 'production' && isLocalhostOrigin(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  });

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cookieParser());
  app.use(createCsrfMiddleware(configService));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  // NOTE: Local /uploads/ folder removed — use Cloudinary for all media storage.

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new AuditInterceptor(),
    new CacheControlInterceptor(reflector),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port, '0.0.0.0');
  logger.log(`Application running on 0.0.0.0:${port}`);
}
bootstrap();