import { db } from '../lib/db'
import { user, campaigns, leads, linkedinAccounts, campaignSequences, activityLogs, messages } from '../lib/db/schema'
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

    const insertedUser = await db.insert(user).values(sampleUser).onConflictDoNothing().returning()
    if (insertedUser.length > 0) {
      console.log(`✅ Created sample user: ${insertedUser[0].email}`)
    } else {
      console.log(`✅ Sample user already exists: ${sampleUser.email}`)
    }

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

    const insertedCampaigns = await db.insert(campaigns).values(sampleCampaigns).onConflictDoNothing().returning()
    console.log(`✅ Created ${insertedCampaigns.length} sample campaigns`)

    // Create sample leads with correct schema
    const sampleLeads = [
      {
        id: nanoid(),
        name: 'John Smith',
        email: 'john.smith@techcorp.com',
        company: 'TechCorp Inc.',
        position: 'VP of Engineering',
        linkedinUrl: 'https://linkedin.com/in/johnsmith',
        location: 'San Francisco, CA',
        status: 'pending',
        connectionStatus: 'not_connected',
        sequenceStep: 0,
        notes: 'Interested in enterprise solution',
        campaignId: insertedCampaigns.length > 0 ? insertedCampaigns[0].id : 'campaign-1',
        userId: 'default-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        name: 'Sarah Johnson',
        email: 'sarah.j@innovate.io',
        company: 'Innovate Solutions',
        position: 'CTO',
        linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
        location: 'New York, NY',
        status: 'contacted',
        connectionStatus: 'request_sent',
        sequenceStep: 1,
        lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastActivity: 'Connection request sent',
        lastActivityDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        notes: 'Scheduled demo for next week',
        campaignId: insertedCampaigns.length > 1 ? insertedCampaigns[1].id : 'campaign-2',
        userId: 'default-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        name: 'Mike Chen',
        email: 'mike.chen@startup.com',
        company: 'StartupXYZ',
        position: 'Founder & CEO',
        linkedinUrl: 'https://linkedin.com/in/mikechen',
        location: 'Austin, TX',
        status: 'responded',
        connectionStatus: 'connected',
        sequenceStep: 2,
        lastContactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        lastActivity: 'Replied to follow-up message',
        lastActivityDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        notes: 'Requested pricing information',
        campaignId: insertedCampaigns.length > 0 ? insertedCampaigns[0].id : 'campaign-1',
        userId: 'default-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        name: 'Emily Davis',
        email: 'emily@enterprise.com',
        company: 'Enterprise Corp',
        position: 'Head of Product',
        linkedinUrl: 'https://linkedin.com/in/emilydavis',
        location: 'Seattle, WA',
        status: 'qualified',
        connectionStatus: 'connected',
        sequenceStep: 3,
        lastContactDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        lastActivity: 'Scheduled demo call',
        lastActivityDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        notes: 'High potential lead',
        campaignId: insertedCampaigns.length > 1 ? insertedCampaigns[1].id : 'campaign-2',
        userId: 'default-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        name: 'Alex Rodriguez',
        email: 'alex@growth.co',
        company: 'Growth Co',
        position: 'Marketing Director',
        linkedinUrl: 'https://linkedin.com/in/alexrodriguez',
        location: 'Miami, FL',
        status: 'nurturing',
        connectionStatus: 'request_sent',
        sequenceStep: 1,
        lastContactDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        lastActivity: 'Connection request sent',
        lastActivityDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        notes: 'Needs more information about pricing',
        campaignId: insertedCampaigns.length > 2 ? insertedCampaigns[2].id : 'campaign-3',
        userId: 'default-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const insertedLeads = await db.insert(leads).values(sampleLeads).onConflictDoNothing().returning()
    console.log(`✅ Created ${insertedLeads.length} sample leads`)

    // Create sample LinkedIn account (only one per user)
    const sampleLinkedInAccounts = [
      {
        id: nanoid(),
        name: 'John Smith',
        linkedinUrl: 'https://linkedin.com/in/john-smith-demo',
        isActive: true,
        dailyLimit: 50,
        weeklyLimit: 200,
        currentDailyCount: 12,
        currentWeeklyCount: 45,
        lastResetDate: new Date(),
        userId: 'default-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const insertedLinkedInAccounts = await db.insert(linkedinAccounts).values(sampleLinkedInAccounts).onConflictDoNothing().returning()
    console.log(`✅ Created ${insertedLinkedInAccounts.length} sample LinkedIn account`)

    // Create sample campaign sequences
    const sampleSequences = [
      {
        id: nanoid(),
        campaignId: insertedCampaigns.length > 0 ? insertedCampaigns[0].id : 'campaign-1',
        stepNumber: 1,
        stepType: 'connection_request',
        title: 'Initial Connection Request',
        content: 'Hi {{firstName}}, I noticed we both work in the {{industry}} industry and thought it would be great to connect!',
        delayDays: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        campaignId: insertedCampaigns.length > 0 ? insertedCampaigns[0].id : 'campaign-1',
        stepNumber: 2,
        stepType: 'follow_up_message',
        title: 'Follow-up Message',
        content: 'Thanks for connecting! I wanted to follow up on our mutual interest in {{topic}}. Would you be open to a brief chat?',
        delayDays: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        campaignId: insertedCampaigns.length > 1 ? insertedCampaigns[1].id : 'campaign-2',
        stepNumber: 1,
        stepType: 'connection_request',
        title: 'Product Launch Connection',
        content: 'Hi {{firstName}}, I saw your recent post about {{topic}} and found it very insightful. Would love to connect!',
        delayDays: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const insertedSequences = await db.insert(campaignSequences).values(sampleSequences).onConflictDoNothing().returning()
    console.log(`✅ Created ${insertedSequences.length} sample campaign sequences`)

    // Create sample activity logs
    const sampleActivities = [
      {
        id: nanoid(),
        leadId: insertedLeads.length > 0 ? insertedLeads[0].id : null,
        campaignId: insertedCampaigns.length > 0 ? insertedCampaigns[0].id : null,
        activityType: 'connection_request_sent',
        description: 'Connection request sent to John Smith',
        metadata: JSON.stringify({ platform: 'linkedin', messageLength: 120 }),
        userId: 'default-user',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: nanoid(),
        leadId: insertedLeads.length > 1 ? insertedLeads[1].id : null,
        campaignId: insertedCampaigns.length > 1 ? insertedCampaigns[1].id : null,
        activityType: 'message_sent',
        description: 'Follow-up message sent to Sarah Johnson',
        metadata: JSON.stringify({ platform: 'linkedin', messageLength: 180 }),
        userId: 'default-user',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: nanoid(),
        leadId: insertedLeads.length > 2 ? insertedLeads[2].id : null,
        campaignId: insertedCampaigns.length > 0 ? insertedCampaigns[0].id : null,
        activityType: 'profile_viewed',
        description: 'Profile viewed: Mike Chen',
        metadata: JSON.stringify({ platform: 'linkedin', viewDuration: 45 }),
        userId: 'default-user',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
    ]

    const insertedActivities = await db.insert(activityLogs).values(sampleActivities).onConflictDoNothing().returning()
    console.log(`✅ Created ${insertedActivities.length} sample activities`)

    // Create sample messages
    const sampleMessages = [
      {
        id: nanoid(),
        leadId: insertedLeads.length > 0 ? insertedLeads[0].id : 'lead-1',
        campaignId: insertedCampaigns.length > 0 ? insertedCampaigns[0].id : null,
        sequenceStepId: insertedSequences.length > 0 ? insertedSequences[0].id : null,
        messageType: 'connection_request',
        content: 'Hi John, I noticed we both work in the tech industry and thought it would be great to connect!',
        status: 'sent',
        sentAt: new Date(Date.now() - 7 * 60 * 1000),
        userId: 'default-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        leadId: insertedLeads.length > 1 ? insertedLeads[1].id : 'lead-2',
        campaignId: insertedCampaigns.length > 1 ? insertedCampaigns[1].id : null,
        sequenceStepId: insertedSequences.length > 1 ? insertedSequences[1].id : null,
        messageType: 'follow_up',
        content: 'Thanks for connecting! I wanted to follow up on our mutual interest in tech innovation...',
        status: 'replied',
        sentAt: new Date(Date.now() - 15 * 60 * 1000),
        readAt: new Date(Date.now() - 12 * 60 * 1000),
        repliedAt: new Date(Date.now() - 10 * 60 * 1000),
        userId: 'default-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: nanoid(),
        leadId: insertedLeads.length > 2 ? insertedLeads[2].id : 'lead-3',
        campaignId: insertedCampaigns.length > 0 ? insertedCampaigns[0].id : null,
        messageType: 'connection_request',
        content: 'Great to connect with you! I saw your recent post about AI trends and found it very insightful.',
        status: 'read',
        sentAt: new Date(Date.now() - 23 * 60 * 1000),
        readAt: new Date(Date.now() - 20 * 60 * 1000),
        userId: 'default-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const insertedMessages = await db.insert(messages).values(sampleMessages).onConflictDoNothing().returning()
    console.log(`✅ Created ${insertedMessages.length} sample messages`)

    // Update campaign lead counts
    const allCampaigns = await db.select().from(campaigns)
    for (const campaign of allCampaigns) {
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