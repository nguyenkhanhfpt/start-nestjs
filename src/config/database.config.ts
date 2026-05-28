import { registerAs } from '@nestjs/config';
import { join } from 'path';
import { TypeOrmLoggerContainer } from '@shared/logger/typeorm.logger';
import { DataSourceOptions } from 'typeorm';

export default registerAs('database', (): DataSourceOptions => {
  const driver = process.env.DATABASE_DRIVER || 'postgres';
  const isSQLite = driver === 'sqlite' || driver === 'better-sqlite3';

  const commonOptions = {
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
    autoLoadEntities: process.env.DATABASE_AUTOLOAD === 'true',
    entities: [join(__dirname, '../database/entities/*.entity{.ts,.js}')],
    logger: TypeOrmLoggerContainer.ForConnection('CONNECTION', 'all'),
  };

  if (isSQLite) {
    console.warn(
      '⚠️  Using SQLite database. This is not recommended for production use.',
    );
    return {
      ...commonOptions,
      type: 'better-sqlite3',
      database: process.env.DATABASE_PATH || './database.sqlite',
    } as DataSourceOptions;
  }

  return {
    ...commonOptions,
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  } as DataSourceOptions;
});
