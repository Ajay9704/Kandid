import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { activityLogs } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    const activities = await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(50)
    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadId, campaignId, activityType, description, metadata } = body

    const newActivity = await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      leadId,
      campaignId,
      activityType,
      description,
      metadata: metadata ? JSON.stringify(metadata) : null,
      userId: 'demo-user', // Replace with actual user ID from session
      createdAt: new Date(),
    }).returning()

    return NextResponse.json(newActivity[0])
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}