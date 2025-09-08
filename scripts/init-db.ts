import { runMigrations } from '../lib/db/migrate'
import { existsSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

async function initDatabase() {
  console.log('🚀 Initializing database...')
  
  try {
    // Ensure the database directory exists
    const dbDir = '.'
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true })
      console.log(`✅ Created database directory: ${dbDir}`)
    }
    
    // Run migrations
    const success = await runMigrations()
    
    if (success) {
      console.log('✅ Database initialization completed successfully!')
      process.exit(0)
    } else {
      console.log('❌ Database initialization failed!')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error)
    process.exit(1)
  }
}

initDatabase()