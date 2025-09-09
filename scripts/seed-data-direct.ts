import { MongoClient } from 'mongodb'
import { nanoid } from 'nanoid'

async function seedData() {
  console.log('🌱 Seeding database with sample data...')
  
  try {
    // Connect directly to MongoDB
    const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/linkbird'
    const client = new MongoClient(mongoUrl)
    
    await client.connect()
    console.log('✅ MongoDB connected successfully!')
    
    const db = client.db('linkbird')
    
    // Get the existing demo user
    const existingUser = await db.collection('users').findOne({ email: 'demo@linkbird.com' })
    
    if (!existingUser) {
      console.log('❌ Demo user not found. Please run the create-demo-user script first.')
      await client.close()
      process.exit(1)
    }
    
    const demoUserId = existingUser.id
    console.log(`✅ Using existing demo user: ${existingUser.email} (ID: ${demoUserId})`)

    // Create sample campaigns
    const sampleCampaigns = [
      {
        id: 'campaign-1',
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
        id: 'campaign-2',
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

    // Insert campaigns
    for (const campaign of sampleCampaigns) {
      try {
        await db.collection('campaigns').insertOne(campaign)
        console.log(`✅ Created campaign: ${campaign.name}`)
      } catch (error) {
        console.log(`⚠️ Campaign ${campaign.name} might already exist`)
      }
    }

    // Create sample leads
    const sampleLeads = [
      {
        id: 'lead-1',
        name: 'John Smith',
        email: 'john.smith@example.com',
        company: 'TechCorp',
        position: 'CTO',
        linkedinUrl: 'https://linkedin.com/in/johnsmith',
        location: 'San Francisco, CA',
        status: 'pending',
        connectionStatus: 'not_connected',
        sequenceStep: 0,
        campaignId: 'campaign-1',
        userId: demoUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'lead-2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        company: 'InnovateCo',
        position: 'Marketing Director',
        linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
        location: 'New York, NY',
        status: 'contacted',
        connectionStatus: 'connected',
        sequenceStep: 2,
        campaignId: 'campaign-1',
        userId: demoUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'lead-3',
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        company: 'StartupXYZ',
        position: 'Founder',
        linkedinUrl: 'https://linkedin.com/in/michaelchen',
        location: 'Austin, TX',
        status: 'converted',
        connectionStatus: 'connected',
        sequenceStep: 5,
        campaignId: 'campaign-2',
        userId: demoUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]

    // Insert leads
    for (const lead of sampleLeads) {
      try {
        await db.collection('leads').insertOne(lead)
        console.log(`✅ Created lead: ${lead.name}`)
      } catch (error) {
        console.log(`⚠️ Lead ${lead.name} might already exist`)
      }
    }

    await client.close()
    console.log('🎉 Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedData()