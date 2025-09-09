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

    const { id: leadId } = await context.params

    // Fetch from database
    const lead = await mongoAdapter.leads.findLeadById(leadId)
    
    if (!lead) {
      // Add debugging information
      console.log(`🔍 Lead not found. Searching for lead with ID: ${leadId}`)
      console.log(`🔍 User ID from session: ${session.user.id}`)
      
      // Try to find any lead with this ID to see if it exists but belongs to a different user
      const anyLead = await mongoAdapter.leads.findLeadById(leadId)
      if (anyLead) {
        console.log(`🔍 Lead exists but may belong to different user. Lead user ID: ${anyLead.userId}`)
      }
      
      return NextResponse.json({ error: "Lead not found", details: `Lead with ID ${leadId} does not exist or may have been deleted` }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error("Error fetching lead:", error)
    return NextResponse.json({ error: "Failed to fetch lead", details: (error as Error).message }, { status: 500 })
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

    const { id: leadId } = await context.params
    const body = await request.json()

    // Check if lead exists first
    const existingLead = await mongoAdapter.leads.findLeadById(leadId)
    if (!existingLead) {
      // Add debugging information
      console.log(`🔍 Lead not found for update. Searching for lead with ID: ${leadId}`)
      console.log(`🔍 User ID from session: ${session.user.id}`)
      
      // Try to find any lead with this ID to see if it exists but belongs to a different user
      const anyLead = await mongoAdapter.leads.findLeadById(leadId)
      if (anyLead) {
        console.log(`🔍 Lead exists but may belong to different user. Lead user ID: ${anyLead.userId}`)
      }
      
      return NextResponse.json({ error: "Lead not found", details: `Lead with ID ${leadId} does not exist or may have been deleted` }, { status: 404 })
    }

    // Prepare update data - only include fields that are actually provided
    const updateData: any = {
      updatedAt: new Date(),
    }
    
    // Only add fields that are actually provided in the request
    if (body.name !== undefined) updateData.name = body.name
    if (body.email !== undefined) updateData.email = body.email
    if (body.company !== undefined) updateData.company = body.company
    if (body.status !== undefined) updateData.status = body.status
    if (body.connectionStatus !== undefined) updateData.connectionStatus = body.connectionStatus
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.sequenceStep !== undefined) updateData.sequenceStep = body.sequenceStep
    if (body.lastContactDate !== undefined) updateData.lastContactDate = body.lastContactDate
    if (body.lastActivity !== undefined) updateData.lastActivity = body.lastActivity
    if (body.lastActivityDate !== undefined) updateData.lastActivityDate = body.lastActivityDate

    // Update in database
    const updatedLead = await mongoAdapter.leads.updateLead(leadId, updateData)

    if (!updatedLead) {
      return NextResponse.json({ error: "Lead not found", details: `Lead with ID ${leadId} does not exist or may have been deleted` }, { status: 404 })
    }

    // Emit event for real-time updates
    emitServerUpdateEvent('leads_updated', { id: leadId, ...updatedLead })

    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error("Error updating lead:", error)
    return NextResponse.json({ error: "Failed to update lead", details: (error as Error).message }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // PATCH should work the same as PUT for our use case
  return PUT(request, context)
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

    const { id: leadId } = await context.params
    
    // Check if lead exists first
    const existingLead = await mongoAdapter.leads.findLeadById(leadId)
    if (!existingLead) {
      return NextResponse.json({ error: "Lead not found", details: `Lead with ID ${leadId} does not exist or may have been deleted` }, { status: 404 })
    }
    
    // Delete from database
    await mongoAdapter.leads.deleteLead(leadId)
    
    // Emit event for real-time updates
    emitServerUpdateEvent('leads_updated', { id: leadId })
    
    return NextResponse.json({ message: "Lead deleted successfully" })
  } catch (error) {
    console.error("Error deleting lead:", error)
    return NextResponse.json({ error: "Failed to delete lead", details: (error as Error).message }, { status: 500 })
  }
}