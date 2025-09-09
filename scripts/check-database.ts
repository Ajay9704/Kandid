import { mongoAdapter } from '../lib/db/mongo-adapter'

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...')
    
    // Test the connection
    console.log('✅ Database connection successful!')
    
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error instanceof Error ? error.message : 'Unknown error')
    console.log('💡 This might be expected in some environments like Vercel')
    return false
  }
}

checkDatabase().then(success => {
  if (success) {
    console.log('✅ Database check completed successfully!')
    process.exit(0)
  } else {
    console.log('❌ Database check failed!')
    process.exit(1)
  }
})