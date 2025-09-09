#!/usr/bin/env tsx
import { MongoClient } from 'mongodb'
import { initializeDatabase as initDb } from '../lib/db'
import { mongoAdapter } from '../lib/db/mongo-adapter'
import { nanoid } from 'nanoid'

async function populateAnalyticsData() {
  console.log('📊 Populating analytics data...')
  
  try {
    // Initialize database
    await initDb()
    
    // Find demo user
    const demoUser = await mongoAdapter.users.findUserByEmail('demo@linkbird.com')
    if (!demoUser) {
      console.log('❌ Demo user not found. Please run "npm run create-demo-user" first.')
      process.exit(1)
    }
    
    console.log(`✅ Using demo user: ${demoUser.email} (ID: ${demoUser.id})`)
    
    // Create more campaigns if needed
    const existingCampaigns = await mongoAdapter.campaigns.findCampaignsByUserId(demoUser.id)
    let campaigns = existingCampaigns.data
    
    if (campaigns.length < 3) {
      console.log('➕ Creating additional campaigns...')
      
      const newCampaigns = [
        {
          id: `campaign-${nanoid()}`,
          name: 'Enterprise Outreach Q1',
          status: 'active',
          description: 'Targeting enterprise clients for Q1 growth',
          totalLeads: 0,
          successfulLeads: 0,
          responseRate: 0.0,
          userId: demoUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: `campaign-${nanoid()}`,
          name: 'Startup Founder Campaign',
          status: 'active',
          description: 'Connecting with startup founders and CTOs',
          totalLeads: 0,
          successfulLeads: 0,
          responseRate: 0.0,
          userId: demoUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]
      
      for (const campaign of newCampaigns) {
        try {
          await mongoAdapter.campaigns.createCampaign(campaign)
          console.log(`✅ Created campaign: ${campaign.name}`)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.log(`⚠️ Campaign ${campaign.name} might already exist:`, errorMessage)
        }
      }
      
      // Refresh campaigns list
      const updatedCampaigns = await mongoAdapter.campaigns.findCampaignsByUserId(demoUser.id)
      campaigns = updatedCampaigns.data
    }
    
    // Create more leads with varied statuses
    console.log('➕ Creating leads with varied statuses...')
    
    const leadData = [
      // Campaign 1 leads
      { name: 'Alex Johnson', email: 'alex.johnson@techcorp.com', company: 'TechCorp', position: 'CTO', campaignId: campaigns[0]?.id },
      { name: 'Maria Garcia', email: 'maria.garcia@techcorp.com', company: 'TechCorp', position: 'VP Engineering', campaignId: campaigns[0]?.id },
      { name: 'David Smith', email: 'david.smith@innovateco.com', company: 'InnovateCo', position: 'Director', campaignId: campaigns[0]?.id },
      { name: 'Sarah Williams', email: 'sarah.williams@startupxyz.com', company: 'StartupXYZ', position: 'Founder', campaignId: campaigns[0]?.id },
      { name: 'James Brown', email: 'james.brown@enterpriseinc.com', company: 'Enterprise Inc', position: 'CEO', campaignId: campaigns[0]?.id },
      
      // Campaign 2 leads
      { name: 'Emma Davis', email: 'emma.davis@growthco.com', company: 'Growth Co', position: 'Marketing Director', campaignId: campaigns[1]?.id },
      { name: 'Michael Wilson', email: 'michael.wilson@futuretech.com', company: 'Future Tech', position: 'Product Manager', campaignId: campaigns[1]?.id },
      { name: 'Olivia Martinez', email: 'olivia.martinez@digitalcorp.com', company: 'Digital Corp', position: 'CTO', campaignId: campaigns[1]?.id },
      { name: 'William Taylor', email: 'william.taylor@innovatelabs.com', company: 'Innovation Labs', position: 'VP Product', campaignId: campaigns[1]?.id },
      { name: 'Sophia Anderson', email: 'sophia.anderson@techsolutions.com', company: 'Tech Solutions', position: 'Founder', campaignId: campaigns[1]?.id },
      
      // Campaign 3 leads (if exists)
      ...(campaigns.length > 2 ? [
        { name: 'Robert Thomas', email: 'robert.thomas@enterprisegroup.com', company: 'Enterprise Group', position: 'CEO', campaignId: campaigns[2]?.id },
        { name: 'Jennifer Lee', email: 'jennifer.lee@startupworld.com', company: 'Startup World', position: 'CTO', campaignId: campaigns[2]?.id },
        { name: 'Daniel Clark', email: 'daniel.clark@techinnovators.com', company: 'Tech Innovators', position: 'Director', campaignId: campaigns[2]?.id },
        { name: 'Elizabeth Hall', email: 'elizabeth.hall@digitalfuture.com', company: 'Digital Future', position: 'VP Engineering', campaignId: campaigns[2]?.id },
        { name: 'Matthew Allen', email: 'matthew.allen@innovateplus.com', company: 'Innovate Plus', position: 'Founder', campaignId: campaigns[2]?.id },
      ] : [])
    ].filter(lead => lead.campaignId) // Filter out leads without valid campaignId
    
    // Create leads with different statuses and connection statuses
    const statusOptions = ['pending', 'contacted', 'responded', 'qualified', 'converted', 'nurturing']
    const connectionStatusOptions = ['not_connected', 'request_sent', 'connected', 'request_received']
    
    for (let i = 0; i < leadData.length; i++) {
      const lead = leadData[i]
      const status = statusOptions[i % statusOptions.length]
      const connectionStatus = connectionStatusOptions[i % connectionStatusOptions.length]
      
      try {
        await mongoAdapter.leads.createLead({
          id: `lead-${nanoid()}`,
          name: lead.name,
          email: lead.email,
          company: lead.company,
          position: lead.position,
          linkedinUrl: `https://linkedin.com/in/${lead.name.toLowerCase().replace(' ', '-')}`,
          profileImage: undefined,
          location: ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA'][i % 5],
          status,
          connectionStatus,
          sequenceStep: Math.floor(Math.random() * 5),
          lastContactDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          lastActivity: ['Connection request sent', 'Message replied', 'Profile viewed', 'Follow-up sent'][i % 4],
          lastActivityDate: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
          notes: `Lead notes for ${lead.name}`,
          campaignId: lead.campaignId,
          userId: demoUser.id,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        })
        console.log(`✅ Created lead: ${lead.name} (${status}, ${connectionStatus})`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`⚠️ Lead ${lead.name} might already exist:`, errorMessage)
      }
    }
    
    // Create activity logs
    console.log('➕ Creating activity logs...')
    
    // Wait for database initialization
    const { db, initializeDatabase } = await import('../lib/db')
    
    // If db is not initialized, try to initialize it
    if (!db) {
      console.log('🔄 Initializing database for activity logs...')
      try {
        await initializeDatabase()
        console.log('✅ Database initialized for activity logs')
      } catch (initError) {
        console.log('❌ Failed to initialize database for activity logs:', initError)
      }
    }
    
    // Re-import db after potential initialization
    const { db: refreshedDb } = await import('../lib/db')
    console.log('📊 Database status for activity logs:', refreshedDb ? 'Connected' : 'Not connected')
    
    if (refreshedDb) {
      const leads = await refreshedDb.collection('leads').find({ userId: demoUser.id }).toArray()
      console.log(`📊 Found ${leads.length} leads for activity logs`)
      
      for (let i = 0; i < Math.min(20, leads.length); i++) {
        const lead = leads[i]
        const activityTypes = [
          'connection_request_sent',
          'profile_viewed',
          'message_sent',
          'connection_accepted',
          'message_replied'
        ]
        
        const activityType = activityTypes[i % activityTypes.length]
        const descriptions = {
          'connection_request_sent': `Connection request sent to ${lead.name}`,
          'profile_viewed': `Profile viewed by ${lead.name}`,
          'message_sent': `Follow-up message sent to ${lead.name}`,
          'connection_accepted': `Connection request accepted by ${lead.name}`,
          'message_replied': `Message replied by ${lead.name}`
        }
        
        try {
          const result = await refreshedDb.collection('activityLogs').insertOne({
            id: `activity-${nanoid()}`,
            leadId: lead.id,
            activityType,
            description: descriptions[activityType as keyof typeof descriptions],
            userId: demoUser.id,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          })
          console.log(`✅ Created activity log: ${descriptions[activityType as keyof typeof descriptions]} (ID: ${result.insertedId})`)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.log(`⚠️ Failed to create activity log for ${lead.name}:`, errorMessage)
        }
      }
    } else {
      console.log('❌ No database connection available for activity logs')
    }
    
    // Create messages
    console.log('➕ Creating messages...')
    
    const messageTypes = ['connection_request', 'follow_up', 'email']
    const messageStatuses = ['sent', 'delivered', 'read', 'replied']
    
    for (let i = 0; i < 15; i++) {
      const leads = await mongoAdapter.leads.findLeadsByCampaignId(campaigns[0].id)
      if (leads.data.length > 0) {
        const randomLead = leads.data[Math.floor(Math.random() * leads.data.length)]
        
        try {
          await mongoAdapter.messages.createMessage({
            id: `message-${nanoid()}`,
            leadId: randomLead.id,
            campaignId: campaigns[0].id,
            messageType: messageTypes[i % messageTypes.length],
            subject: `Message subject ${i + 1}`,
            content: `This is the content of message ${i + 1} sent to ${randomLead.name}. This message is about following up on our previous conversation and discussing potential opportunities.`,
            status: messageStatuses[i % messageStatuses.length],
            sentAt: new Date(Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000),
            readAt: messageStatuses[i % messageStatuses.length] === 'read' || messageStatuses[i % messageStatuses.length] === 'replied' 
              ? new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000) 
              : undefined,
            repliedAt: messageStatuses[i % messageStatuses.length] === 'replied' 
              ? new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000) 
              : undefined,
            userId: demoUser.id,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 25) * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
          })
          console.log(`✅ Created message to: ${randomLead.name}`)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.log(`⚠️ Message might already exist:`, errorMessage)
        }
      }
    }
    
    console.log('🎉 Analytics data population completed successfully!')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error populating analytics data:', errorMessage)
    process.exit(1)
  }
}

async function resetAnalyticsData() {
  console.log('🔄 Resetting analytics data...')
  
  try {
    // Connect directly to MongoDB
    const client = new MongoClient('mongodb://localhost:27017')
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db('linkbird')
    
    // Clear existing activity logs and messages
    await db.collection('activityLogs').deleteMany({})
    console.log('🗑️  Deleted all activity logs')
    
    await db.collection('messages').deleteMany({})
    console.log('🗑️  Deleted all messages')
    
    await client.close()
    console.log('✅ Database reset completed')
    
    // Repopulate with fresh data
    await populateAnalyticsData()
    
    console.log('🎉 Analytics data reset and repopulated successfully!')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error resetting analytics data:', errorMessage)
    process.exit(1)
  }
}

// Run the reset if this script is executed directly
if (require.main === module) {
  resetAnalyticsData()
}