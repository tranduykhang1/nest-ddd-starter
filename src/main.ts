import {
  INestApplication,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { join } from 'path';

import { Config } from 'libs/config/Config';
import { HttpExceptionFilter } from 'libs/HttpExceptionFilter';
import { LoggingInterceptor } from 'libs/interceptors/LoggingInterceptor';
import { AppModule } from 'src/AppModule';

function setupSwagger(app: INestApplication): void {
  const documentBuilder = new DocumentBuilder()
    .setTitle('NestJS DDD Example')
    .setDescription('NestJS with DDD, CQRS, and gRPC')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  });
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: join(__dirname, 'shared/infrastructure/protos/user.proto'),
      url: `0.0.0.0:${Config.USER_GRPC_PORT}`,
    },
  });

  if (Config.CORS_ENABLED) {
    app.enableCors({
      origin: Config.CORS_ORIGINS,
      methods: Config.CORS_METHODS,
      credentials: Config.CORS_CREDENTIALS,
      maxAge: Config.CORS_MAX_AGE,
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
      ],
      exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
    });
  }

  if (Config.HELMET_ENABLED) {
    app.use(
      helmet({
        contentSecurityPolicy: Config.HELMET_CSP,
        crossOriginEmbedderPolicy: Config.HELMET_COEP,
        crossOriginOpenerPolicy: { policy: 'same-origin' },
        crossOriginResourcePolicy: { policy: 'same-origin' },
        dnsPrefetchControl: { allow: false },
        frameguard: { action: 'deny' },
        hidePoweredBy: true,
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: { permittedPolicies: 'none' },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        xssFilter: true,
      }),
    );
  }

  app.use(compression());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableVersioning({
    defaultVersion: '1',
    prefix: 'v',
    type: VersioningType.URI,
  });

  setupSwagger(app);

  await app.startAllMicroservices();
  await app.listen(Config.PORT);

  logger.log(`Application running on: http://localhost:${Config.PORT}`);
  logger.log(`Swagger docs: http://localhost:${Config.PORT}/api`);
  logger.log(`User gRPC server running on: 0.0.0.0:${Config.USER_GRPC_PORT}`);
}

bootstrap();
