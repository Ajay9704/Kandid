import { mongoAdapter } from '../lib/db/mongo-adapter'

async function testApiEndpoints() {
  console.log('🔍 Testing API endpoints...')
  
  try {
    // Import and initialize database
    const { initializeDatabase } = await import('../lib/db')
    await initializeDatabase()
    
    // Simulate what the API route does for a specific lead
    console.log('\n=== Testing Lead API Route Logic ===')
    const leadId = 'lead-1757393095718-0'
    
    // This is what the API route does:
    const lead = await mongoAdapter.leads.findLeadById(leadId)
    if (!lead) {
      console.log(`❌ Lead not found in API route logic: ${leadId}`)
    } else {
      console.log(`✅ Lead found in API route logic: ${lead.name} (ID: ${lead.id})`)
    }
    
    // Simulate what the API route does for a specific campaign
    console.log('\n=== Testing Campaign API Route Logic ===')
    const campaignId = 'campaign-G9OWwUUw1oIt-Q5HYlMaX'
    
    // This is what the API route does:
    const campaign = await mongoAdapter.campaigns.findCampaignById(campaignId)
    if (!campaign) {
      console.log(`❌ Campaign not found in API route logic: ${campaignId}`)
    } else {
      console.log(`✅ Campaign found in API route logic: ${campaign.name} (ID: ${campaign.id})`)
    }
    
    console.log('\n✅ API endpoint logic test completed!')
  } catch (error) {
    console.error('❌ Error testing API endpoints:', error)
    process.exit(1)
  }
}

testApiEndpoints()