import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { DATABASE_ENTITIES } from '../../entities/database.entities';

const requiredEnvironmentValue = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const databasePort = (): number => {
  const value = Number(requiredEnvironmentValue('DATABASE_PORT'));

  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error('DATABASE_PORT must be an integer between 1 and 65535');
  }

  return value;
};

export const typeOrmDataSourceOptions = (): DataSourceOptions => ({
  type: 'postgres',
  host: requiredEnvironmentValue('DATABASE_HOST'),
  port: databasePort(),
  username: requiredEnvironmentValue('DATABASE_USER'),
  password: requiredEnvironmentValue('DATABASE_PASSWORD'),
  database: requiredEnvironmentValue('DATABASE_NAME'),
  entities: DATABASE_ENTITIES,
  migrations: [`${__dirname}/../migrations/[0-9]*{.ts,.js}`],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
});

export default new DataSource(typeOrmDataSourceOptions());
