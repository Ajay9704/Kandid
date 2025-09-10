import { MongoClient, Db } from 'mongodb'
import * as schema from './schema'

let db: Db | null = null
let client: MongoClient | null = null
let isInitialized = false

// Enhanced MongoDB initialization for Vercel deployment
const initializeMongoDB = async () => {
  console.log('🍃 Initializing MongoDB database')
  try {
    // Check if we're in a Vercel environment
    const isVercel = process.env.VERCEL === '1'
    
    // Use MongoDB Atlas connection string for Vercel, fallback to local for development
    const mongoUrl = process.env.DATABASE_URL || (isVercel ? undefined : 'mongodb://localhost:27017/linkbird')
    
    // Validate MongoDB URL
    if (!mongoUrl) {
      if (isVercel) {
        throw new Error('DATABASE_URL environment variable is required for Vercel deployment. Please set it in your Vercel project settings.')
      } else {
        throw new Error('DATABASE_URL environment variable is not set')
      }
    }
    
    console.log(`🔗 Connecting to MongoDB at: ${mongoUrl.includes('mongodb.net') ? 'MongoDB Atlas (cloud)' : 'Local MongoDB'}`)
    
    // Create MongoDB client with Vercel-optimized settings
    client = new MongoClient(mongoUrl, {
      // Vercel-friendly options
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      retryWrites: true,
      retryReads: true,
      minPoolSize: 0,
      maxIdleTimeMS: 30000,
    })
    
    // Connect to MongoDB
    await client.connect()
    db = client.db('linkbird')
    
    // Test the connection
    await db.admin().ping()
    
    // Create collections if they don't exist and add indexes
    await createCollections()
    
    isInitialized = true
    console.log('✅ MongoDB database connected successfully')
    return { client, db }
  } catch (error) {
    console.error('❌ Failed to initialize MongoDB database:', error)
    throw error
  }
}

// Create collections and indexes
const createCollections = async () => {
  if (!db) return
  
  try {
    // Create collections
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)
    
    // User collection
    if (!collectionNames.includes('users')) {
      await db.createCollection('users')
      await db.collection('users').createIndex({ email: 1 }, { unique: true })
      console.log('✅ Created users collection with email index')
    }
    
    // Session collection
    if (!collectionNames.includes('sessions')) {
      await db.createCollection('sessions')
      await db.collection('sessions').createIndex({ token: 1 }, { unique: true })
      console.log('✅ Created sessions collection with token index')
    }
    
    // Account collection
    if (!collectionNames.includes('accounts')) {
      await db.createCollection('accounts')
      console.log('✅ Created accounts collection')
    }
    
    // Verification collection
    if (!collectionNames.includes('verifications')) {
      await db.createCollection('verifications')
      console.log('✅ Created verifications collection')
    }
    
    // Campaigns collection
    if (!collectionNames.includes('campaigns')) {
      await db.createCollection('campaigns')
      await db.collection('campaigns').createIndex({ userId: 1 })
      console.log('✅ Created campaigns collection with userId index')
    }
    
    // Leads collection
    if (!collectionNames.includes('leads')) {
      await db.createCollection('leads')
      await db.collection('leads').createIndex({ campaignId: 1 })
      await db.collection('leads').createIndex({ userId: 1 })
      console.log('✅ Created leads collection with campaignId and userId indexes')
    }
    
    // LinkedIn accounts collection
    if (!collectionNames.includes('linkedinAccounts')) {
      await db.createCollection('linkedinAccounts')
      await db.collection('linkedinAccounts').createIndex({ userId: 1 })
      console.log('✅ Created linkedinAccounts collection with userId index')
    }
    
    // Campaign sequences collection
    if (!collectionNames.includes('campaignSequences')) {
      await db.createCollection('campaignSequences')
      await db.collection('campaignSequences').createIndex({ campaignId: 1 })
      console.log('✅ Created campaignSequences collection with campaignId index')
    }
    
    // Activity logs collection
    if (!collectionNames.includes('activityLogs')) {
      await db.createCollection('activityLogs')
      await db.collection('activityLogs').createIndex({ userId: 1 })
      console.log('✅ Created activityLogs collection with userId index')
    }
    
    // Messages collection
    if (!collectionNames.includes('messages')) {
      await db.createCollection('messages')
      await db.collection('messages').createIndex({ leadId: 1 })
      console.log('✅ Created messages collection with leadId index')
    }
    
  } catch (error) {
    console.error('❌ Failed to create collections:', error)
    throw error
  }
}

// Main database initialization logic
export const initializeDatabase = async () => {
  try {
    const result = await initializeMongoDB()
    return result
  } catch (error) {
    console.error('❌ Critical database initialization failed:', error)
    throw error
  }
}

// Function to get database instance with lazy initialization
export const getDatabase = async () => {
  if (!isInitialized) {
    try {
      await initializeDatabase()
    } catch (error) {
      console.error('❌ Failed to initialize database on demand:', error)
      throw error
    }
  }
  return { db, client }
}

// Initialize database
initializeDatabase().catch(error => {
  console.error('❌ Failed to initialize database:', error)
  // In Vercel environment, we should not exit the process
  if (process.env.VERCEL !== '1') {
    process.exit(1)
  }
})

export { db, client }