import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { linkedinAccounts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const accounts = await db.select().from(linkedinAccounts)
    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Error fetching LinkedIn accounts:', error)
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, linkedinUrl, dailyLimit = 50, weeklyLimit = 200 } = body

    const newAccount = await db.insert(linkedinAccounts).values({
      id: crypto.randomUUID(),
      name,
      linkedinUrl,
      dailyLimit,
      weeklyLimit,
      userId: 'demo-user', // Replace with actual user ID from session
      isActive: true,
      currentDailyCount: 0,
      currentWeeklyCount: 0,
      lastResetDate: new Date(),
    }).returning()

    return NextResponse.json(newAccount[0])
  } catch (error) {
    console.error('Error creating LinkedIn account:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}