import { mongoAdapter } from '../lib/db/mongo-adapter'
import { nanoid } from 'nanoid'

async function seedData() {
  console.log('🌱 Seeding database with sample data...')
  
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

    // Create sample campaigns with unique IDs
    const sampleCampaigns = [
      {
        id: `campaign-${nanoid()}`,
        name: 'Q4 Outreach Campaign',
        status: 'active',
        description: 'End of year outreach to enterprise clients',
        totalLeads: 0,
        successfulLeads: 0,
        responseRate: 0.0,
        userId: demoUserId,
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
        userId: demoUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]

    // Insert campaigns and store their actual IDs
    const createdCampaigns = [];
    for (const campaign of sampleCampaigns) {
      try {
        // Check if campaign already exists
        const existingCampaign = await mongoAdapter.campaigns.findCampaignByNameAndUserId(campaign.name, demoUserId);
        if (existingCampaign) {
          console.log(`⚠️ Campaign ${campaign.name} already exists (ID: ${existingCampaign.id})`);
          createdCampaigns.push(existingCampaign);
        } else {
          const createdCampaign = await mongoAdapter.campaigns.createCampaign(campaign);
          createdCampaigns.push(createdCampaign);
          console.log(`✅ Created campaign: ${campaign.name} (ID: ${createdCampaign.id})`);
        }
      } catch (error) {
        console.log(`⚠️ Error creating campaign ${campaign.name}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Create sample leads only if we have campaigns
    if (createdCampaigns.length >= 2) {
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
          campaignId: createdCampaigns[0].id,
          userId: demoUserId,
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
          campaignId: createdCampaigns[0].id,
          userId: demoUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
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
          campaignId: createdCampaigns[1].id,
          userId: demoUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]

      // Insert leads
      for (const lead of sampleLeads) {
        try {
          // Check if lead already exists
          const existingLead = await mongoAdapter.leads.findLeadById(lead.id);
          if (existingLead) {
            console.log(`⚠️ Lead ${lead.name} already exists`);
          } else {
            await mongoAdapter.leads.createLead(lead);
            console.log(`✅ Created lead: ${lead.name}`);
          }
        } catch (error) {
          console.log(`⚠️ Error creating lead ${lead.name}:`, error instanceof Error ? error.message : 'Unknown error');
        }
      }
    }

    console.log('🎉 Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedData()