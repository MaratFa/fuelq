const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u3363187_fuelq_admin',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'u3363187_fuelq',
  multipleStatements: true
};

// Migration directory
const migrationsDir = __dirname;

// State store file
const stateStoreFile = path.join(__dirname, '.migrate');

// Create a connection pool for migrations
const pool = mysql.createPool(dbConfig);

module.exports = {
  dbConfig,
  migrationsDir,
  stateStoreFile,
  pool
};
