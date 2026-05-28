import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';

const driver = process.env.DATABASE_DRIVER || 'postgres';
const isSQLite = driver === 'sqlite' || driver === 'better-sqlite3';

const dataSourceOptions: DataSourceOptions = isSQLite
  ? {
      type: 'better-sqlite3',
      database: process.env.DATABASE_PATH || './database.sqlite',
      synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
      entities: [join(__dirname, '../database/entities/*.entity{.ts,.js}')],
      migrations: [join(__dirname, '../database/migrations/sqlite/*{.ts,.js}')],
      dropSchema: false,
    }
  : {
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
      entities: [join(__dirname, '../database/entities/*.entity{.ts,.js}')],
      migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
      dropSchema: false,
    };

export default new DataSource(dataSourceOptions);
