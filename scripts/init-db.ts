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
    
    // For MongoDB, we don't need migrations
    console.log('✅ Database initialization completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Database initialization error:', error)
    process.exit(1)
  }
}

initDatabase()