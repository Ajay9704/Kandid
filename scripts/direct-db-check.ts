import { MongoClient } from 'mongodb'

async function checkDatabaseDirectly() {
  console.log('🔍 Direct database check...')
  
  try {
    // Connect directly to MongoDB
    const client = new MongoClient('mongodb://localhost:27017')
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db('linkbird')
    
    // Check users collection
    const users = await db.collection('users').find({}).toArray()
    console.log(`📊 Found ${users.length} user(s) in database:`)
    
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ID: ${user.id}`)
    })
    
    // Specifically check for demo user
    const demoUser = await db.collection('users').findOne({ email: 'demo@linkbird.com' })
    if (demoUser) {
      console.log('✅ Demo user found in database:')
      console.log('  - Name:', demoUser.name)
      console.log('  - Email:', demoUser.email)
      console.log('  - ID:', demoUser.id)
    } else {
      console.log('❌ Demo user NOT found in database')
    }
    
    await client.close()
    console.log('✅ Direct database check completed')
  } catch (error) {
    console.error('❌ Direct database check failed:', error)
  }
}

checkDatabaseDirectly()