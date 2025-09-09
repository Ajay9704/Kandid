import { MongoClient } from 'mongodb'

async function verifySeedData() {
  console.log('🔍 Verifying seed data...')
  
  try {
    // Connect directly to MongoDB
    const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/linkbird'
    const client = new MongoClient(mongoUrl)
    
    await client.connect()
    console.log('✅ MongoDB connected successfully!')
    
    const db = client.db('linkbird')
    
    // Check users
    const users = await db.collection('users').find({}).toArray()
    console.log(`👥 Users found: ${users.length}`)
    users.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id})`)
    })
    
    // Check campaigns
    const campaigns = await db.collection('campaigns').find({}).toArray()
    console.log(`📢 Campaigns found: ${campaigns.length}`)
    campaigns.forEach(campaign => {
      console.log(`  - ${campaign.name} (ID: ${campaign.id})`)
    })
    
    // Check leads
    const leads = await db.collection('leads').find({}).toArray()
    console.log(`👤 Leads found: ${leads.length}`)
    leads.forEach(lead => {
      console.log(`  - ${lead.name} (ID: ${lead.id}, Campaign: ${lead.campaignId})`)
    })
    
    await client.close()
    console.log('✅ Verification completed successfully!')
  } catch (error) {
    console.error('❌ Error verifying seed data:', error)
    process.exit(1)
  }
}

verifySeedData()