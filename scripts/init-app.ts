import { mongoAdapter } from '../lib/db/mongo-adapter'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'
import { initializeDatabase, db } from '../lib/db'

async function initApp() {
  console.log('🚀 Initializing application with demo data...')
  
  try {
    // Initialize database
    await initializeDatabase()
    
    // Create demo user if not exists
    let demoUser = await mongoAdapter.users.findUserByEmail('demo@linkbird.com')
    
    if (!demoUser) {
      console.log('👤 Creating demo user...')
      const hashedPassword = await bcrypt.hash('demo123456', 12)
      
      demoUser = await mongoAdapter.users.createUser({
        id: 'demo-user-id',
        name: 'Demo User',
        email: 'demo@linkbird.com',
        password: hashedPassword,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      
      console.log('✅ Demo user created successfully!')
    } else {
      console.log('✅ Demo user already exists')
    }
    
    // Create sample campaigns
    console.log('📢 Creating sample campaigns...')
    const sampleCampaigns = [
      {
        id: `campaign-${nanoid()}`,
        name: 'Q4 Outreach Campaign',
        status: 'active',
        description: 'End of year outreach to enterprise clients',
        totalLeads: 0,
        successfulLeads: 0,
        responseRate: 0.0,
        userId: demoUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `campaign-${nanoid()}`,
        name: 'Product Launch Campaign',
        status: 'active',
        description: 'New product launch outreach campaign',
        totalLeads: 0,
        successfulLeads: 0,
        responseRate: 0.0,
        userId: demoUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `campaign-${nanoid()}`,
        name: 'Startup Founder Outreach',
        status: 'draft',
        description: 'Outreach campaign targeting startup founders',
        totalLeads: 0,
        successfulLeads: 0,
        responseRate: 0.0,
        userId: demoUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]

    const createdCampaigns = []
    for (const campaignData of sampleCampaigns) {
      try {
        // Check if campaign already exists
        const existingCampaign = await mongoAdapter.campaigns.findCampaignByNameAndUserId(campaignData.name, demoUser.id)
        if (existingCampaign) {
          console.log(`⚠️ Campaign "${campaignData.name}" already exists`)
          createdCampaigns.push(existingCampaign)
        } else {
          const createdCampaign = await mongoAdapter.campaigns.createCampaign(campaignData)
          createdCampaigns.push(createdCampaign)
          console.log(`✅ Created campaign: ${campaignData.name}`)
        }
      } catch (error) {
        console.log(`❌ Error creating campaign "${campaignData.name}":`, error instanceof Error ? error.message : 'Unknown error')
      }
    }

    // Create sample leads
    console.log('👥 Creating sample leads...')
    if (createdCampaigns.length > 0) {
      const sampleLeads = [
        {
          id: `lead-${nanoid()}`,
          name: 'John Smith',
          email: 'john.smith@example.com',
          company: 'TechCorp',
          position: 'CTO',
          linkedinUrl: 'https://linkedin.com/in/johnsmith',
          location: 'San Francisco, CA',
          status: 'pending',
          connectionStatus: 'not_connected',
          sequenceStep: 0,
          lastActivity: 'Lead created',
          lastActivityDate: new Date(),
          campaignId: createdCampaigns[0].id,
          userId: demoUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: `lead-${nanoid()}`,
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          company: 'InnovateCo',
          position: 'Marketing Director',
          linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
          location: 'New York, NY',
          status: 'contacted',
          connectionStatus: 'connected',
          sequenceStep: 2,
          lastActivity: 'Connection accepted',
          lastActivityDate: new Date(Date.now() - 86400000), // 1 day ago
          campaignId: createdCampaigns[0].id,
          userId: demoUser.id,
          createdAt: new Date(Date.now() - 172800000), // 2 days ago
          updatedAt: new Date(Date.now() - 86400000), // 1 day ago
        },
        {
          id: `lead-${nanoid()}`,
          name: 'Michael Chen',
          email: 'michael.chen@example.com',
          company: 'StartupXYZ',
          position: 'Founder',
          linkedinUrl: 'https://linkedin.com/in/michaelchen',
          location: 'Austin, TX',
          status: 'converted',
          connectionStatus: 'connected',
          sequenceStep: 5,
          lastActivity: 'Converted to customer',
          lastActivityDate: new Date(Date.now() - 259200000), // 3 days ago
          campaignId: createdCampaigns[1].id,
          userId: demoUser.id,
          createdAt: new Date(Date.now() - 345600000), // 4 days ago
          updatedAt: new Date(Date.now() - 259200000), // 3 days ago
        },
        {
          id: `lead-${nanoid()}`,
          name: 'Emily Wilson',
          email: 'emily.wilson@example.com',
          company: 'Digital Solutions Inc',
          position: 'Product Manager',
          linkedinUrl: 'https://linkedin.com/in/emilywilson',
          location: 'Seattle, WA',
          status: 'responded',
          connectionStatus: 'request_sent',
          sequenceStep: 1,
          lastActivity: 'Connection request sent',
          lastActivityDate: new Date(Date.now() - 43200000), // 12 hours ago
          campaignId: createdCampaigns[1].id,
          userId: demoUser.id,
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
          updatedAt: new Date(Date.now() - 43200000), // 12 hours ago
        },
        {
          id: `lead-${nanoid()}`,
          name: 'David Brown',
          email: 'david.brown@example.com',
          company: 'Enterprise Corp',
          position: 'VP of Sales',
          linkedinUrl: 'https://linkedin.com/in/davidbrown',
          location: 'Chicago, IL',
          status: 'nurturing',
          connectionStatus: 'connected',
          sequenceStep: 3,
          lastActivity: 'Follow-up message sent',
          lastActivityDate: new Date(Date.now() - 172800000), // 2 days ago
          campaignId: createdCampaigns[2].id,
          userId: demoUser.id,
          createdAt: new Date(Date.now() - 259200000), // 3 days ago
          updatedAt: new Date(Date.now() - 172800000), // 2 days ago
        }
      ]

      // Insert leads
      for (const leadData of sampleLeads) {
        try {
          // Check if lead already exists
          const existingLead = await mongoAdapter.leads.findLeadById(leadData.id)
          if (existingLead) {
            console.log(`⚠️ Lead "${leadData.name}" already exists`)
          } else {
            await mongoAdapter.leads.createLead(leadData)
            console.log(`✅ Created lead: ${leadData.name}`)
          }
        } catch (error) {
          console.log(`❌ Error creating lead "${leadData.name}":`, error instanceof Error ? error.message : 'Unknown error')
        }
      }
    }

    console.log('🎉 Application initialization completed successfully!')
    console.log('')
    console.log('You can now sign in with:')
    console.log('📧 Email: demo@linkbird.com')
    console.log('🔑 Password: demo123456')
    console.log('')
    
  } catch (error) {
    console.error('❌ Error initializing application:', error)
    process.exit(1)
  }
}

initApp()