import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nModule } from 'nestjs-i18n';
import { AuthModule } from './components/auth/auth.module';
import { HealthModule } from './components/health/health.module';
import { appConfig } from './config/app.config';
import { validateEnvironment } from './config/environment.validation';
import { i18nConfig } from './config/i18n.config';
import { typeOrmDataSourceOptions } from './database/config/typeorm.options';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validate: validateEnvironment,
    }),
    I18nModule.forRoot(i18nConfig),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmDataSourceOptions,
    }),
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
