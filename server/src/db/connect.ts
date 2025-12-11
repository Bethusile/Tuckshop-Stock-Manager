import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables (should be loaded in index.ts, but good to have here too)
dotenv.config();

// PostgreSQL Connection Pool
export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Function to test and confirm database connection
export const connectDB = async () => {
    try {
        await pool.query('SELECT 1'); // Simple query to test the connection
        console.log('✅ PostgreSQL Database Connected!');
    } catch (error) {
        console.error('❌ Database connection error. Check environment variables:', error);
        throw new Error('Failed to connect to the database.');
    }
};

// Export the pool for use in controllers
export default pool;