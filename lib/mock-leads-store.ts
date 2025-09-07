// Shared mock data store for leads API when database is not available
// This allows persistence across API calls during development

export interface MockLead {
  id: string
  name: string
  email: string
  company?: string | null
  position?: string | null
  linkedinUrl?: string | null
  profileImage?: string | null
  location?: string | null
  status: string
  connectionStatus: string
  sequenceStep: number
  lastContactDate?: Date | null
  lastActivity?: string | null
  lastActivityDate?: Date | null
  notes?: string | null
  campaignId: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

// In-memory store for mock leads
let mockLeadsStore: MockLead[] = [
  {
    id: "otMpyG_vCnXyXXh-KhCK6",
    name: "John Smith",
    email: "john.smith@example.com",
    company: "Example Corp",
    position: "Software Engineer",
    linkedinUrl: "https://linkedin.com/in/johnsmith",
    profileImage: null,
    location: "San Francisco, CA",
    status: "pending",
    connectionStatus: "not_connected",
    sequenceStep: 0,
    lastContactDate: null,
    lastActivity: "Lead created",
    lastActivityDate: new Date("2024-01-20"),
    notes: "New lead from website form",
    campaignId: "1",
    userId: "demo-user-id",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.com",
    company: "TechCorp",
    position: "VP of Engineering",
    linkedinUrl: "https://linkedin.com/in/sarahjohnson",
    profileImage: null,
    location: "San Francisco, CA",
    status: "responded",
    connectionStatus: "connected",
    sequenceStep: 2,
    lastContactDate: new Date("2024-01-18"),
    lastActivity: "Replied to follow-up message",
    lastActivityDate: new Date("2024-01-18"),
    notes: "Very interested in our solution",
    campaignId: "1",
    userId: "demo-user-id",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike.chen@startupxyz.com",
    company: "StartupXYZ",
    position: "CTO",
    linkedinUrl: "https://linkedin.com/in/mikechen",
    profileImage: null,
    location: "New York, NY",
    status: "contacted",
    connectionStatus: "request_sent",
    sequenceStep: 1,
    lastContactDate: new Date("2024-01-17"),
    lastActivity: "Connection request sent",
    lastActivityDate: new Date("2024-01-17"),
    notes: "Potential early adopter",
    campaignId: "1",
    userId: "demo-user-id",
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-17"),
  },
  {
    id: "3",
    name: "Lisa Wang",
    email: "lisa.wang@innovationlabs.com",
    company: "Innovation Labs",
    position: "Head of Product",
    linkedinUrl: "https://linkedin.com/in/lisawang",
    profileImage: null,
    location: "Austin, TX",
    status: "qualified",
    connectionStatus: "connected",
    sequenceStep: 3,
    lastContactDate: new Date("2024-01-19"),
    lastActivity: "Scheduled demo call",
    lastActivityDate: new Date("2024-01-19"),
    notes: "Ready for demo, very engaged",
    campaignId: "2",
    userId: "demo-user-id",
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-19"),
  }
]

// Helper functions to manage mock leads
export function getMockLeads(): MockLead[] {
  return [...mockLeadsStore] // Return a copy to prevent mutations
}

export function addMockLead(lead: MockLead): void {
  mockLeadsStore.unshift(lead) // Add to beginning for newest first
  console.log(`✅ Mock lead added: ${lead.name} (${lead.email}) - Total leads: ${mockLeadsStore.length}`)
}

export function getMockLeadById(id: string): MockLead | undefined {
  const lead = mockLeadsStore.find(lead => lead.id === id)
  console.log(`🔍 Looking for mock lead with ID: ${id}, found:`, lead ? lead.name : 'Not found')
  return lead
}

export function updateMockLead(id: string, updates: Partial<MockLead>): MockLead | null {
  const leadIndex = mockLeadsStore.findIndex(lead => lead.id === id)
  if (leadIndex === -1) return null
  
  mockLeadsStore[leadIndex] = {
    ...mockLeadsStore[leadIndex],
    ...updates,
    updatedAt: new Date()
  }
  
  console.log(`✅ Mock lead updated: ${mockLeadsStore[leadIndex].name}`)
  return mockLeadsStore[leadIndex]
}

export function findMockLeadByEmail(email: string, userId: string): MockLead | undefined {
  const lead = mockLeadsStore.find(lead => lead.email === email && (lead.userId === userId || lead.userId === 'demo-user' || lead.userId === 'demo-user-id'))
  console.log(`🔍 Looking for mock lead by email: ${email}, userId: ${userId}, found:`, lead ? lead.name : 'Not found')
  return lead
}