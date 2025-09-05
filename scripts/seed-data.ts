import { db } from '../lib/db'
import { user, campaigns, leads } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

async function seedData() {
  console.log('🌱 Seeding database with sample data...')
  
  try {
    // First create a sample user
    const sampleUser = {
      id: 'default-user',
      name: 'Demo User',
      email: 'demo@linkbird.com',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const insertedUser = await db.insert(user).values(sampleUser).returning()
    console.log(`✅ Created sample user: ${insertedUser[0].email}`)

    // Create sample campaigns
    const sampleCampaigns = [
      {
        id: nanoid(),
        name: 'Q4 Outreach Campaign',
        status: 'active',
        description: 'End of year outreach to enterprise clients',
        totalLeads: 0,
        successfulLeads: 0,
        responseRate: 0.0,
        userId: 'default-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        name: 'Product Launch Campaign',
        status: 'active',
        description: 'Promoting our new product features',
        totalLeads: 0,
        successfulLeads: 0,
        responseRate: 0.0,
        userId: 'default-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        name: 'SMB Expansion',
        status: 'draft',
        description: 'Targeting small and medium businesses',
        totalLeads: 0,
        successfulLeads: 0,
        responseRate: 0.0,
        userId: 'default-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const insertedCampaigns = await db.insert(campaigns).values(sampleCampaigns).returning()
    console.log(`✅ Created ${insertedCampaigns.length} sample campaigns`)

    // Create sample leads
    const sampleLeads = [
      {
        id: nanoid(),
        name: 'John Smith',
        email: 'john.smith@techcorp.com',
        company: 'TechCorp Inc.',
        status: 'pending',
        notes: 'Interested in enterprise solution',
        campaignId: insertedCampaigns[0].id,
        userId: 'default-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        name: 'Sarah Johnson',
        email: 'sarah.j@innovate.io',
        company: 'Innovate Solutions',
        status: 'contacted',
        notes: 'Scheduled demo for next week',
        campaignId: insertedCampaigns[1].id,
        userId: 'default-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        name: 'Mike Chen',
        email: 'mike.chen@startup.com',
        company: 'StartupXYZ',
        status: 'responded',
        notes: 'Requested pricing information',
        campaignId: insertedCampaigns[0].id,
        userId: 'default-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        name: 'Emily Davis',
        email: 'emily@enterprise.com',
        company: 'Enterprise Corp',
        status: 'qualified',
        notes: 'High potential lead',
        campaignId: insertedCampaigns[1].id,
        userId: 'default-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        name: 'Alex Rodriguez',
        email: 'alex@growth.co',
        company: 'Growth Co',
        status: 'nurturing',
        notes: 'Needs more information about pricing',
        campaignId: insertedCampaigns[2].id,
        userId: 'default-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const insertedLeads = await db.insert(leads).values(sampleLeads).returning()
    console.log(`✅ Created ${insertedLeads.length} sample leads`)

    // Update campaign lead counts
    for (const campaign of insertedCampaigns) {
      const campaignLeads = insertedLeads.filter(lead => lead.campaignId === campaign.id)
      const successfulLeads = campaignLeads.filter(lead => 
        ['contacted', 'responded', 'qualified'].includes(lead.status)
      ).length
      
      await db.update(campaigns)
        .set({
          totalLeads: campaignLeads.length,
          successfulLeads,
          responseRate: campaignLeads.length > 0 ? (successfulLeads / campaignLeads.length) * 100 : 0,
          updatedAt: new Date(),
        })
        .where(eq(campaigns.id, campaign.id))
    }

    console.log('✅ Updated campaign statistics')
    console.log('🎉 Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedData()