import { NextRequest, NextResponse } from "next/server"
import { mongoAdapter } from "@/lib/db/mongo-adapter"
import { nanoid } from "nanoid"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { emitServerUpdateEvent } from "@/lib/socket-server-utils"

export async function GET(request: NextRequest) {
  try {
    // Get session for user authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit
    const status = searchParams.get('status') || undefined
    const connectionStatus = searchParams.get('connectionStatus') || undefined
    const search = searchParams.get('search') || undefined

    let result;
    
    // If campaignId is specified, fetch leads for that campaign
    if (campaignId) {
      result = await mongoAdapter.leads.findLeadsByCampaignId(campaignId, {
        limit,
        offset,
        status,
        connectionStatus,
        search
      })
    } else {
      // If no campaignId specified, fetch all leads for the user
      result = await mongoAdapter.leads.findLeadsByUserId(session.user.id, {
        limit,
        offset,
        status,
        connectionStatus,
        search
      })
    }

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
    console.error("Error fetching leads:", error)
    return NextResponse.json({ error: "Failed to fetch leads", details: (error as Error).message }, { status: 500 })
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
    const { name, email, company, position, status = "pending", notes, campaignId } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Create new lead
    const newLead = {
      id: nanoid(),
      name,
      email,
      company: company || undefined,
      position: position || undefined,
      linkedinUrl: undefined,
      profileImage: undefined,
      location: undefined,
      status,
      connectionStatus: "not_connected",
      sequenceStep: 0,
      lastContactDate: undefined,
      lastActivity: "Lead created",
      lastActivityDate: new Date(),
      notes: notes || undefined,
      campaignId: campaignId || undefined, // Allow undefined campaignId
      userId: session.user.id, // Use actual user ID from session
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert into database
    const dbResult = await mongoAdapter.leads.createLead(newLead)
    
    // Emit event for real-time updates
    emitServerUpdateEvent('leads_updated', { ...dbResult })
    
    return NextResponse.json(dbResult)
  } catch (error) {
    console.error("Error creating lead:", error)
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 })
  }
}