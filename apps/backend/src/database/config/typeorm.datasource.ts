import 'dotenv/config';
import { DataSource } from 'typeorm';
import { typeOrmDataSourceOptions } from './typeorm.options';

export default new DataSource(typeOrmDataSourceOptions());
