Solidity USC
=================

## Supabase Deployment

This project now supports running against a [Supabase](https://supabase.com/)
PostgreSQL instance. Configure the following environment variable before
starting the server:

```bash
export SUPABASE_DB_URL="<your-supabase-postgres-connection-string>"
```

If `SUPABASE_DB_URL` is not provided the application falls back to the
traditional `DATABASE_URL` variable which can also point to a Supabase
database. Both paths expect an SSL-enabled connection.

Use the standard npm scripts to run the app:

```bash
npm run dev     # Next.js development server
npm start       # Production build
```
