import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './components/auth/auth.module';
import { HealthModule } from './components/health/health.module';
import { appConfig } from './config/app.config';
import { validateEnvironment } from './config/environment.validation';
import { typeOrmDataSourceOptions } from './database/config/typeorm.options';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmDataSourceOptions,
    }),
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
