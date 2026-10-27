import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import { configureApplication } from './common/configure-application';
import { configureSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.useWebSocketAdapter(new IoAdapter(app));
  configureApplication(app);

  const configService = app.get(ConfigService);
  const host = configService.getOrThrow<string>('app.host');
  const port = configService.getOrThrow<number>('app.port');
  const apiPrefix = configService.getOrThrow<string>('app.apiPrefix');

  if (apiPrefix) {
    app.setGlobalPrefix(apiPrefix);
  }

  const corsOrigin = configService.get<string>('app.corsOrigin');
  const corsOptions = {
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  };

  if (corsOrigin) {
    app.enableCors({
      ...corsOptions,
      origin: corsOrigin.split(',').map((item) => item.trim()),
    });
  } else {
    app.enableCors({
      ...corsOptions,
      origin: true,
    });
  }

  configureSwagger(app);

  await app.listen({ host, port });
}

bootstrap().catch((error: unknown) => {
  console.error('Application bootstrap failed', error);
  process.exitCode = 1;
});
