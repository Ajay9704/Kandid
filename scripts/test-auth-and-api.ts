import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

async function testAuthAndApi() {
  console.log('🔍 Testing authentication and API access...')
  
  try {
    // Connect directly to MongoDB
    const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/linkbird'
    const client = new MongoClient(mongoUrl)
    
    await client.connect()
    console.log('✅ MongoDB connected successfully!')
    
    const db = client.db('linkbird')
    
    // Check if demo user exists
    const existingUser = await db.collection('users').findOne({ email: 'demo@linkbird.com' })
    
    if (!existingUser) {
      console.log('❌ Demo user not found.')
      await client.close()
      return false
    }
    
    console.log(`✅ Demo user found: ${existingUser.email}`)
    
    // Test campaign data
    const campaigns = await db.collection('campaigns').find({ userId: existingUser.id }).toArray()
    console.log(`✅ Found ${campaigns.length} campaigns for user`)
    
    // Test lead data
    const leads = await db.collection('leads').find({ userId: existingUser.id }).toArray()
    console.log(`✅ Found ${leads.length} leads for user`)
    
    await client.close()
    console.log('🎉 Authentication and API access test completed successfully!')
    return true
  } catch (error) {
    console.error('❌ Error testing authentication and API access:', error)
    return false
  }
}

testAuthAndApi().then(success => {
  if (success) {
    console.log('✅ All tests passed!')
    process.exit(0)
  } else {
    console.log('❌ Some tests failed!')
    process.exit(1)
  }
})