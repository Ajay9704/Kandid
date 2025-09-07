// Shared mock data store for campaigns API when database is not available
// This allows persistence across API calls during development

export interface MockCampaign {
  id: string
  name: string
  status: string
  description?: string | null
  totalLeads: number
  successfulLeads: number
  responseRate: number
  userId: string
  createdAt: Date
  updatedAt: Date
}

// In-memory store for mock campaigns
let mockCampaignsStore: MockCampaign[] = [
  {
    id: "campaign-1",
    name: "Q4 Outreach Campaign",
    status: "active",
    description: "End of year outreach to potential clients",
    totalLeads: 45,
    successfulLeads: 12,
    responseRate: 26.7,
    userId: "demo-user-id",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "campaign-2", 
    name: "Tech Executive Outreach",
    status: "active",
    description: "Targeting CTOs and VPs in tech companies",
    totalLeads: 28,
    successfulLeads: 8,
    responseRate: 28.6,
    userId: "demo-user-id",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    id: "campaign-3",
    name: "Holiday Promotion",
    status: "paused",
    description: "Special holiday offers for prospects",
    totalLeads: 12,
    successfulLeads: 3,
    responseRate: 25.0,
    userId: "demo-user-id",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-15"),
  }
]

// Helper functions to manage mock campaigns
export function getMockCampaigns(): MockCampaign[] {
  return [...mockCampaignsStore] // Return a copy to prevent mutations
}

export function addMockCampaign(campaign: MockCampaign): void {
  mockCampaignsStore.unshift(campaign) // Add to beginning for newest first
  console.log(`✅ Mock campaign added: ${campaign.name} - Total campaigns: ${mockCampaignsStore.length}`)
}

export function getMockCampaignById(id: string): MockCampaign | undefined {
  const campaign = mockCampaignsStore.find(campaign => campaign.id === id)
  console.log(`🔍 Looking for mock campaign with ID: ${id}, found:`, campaign ? campaign.name : 'Not found')
  return campaign
}

export function updateMockCampaign(id: string, updates: Partial<MockCampaign>): MockCampaign | null {
  const campaignIndex = mockCampaignsStore.findIndex(campaign => campaign.id === id)
  if (campaignIndex === -1) return null
  
  mockCampaignsStore[campaignIndex] = {
    ...mockCampaignsStore[campaignIndex],
    ...updates,
    updatedAt: new Date()
  }
  
  console.log(`✅ Mock campaign updated: ${mockCampaignsStore[campaignIndex].name}`)
  return mockCampaignsStore[campaignIndex]
}

export function findMockCampaignByName(name: string, userId: string): MockCampaign | undefined {
  const campaign = mockCampaignsStore.find(campaign => 
    campaign.name === name && 
    (campaign.userId === userId || campaign.userId === 'demo-user' || campaign.userId === 'demo-user-id')
  )
  console.log(`🔍 Looking for mock campaign by name: ${name}, userId: ${userId}, found:`, campaign ? campaign.name : 'Not found')
  return campaign
}