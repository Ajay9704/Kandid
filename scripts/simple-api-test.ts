import { db } from '../lib/db/index'
import { campaigns, leads } from '../lib/db/schema'
import { desc } from 'drizzle-orm'

async function simpleApiTest() {
  try {
    console.log('🔍 Testing database operations (simulating API routes)...')
    
    // Test querying campaigns (should work even if table is empty)
    console.log('🔍 Querying campaigns...')
    const allCampaigns = await db.select().from(campaigns).orderBy(desc(campaigns.createdAt)).limit(5)
    console.log(`✅ Found ${allCampaigns.length} campaigns`)
    
    // Test querying leads
    console.log('🔍 Querying leads...')
    const allLeads = await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(5)
    console.log(`✅ Found ${allLeads.length} leads`)
    
    console.log('🎉 All API route simulations completed successfully!')
    return true
  } catch (error) {
    console.error('❌ API route simulation failed:', error)
    return false
  }
}

simpleApiTest().then(success => {
  if (success) {
    console.log('✅ API route simulation completed successfully!')
    process.exit(0)
  } else {
    console.log('❌ API route simulation failed!')
    process.exit(1)
  }
})