
import * as fs from 'fs';
import * as path from 'path';
import { pool, stateStoreFile, migrationsDir } from './config';
import { Pool, PoolConnection } from 'mysql2';

interface MigrationState {
  lastRun: string | null;
  migrations: Record<string, MigrationRecord>;
}

interface MigrationRecord {
  runAt: string;
}

interface Migration {
  up(connection: PoolConnection, callback: (err?: Error) => void): void;
  down?(connection: PoolConnection, callback: (err?: Error) => void): void;
}

/**
 * Migration runner for the FuelQ database
 */
class MigrationRunner {
  private state: MigrationState;

  constructor() {
    this.state = this.loadState();
  }

  /**
   * Load the migration state from the state store file
   */
  private loadState(): MigrationState {
    try {
      if (fs.existsSync(stateStoreFile)) {
        const stateData = fs.readFileSync(stateStoreFile, 'utf8');
        return JSON.parse(stateData) as MigrationState;
      }
      return { lastRun: null, migrations: {} };
    } catch (error) {
      console.error('Error loading migration state:', error);
      return { lastRun: null, migrations: {} };
    }
  }

  /**
   * Save the migration state to the state store file
   */
  private saveState(): void {
    try {
      fs.writeFileSync(stateStoreFile, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error('Error saving migration state:', error);
    }
  }

  /**
   * Get all migration files sorted by timestamp
   */
  private getMigrationFiles(): string[] {
    try {
      const files = fs.readdirSync(migrationsDir)
        .filter(file => 
          (file.endsWith('.js') || file.endsWith('.ts')) && 
          file !== 'runner.js' && 
          file !== 'runner.ts' && 
          file !== 'config.js' && 
          file !== 'config.ts'
        )
        .sort();

      return files;
    } catch (error) {
      console.error('Error reading migration files:', error);
      return [];
    }
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<void> {
    const migrationFiles = this.getMigrationFiles();
    const pendingMigrations = migrationFiles.filter(file => !this.state.migrations[file]);

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations.');
      return;
    }

    console.log(`Running ${pendingMigrations.length} pending migrations...`);

    for (const file of pendingMigrations) {
      try {
        console.log(`Running migration: ${file}`);

        // Load and execute the migration
        const migrationPath = path.join(migrationsDir, file);
        const migration = require(migrationPath) as Migration;

        // Get a connection from the pool
        const connection = await new Promise<PoolConnection>((resolve, reject) => {
          pool.getConnection((err, conn) => {
            if (err) reject(err);
            else resolve(conn);
          });
        });

        // Begin transaction
        await new Promise<void>((resolve, reject) => {
          connection.beginTransaction(err => {
            if (err) reject(err);
            else resolve();
          });
        });

        // Execute the migration up function
        await new Promise<void>((resolve, reject) => {
          migration.up(connection, err => {
            if (err) reject(err);
            else resolve();
          });
        });

        // Commit the transaction
        await new Promise<void>((resolve, reject) => {
          connection.commit(err => {
            if (err) reject(err);
            else resolve();
          });
        });

        // Release the connection
        connection.release();

        // Update the state
        this.state.migrations[file] = {
          runAt: new Date().toISOString()
        };
        this.state.lastRun = new Date().toISOString();

        console.log(`Migration ${file} completed successfully.`);
      } catch (error) {
        console.error(`Error running migration ${file}:`, error);
        throw error;
      }
    }

    // Save the updated state
    this.saveState();
    console.log('All migrations completed successfully.');
  }

  /**
   * Rollback the last migration
   */
  async rollbackLastMigration(): Promise<void> {
    const migrationFiles = this.getMigrationFiles();
    const completedMigrations = migrationFiles.filter(file => this.state.migrations[file]);

    if (completedMigrations.length === 0) {
      console.log('No migrations to rollback.');
      return;
    }

    const lastMigration = completedMigrations[completedMigrations.length - 1];

    try {
      console.log(`Rolling back migration: ${lastMigration}`);

      // Load and execute the migration
      const migrationPath = path.join(migrationsDir, lastMigration);
      const migration = require(migrationPath) as Migration;

      // Get a connection from the pool
      const connection = await new Promise<PoolConnection>((resolve, reject) => {
        pool.getConnection((err, conn) => {
          if (err) reject(err);
          else resolve(conn);
        });
      });

      // Begin transaction
      await new Promise<void>((resolve, reject) => {
        connection.beginTransaction(err => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Execute the migration down function if it exists
      if (typeof migration.down === 'function') {
        await new Promise<void>((resolve, reject) => {
          migration.down!(connection, err => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      // Commit the transaction
      await new Promise<void>((resolve, reject) => {
        connection.commit(err => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Release the connection
      connection.release();

      // Update the state
      delete this.state.migrations[lastMigration];

      console.log(`Migration ${lastMigration} rolled back successfully.`);
    } catch (error) {
      console.error(`Error rolling back migration ${lastMigration}:`, error);
      throw error;
    }

    // Save the updated state
    this.saveState();
    console.log('Rollback completed successfully.');
  }
}

// Export the MigrationRunner class
export default MigrationRunner;

// If this script is run directly, execute migrations
if (require.main === module) {
  const runner = new MigrationRunner();

  // Parse command line arguments
  const command = process.argv[2];

  if (command === 'up') {
    runner.runMigrations().catch(err => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
  } else if (command === 'down') {
    runner.rollbackLastMigration().catch(err => {
      console.error('Rollback failed:', err);
      process.exit(1);
    });
  } else {
    console.log('Usage: ts-node runner.ts [up|down]');
    console.log('  up   - Run all pending migrations');
    console.log('  down - Rollback the last migration');
  }
}
