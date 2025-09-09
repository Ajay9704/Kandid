import { db } from '../lib/db/index'
import { COLLECTIONS } from '../lib/db/schema'

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database schema...')
    
    if (!db) {
      throw new Error('Database not initialized')
    }
    
    // For MongoDB, we just ensure the collections exist by creating them if needed
    try {
      // Create collections if they don't exist
      const collections = await db.listCollections().toArray()
      const collectionNames = collections.map(c => c.name)
      
      // Ensure campaigns collection exists
      if (!collectionNames.includes(COLLECTIONS.CAMPAIGNS)) {
        await db.createCollection(COLLECTIONS.CAMPAIGNS)
        console.log('✅ Campaigns collection created')
      } else {
        console.log('✅ Campaigns collection exists')
      }
      
      // Ensure leads collection exists
      if (!collectionNames.includes(COLLECTIONS.LEADS)) {
        await db.createCollection(COLLECTIONS.LEADS)
        console.log('✅ Leads collection created')
      } else {
        console.log('✅ Leads collection exists')
      }
      
      // Create indexes
      await db.collection(COLLECTIONS.CAMPAIGNS).createIndex({ userId: 1 })
      await db.collection(COLLECTIONS.LEADS).createIndex({ campaignId: 1 })
      await db.collection(COLLECTIONS.LEADS).createIndex({ userId: 1 })
      
      console.log('✅ Database indexes created')
      
      // Create a test campaign to ensure collection works
      const existingCampaigns = await db.collection(COLLECTIONS.CAMPAIGNS).countDocuments()
      if (existingCampaigns === 0) {
        console.log('📝 Creating test campaign...')
        await db.collection(COLLECTIONS.CAMPAIGNS).insertOne({
          id: 'test-campaign-1',
          name: 'Test Campaign',
          status: 'active',
          description: 'A test campaign for development',
          totalLeads: 0,
          successfulLeads: 0,
          responseRate: 0.0,
          userId: '7e28ad20-e128-4ecd-a126-957064bfb2e7', // Demo user ID
          createdAt: new Date(),
          updatedAt: new Date()
        })
        console.log('✅ Test campaign created')
      }
    } catch (error) {
      console.error('Error creating collections:', error)
    }
    
    console.log('🎉 Database fix completed!')
    
  } catch (error) {
    console.error('❌ Error fixing database:', error)
  }
}

fixDatabase()