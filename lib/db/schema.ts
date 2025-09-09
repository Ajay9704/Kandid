// MongoDB collections definitions
import { ObjectId } from 'mongodb'

// User collection
export interface User {
  _id?: ObjectId
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string
  password?: string
  createdAt: Date
  updatedAt: Date
}

// Session collection
export interface Session {
  _id?: ObjectId
  id: string
  expiresAt: Date
  token: string
  createdAt: Date
  updatedAt: Date
  ipAddress?: string
  userAgent?: string
  userId: string
}

// Account collection
export interface Account {
  _id?: ObjectId
  id: string
  accountId: string
  providerId: string
  userId: string
  accessToken?: string
  refreshToken?: string
  idToken?: string
  accessTokenExpiresAt?: Date
  refreshTokenExpiresAt?: Date
  scope?: string
  password?: string
  createdAt: Date
  updatedAt: Date
}

// Verification collection
export interface Verification {
  _id?: ObjectId
  id: string
  identifier: string
  value: string
  expiresAt: Date
  createdAt?: Date
  updatedAt?: Date
}

// Campaigns collection
export interface Campaign {
  _id?: ObjectId
  id: string
  name: string
  status: string
  description?: string
  totalLeads: number
  successfulLeads: number
  responseRate: number
  userId: string
  createdAt: Date
  updatedAt: Date
}

// Leads collection (LinkedIn-style)
export interface Lead {
  _id?: ObjectId
  id: string
  name: string
  email: string
  company?: string
  position?: string
  linkedinUrl?: string
  profileImage?: string
  location?: string
  status: string // pending, contacted, responded, qualified, nurturing, converted
  connectionStatus: string // not_connected, request_sent, connected, request_received, do_not_contact
  sequenceStep: number // 0: not started, 1: connection request, 2: follow-up 1, etc.
  lastContactDate?: Date
  lastActivity?: string // "Connection request sent", "Message replied", etc.
  lastActivityDate?: Date
  notes?: string
  campaignId: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

// LinkedIn Accounts collection
export interface LinkedInAccount {
  _id?: ObjectId
  id: string
  name: string
  linkedinUrl: string
  isActive: boolean
  dailyLimit: number
  weeklyLimit: number
  currentDailyCount: number
  currentWeeklyCount: number
  lastResetDate?: Date
  userId: string
  createdAt: Date
  updatedAt: Date
}

// Campaign Sequences collection
export interface CampaignSequence {
  _id?: ObjectId
  id: string
  campaignId: string
  stepNumber: number
  stepType: string // 'connection_request', 'follow_up_message', 'email'
  title: string
  content: string
  delayDays: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Activity Logs collection
export interface ActivityLog {
  _id?: ObjectId
  id: string
  leadId?: string
  campaignId?: string
  activityType: string // 'connection_request_sent', 'message_sent', 'profile_viewed', etc.
  description: string
  metadata?: string // JSON string for additional data
  userId: string
  createdAt: Date
}

// Messages collection
export interface Message {
  _id?: ObjectId
  id: string
  leadId: string
  campaignId?: string
  sequenceStepId?: string
  messageType: string // 'connection_request', 'follow_up', 'email'
  subject?: string
  content: string
  status: string // draft, sent, delivered, read, replied
  sentAt?: Date
  readAt?: Date
  repliedAt?: Date
  userId: string
  createdAt: Date
  updatedAt: Date
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  SESSIONS: 'sessions',
  ACCOUNTS: 'accounts',
  VERIFICATIONS: 'verifications',
  CAMPAIGNS: 'campaigns',
  LEADS: 'leads',
  LINKEDIN_ACCOUNTS: 'linkedinAccounts',
  CAMPAIGN_SEQUENCES: 'campaignSequences',
  ACTIVITY_LOGS: 'activityLogs',
  MESSAGES: 'messages'
} as const

// Export types
export type NewCampaign = Omit<Campaign, '_id'>
export type NewLead = Omit<Lead, '_id'>