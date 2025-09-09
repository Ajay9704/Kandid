#!/usr/bin/env tsx
import { initializeDatabase } from '../lib/db'
import { mongoAdapter } from '../lib/db/mongo-adapter'

async function verifyFixes() {
  console.log('🔍 Verifying fixes...')
  
  try {
    // Initialize database
    await initializeDatabase()
    
    // Find demo user
    const demoUser = await mongoAdapter.users.findUserByEmail('demo@linkbird.com')
    if (!demoUser) {
      console.log('❌ Demo user not found')
      process.exit(1)
    }
    
    console.log(`✅ Found demo user: ${demoUser.email}`)
    
    // Check campaigns
    const campaignsResult = await mongoAdapter.campaigns.findCampaignsByUserId(demoUser.id)
    console.log(`📊 Found ${campaignsResult.total} campaigns`)
    
    // Check leads
    const leadsResult = await mongoAdapter.leads.findLeadsByUserId(demoUser.id)
    console.log(`📊 Found ${leadsResult.total} leads`)
    
    // Check lead statuses
    const statusCounts: Record<string, number> = {}
    leadsResult.data.forEach(lead => {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1
    })
    
    console.log('📊 Lead status distribution:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`)
    })
    
    // Check connection statuses
    const connectionStatusCounts: Record<string, number> = {}
    leadsResult.data.forEach(lead => {
      connectionStatusCounts[lead.connectionStatus] = (connectionStatusCounts[lead.connectionStatus] || 0) + 1
    })
    
    console.log('📊 Lead connection status distribution:')
    Object.entries(connectionStatusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`)
    })
    
    // Check active campaigns
    const activeCampaigns = campaignsResult.data.filter(c => c.status === 'active')
    console.log(`📊 Active campaigns: ${activeCampaigns.length}`)
    
    // Check active leads (leads with status that indicates activity)
    const activeLeads = leadsResult.data.filter(lead => 
      ['contacted', 'responded', 'qualified', 'converted', 'nurturing'].includes(lead.status)
    )
    console.log(`📊 Active leads: ${activeLeads.length}`)
    
    console.log('✅ Verification completed successfully!')
    console.log('\n📋 Summary:')
    console.log(`  Total Campaigns: ${campaignsResult.total}`)
    console.log(`  Active Campaigns: ${activeCampaigns.length}`)
    console.log(`  Total Leads: ${leadsResult.total}`)
    console.log(`  Active Leads: ${activeLeads.length}`)
  } catch (error) {
    console.error('❌ Error during verification:', error)
    process.exit(1)
  }
}

// Run the verification
verifyFixes()