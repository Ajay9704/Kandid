import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/index"
import { leads, campaigns } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"

export async function GET(request: NextRequest) {
  try {
    // Try to fetch from database first
    try {
      const allLeads = await db.select({
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

      return NextResponse.json(allLeads)
    } catch (dbError) {
      console.log("Database not ready, returning mock data")
      // Return mock data if database is not ready
      const mockLeads = [
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
          userId: "demo-user",
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
          userId: "demo-user",
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
          userId: "demo-user",
          createdAt: new Date("2024-01-14"),
          updatedAt: new Date("2024-01-19"),
        }
      ]
      return NextResponse.json(mockLeads)
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

    // Create new lead with mock data for now
    const newLead = {
      id: nanoid(),
      name,
      email,
      company: company || "Unknown Company",
      position: position || "Unknown Position",
      linkedinUrl: null,
      profileImage: null,
      location: null,
      status,
      connectionStatus: "not_connected",
      sequenceStep: 0,
      lastContactDate: null,
      lastActivity: "Lead created",
      lastActivityDate: new Date(),
      notes: notes || "",
      campaignId: campaignId || "1",
      userId: "demo-user",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Try to insert into database, fallback to returning mock data
    try {
      const dbResult = await db.insert(leads).values(newLead).returning()
      return NextResponse.json(dbResult[0])
    } catch (dbError) {
      console.log("Database not ready, returning mock lead")
      return NextResponse.json(newLead)
    }
  } catch (error) {
    console.error("Error creating lead:", error)
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 })
  }
}