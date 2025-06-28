export interface PgConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export const defaultPgConfig: PgConfig = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'password',
  database: 'postgres'
};