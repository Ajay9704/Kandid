import { MongoClient } from 'mongodb'

async function cleanupDatabase() {
  console.log('🧹 Cleaning up database...')
  
  try {
    // Connect directly to MongoDB
    const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/linkbird'
    const client = new MongoClient(mongoUrl)
    
    await client.connect()
    console.log('✅ MongoDB connected successfully!')
    
    const db = client.db('linkbird')
    
    // Clean up duplicate campaigns
    console.log('\n--- Cleaning up duplicate campaigns ---')
    const campaigns = await db.collection('campaigns').find({}).toArray()
    const campaignMap = new Map()
    
    for (const campaign of campaigns) {
      if (campaignMap.has(campaign.name)) {
        console.log(`🗑️  Deleting duplicate campaign: ${campaign.name} (ID: ${campaign.id})`)
        await db.collection('campaigns').deleteOne({ id: campaign.id })
      } else {
        campaignMap.set(campaign.name, campaign.id)
      }
    }
    
    // Clean up duplicate leads
    console.log('\n--- Cleaning up duplicate leads ---')
    const leads = await db.collection('leads').find({}).toArray()
    const leadMap = new Map()
    
    for (const lead of leads) {
      const key = `${lead.name}-${lead.email}`
      if (leadMap.has(key)) {
        console.log(`🗑️  Deleting duplicate lead: ${lead.name} (ID: ${lead.id})`)
        await db.collection('leads').deleteOne({ id: lead.id })
      } else {
        leadMap.set(key, lead.id)
      }
    }
    
    await client.close()
    console.log('\n✅ Database cleanup completed successfully!')
  } catch (error) {
    console.error('❌ Error cleaning up database:', error)
    process.exit(1)
  }
}

cleanupDatabase()