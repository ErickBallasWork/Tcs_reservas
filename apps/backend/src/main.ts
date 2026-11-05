import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import serverlessExpress from '@vendia/serverless-express';
import { Request, Response, NextFunction } from 'express';

// ── Cached serverless handler ─────────────────────────────────────────────
// The handler is cached across warm invocations to avoid re-bootstrapping
// the NestJS application on every request (critical for cold-start latency).
let cachedHandler: ReturnType<typeof serverlessExpress> | undefined;

async function bootstrapServerless() {
  if (cachedHandler) return cachedHandler;

  const app = await NestFactory.create(AppModule);

  // ── Global pipes ───────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // Strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,       // Auto-transform payloads to DTO instances
    }),
  );

  // ── CORS ───────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ── Global API prefix ──────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // NestJS must initialize without listening on a port for serverless
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  cachedHandler = serverlessExpress({ app: expressApp });
  return cachedHandler;
}

// ── Vercel Serverless Function entrypoint ─────────────────────────────────
// Vercel calls this exported function for every HTTP request.
export default async function handler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const serverlessHandler = await bootstrapServerless();
  return serverlessHandler(req, res, next);
}

// ── Local development bootstrap ───────────────────────────────────────────
// When running locally (not on Vercel), start a standard HTTP server.
if (process.env.VERCEL !== '1') {
  async function bootstrapLocal() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.enableCors({
      origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    app.setGlobalPrefix('api');

    const port = process.env.PORT ?? 3001;
    await app.listen(port);
    console.log(`🚀 Backend running locally at http://localhost:${port}/api`);
  }

  bootstrapLocal();
}
