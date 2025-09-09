import { NextRequest, NextResponse } from 'next/server'
import { ActivityLog } from '@/lib/db/schema'
import { db } from '@/lib/db/index'
import { COLLECTIONS } from '@/lib/db/schema'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { nanoid } from "nanoid"

export async function GET() {
  try {
    // Get session for user authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if database is initialized
    if (!db) {
      // Return empty array if database is not initialized
      const activities: ActivityLog[] = []
      return NextResponse.json(activities)
    }

    // Query the database for activities belonging to the user
    const activitiesData = await db.collection(COLLECTIONS.ACTIVITY_LOGS)
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()

    // Enrich activities with lead information
    const enrichedActivities = []
    for (const activity of activitiesData) {
      let leadInfo = null
      if (activity.leadId) {
        const lead = await db.collection(COLLECTIONS.LEADS).findOne({ id: activity.leadId })
        if (lead) {
          leadInfo = {
            name: lead.name,
            company: lead.company
          }
        }
      }

      enrichedActivities.push({
        ...activity,
        leadName: leadInfo?.name || 'Unknown Lead',
        company: leadInfo?.company || 'Unknown Company',
        id: activity.id,
        userId: activity.userId,
        activityType: activity.activityType,
        description: activity.description,
        createdAt: activity.createdAt,
        leadId: activity.leadId,
        campaignId: activity.campaignId,
        metadata: activity.metadata,
        _id: activity._id
      })
    }

    return NextResponse.json(enrichedActivities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get session for user authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await req.json()

    // Check if database is initialized
    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 })
    }

    // Create a new activity log entry
    const newActivity = {
      id: nanoid(),
      userId: session.user.id,
      activityType: body.activityType,
      description: body.description,
      createdAt: new Date(),
      leadId: body.leadId,
      campaignId: body.campaignId,
      metadata: body.metadata,
    }

    // Insert the new activity into the database
    const result = await db.collection(COLLECTIONS.ACTIVITY_LOGS).insertOne(newActivity)

    return NextResponse.json({ id: result.insertedId })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}
