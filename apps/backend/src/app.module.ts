import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './components/health/health.module';
import { appConfig } from './config/app.config';
import { validateEnvironment } from './config/environment.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validate: validateEnvironment,
    }),
    HealthModule,
  ],
})
export class AppModule {}
