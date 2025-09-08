import { db } from '../lib/db/index'
import { campaigns, leads, user } from '../lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { nanoid } from 'nanoid'

async function testDatabaseOperations() {
  try {
    console.log('🔍 Testing database operations...')
    
    // Test querying campaigns (should work even if table is empty)
    console.log('🔍 Querying campaigns...')
    const allCampaigns = await db.select().from(campaigns).orderBy(desc(campaigns.createdAt)).limit(5)
    console.log(`✅ Found ${allCampaigns.length} campaigns`)
    
    // Test querying leads
    console.log('🔍 Querying leads...')
    const allLeads = await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(5)
    console.log(`✅ Found ${allLeads.length} leads`)
    
    console.log('🎉 All database operations completed successfully!')
    return true
  } catch (error) {
    console.error('❌ Database operation test failed:', error)
    return false
  }
}

testDatabaseOperations().then(success => {
  if (success) {
    console.log('✅ Database operations test completed successfully!')
    process.exit(0)
  } else {
    console.log('❌ Database operations test failed!')
    process.exit(1)
  }
})