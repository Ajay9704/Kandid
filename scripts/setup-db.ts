import { runMigrations } from '../lib/db/migrate'

async function setup() {
  console.log('🚀 Setting up database...')
  
  try {
    await runMigrations()
    console.log('✅ Database setup completed!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

setup()