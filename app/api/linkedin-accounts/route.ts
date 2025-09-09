import { NextRequest, NextResponse } from 'next/server'
import { mongoAdapter } from '@/lib/db/mongo-adapter'
import { nanoid } from 'nanoid'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // Get session for user authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch LinkedIn accounts from database
    const accounts = await mongoAdapter.linkedinAccounts.findLinkedInAccountsByUserId(session.user.id)
    
    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Error fetching LinkedIn accounts:', error)
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
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
    const { name, linkedinUrl, dailyLimit = 50, weeklyLimit = 200 } = body

    const newAccount = {
      id: nanoid(),
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@linkedin.com`,
      linkedinUrl,
      profileImage: null,
      isActive: true,
      isPrimary: false,
      dailyLimit,
      weeklyLimit,
      currentDailyCount: 0,
      currentWeeklyCount: 0,
      lastResetDate: new Date(),
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert into database
    const dbResult = await mongoAdapter.linkedinAccounts.createLinkedInAccount(newAccount)
    return NextResponse.json(dbResult)
  } catch (error) {
    console.error('Error creating LinkedIn account:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}