import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { leads } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await db.select().from(leads).where(eq(leads.id, params.id)).limit(1)
    
    if (lead.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json(lead[0])
  } catch (error) {
    console.error("Error fetching lead:", error)
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
      .where(eq(leads.id, params.id))
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deletedLead = await db.delete(leads).where(eq(leads.id, params.id)).returning()
    
    if (deletedLead.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Lead deleted successfully" })
  } catch (error) {
    console.error("Error deleting lead:", error)
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 })
  }
}