import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from './index'

export async function runMigrations() {
  try {
    console.log('🚀 Running migrations...')
    await migrate(db, { migrationsFolder: './lib/db/migrations' })
    console.log('✅ Migrations completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}