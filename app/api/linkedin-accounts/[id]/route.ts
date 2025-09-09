import { NextRequest, NextResponse } from "next/server"
import { mongoAdapter } from "@/lib/db/mongo-adapter"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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

    const { id: accountId } = await context.params

    // Fetch LinkedIn account from database
    const account = await mongoAdapter.linkedinAccounts.findLinkedInAccountById(accountId)
    
    if (!account) {
      return NextResponse.json({ error: "LinkedIn account not found" }, { status: 404 })
    }

    return NextResponse.json(account)
  } catch (error) {
    console.error("Error fetching LinkedIn account:", error)
    return NextResponse.json({ error: "Failed to fetch LinkedIn account" }, { status: 500 })
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

    const { id: accountId } = await context.params
    const body = await request.json()

    // Update in database
    const updatedAccount = await mongoAdapter.linkedinAccounts.updateLinkedInAccount(accountId, {
      ...body,
      updatedAt: new Date(),
    })

    if (!updatedAccount) {
      return NextResponse.json({ error: "LinkedIn account not found" }, { status: 404 })
    }

    return NextResponse.json(updatedAccount)
  } catch (error) {
    console.error("Error updating LinkedIn account:", error)
    return NextResponse.json({ error: "Failed to update LinkedIn account" }, { status: 500 })
  }
}