import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return mock LinkedIn accounts data
    const mockAccounts = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@linkedin.com',
        profileUrl: 'https://linkedin.com/in/johnsmith',
        profileImage: 'https://media.licdn.com/dms/image/profile.jpg',
        connectionCount: 1247,
        isActive: true,
        isPrimary: true,
        dailyRequestLimit: 50,
        dailyRequestsUsed: 23,
        weeklyRequestLimit: 200,
        weeklyRequestsUsed: 89,
        lastActivity: new Date(),
        connectedAt: new Date('2024-01-01'),
        settings: {
          autoConnect: true,
          autoMessage: false,
          workingHours: {
            start: '09:00',
            end: '17:00',
            timezone: 'UTC'
          },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        }
      }
    ]
    
    return NextResponse.json(mockAccounts)
  } catch (error) {
    console.error('Error fetching LinkedIn accounts:', error)
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, linkedinUrl, dailyLimit = 50, weeklyLimit = 200 } = body

    const newAccount = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@linkedin.com`,
      profileUrl: linkedinUrl,
      profileImage: null,
      connectionCount: 0,
      isActive: true,
      isPrimary: false,
      dailyRequestLimit: dailyLimit,
      dailyRequestsUsed: 0,
      weeklyRequestLimit: weeklyLimit,
      weeklyRequestsUsed: 0,
      lastActivity: new Date(),
      connectedAt: new Date(),
      settings: {
        autoConnect: false,
        autoMessage: false,
        workingHours: {
          start: '09:00',
          end: '17:00',
          timezone: 'UTC'
        },
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      }
    }

    return NextResponse.json(newAccount)
  } catch (error) {
    console.error('Error creating LinkedIn account:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}