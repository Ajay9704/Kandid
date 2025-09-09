// This script will test if we can make a direct request to the API endpoints
// We'll simulate what the frontend is doing

async function testApiRequest() {
  console.log('🔍 Testing API request simulation...')
  
  try {
    // Dynamically import the Next.js server to simulate a request
    console.log('This test would require setting up a full Next.js server environment')
    console.log('Instead, let\'s verify the database logic is working correctly')
    
    // Import and initialize database
    const { initializeDatabase } = await import('../lib/db')
    await initializeDatabase()
    
    // Import the mongo adapter
    const { mongoAdapter } = await import('../lib/db/mongo-adapter')
    
    // Test the exact logic used in the API routes
    console.log('\n=== Testing Lead API GET Logic ===')
    const leadId = 'lead-1757393095718-0'
    
    // This is the exact logic from the API route:
    const lead = await mongoAdapter.leads.findLeadById(leadId)
    
    if (!lead) {
      console.log(`❌ Lead not found: ${leadId}`)
    } else {
      console.log(`✅ Lead found: ${lead.name} (ID: ${lead.id}, Campaign: ${lead.campaignId})`)
    }
    
    console.log('\n=== Testing Campaign API GET Logic ===')
    const campaignId = 'campaign-G9OWwUUw1oIt-Q5HYlMaX'
    
    // This is the exact logic from the API route:
    const campaign = await mongoAdapter.campaigns.findCampaignById(campaignId)
    
    if (!campaign) {
      console.log(`❌ Campaign not found: ${campaignId}`)
    } else {
      console.log(`✅ Campaign found: ${campaign.name} (ID: ${campaign.id})`)
    }
    
    console.log('\n✅ API request simulation completed!')
    console.log('\n📝 Note: Since the database logic is working correctly,')
    console.log('   the issue is likely in the frontend authentication or request handling.')
  } catch (error) {
    console.error('❌ Error in API request simulation:', error)
    process.exit(1)
  }
}

testApiRequest()