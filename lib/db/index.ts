import { MongoClient, Db } from 'mongodb'
import * as schema from './schema'

// More robust serverless environment detection
const isServerless = () => {
  // Check for Vercel environment
  if (process.env.VERCEL === '1' || process.env.NOW_REGION || process.env.VERCEL_ENV) {
    console.log('🔍 Detected Vercel environment')
    return true
  }
  
  // Check for other serverless platforms
  if (process.env.NEXT_RUNTIME === 'edge' || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    console.log('🔍 Detected other serverless environment')
    return true
  }
  
  // Check for production environment that might be serverless
  if (process.env.NODE_ENV === 'production' && !process.env.DEVELOPMENT) {
    console.log('🔍 Detected production environment (assuming serverless)')
    return true
  }
  
  console.log('🔍 Not in serverless environment')
  return false
}

console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`)
console.log(`🔧 Vercel: ${process.env.VERCEL || 'not set'}`)
console.log(`🔧 VERCEL_ENV: ${process.env.VERCEL_ENV || 'not set'}`)
console.log(`🔧 NEXT_RUNTIME: ${process.env.NEXT_RUNTIME || 'not set'}`)
console.log(`🔧 DATABASE_URL: ${process.env.DATABASE_URL || 'not set'}`)

let db: Db | null = null
let client: MongoClient | null = null

// Check if we should use MongoDB
const useMongoDB = () => {
  // Use MongoDB if explicitly set in environment or in Vercel with MongoDB URL
  return process.env.VERCEL === '1' || process.env.DATABASE_URL?.includes('mongodb') || isServerless()
}

// Enhanced MongoDB initialization
const initializeMongoDB = async () => {
  console.log('🍃 Initializing MongoDB database')
  try {
    const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/linkbird'
    
    // Create MongoDB client
    client = new MongoClient(mongoUrl, {
      // Serverless-friendly options
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    })
    
    // Connect to MongoDB
    await client.connect()
    db = client.db('linkbird')
    
    // Create collections if they don't exist and add indexes
    await createCollections()
    
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

// Enhanced serverless database initialization with better error handling
const initializeServerlessDatabase = async () => {
  console.log('☁️  Initializing serverless database')
  try {
    // For serverless environments, we'll use MongoDB
    return await initializeMongoDB()
  } catch (error) {
    console.error('❌ Failed to initialize serverless database:', error)
    throw error
  }
}

// Enhanced file-based database initialization with better error handling
const initializeFileDatabase = () => {
  console.log('📁 Initializing file-based database (fallback)')
  // This is a fallback - in a real implementation you might want to use a different approach
  throw new Error('File-based database not supported with MongoDB implementation')
}

// Main database initialization logic
export const initializeDatabase = async () => {
  try {
    // For serverless environments, use MongoDB
    if (useMongoDB()) {
      const result = await initializeServerlessDatabase()
      return result
    } else {
      // For development/local environments, try to use MongoDB as well
      const result = await initializeMongoDB()
      return result
    }
  } catch (error) {
    console.error('❌ Critical database initialization failed:', error)
    throw error
  }
}

// Initialize database
initializeDatabase().catch(error => {
  console.error('❌ Failed to initialize database:', error)
})

export { db, client }