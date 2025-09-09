import { initializeDatabase } from '../lib/db/index'
import { mongoAdapter } from '../lib/db/mongo-adapter'

async function checkSpecificLead() {
  const leadId = 'lead-1757393095718-0'
  console.log(`🔍 Checking specific lead with ID: ${leadId}`)
  
  try {
    // Initialize database connection
    await initializeDatabase()
    
    // Try to fetch the specific lead
    const lead = await mongoAdapter.leads.findLeadById(leadId)
    
    if (lead) {
      console.log('✅ Lead found:')
      console.log(`  Name: ${lead.name}`)
      console.log(`  Email: ${lead.email}`)
      console.log(`  Status: ${lead.status}`)
      console.log(`  Connection Status: ${lead.connectionStatus}`)
      console.log(`  Created At: ${lead.createdAt}`)
      console.log(`  Updated At: ${lead.updatedAt}`)
    } else {
      console.log('❌ Lead not found in database')
      
      // Let's also check if there are any leads with similar IDs
      console.log('🔍 Checking for similar leads...')
      const result = await mongoAdapter.leads.findLeadsByUserId('demo-user-id', {
        limit: 100,
        offset: 0
      })
      
      const similarLeads = result.data.filter((lead: any) => 
        lead.id.includes('1757393095718') || lead.id.includes('lead-1757')
      )
      
      if (similarLeads.length > 0) {
        console.log(`✅ Found ${similarLeads.length} similar leads:`)
        similarLeads.forEach((lead: any, index: number) => {
          console.log(`${index + 1}. ${lead.name} (${lead.email}) - ID: ${lead.id}`)
        })
      } else {
        console.log('❌ No similar leads found')
      }
    }
    
    console.log('✅ Specific lead check completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error checking specific lead:', error)
    process.exit(1)
  }
}

checkSpecificLead()