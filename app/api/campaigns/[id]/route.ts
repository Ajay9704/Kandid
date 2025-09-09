import { NextRequest, NextResponse } from "next/server"
import { mongoAdapter } from "@/lib/db/mongo-adapter"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { emitServerUpdateEvent } from "@/lib/socket-server-utils"

// Fix the route signature to match Next.js 15 expectations
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get session for user authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: campaignId } = await context.params

    // Fetch from database
    const campaign = await mongoAdapter.campaigns.findCampaignById(campaignId)
    
    if (!campaign) {
      // Add debugging information
      console.log(`🔍 Campaign not found. Searching for campaign with ID: ${campaignId}`)
      console.log(`🔍 User ID from session: ${session.user.id}`)
      
      // Try to find any campaign with this ID to see if it exists but belongs to a different user
      const anyCampaign = await mongoAdapter.campaigns.findCampaignById(campaignId)
      if (anyCampaign) {
        console.log(`🔍 Campaign exists but may belong to different user. Campaign user ID: ${anyCampaign.userId}`)
      }
      
      return NextResponse.json({ error: "Campaign not found", details: `Campaign with ID ${campaignId} does not exist or may have been deleted` }, { status: 404 })
    }

    return NextResponse.json(campaign)
  } catch (error) {
    console.error("Error fetching campaign:", error)
    return NextResponse.json({ error: "Failed to fetch campaign", details: (error as Error).message }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get session for user authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: campaignId } = await context.params
    const body = await request.json()

    // Check if campaign exists first
    const existingCampaign = await mongoAdapter.campaigns.findCampaignById(campaignId)
    if (!existingCampaign) {
      return NextResponse.json({ error: "Campaign not found", details: `Campaign with ID ${campaignId} does not exist or may have been deleted` }, { status: 404 })
    }

    // Prepare update data - only include fields that are actually provided
    const updateData: any = {
      updatedAt: new Date(),
    }
    
    // Only add fields that are actually provided in the request
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.status !== undefined) updateData.status = body.status

    // Update in database
    const updatedCampaign = await mongoAdapter.campaigns.updateCampaign(campaignId, updateData)

    if (!updatedCampaign) {
      return NextResponse.json({ error: "Campaign not found", details: `Campaign with ID ${campaignId} does not exist or may have been deleted` }, { status: 404 })
    }

    // Emit event for real-time updates
    emitServerUpdateEvent('campaigns_updated', { ...updatedCampaign })

    return NextResponse.json(updatedCampaign)
  } catch (error) {
    console.error("Error updating campaign:", error)
    return NextResponse.json({ error: "Failed to update campaign", details: (error as Error).message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get session for user authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: campaignId } = await context.params
    const body = await request.json()

    // Check if campaign exists first
    const existingCampaign = await mongoAdapter.campaigns.findCampaignById(campaignId)
    if (!existingCampaign) {
      return NextResponse.json({ error: "Campaign not found", details: `Campaign with ID ${campaignId} does not exist or may have been deleted` }, { status: 404 })
    }

    // Prepare update data - only include fields that are actually provided
    const updateData: any = {
      updatedAt: new Date(),
    }
    
    // Only add fields that are actually provided in the request
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.status !== undefined) updateData.status = body.status

    // Update in database
    const updatedCampaign = await mongoAdapter.campaigns.updateCampaign(campaignId, updateData)

    if (!updatedCampaign) {
      return NextResponse.json({ error: "Campaign not found", details: `Campaign with ID ${campaignId} does not exist or may have been deleted` }, { status: 404 })
    }

    // Emit event for real-time updates
    emitServerUpdateEvent('campaigns_updated', { ...updatedCampaign })

    // Also invalidate related queries by returning the updated campaign
    return NextResponse.json(updatedCampaign)
  } catch (error) {
    console.error("Error updating campaign:", error)
    return NextResponse.json({ error: "Failed to update campaign", details: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get session for user authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: campaignId } = await context.params
    
    // Check if campaign exists first
    const existingCampaign = await mongoAdapter.campaigns.findCampaignById(campaignId)
    if (!existingCampaign) {
      // Add debugging information
      console.log(`🔍 Campaign not found for delete. Searching for campaign with ID: ${campaignId}`)
      console.log(`🔍 User ID from session: ${session.user.id}`)
      
      // Try to find any campaign with this ID to see if it exists but belongs to a different user
      const anyCampaign = await mongoAdapter.campaigns.findCampaignById(campaignId)
      if (anyCampaign) {
        console.log(`🔍 Campaign exists but may belong to different user. Campaign user ID: ${anyCampaign.userId}`)
      }
      
      return NextResponse.json({ error: "Campaign not found", details: `Campaign with ID ${campaignId} does not exist or may have been deleted` }, { status: 404 })
    }

    // Delete from database
    await mongoAdapter.campaigns.deleteCampaign(campaignId)

    return NextResponse.json({ message: "Campaign deleted successfully" })
  } catch (error) {
    console.error("Error deleting campaign:", error)
    return NextResponse.json({ error: "Failed to delete campaign", details: (error as Error).message }, { status: 500 })
  }
}