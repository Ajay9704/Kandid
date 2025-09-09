import { initializeDatabase } from '../lib/db/index'
import { mongoAdapter } from '../lib/db/mongo-adapter'

async function checkLeads() {
  console.log('🔍 Checking leads in database...')
  
  try {
    // Initialize database connection
    await initializeDatabase()
    
    // Try to fetch leads
    const result = await mongoAdapter.leads.findLeadsByUserId('demo-user-id', {
      limit: 10,
      offset: 0
    })
    
    console.log(`✅ Found ${result.total} leads in database`)
    console.log('📋 First 5 leads:')
    result.data.slice(0, 5).forEach((lead: any, index: number) => {
      console.log(`${index + 1}. ${lead.name} (${lead.email}) - ID: ${lead.id}`)
    })
    
    if (result.total === 0) {
      console.log('ℹ️  No leads found in database')
    }
    
    console.log('✅ Lead check completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error checking leads:', error)
    process.exit(1)
  }
}

checkLeads()