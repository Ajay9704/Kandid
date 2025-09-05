import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { campaigns, leads } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import { nanoid } from "nanoid"

export async function GET(request: NextRequest) {
  try {
    const allCampaigns = await db.select({
      id: campaigns.id,
      name: campaigns.name,
      status: campaigns.status,
      description: campaigns.description,
      totalLeads: campaigns.totalLeads,
      successfulLeads: campaigns.successfulLeads,
      responseRate: campaigns.responseRate,
      createdAt: campaigns.createdAt,
      updatedAt: campaigns.updatedAt,
    }).from(campaigns)

    return NextResponse.json(allCampaigns)
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, status = "draft" } = body

    if (!name) {
      return NextResponse.json({ error: "Campaign name is required" }, { status: 400 })
    }

    const newCampaign = await db.insert(campaigns).values({
      id: nanoid(),
      name,
      description,
      status,
      totalLeads: 0,
      successfulLeads: 0,
      responseRate: 0.0,
      userId: "default-user", // Replace with actual user ID from session
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    return NextResponse.json(newCampaign[0])
  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 })
  }
}