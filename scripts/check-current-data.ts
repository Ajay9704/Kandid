import { mongoAdapter } from '../lib/db/mongo-adapter'

async function checkCurrentData() {
  console.log('🔍 Checking current database state...')
  
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
    
    // Check all campaigns
    console.log('\n=== Campaigns ===')
    const campaignsResult = await mongoAdapter.campaigns.findCampaignsByUserId(demoUserId, {})
    console.log(`Found ${campaignsResult.total} campaigns`)
    campaignsResult.data.forEach((campaign: any) => {
      console.log(`  - ${campaign.name} (ID: ${campaign.id})`)
    })
    
    // Check all leads
    console.log('\n=== Leads ===')
    const leadsResult = await mongoAdapter.leads.findLeadsByUserId(demoUserId, {})
    console.log(`Found ${leadsResult.total} leads`)
    leadsResult.data.forEach((lead: any) => {
      console.log(`  - ${lead.name} (ID: ${lead.id}, Campaign: ${lead.campaignId})`)
    })
    
    console.log('\n✅ Database check completed!')
  } catch (error) {
    console.error('❌ Error checking database:', error)
    process.exit(1)
  }
}

checkCurrentData()