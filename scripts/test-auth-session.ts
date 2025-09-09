import { mongoAdapter } from '../lib/db/mongo-adapter'

async function testAuthSession() {
  console.log('🔍 Testing authentication session logic...')
  
  try {
    // Import and initialize database
    const { initializeDatabase } = await import('../lib/db')
    await initializeDatabase()
    
    // Get the existing demo user
    const existingUser = await mongoAdapter.users.findUserByEmail('demo@linkbird.com')
    
    if (!existingUser) {
      console.log('❌ Demo user not found. Please run "npm run create-demo-user" first.')
      process.exit(1)
    }
    
    const demoUserId = existingUser.id
    console.log(`✅ Using existing demo user: ${existingUser.email} (ID: ${demoUserId})`)
    
    // Test the specific lead that's causing issues
    const leadId = 'lead-1757393095718-0'
    console.log(`\n=== Testing Lead Ownership ===`)
    const lead = await mongoAdapter.leads.findLeadById(leadId)
    
    if (!lead) {
      console.log(`❌ Lead not found: ${leadId}`)
    } else {
      console.log(`✅ Lead found: ${lead.name} (ID: ${lead.id})`)
      console.log(`📝 Lead user ID: ${lead.userId}`)
      console.log(`📝 Session user ID: ${demoUserId}`)
      console.log(`✅ User ID match: ${lead.userId === demoUserId}`)
    }
    
    // Test the specific campaign that's causing issues
    const campaignId = 'campaign-G9OWwUUw1oIt-Q5HYlMaX'
    console.log(`\n=== Testing Campaign Ownership ===`)
    const campaign = await mongoAdapter.campaigns.findCampaignById(campaignId)
    
    if (!campaign) {
      console.log(`❌ Campaign not found: ${campaignId}`)
    } else {
      console.log(`✅ Campaign found: ${campaign.name} (ID: ${campaign.id})`)
      console.log(`📝 Campaign user ID: ${campaign.userId}`)
      console.log(`📝 Session user ID: ${demoUserId}`)
      console.log(`✅ User ID match: ${campaign.userId === demoUserId}`)
    }
    
    console.log('\n✅ Authentication session test completed!')
  } catch (error) {
    console.error('❌ Error in authentication session test:', error)
    process.exit(1)
  }
}

testAuthSession()