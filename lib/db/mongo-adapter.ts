import { db } from './index'
import { COLLECTIONS, User, Session, Account, Verification, Campaign, Lead, LinkedInAccount, CampaignSequence, ActivityLog, Message } from './schema'
import { ObjectId, Filter, FindOptions } from 'mongodb'

// Helper function to convert MongoDB document to plain object
const toPlainObject = (doc: any) => {
  if (!doc) return doc
  const plain = { ...doc }
  if (plain._id) {
    // Only set id from _id if id doesn't already exist
    if (!plain.id) {
      plain.id = plain._id.toString()
    }
    delete plain._id
  }
  return plain
}

// Helper function to convert string ID to ObjectId
const toObjectId = (id: string) => {
  try {
    return new ObjectId(id)
  } catch {
    return id // Return original if not a valid ObjectId
  }
}

// User operations
export const userAdapter = {
  async findUserByEmail(email: string) {
    if (!db) return null
    const user = await db.collection(COLLECTIONS.USERS).findOne({ email })
    return user ? toPlainObject(user) : null
  },
  
  async findUserById(id: string) {
    if (!db) return null
    const user = await db.collection(COLLECTIONS.USERS).findOne({ id })
    return user ? toPlainObject(user) : null
  },
  
  async createUser(userData: Omit<User, '_id'>) {
    if (!db) throw new Error('Database not initialized')
    const result = await db.collection(COLLECTIONS.USERS).insertOne({
      ...userData,
      createdAt: userData.createdAt || new Date(),
      updatedAt: userData.updatedAt || new Date()
    })
    return { ...userData, id: userData.id, _id: result.insertedId }
  },
  
  async updateUser(id: string, userData: Partial<User>) {
    if (!db) throw new Error('Database not initialized')
    const result = await db.collection(COLLECTIONS.USERS).findOneAndUpdate(
      { id },
      { $set: { ...userData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    return result && result.value ? toPlainObject(result.value) : null
  },
  
  async deleteUser(email: string) {
    if (!db) return
    await db.collection(COLLECTIONS.USERS).deleteOne({ email })
  }
}

// Session operations
export const sessionAdapter = {
  async findSessionByToken(token: string) {
    if (!db) return null
    const session = await db.collection(COLLECTIONS.SESSIONS).findOne({ token })
    return session ? toPlainObject(session) : null
  },
  
  async createSession(sessionData: Omit<Session, '_id'>) {
    if (!db) throw new Error('Database not initialized')
    const result = await db.collection(COLLECTIONS.SESSIONS).insertOne({
      ...sessionData,
      createdAt: sessionData.createdAt || new Date(),
      updatedAt: sessionData.updatedAt || new Date()
    })
    return { ...sessionData, id: sessionData.id, _id: result.insertedId }
  },
  
  async deleteSession(token: string) {
    if (!db) return
    await db.collection(COLLECTIONS.SESSIONS).deleteOne({ token })
  }
}

// Campaign operations
export const campaignAdapter = {
  async findCampaignsByUserId(userId: string, options: { 
    limit?: number, 
    offset?: number, 
    status?: string, 
    search?: string 
  } = {}) {
    if (!db) return { data: [], total: 0 }
    
    const filter: Filter<any> = { userId }
    
    if (options.status) {
      filter.status = options.status
    }
    
    if (options.search) {
      filter.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { description: { $regex: options.search, $options: 'i' } }
      ]
    }
    
    const findOptions: FindOptions = {
      sort: { createdAt: -1 },
      skip: options.offset,
      limit: options.limit
    }
    
    const [data, total] = await Promise.all([
      db.collection(COLLECTIONS.CAMPAIGNS).find(filter, findOptions).toArray(),
      db.collection(COLLECTIONS.CAMPAIGNS).countDocuments(filter)
    ])
    
    return {
      data: data.map(toPlainObject),
      total
    }
  },
  
  async findCampaignById(id: string) {
    if (!db) return null
    const campaign = await db.collection(COLLECTIONS.CAMPAIGNS).findOne({ id })
    return campaign ? toPlainObject(campaign) : null
  },
  
  async findCampaignByNameAndUserId(name: string, userId: string) {
    if (!db) return null
    const campaign = await db.collection(COLLECTIONS.CAMPAIGNS).findOne({ name, userId })
    return campaign ? toPlainObject(campaign) : null
  },
  
  async createCampaign(campaignData: Omit<Campaign, '_id'>) {
    if (!db) throw new Error('Database not initialized')
    const result = await db.collection(COLLECTIONS.CAMPAIGNS).insertOne({
      ...campaignData,
      createdAt: campaignData.createdAt || new Date(),
      updatedAt: campaignData.updatedAt || new Date()
    })
    return { ...campaignData, id: campaignData.id, _id: result.insertedId }
  },
  
  async updateCampaign(id: string, campaignData: Partial<Campaign>) {
    if (!db) throw new Error('Database not initialized')
    const result = await db.collection(COLLECTIONS.CAMPAIGNS).findOneAndUpdate(
      { id },
      { $set: { ...campaignData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    return result && result.value ? toPlainObject(result.value) : null
  },
  
  async deleteCampaign(id: string) {
    if (!db) return
    await db.collection(COLLECTIONS.CAMPAIGNS).deleteOne({ id })
  }
}

// Lead operations
export const leadAdapter = {
  async findLeadsByCampaignId(campaignId: string, options: { 
    limit?: number, 
    offset?: number,
    status?: string,
    connectionStatus?: string,
    search?: string
  } = {}) {
    if (!db) return { data: [], total: 0 }
    
    const filter: Filter<any> = { campaignId }
    
    if (options.status) {
      filter.status = options.status
    }
    
    if (options.connectionStatus) {
      filter.connectionStatus = options.connectionStatus
    }
    
    if (options.search) {
      filter.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { company: { $regex: options.search, $options: 'i' } },
        { position: { $regex: options.search, $options: 'i' } }
      ]
    }
    
    const findOptions: FindOptions = {
      sort: { createdAt: -1 },
      skip: options.offset,
      limit: options.limit
    }
    
    const [data, total] = await Promise.all([
      db.collection(COLLECTIONS.LEADS).find(filter, findOptions).toArray(),
      db.collection(COLLECTIONS.LEADS).countDocuments(filter)
    ])
    
    return {
      data: data.map(toPlainObject),
      total
    }
  },
  
  async findLeadsByUserId(userId: string, options: { 
    limit?: number, 
    offset?: number,
    status?: string,
    connectionStatus?: string,
    search?: string
  } = {}) {
    if (!db) return { data: [], total: 0 }
    
    const filter: Filter<any> = { userId }
    
    if (options.status) {
      filter.status = options.status
    }
    
    if (options.connectionStatus) {
      filter.connectionStatus = options.connectionStatus
    }
    
    if (options.search) {
      filter.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { company: { $regex: options.search, $options: 'i' } },
        { position: { $regex: options.search, $options: 'i' } }
      ]
    }
    
    const findOptions: FindOptions = {
      sort: { createdAt: -1 },
      skip: options.offset,
      limit: options.limit
    }
    
    const [data, total] = await Promise.all([
      db.collection(COLLECTIONS.LEADS).find(filter, findOptions).toArray(),
      db.collection(COLLECTIONS.LEADS).countDocuments(filter)
    ])
    
    return {
      data: data.map(toPlainObject),
      total
    }
  },
  
  async findLeadById(id: string) {
    if (!db) return null
    const lead = await db.collection(COLLECTIONS.LEADS).findOne({ id })
    return lead ? toPlainObject(lead) : null
  },
  
  async createLead(leadData: Omit<Lead, '_id'>) {
    if (!db) throw new Error('Database not initialized')
    const result = await db.collection(COLLECTIONS.LEADS).insertOne({
      ...leadData,
      createdAt: leadData.createdAt || new Date(),
      updatedAt: leadData.updatedAt || new Date()
    })
    return { ...leadData, id: leadData.id, _id: result.insertedId }
  },
  
  async updateLead(id: string, leadData: Partial<Lead>) {
    if (!db) throw new Error('Database not initialized')
    const result = await db.collection(COLLECTIONS.LEADS).findOneAndUpdate(
      { id },
      { $set: { ...leadData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    
    // Check if result is the actual document
    if (result && result.id) {
      return toPlainObject(result)
    }
    
    // Check if result has a value property
    if (result && (result as any).value) {
      return toPlainObject((result as any).value)
    }
    
    // If no result but the operation might have succeeded, fetch the lead again
    const updatedLead = await this.findLeadById(id)
    return updatedLead
  },
  
  async deleteLead(id: string) {
    if (!db) return
    await db.collection(COLLECTIONS.LEADS).deleteOne({ id })
  }
}

// LinkedIn Account operations
export const linkedinAccountAdapter = {
  async findLinkedInAccountsByUserId(userId: string) {
    if (!db) return []
    const accounts = await db.collection(COLLECTIONS.LINKEDIN_ACCOUNTS).find({ userId }).toArray()
    return accounts.map(toPlainObject)
  },
  
  async findLinkedInAccountById(id: string) {
    if (!db) return null
    const account = await db.collection(COLLECTIONS.LINKEDIN_ACCOUNTS).findOne({ id })
    return account ? toPlainObject(account) : null
  },
  
  async createLinkedInAccount(accountData: Omit<LinkedInAccount, '_id'>) {
    if (!db) throw new Error('Database not initialized')
    const result = await db.collection(COLLECTIONS.LINKEDIN_ACCOUNTS).insertOne({
      ...accountData,
      createdAt: accountData.createdAt || new Date(),
      updatedAt: accountData.updatedAt || new Date()
    })
    return { ...accountData, id: accountData.id, _id: result.insertedId }
  },
  
  async updateLinkedInAccount(id: string, accountData: Partial<LinkedInAccount>) {
    if (!db) throw new Error('Database not initialized')
    const result = await db.collection(COLLECTIONS.LINKEDIN_ACCOUNTS).findOneAndUpdate(
      { id },
      { $set: { ...accountData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    return result && result.value ? toPlainObject(result.value) : null
  },
  
  async deleteLinkedInAccount(id: string) {
    if (!db) return
    await db.collection(COLLECTIONS.LINKEDIN_ACCOUNTS).deleteOne({ id })
  }
}

// Message operations
export const messageAdapter = {
  async findMessagesByUserId(userId: string) {
    if (!db) return []
    const messages = await db.collection(COLLECTIONS.MESSAGES).find({ userId }).toArray()
    return messages.map(toPlainObject)
  },
  
  async createMessage(messageData: Omit<Message, '_id'>) {
    if (!db) throw new Error('Database not initialized')
    const result = await db.collection(COLLECTIONS.MESSAGES).insertOne({
      ...messageData,
      createdAt: messageData.createdAt || new Date(),
      updatedAt: messageData.updatedAt || new Date()
    })
    return { ...messageData, id: messageData.id, _id: result.insertedId }
  }
}

// Export all adapters
export const mongoAdapter = {
  users: userAdapter,
  sessions: sessionAdapter,
  campaigns: campaignAdapter,
  leads: leadAdapter,
  linkedinAccounts: linkedinAccountAdapter,
  messages: messageAdapter
}