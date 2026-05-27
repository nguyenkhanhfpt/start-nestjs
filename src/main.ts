import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from '@app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { NotFoundExceptionFilter } from '@filters/not-found-exception.filter';
import { LoggerService } from '@modules/logger/logger.service';
import { UnauthorizedExceptionFilter } from '@filters/unauthorized-exception.filter';
import { ForbiddenExceptionFilter } from '@filters/forbidden-exception.filter';
import { InternalServerExceptionFilter } from '@filters/internal-server-exception.filter';
import { BadRequestExceptionFilter } from '@filters/bad-request-exception.filter';
import {
  BadRequestException,
  ValidationPipe,
  RequestMethod,
  VersioningType,
} from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { useContainer } from 'class-validator';
import { setupSwagger } from '@shared/utils';
import { ResponseTransformInterceptor } from '@interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const reflector = app.get(Reflector);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  const loggerService = app.get(LoggerService);

  // Apply winston logger for app.
  app.useLogger(logger);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService);
  const corsOrigin = configService.getOrThrow<string>('app.corsOrigin', {
    infer: true,
  });

  // Setup security headers
  app.use(helmet());
  app.enableCors({
    origin: corsOrigin.split(','),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Timezone, Authorization',
    credentials: true,
  });

  // Use global prefix if you don't have subdomain
  app.setGlobalPrefix(
    configService.getOrThrow<string>('app.apiPrefix', {
      infer: true,
    }),
    {
      exclude: [{ method: RequestMethod.GET, path: '/' }],
    },
  );

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: configService.getOrThrow<string>('app.apiVersion', {
      infer: true,
    }),
  });

  // use global pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => new BadRequestException(errors),
    }),
  );

  // use global filters
  app.useGlobalFilters(
    new InternalServerExceptionFilter(loggerService),
    new BadRequestExceptionFilter(loggerService),
    new NotFoundExceptionFilter(loggerService),
    new UnauthorizedExceptionFilter(loggerService),
    new ForbiddenExceptionFilter(loggerService),
  );

  // use global interceptors
  app.useGlobalInterceptors(new ResponseTransformInterceptor(reflector));

  // setup swagger
  setupSwagger(app);

  await app.listen(
    configService.getOrThrow<string>('app.port', {
      infer: true,
    }),
  );
}
bootstrap();
