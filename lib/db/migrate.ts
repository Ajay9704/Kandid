import { db } from './index'
import { sql } from 'drizzle-orm'

export async function runMigrations() {
  try {
    console.log('🚀 Creating tables...')
    
    // Create user table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        emailVerified INTEGER DEFAULT 0,
        image TEXT,
        password TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `)
    
    console.log('✅ Tables created successfully!')
  } catch (error) {
    console.error('❌ Table creation failed:', error)
    throw error
  }
}

// Only run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
}