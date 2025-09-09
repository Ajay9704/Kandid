import { initializeDatabase } from '../lib/db/index'
import { mongoAdapter } from '../lib/db/mongo-adapter'

async function testApiLeadUpdate() {
  const leadId = 'lead-1757393095718-0'
  console.log(`🔍 Testing API lead update for ID: ${leadId}`)
  
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
    console.log(`  Status: ${lead.status}`)
    console.log(`  Connection Status: ${lead.connectionStatus}`)
    
    // Try to update the lead with the same approach as the API route
    console.log('🔍 Attempting to update lead with API-like approach...')
    const updateData = {
      status: 'contacted',
      connectionStatus: 'request_sent'
    }
    
    console.log('  Update data:', JSON.stringify(updateData, null, 2))
    
    // Check if lead exists first (like in the API route)
    const existingLead = await mongoAdapter.leads.findLeadById(leadId)
    if (!existingLead) {
      console.log('❌ Lead not found during pre-check')
      process.exit(1)
    }
    
    // Prepare update data - only include fields that are actually provided
    const updateFields: any = {
      updatedAt: new Date(),
    }
    
    // Only add fields that are actually provided in the request
    if (updateData.status !== undefined) updateFields.status = updateData.status
    if (updateData.connectionStatus !== undefined) updateFields.connectionStatus = updateData.connectionStatus
    
    console.log('  Final update fields:', JSON.stringify(updateFields, null, 2))
    
    // Update in database
    const updatedLead = await mongoAdapter.leads.updateLead(leadId, updateFields)
    
    if (!updatedLead) {
      console.log('❌ Failed to update lead - updateLead returned null')
      process.exit(1)
    }
    
    console.log('✅ Lead updated successfully via API-like approach!')
    console.log(`  New status: ${updatedLead.status}`)
    console.log(`  New connection status: ${updatedLead.connectionStatus}`)
    
    console.log('✅ API lead update test completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error testing API lead update:', error)
    process.exit(1)
  }
}

testApiLeadUpdate()