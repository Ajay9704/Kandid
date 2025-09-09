import { initializeDatabase } from '../lib/db/index'
import { mongoAdapter } from '../lib/db/mongo-adapter'

async function testLeadUpdate() {
  const leadId = 'lead-1757393095718-0'
  console.log(`🔍 Testing lead update for ID: ${leadId}`)
  
  try {
    // Initialize database connection
    await initializeDatabase()
    
    // First, check if the lead exists
    console.log('🔍 Checking if lead exists...')
    const lead = await mongoAdapter.leads.findLeadById(leadId)
    
    if (!lead) {
      console.log('❌ Lead not found in database')
      process.exit(1)
    }
    
    console.log('✅ Lead found in database')
    console.log(`  Name: ${lead.name}`)
    console.log(`  Email: ${lead.email}`)
    console.log(`  Status: ${lead.status}`)
    console.log(`  Connection Status: ${lead.connectionStatus}`)
    console.log(`  Created At: ${lead.createdAt}`)
    console.log(`  Updated At: ${lead.updatedAt}`)
    
    // Try to update the lead with different values
    console.log('🔍 Attempting to update lead with different values...')
    const updateData = {
      status: 'pending',
      connectionStatus: 'not_connected',
      updatedAt: new Date()
    }
    
    console.log('  Update data:', JSON.stringify(updateData, null, 2))
    
    const result = await mongoAdapter.leads.updateLead(leadId, updateData)
    
    console.log('  Update result:', result)
    
    if (result) {
      console.log('✅ Lead updated successfully!')
      console.log(`  New status: ${result.status}`)
      console.log(`  New connection status: ${result.connectionStatus}`)
      console.log(`  New updated at: ${result.updatedAt}`)
    } else {
      console.log('❌ Failed to update lead - updateLead returned null')
      
      // Let's try a different approach - check if the lead still exists after the failed update
      console.log('🔍 Checking if lead still exists after failed update...')
      const leadAfterFailedUpdate = await mongoAdapter.leads.findLeadById(leadId)
      console.log('  Lead after failed update:', leadAfterFailedUpdate)
    }
    
    console.log('✅ Lead update test completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error testing lead update:', error)
    process.exit(1)
  }
}

testLeadUpdate()