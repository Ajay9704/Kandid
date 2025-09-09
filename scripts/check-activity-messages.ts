import { MongoClient } from 'mongodb'

async function checkActivityAndMessages() {
  console.log('🔍 Checking activity logs and messages...')
  
  try {
    // Connect directly to MongoDB
    const client = new MongoClient('mongodb://localhost:27017')
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db('linkbird')
    
    // Check activity logs
    const activities = await db.collection('activityLogs').find({}).toArray()
    console.log(`\n📝 Activity Logs (${activities.length}):`)
    activities.forEach(activity => {
      console.log(`  - ${activity.description} (${activity.activityType}) - ${new Date(activity.createdAt).toLocaleDateString()}`)
    })
    
    // Check messages
    const messages = await db.collection('messages').find({}).toArray()
    console.log(`\n📧 Messages (${messages.length}):`)
    messages.forEach(message => {
      console.log(`  - To lead ${message.leadId}: ${message.subject} (${message.status})`)
    })
    
    await client.close()
    console.log('\n✅ Check completed')
  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkActivityAndMessages()