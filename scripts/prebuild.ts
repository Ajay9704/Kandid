import { runMigrations } from '../lib/db/migrate'
import { existsSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

async function prebuild() {
  console.log('🏗️  Preparing for build...')
  
  try {
    // Ensure the database directory exists
    const dbPath = './sqlite.db'
    const dbDir = '.'
    
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true })
      console.log(`✅ Created database directory: ${dbDir}`)
    }
    
    // Run migrations to ensure database schema is up to date
    const success = await runMigrations()
    
    if (success) {
      console.log('✅ Database migrations completed successfully!')
      
      // Create empty database file if it doesn't exist
      if (!existsSync(dbPath)) {
        writeFileSync(dbPath, '', 'utf8')
        console.log('✅ Created empty database file')
      }
      
      console.log('🎉 Prebuild completed successfully!')
      process.exit(0)
    } else {
      console.log('❌ Database migrations failed!')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Prebuild error:', error)
    process.exit(1)
  }
}

prebuild()