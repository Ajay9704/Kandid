import { NextRequest, NextResponse } from "next/server"
import { mongoAdapter } from "@/lib/db/mongo-adapter"
import { nanoid } from "nanoid"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { emitServerUpdateEvent } from "@/lib/socket-server-utils"

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

    // Database operation
    const result = await mongoAdapter.campaigns.findCampaignsByUserId(session.user.id, {
      limit,
      offset,
      status,
      search
    })

    const totalPages = Math.ceil(result.total / limit)

    return NextResponse.json({
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages,
        hasMore: page < totalPages,
      },
      meta: {
        timestamp: new Date().toISOString(),
        source: "database",
      }
    })
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

    // Check if campaign with this name already exists
    const existingCampaign = await mongoAdapter.campaigns.findCampaignByNameAndUserId(name, session.user.id)
    
    if (existingCampaign) {
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
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const dbResult = await mongoAdapter.campaigns.createCampaign(newCampaign)
    
    // Emit event for real-time updates
    emitServerUpdateEvent('campaigns_updated', { ...dbResult })

    return NextResponse.json({
      message: "Campaign created successfully",
      data: dbResult,
      meta: {
        timestamp: new Date().toISOString(),
        source: "database",
      }
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json(
      { error: "Failed to create campaign", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}