import { db } from '../lib/db/index'
import { User, Campaign, Lead } from '../lib/db/schema'

async function testVercelDatabase() {
  console.log('🔍 Testing database configuration in Vercel-like environment...')
  
  // Simulate Vercel environment
  process.env.VERCEL = '1'
  
  try {
    if (!db) {
      throw new Error('Database not initialized')
    }
    
    // Test database connectivity
    const collections = await db.listCollections().toArray()
    console.log('✅ Database connection successful')
    console.log('📊 Collections found:', collections.map(c => c.name))
    
    console.log('🎉 All tests passed! Database is working correctly.')
    return true
  } catch (error) {
    console.error('❌ Verification failed:', error)
    return false
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testVercelDatabase().then(success => {
    if (success) {
      console.log('✅ Vercel database configuration test successful!')
      process.exit(0)
    } else {
      console.log('❌ Vercel database configuration test failed!')
      process.exit(1)
    }
  })
}

export default testVercelDatabase