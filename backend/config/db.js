import pg from 'pg';
const { Pool } = pg;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined, max: 10, idleTimeoutMillis: 30000 });
pool.on('error', err => console.error('Unexpected PostgreSQL pool error:', err.message));
export const query = (text, params) => pool.query(text, params);
