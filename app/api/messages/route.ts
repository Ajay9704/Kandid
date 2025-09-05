import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { messages } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    const messagesList = await db.select().from(messages).orderBy(desc(messages.createdAt)).limit(50)
    return NextResponse.json(messagesList)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadId, campaignId, messageType, subject, content, status = 'draft' } = body

    const newMessage = await db.insert(messages).values({
      id: crypto.randomUUID(),
      leadId,
      campaignId,
      messageType,
      subject,
      content,
      status,
      userId: 'demo-user', // Replace with actual user ID from session
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    return NextResponse.json(newMessage[0])
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}