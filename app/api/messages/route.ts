import { NextRequest, NextResponse } from 'next/server'
import { mongoAdapter } from '@/lib/db/mongo-adapter'
import { Message } from '@/lib/db/schema'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { nanoid } from "nanoid"
import { db } from '@/lib/db/index'
import { COLLECTIONS } from '@/lib/db/schema'

export async function GET() {
  try {
    // Get session for user authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if database is initialized
    if (!db) {
      const messagesList: Message[] = []
      return NextResponse.json(messagesList)
    }

    // Fetch messages for the user
    const messagesData = await db.collection(COLLECTIONS.MESSAGES)
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()

    // Enrich messages with lead information
    const enrichedMessages = []
    for (const message of messagesData) {
      let leadInfo = null
      if (message.leadId) {
        const lead = await db.collection(COLLECTIONS.LEADS).findOne({ id: message.leadId })
        if (lead) {
          leadInfo = {
            name: lead.name,
            company: lead.company
          }
        }
      }

      enrichedMessages.push({
        ...message,
        leadName: leadInfo?.name || 'Unknown Lead',
        company: leadInfo?.company || 'Unknown Company',
        id: message.id,
        userId: message.userId,
        messageType: message.messageType,
        subject: message.subject,
        content: message.content,
        status: message.status,
        sentAt: message.sentAt,
        readAt: message.readAt,
        repliedAt: message.repliedAt,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        _id: message._id
      })
    }

    return NextResponse.json(enrichedMessages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
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
    const { leadId, campaignId, messageType, subject, content, status = 'draft' } = body

    const newMessage = await mongoAdapter.messages.createMessage({
      id: nanoid(),
      leadId,
      campaignId,
      messageType,
      subject,
      content,
      status,
      userId: session.user.id, // Use actual user ID from session
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}