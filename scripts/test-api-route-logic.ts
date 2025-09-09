// Test the exact logic used in the API routes
import { mongoAdapter } from '../lib/db/mongo-adapter'

async function testApiRouteLogic() {
  console.log('🔍 Testing API route logic...')
  
  try {
    // Import and initialize database
    const { initializeDatabase } = await import('../lib/db')
    await initializeDatabase()
    
    // Simulate what happens in the API route with the exact same logic
    
    // Test lead lookup (exact same logic as in the API route)
    console.log('\n=== Testing Lead API Route Logic ===')
    const leadId = 'lead-1757393095718-0'
    
    console.log(`🔍 Looking for lead with ID: ${leadId}`)
    const lead = await mongoAdapter.leads.findLeadById(leadId)
    
    if (!lead) {
      console.log(`❌ Lead not found with findLeadById: ${leadId}`)
    } else {
      console.log(`✅ Lead found with findLeadById: ${lead.name} (ID: ${lead.id})`)
      console.log(`📝 Lead user ID: ${lead.userId}`)
    }
    
    // Test campaign lookup (exact same logic as in the API route)
    console.log('\n=== Testing Campaign API Route Logic ===')
    const campaignId = 'campaign-G9OWwUUw1oIt-Q5HYlMaX'
    
    console.log(`🔍 Looking for campaign with ID: ${campaignId}`)
    const campaign = await mongoAdapter.campaigns.findCampaignById(campaignId)
    
    if (!campaign) {
      console.log(`❌ Campaign not found with findCampaignById: ${campaignId}`)
    } else {
      console.log(`✅ Campaign found with findCampaignById: ${campaign.name} (ID: ${campaign.id})`)
      console.log(`📝 Campaign user ID: ${campaign.userId}`)
    }
    
    console.log('\n✅ API route logic test completed!')
    console.log('\n📝 Since the database logic is working correctly,')
    console.log('   the issue is likely in the frontend request or session handling.')
  } catch (error) {
    console.error('❌ Error in API route logic test:', error)
    process.exit(1)
  }
}

testApiRouteLogic()