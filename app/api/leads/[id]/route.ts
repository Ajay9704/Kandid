import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/index"
import { leads } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id

    // Try to fetch from database first
    try {
      const lead = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1)
      
      if (lead.length > 0) {
        return NextResponse.json(lead[0])
      }
    } catch (dbError) {
      console.log("Database not ready, returning mock data")
    }

    // Return mock data based on ID
    const mockLeads: { [key: string]: any } = {
      "1": {
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
        userId: "demo-user",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-18"),
      },
      "2": {
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
        userId: "demo-user",
        createdAt: new Date("2024-01-16"),
        updatedAt: new Date("2024-01-17"),
      },
      "3": {
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
        userId: "demo-user",
        createdAt: new Date("2024-01-14"),
        updatedAt: new Date("2024-01-19"),
      }
    }

    const lead = mockLeads[leadId]
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error("Error fetching lead:", error)
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, email, company, status, notes } = body

    const updatedLead = await db.update(leads)
      .set({
        name,
        email,
        company,
        status,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, params.id))
      .returning()

    if (updatedLead.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json(updatedLead[0])
  } catch (error) {
    console.error("Error updating lead:", error)
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body
    const leadId = params.id

    // Try to update in database first
    try {
      const updatedLead = await db.update(leads)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(leads.id, leadId))
        .returning()

      if (updatedLead.length > 0) {
        return NextResponse.json(updatedLead[0])
      }
    } catch (dbError) {
      console.log("Database not ready, returning mock update")
    }

    // Return mock updated data
    const updatedLead = {
      id: leadId,
      name: "Mock Lead",
      email: "mock@example.com",
      company: "Mock Company",
      position: "Mock Position",
      status,
      connectionStatus: "connected",
      sequenceStep: 2,
      lastActivity: "Status updated",
      lastActivityDate: new Date(),
      notes: "Status updated via API",
      campaignId: "1",
      userId: "demo-user",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date(),
    }

    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error("Error updating lead status:", error)
    return NextResponse.json({ error: "Failed to update lead status" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deletedLead = await db.delete(leads).where(eq(leads.id, params.id)).returning()
    
    if (deletedLead.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Lead deleted successfully" })
  } catch (error) {
    console.error("Error deleting lead:", error)
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 })
  }
}