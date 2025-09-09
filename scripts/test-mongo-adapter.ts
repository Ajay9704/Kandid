import { mongoAdapter } from '../lib/db/mongo-adapter'
import { db, client } from '../lib/db'

async function testMongoAdapter() {
  console.log('🔍 Testing mongoAdapter...')
  
  try {
    console.log('📊 Database status:', db ? 'Connected' : 'Not connected')
    
    // Try to find the demo user using mongoAdapter
    console.log('🔍 Searching for demo user using mongoAdapter...')
    const demoUser = await mongoAdapter.users.findUserByEmail('demo@linkbird.com')
    
    if (demoUser) {
      console.log('✅ Demo user found via mongoAdapter:')
      console.log('  - Name:', demoUser.name)
      console.log('  - Email:', demoUser.email)
      console.log('  - ID:', demoUser.id)
    } else {
      console.log('❌ Demo user NOT found via mongoAdapter')
    }
    
    // List all users via direct database access
    if (db) {
      const users = await db.collection('users').find({}).toArray()
      console.log(`📊 Found ${users.length} user(s) via direct access:`)
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - ID: ${user.id}`)
      })
    }
    
    console.log('✅ MongoAdapter test completed')
  } catch (error) {
    console.error('❌ MongoAdapter test failed:', error)
  }
}

testMongoAdapter()