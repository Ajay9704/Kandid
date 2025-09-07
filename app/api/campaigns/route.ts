import { NextRequest, NextResponse } from "next/server"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/index"
import { campaigns, leads } from "@/lib/db/schema"
import { eq, count, and, sql, desc } from "drizzle-orm"
import { nanoid } from "nanoid"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getMockCampaigns, addMockCampaign, findMockCampaignByName, type MockCampaign } from "@/lib/mock-campaigns-store"

// Simple validation functions
function validateCampaignInput(body: any) {
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return { valid: false, error: "Campaign name is required" }
  }
  if (body.status && !['draft', 'active', 'paused', 'completed'].includes(body.status)) {
    return { valid: false, error: "Invalid status" }
  }
  return { valid: true }
}

function parseQueryParams(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const status = searchParams.get('status') || undefined
  const search = searchParams.get('search') || undefined
  return { page, limit, status, search }
}

export async function GET(request: NextRequest) {
  try {
    // Get session for user authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const { page, limit, status, search } = parseQueryParams(searchParams)
    const offset = (page - 1) * limit

    try {
      // Try database operation first
      const conditions = [eq(campaigns.userId, session.user.id)]
      
      if (status) {
        conditions.push(eq(campaigns.status, status))
      }
      
      if (search) {
        conditions.push(
          sql`LOWER(${campaigns.name}) LIKE LOWER(${'%' + search + '%'}) OR LOWER(${campaigns.description}) LIKE LOWER(${'%' + search + '%'})`
        )
      }

      // Fetch campaigns with lead statistics
      const allCampaigns = await db
        .select({
          id: campaigns.id,
          name: campaigns.name,
          status: campaigns.status,
          description: campaigns.description,
          totalLeads: campaigns.totalLeads,
          successfulLeads: campaigns.successfulLeads,
          responseRate: campaigns.responseRate,
          userId: campaigns.userId,
          createdAt: campaigns.createdAt,
          updatedAt: campaigns.updatedAt,
        })
        .from(campaigns)
        .where(and(...conditions))
        .orderBy(desc(campaigns.createdAt))
        .limit(limit)
        .offset(offset)

      // Get total count for pagination
      const totalResult = await db
        .select({ count: sql`COUNT(*)`.mapWith(Number) })
        .from(campaigns)
        .where(and(...conditions))
      
      const total = totalResult[0]?.count || 0
      const totalPages = Math.ceil(total / limit)

      return NextResponse.json({
        data: allCampaigns,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
        meta: {
          timestamp: new Date().toISOString(),
          source: "database",
        }
      })
    } catch (dbError) {
      console.error("Database error, returning mock data:", dbError)
      
      // Get mock data from shared store
      let filteredCampaigns = getMockCampaigns()
      
      if (status) {
        filteredCampaigns = filteredCampaigns.filter(campaign => campaign.status === status)
      }
      
      if (search) {
        const searchLower = search.toLowerCase()
        filteredCampaigns = filteredCampaigns.filter(campaign => 
          campaign.name.toLowerCase().includes(searchLower) ||
          (campaign.description && campaign.description.toLowerCase().includes(searchLower))
        )
      }
      
      // Apply pagination to mock data
      const paginatedCampaigns = filteredCampaigns.slice(offset, offset + limit)
      const total = filteredCampaigns.length
      const totalPages = Math.ceil(total / limit)
      
      return NextResponse.json({
        data: paginatedCampaigns,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
        meta: {
          timestamp: new Date().toISOString(),
          source: "mock",
        }
      })
    }
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json(
      { error: "Failed to fetch campaigns", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get session for user authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validation = validateCampaignInput(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    const { name, description, status = 'draft' } = body

    try {
      // Try database operation first
      const existingCampaign = await db
        .select({ id: campaigns.id })
        .from(campaigns)
        .where(and(eq(campaigns.name, name), eq(campaigns.userId, session.user.id)))
        .limit(1)
      
      if (existingCampaign.length > 0) {
        return NextResponse.json(
          { error: "Campaign with this name already exists" },
          { status: 409 }
        )
      }

      // Create new campaign
      const newCampaign = {
        id: nanoid(),
        name,
        description: description || "",
        status,
        totalLeads: 0,
        successfulLeads: 0,
        responseRate: 0.0,
        userId: session.user.id,
      }

      const dbResult = await db.insert(campaigns).values(newCampaign).returning()
      
      if (dbResult.length === 0) {
        throw new Error("Failed to create campaign")
      }

      return NextResponse.json({
        message: "Campaign created successfully",
        data: dbResult[0],
        meta: {
          timestamp: new Date().toISOString(),
          source: "database",
        }
      }, { status: 201 })
      
    } catch (dbError) {
      console.error("Database error, creating mock campaign:", dbError)
      
      // Check if campaign with same name already exists in mock store
      const existingMockCampaign = findMockCampaignByName(name, session.user.id)
      
      if (existingMockCampaign) {
        return NextResponse.json(
          { error: "Campaign with this name already exists" },
          { status: 409 }
        )
      }
      
      // Create and add mock campaign to the store
      const mockCampaign: MockCampaign = {
        id: nanoid(),
        name,
        description: description || "",
        status,
        totalLeads: 0,
        successfulLeads: 0,
        responseRate: 0.0,
        userId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      // Add to mock store
      addMockCampaign(mockCampaign)

      return NextResponse.json({
        message: "Campaign created successfully (mock)",
        data: mockCampaign,
        meta: {
          timestamp: new Date().toISOString(),
          source: "mock",
        }
      }, { status: 201 })
    }
  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json(
      { error: "Failed to create campaign", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}