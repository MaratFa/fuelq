
import * as fs from 'fs';
import * as path from 'path';
import * as mysql from 'mysql2';
import * as dotenv from 'dotenv';
dotenv.config();

// Database configuration
interface DbConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  multipleStatements: boolean;
}

const dbConfig: DbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u3363187_fuelq_admin',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'u3363187_fuelq',
  multipleStatements: true
};

// Migration directory
const migrationsDir: string = __dirname;

// State store file
const stateStoreFile: string = path.join(__dirname, '.migrate');

// Create a connection pool for migrations
const pool: mysql.Pool = mysql.createPool(dbConfig);

export {
  dbConfig,
  migrationsDir,
  stateStoreFile,
  pool
};
