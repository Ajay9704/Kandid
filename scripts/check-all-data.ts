import { MongoClient } from 'mongodb'

async function checkAllData() {
  console.log('🔍 Checking all data in database...')
  
  try {
    // Connect directly to MongoDB
    const client = new MongoClient('mongodb://localhost:27017')
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db('linkbird')
    
    // Check users collection
    const users = await db.collection('users').find({}).toArray()
    console.log(`\n👥 Users (${users.length}):`)
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ID: ${user.id}`)
    })
    
    // Check campaigns collection
    const campaigns = await db.collection('campaigns').find({}).toArray()
    console.log(`\n📢 Campaigns (${campaigns.length}):`)
    campaigns.forEach(campaign => {
      console.log(`  - ${campaign.name} (${campaign.id}) - Status: ${campaign.status}, User: ${campaign.userId}`)
    })
    
    // Check leads collection
    const leads = await db.collection('leads').find({}).toArray()
    console.log(`\n👤 Leads (${leads.length}):`)
    leads.forEach(lead => {
      console.log(`  - ${lead.name} (${lead.id}) - Status: ${lead.status}, Connection: ${lead.connectionStatus}, Campaign: ${lead.campaignId}, User: ${lead.userId}`)
    })
    
    await client.close()
    console.log('\n✅ Database check completed')
  } catch (error) {
    console.error('❌ Database check failed:', error)
  }
}

checkAllData()