import { MongoClient } from 'mongodb'

async function cleanupDatabase() {
  console.log('🧹 Cleaning up database...')
  
  try {
    // Connect to MongoDB
    const mongoUrl = 'mongodb://localhost:27017/linkbird'
    const client = new MongoClient(mongoUrl, {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    })
    
    await client.connect()
    const db = client.db('linkbird')
    
    // Delete all campaigns with fixed IDs
    const campaignsCollection = db.collection('campaigns')
    const deletedCampaigns = await campaignsCollection.deleteMany({
      id: { $in: ['campaign-1', 'campaign-2'] }
    })
    console.log(`🗑️ Deleted ${deletedCampaigns.deletedCount} campaigns with fixed IDs`)
    
    // Delete all leads associated with those campaigns
    const leadsCollection = db.collection('leads')
    const deletedLeads = await leadsCollection.deleteMany({
      campaignId: { $in: ['campaign-1', 'campaign-2'] }
    })
    console.log(`🗑️ Deleted ${deletedLeads.deletedCount} leads associated with fixed campaign IDs`)
    
    await client.close()
    console.log('✅ Database cleanup completed successfully!')
  } catch (error) {
    console.error('❌ Error cleaning up database:', error)
    process.exit(1)
  }
}

cleanupDatabase()