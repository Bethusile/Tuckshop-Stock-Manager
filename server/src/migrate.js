import { runner } from 'node-pg-migrate';
import { pool } from './db/connect'; // Re-use your existing connection pool

const migrate = async () => {
  const client = await pool.connect();
  try {
    await runner({
      dbClient: client,
      direction: 'up', // or 'down'
      dir: 'migrations', // folder where migration files are
      migrationsTable: 'pgmigrations',
    });
    console.log('Migration complete!');
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
  }
};

migrate();