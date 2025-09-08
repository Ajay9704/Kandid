import { runMigrations } from '../lib/db/migrate'
import { existsSync, writeFileSync } from 'fs'
import { join } from 'path'

async function setup() {
  console.log('🚀 Setting up database...')
  
  try {
    const success = await runMigrations()
    if (success) {
      console.log('✅ Database setup completed!')
      
      // Create a .gitkeep file in the db directory to ensure it exists in git
      const dbPath = 'sqlite.db'
      if (!existsSync(dbPath)) {
        writeFileSync(dbPath, '', 'utf8')
        console.log('✅ Created empty database file')
      }
      
      process.exit(0)
    } else {
      console.log('⚠️ Database setup completed with warnings')
      process.exit(0)
    }
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

setup()