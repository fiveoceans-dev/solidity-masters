const { Pool } = require('pg');

// Allow connecting to Supabase or any Postgres database via connection string.
// Prefer `SUPABASE_DB_URL` when available and fall back to the generic
// `DATABASE_URL` which can still point to a Supabase instance.
const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Database connection string is not set.');
}

const pool = new Pool({
  connectionString,
  ssl: {
    // Supabase requires SSL, but it uses self-signed certificates in some
    // environments. Rejecting unauthorized certificates would prevent the
    // connection, so disable that check here.
    rejectUnauthorized: false,
  },
});

module.exports = pool;

