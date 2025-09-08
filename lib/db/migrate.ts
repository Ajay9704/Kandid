import { sql } from 'drizzle-orm'
import { db } from './index'

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
    
    // Create campaigns table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        description TEXT,
        totalLeads INTEGER DEFAULT 0,
        successfulLeads INTEGER DEFAULT 0,
        responseRate REAL DEFAULT 0.0,
        userId TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `)
    
    // Create leads table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT,
        position TEXT,
        linkedinUrl TEXT,
        profileImage TEXT,
        location TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        connectionStatus TEXT NOT NULL DEFAULT 'not_connected',
        sequenceStep INTEGER DEFAULT 0,
        lastContactDate INTEGER,
        lastActivity TEXT,
        lastActivityDate INTEGER,
        notes TEXT,
        campaignId TEXT,
        userId TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `)
    
    console.log('✅ Tables created successfully!')
    return true
  } catch (error) {
    console.error('❌ Table creation failed:', error)
    return false
  }
}

// Only run migrations if this file is executed directly
if (require.main === module) {
  runMigrations().then(success => {
    if (success) {
      console.log('✅ Database setup completed!')
      process.exit(0)
    } else {
      console.log('❌ Database setup failed!')
      process.exit(1)
    }
  })
}