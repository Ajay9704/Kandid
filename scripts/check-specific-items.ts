import { mongoAdapter } from '../lib/db/mongo-adapter'

async function checkSpecificItems() {
  console.log('🔍 Checking specific items...')
  
  try {
    // Import and initialize database
    const { initializeDatabase } = await import('../lib/db')
    await initializeDatabase()
    
    // Check specific campaign
    console.log('\n=== Checking Campaign ===')
    const campaignId = 'campaign-G9OWwUUw1oIt-Q5HYlMaX'
    const campaign = await mongoAdapter.campaigns.findCampaignById(campaignId)
    if (campaign) {
      console.log(`✅ Found campaign: ${campaign.name} (ID: ${campaign.id})`)
    } else {
      console.log(`❌ Campaign not found: ${campaignId}`)
    }
    
    // Check specific lead
    console.log('\n=== Checking Lead ===')
    const leadId = 'lead-1757393095718-0'
    const lead = await mongoAdapter.leads.findLeadById(leadId)
    if (lead) {
      console.log(`✅ Found lead: ${lead.name} (ID: ${lead.id}, Campaign: ${lead.campaignId})`)
    } else {
      console.log(`❌ Lead not found: ${leadId}`)
    }
    
    console.log('\n✅ Specific items check completed!')
  } catch (error) {
    console.error('❌ Error checking specific items:', error)
    process.exit(1)
  }
}

checkSpecificItems()