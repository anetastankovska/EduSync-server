import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { RequestMethod } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // const allowlist = (process.env.CORS_ORIGINS ?? '')
  //   .split(',')
  //   .map(s => s.trim())
  //   .filter(Boolean);

  // app.enableCors({
  //   origin: (origin, cb) => {
  //     // Allow server-to-server / curl (no Origin header) and allowed FE origins
  //     if (!origin || allowlist.includes(origin)) return cb(null, true);
  //     return cb(new Error('Not allowed by CORS'), false);
  //   },
  //   methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  //   allowedHeaders: ['Authorization', 'Content-Type'],
  //   credentials: true, // needed if we use cookies
  //   optionsSuccessStatus: 204, // for legacy browsers
  // });

  app.enableCors();

  // Global prefix for everything EXCEPT health endpoints
  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: 'health', method: RequestMethod.GET },
      { path: 'ready', method: RequestMethod.GET },
    ],
  });

  const config = new DocumentBuilder()
    .setTitle('Academy management')
    .setDescription('Application for managing academies and students')
    .setVersion('1.0')
    .addTag('Academy Management App')
    .addBearerAuth()
    .build();

  const options: SwaggerDocumentOptions = { ignoreGlobalPrefix: false };
  const document = SwaggerModule.createDocument(app, config, options);

  // Disable swagger in production environment (clients do't need it)
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const document = SwaggerModule.createDocument(app, config, options);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(4000);
}
bootstrap();
