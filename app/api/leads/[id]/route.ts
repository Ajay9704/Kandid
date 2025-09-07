import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/index"
import { leads } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getMockLeadById, updateMockLead, type MockLead } from "@/lib/mock-leads-store"

// Fix the route signature to match Next.js 15 expectations
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await context.params

    // Try to fetch from database first
    try {
      const lead = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1)
      
      if (lead.length > 0) {
        return NextResponse.json(lead[0])
      }
    } catch (dbError) {
      console.log("Database not ready, returning mock data")
    }

    // Return mock data from shared store
    const mockLead = getMockLeadById(leadId)
    if (!mockLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json(mockLead)
  } catch (error) {
    console.error("Error fetching lead:", error)
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await context.params
    const body = await request.json()
    const { name, email, company, status, notes } = body

    const updatedLead = await db.update(leads)
      .set({
        name,
        email,
        company,
        status,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, leadId))
      .returning()

    if (updatedLead.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json(updatedLead[0])
  } catch (error) {
    console.error("Error updating lead:", error)
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await context.params
    const body = await request.json()
    const { status, connectionStatus } = body

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    }
    
    // Add status if provided
    if (status !== undefined) {
      updateData.status = status
    }
    
    // Add connectionStatus if provided
    if (connectionStatus !== undefined) {
      updateData.connectionStatus = connectionStatus
    }

    // Try to update in database first
    try {
      const updatedLead = await db.update(leads)
        .set(updateData)
        .where(eq(leads.id, leadId))
        .returning()

      if (updatedLead.length > 0) {
        return NextResponse.json(updatedLead[0])
      }
    } catch (dbError) {
      console.log("Database not ready, updating mock data")
    }

    // Try to update in mock store
    const updatedLead = updateMockLead(leadId, {
      ...updateData,
      lastActivity: "Status updated",
      lastActivityDate: new Date(),
    })

    if (!updatedLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error("Error updating lead status:", error)
    return NextResponse.json({ error: "Failed to update lead status" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await context.params
    const deletedLead = await db.delete(leads).where(eq(leads.id, leadId)).returning()
    
    if (deletedLead.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Lead deleted successfully" })
  } catch (error) {
    console.error("Error deleting lead:", error)
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 })
  }
}