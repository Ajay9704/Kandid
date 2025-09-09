import { config } from 'dotenv'
import { MongoClient } from 'mongodb'

// Load environment variables
config({ path: '.env.local' })
config({ path: '.env', override: false })

async function testVercelDatabase() {
  console.log('🔍 Testing database configuration in Vercel-like environment...')
  console.log('🔧 DATABASE_URL:', process.env.DATABASE_URL || 'not set')
  
  // Simulate Vercel environment
  process.env.VERCEL = '1'
  
  try {
    const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/linkbird'
    console.log('🔗 Connecting to:', mongoUrl)
    
    // Test database connectivity
    const client = new MongoClient(mongoUrl)
    await client.connect()
    console.log('✅ MongoDB connected successfully!')
    
    const db = client.db('linkbird')
    const collections = await db.listCollections().toArray()
    console.log('📊 Collections found:', collections.map(c => c.name))
    
    await client.close()
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