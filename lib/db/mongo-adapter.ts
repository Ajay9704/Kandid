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

// Helper function to ensure database is available
const ensureDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Make sure the database is properly configured and connected.')
  }
  return db
}

// User operations
export const userAdapter = {
  async findUserByEmail(email: string) {
    try {
      const database = ensureDb()
      const user = await database.collection(COLLECTIONS.USERS).findOne({ email })
      return user ? toPlainObject(user) : null
    } catch (error) {
      console.error('Error in findUserByEmail:', error)
      return null
    }
  },
  
  async findUserById(id: string) {
    try {
      const database = ensureDb()
      const user = await database.collection(COLLECTIONS.USERS).findOne({ id })
      return user ? toPlainObject(user) : null
    } catch (error) {
      console.error('Error in findUserById:', error)
      return null
    }
  },
  
  async createUser(userData: Omit<User, '_id'>) {
    const database = ensureDb()
    const result = await database.collection(COLLECTIONS.USERS).insertOne({
      ...userData,
      createdAt: userData.createdAt || new Date(),
      updatedAt: userData.updatedAt || new Date()
    })
    return { ...userData, id: userData.id, _id: result.insertedId }
  },
  
  async updateUser(id: string, userData: Partial<User>) {
    const database = ensureDb()
    const result = await database.collection(COLLECTIONS.USERS).findOneAndUpdate(
      { id },
      { $set: { ...userData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    return result && result.value ? toPlainObject(result.value) : null
  },
  
  async deleteUser(email: string) {
    try {
      const database = ensureDb()
      await database.collection(COLLECTIONS.USERS).deleteOne({ email })
    } catch (error) {
      console.error('Error in deleteUser:', error)
    }
  }
}

// Session operations
export const sessionAdapter = {
  async findSessionByToken(token: string) {
    try {
      const database = ensureDb()
      const session = await database.collection(COLLECTIONS.SESSIONS).findOne({ token })
      return session ? toPlainObject(session) : null
    } catch (error) {
      console.error('Error in findSessionByToken:', error)
      return null
    }
  },
  
  async createSession(sessionData: Omit<Session, '_id'>) {
    const database = ensureDb()
    const result = await database.collection(COLLECTIONS.SESSIONS).insertOne({
      ...sessionData,
      createdAt: sessionData.createdAt || new Date(),
      updatedAt: sessionData.updatedAt || new Date()
    })
    return { ...sessionData, id: sessionData.id, _id: result.insertedId }
  },
  
  async deleteSession(token: string) {
    try {
      const database = ensureDb()
      await database.collection(COLLECTIONS.SESSIONS).deleteOne({ token })
    } catch (error) {
      console.error('Error in deleteSession:', error)
    }
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
    try {
      const database = ensureDb()
      
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
        database.collection(COLLECTIONS.CAMPAIGNS).find(filter, findOptions).toArray(),
        database.collection(COLLECTIONS.CAMPAIGNS).countDocuments(filter)
      ])
      
      return {
        data: data.map(toPlainObject),
        total
      }
    } catch (error) {
      console.error('Error in findCampaignsByUserId:', error)
      return { data: [], total: 0 }
    }
  },
  
  async findCampaignById(id: string) {
    try {
      const database = ensureDb()
      const campaign = await database.collection(COLLECTIONS.CAMPAIGNS).findOne({ id })
      return campaign ? toPlainObject(campaign) : null
    } catch (error) {
      console.error('Error in findCampaignById:', error)
      return null
    }
  },
  
  async findCampaignByNameAndUserId(name: string, userId: string) {
    try {
      const database = ensureDb()
      const campaign = await database.collection(COLLECTIONS.CAMPAIGNS).findOne({ name, userId })
      return campaign ? toPlainObject(campaign) : null
    } catch (error) {
      console.error('Error in findCampaignByNameAndUserId:', error)
      return null
    }
  },
  
  async createCampaign(campaignData: Omit<Campaign, '_id'>) {
    const database = ensureDb()
    const result = await database.collection(COLLECTIONS.CAMPAIGNS).insertOne({
      ...campaignData,
      createdAt: campaignData.createdAt || new Date(),
      updatedAt: campaignData.updatedAt || new Date()
    })
    return { ...campaignData, id: campaignData.id, _id: result.insertedId }
  },
  
  async updateCampaign(id: string, campaignData: Partial<Campaign>) {
    const database = ensureDb()
    const result = await database.collection(COLLECTIONS.CAMPAIGNS).findOneAndUpdate(
      { id },
      { $set: { ...campaignData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    return result && result.value ? toPlainObject(result.value) : null
  },
  
  async deleteCampaign(id: string) {
    try {
      const database = ensureDb()
      await database.collection(COLLECTIONS.CAMPAIGNS).deleteOne({ id })
    } catch (error) {
      console.error('Error in deleteCampaign:', error)
    }
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
    try {
      const database = ensureDb()
      
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
        database.collection(COLLECTIONS.LEADS).find(filter, findOptions).toArray(),
        database.collection(COLLECTIONS.LEADS).countDocuments(filter)
      ])
      
      return {
        data: data.map(toPlainObject),
        total
      }
    } catch (error) {
      console.error('Error in findLeadsByCampaignId:', error)
      return { data: [], total: 0 }
    }
  },
  
  async findLeadsByUserId(userId: string, options: { 
    limit?: number, 
    offset?: number,
    status?: string,
    connectionStatus?: string,
    search?: string
  } = {}) {
    try {
      const database = ensureDb()
      
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
        database.collection(COLLECTIONS.LEADS).find(filter, findOptions).toArray(),
        database.collection(COLLECTIONS.LEADS).countDocuments(filter)
      ])
      
      return {
        data: data.map(toPlainObject),
        total
      }
    } catch (error) {
      console.error('Error in findLeadsByUserId:', error)
      return { data: [], total: 0 }
    }
  },
  
  async findLeadById(id: string) {
    try {
      const database = ensureDb()
      const lead = await database.collection(COLLECTIONS.LEADS).findOne({ id })
      return lead ? toPlainObject(lead) : null
    } catch (error) {
      console.error('Error in findLeadById:', error)
      return null
    }
  },
  
  async createLead(leadData: Omit<Lead, '_id'>) {
    const database = ensureDb()
    const result = await database.collection(COLLECTIONS.LEADS).insertOne({
      ...leadData,
      createdAt: leadData.createdAt || new Date(),
      updatedAt: leadData.updatedAt || new Date()
    })
    return { ...leadData, id: leadData.id, _id: result.insertedId }
  },
  
  async updateLead(id: string, leadData: Partial<Lead>) {
    const database = ensureDb()
    const result = await database.collection(COLLECTIONS.LEADS).findOneAndUpdate(
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
    try {
      const database = ensureDb()
      await database.collection(COLLECTIONS.LEADS).deleteOne({ id })
    } catch (error) {
      console.error('Error in deleteLead:', error)
    }
  }
}

// LinkedIn Account operations
export const linkedinAccountAdapter = {
  async findLinkedInAccountsByUserId(userId: string) {
    try {
      const database = ensureDb()
      const accounts = await database.collection(COLLECTIONS.LINKEDIN_ACCOUNTS).find({ userId }).toArray()
      return accounts.map(toPlainObject)
    } catch (error) {
      console.error('Error in findLinkedInAccountsByUserId:', error)
      return []
    }
  },
  
  async findLinkedInAccountById(id: string) {
    try {
      const database = ensureDb()
      const account = await database.collection(COLLECTIONS.LINKEDIN_ACCOUNTS).findOne({ id })
      return account ? toPlainObject(account) : null
    } catch (error) {
      console.error('Error in findLinkedInAccountById:', error)
      return null
    }
  },
  
  async createLinkedInAccount(accountData: Omit<LinkedInAccount, '_id'>) {
    const database = ensureDb()
    const result = await database.collection(COLLECTIONS.LINKEDIN_ACCOUNTS).insertOne({
      ...accountData,
      createdAt: accountData.createdAt || new Date(),
      updatedAt: accountData.updatedAt || new Date()
    })
    return { ...accountData, id: accountData.id, _id: result.insertedId }
  },
  
  async updateLinkedInAccount(id: string, accountData: Partial<LinkedInAccount>) {
    const database = ensureDb()
    const result = await database.collection(COLLECTIONS.LINKEDIN_ACCOUNTS).findOneAndUpdate(
      { id },
      { $set: { ...accountData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    return result && result.value ? toPlainObject(result.value) : null
  },
  
  async deleteLinkedInAccount(id: string) {
    try {
      const database = ensureDb()
      await database.collection(COLLECTIONS.LINKEDIN_ACCOUNTS).deleteOne({ id })
    } catch (error) {
      console.error('Error in deleteLinkedInAccount:', error)
    }
  }
}

// Message operations
export const messageAdapter = {
  async findMessagesByUserId(userId: string) {
    try {
      const database = ensureDb()
      const messages = await database.collection(COLLECTIONS.MESSAGES).find({ userId }).toArray()
      return messages.map(toPlainObject)
    } catch (error) {
      console.error('Error in findMessagesByUserId:', error)
      return []
    }
  },
  
  async createMessage(messageData: Omit<Message, '_id'>) {
    const database = ensureDb()
    const result = await database.collection(COLLECTIONS.MESSAGES).insertOne({
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