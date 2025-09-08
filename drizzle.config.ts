import { defineConfig } from 'drizzle-kit'
import { join } from 'path'

// Use absolute path for the database file
const dbPath = process.env.DATABASE_URL || './sqlite.db'

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: dbPath,
  },
})