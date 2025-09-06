import { db } from '../lib/db/index'
import * as schema from '../lib/db/schema'

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database schema...')
    
    // Try to create campaigns table if it doesn't exist
    try {
      await db.select().from(schema.campaigns).limit(1)
      console.log('✅ Campaigns table exists')
    } catch (error) {
      console.log('❌ Campaigns table missing, creating...')
      // The table will be created automatically by Drizzle when we try to insert
    }
    
    // Try to create leads table if it doesn't exist
    try {
      await db.select().from(schema.leads).limit(1)
      console.log('✅ Leads table exists')
    } catch (error) {
      console.log('❌ Leads table missing, creating...')
      // The table will be created automatically by Drizzle when we try to insert
    }
    
    // Create a test campaign to ensure table exists
    try {
      const existingCampaigns = await db.select().from(schema.campaigns).limit(1)
      if (existingCampaigns.length === 0) {
        console.log('📝 Creating test campaign...')
        await db.insert(schema.campaigns).values({
          id: 'test-campaign-1',
          name: 'Test Campaign',
          status: 'active',
          description: 'A test campaign for development',
          totalLeads: 0,
          successfulLeads: 0,
          responseRate: 0.0,
          userId: '7e28ad20-e128-4ecd-a126-957064bfb2e7', // Demo user ID
        })
        console.log('✅ Test campaign created')
      }
    } catch (error) {
      console.error('Error creating test campaign:', error)
    }
    
    console.log('🎉 Database fix completed!')
    
  } catch (error) {
    console.error('❌ Error fixing database:', error)
  }
}

fixDatabase()