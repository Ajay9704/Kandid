import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { leads, campaigns } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"

export async function GET(request: NextRequest) {
  try {
    const allLeads = await db.select({
      id: leads.id,
      name: leads.name,
      email: leads.email,
      company: leads.company,
      status: leads.status,
      lastContactDate: leads.lastContactDate,
      notes: leads.notes,
      campaignId: leads.campaignId,
      userId: leads.userId,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
    }).from(leads)

    return NextResponse.json(allLeads)
  } catch (error) {
    console.error("Error fetching leads:", error)
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, company, status = "pending", notes, campaignId } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Get the first campaign if no campaignId provided
    let finalCampaignId = campaignId
    if (!finalCampaignId) {
      const firstCampaign = await db.select({ id: campaigns.id }).from(campaigns).limit(1)
      finalCampaignId = firstCampaign[0]?.id || "default"
    }

    const newLead = await db.insert(leads).values({
      id: nanoid(),
      name,
      email,
      company,
      status,
      notes,
      campaignId: finalCampaignId,
      userId: "default-user", // Replace with actual user ID from session
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    // Emit real-time event (we'll implement this when socket is available)
    // if (global.io) {
    //   global.io.to('dashboard').emit('new-lead', newLead[0])
    // }

    return NextResponse.json(newLead[0])
  } catch (error) {
    console.error("Error creating lead:", error)
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 })
  }
}