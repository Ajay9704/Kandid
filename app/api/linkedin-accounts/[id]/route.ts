import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: accountId } = await context.params

    // Mock LinkedIn account data
    const mockAccount = {
      id: accountId,
      name: "John Smith",
      email: "john.smith@linkedin.com",
      profileUrl: "https://linkedin.com/in/johnsmith",
      profileImage: "https://media.licdn.com/dms/image/profile.jpg",
      connectionCount: 1247,
      isActive: true,
      isPrimary: true,
      dailyRequestLimit: 50,
      dailyRequestsUsed: 23,
      weeklyRequestLimit: 200,
      weeklyRequestsUsed: 89,
      lastActivity: new Date(),
      connectedAt: new Date("2024-01-01"),
      settings: {
        autoConnect: true,
        autoMessage: false,
        workingHours: {
          start: "09:00",
          end: "17:00",
          timezone: "UTC"
        },
        workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"]
      }
    }

    return NextResponse.json(mockAccount)
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
    const { id: accountId } = await context.params
    const body = await request.json()

    // Mock update - in real app, this would update the database
    const updatedAccount = {
      id: accountId,
      ...body,
      updatedAt: new Date(),
    }

    return NextResponse.json(updatedAccount)
  } catch (error) {
    console.error("Error updating LinkedIn account:", error)
    return NextResponse.json({ error: "Failed to update LinkedIn account" }, { status: 500 })
  }
}