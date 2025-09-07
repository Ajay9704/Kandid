import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/index"
import { leads, campaigns } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { getMockLeads, addMockLead, type MockLead } from "@/lib/mock-leads-store"

export async function GET(request: NextRequest) {
  try {
    // Try to fetch from database first
    try {
      const dbLeads = await db.select({
        id: leads.id,
        name: leads.name,
        email: leads.email,
        company: leads.company,
        position: leads.position,
        linkedinUrl: leads.linkedinUrl,
        profileImage: leads.profileImage,
        location: leads.location,
        status: leads.status,
        connectionStatus: leads.connectionStatus,
        sequenceStep: leads.sequenceStep,
        lastContactDate: leads.lastContactDate,
        lastActivity: leads.lastActivity,
        lastActivityDate: leads.lastActivityDate,
        notes: leads.notes,
        campaignId: leads.campaignId,
        userId: leads.userId,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
      }).from(leads)

      // Map database fields back to expected format
      const allLeads = dbLeads.map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        company: lead.company,
        position: lead.position,
        linkedinUrl: lead.linkedinUrl,
        profileImage: lead.profileImage,
        location: lead.location,
        status: lead.status,
        connectionStatus: lead.connectionStatus,
        sequenceStep: lead.sequenceStep,
        lastContactDate: lead.lastContactDate,
        lastActivity: lead.lastActivity,
        lastActivityDate: lead.lastActivityDate,
        notes: lead.notes,
        campaignId: lead.campaignId,
        userId: lead.userId,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      }))

      return NextResponse.json(allLeads)
    } catch (dbError) {
      console.log("Database not ready, returning mock data")
      // Return mock data from shared store
      return NextResponse.json(getMockLeads())
    }
  } catch (error) {
    console.error("Error fetching leads:", error)
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, company, position, status = "pending", notes, campaignId } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Create new lead
    const newLead: MockLead = {
      id: nanoid(),
      name,
      email,
      company: company || null,
      position: position || null,
      linkedinUrl: null,
      profileImage: null,
      location: null,
      status,
      connectionStatus: "not_connected",
      sequenceStep: 0,
      lastContactDate: null,
      lastActivity: "Lead created",
      lastActivityDate: new Date(),
      notes: notes || null,
      campaignId: campaignId || "campaign-1", // Use valid campaign ID from database
      userId: "demo-user-id",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Try to insert into database, fallback to mock store
    try {
      const dbResult = await db.insert(leads).values(newLead).returning()
      return NextResponse.json(dbResult[0])
    } catch (dbError) {
      console.log("Database not ready, adding to mock store")
      // Add to shared mock store
      addMockLead(newLead)
      return NextResponse.json(newLead)
    }
  } catch (error) {
    console.error("Error creating lead:", error)
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 })
  }
}