import { NextRequest, NextResponse } from "next/server"
import { NextRequest, NextResponse } from "next/server"
import { db, checkDatabaseConnection } from "@/lib/db/index"
import { campaigns, leads } from "@/lib/db/schema"
import { eq, count, and, sql, desc } from "drizzle-orm"
import { nanoid } from "nanoid"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getMockCampaigns, addMockCampaign, findMockCampaignByName, type MockCampaign } from "@/lib/mock-campaigns-store"

export async function GET(request: NextRequest) {
  try {
    // Try to fetch from database first
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
    } catch (dbError) {
      console.log("Database not ready, returning mock data")
      // Return mock data if database is not ready
      const mockCampaigns = [
        {
          id: "1",
          name: "Q4 Outreach Campaign",
          status: "active",
          description: "End of year outreach to potential clients",
          totalLeads: 45,
          successfulLeads: 12,
          responseRate: 26.7,
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-20"),
        },
        {
          id: "2", 
          name: "Tech Executive Outreach",
          status: "active",
          description: "Targeting CTOs and VPs in tech companies",
          totalLeads: 28,
          successfulLeads: 8,
          responseRate: 28.6,
          createdAt: new Date("2024-01-10"),
          updatedAt: new Date("2024-01-18"),
        },
        {
          id: "3",
          name: "Holiday Promotion",
          status: "paused",
          description: "Special holiday offers for prospects",
          totalLeads: 12,
          successfulLeads: 3,
          responseRate: 25.0,
          createdAt: new Date("2024-01-05"),
          updatedAt: new Date("2024-01-15"),
        }
      ]
      return NextResponse.json(mockCampaigns)
    }
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

    // Create new campaign with mock data for now
    const newCampaign = {
      id: nanoid(),
      name,
      description: description || "",
      status,
      totalLeads: 0,
      successfulLeads: 0,
      responseRate: 0.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Try to insert into database, fallback to returning mock data
    try {
      const dbResult = await db.insert(campaigns).values({
        ...newCampaign,
        userId: "demo-user",
      }).returning()
      return NextResponse.json(dbResult[0])
    } catch (dbError) {
      console.log("Database not ready, returning mock campaign")
      return NextResponse.json(newCampaign)
    }
  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 })
  }
}