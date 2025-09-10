import { MongoClient } from 'mongodb'

async function setupMongoDB() {
  console.log('🚀 Setting up MongoDB database...')
  
  try {
    // Use the DATABASE_URL from environment or default to local MongoDB
    const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/linkbird'
    
    // Validate MongoDB URL
    if (!mongoUrl) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    
    console.log(`🔗 Connecting to MongoDB at: ${mongoUrl.includes('mongodb.net') ? 'MongoDB Atlas (cloud)' : 'Local MongoDB'}`)
    
    // Create MongoDB client with Vercel-friendly options
    const client = new MongoClient(mongoUrl, {
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
    console.log('✅ MongoDB connection successful!')
    
    const db = client.db('linkbird')
    
    // Test the connection
    await db.admin().ping()
    
    // Create collections if they don't exist
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
    
    // Close connection
    await client.close()
    
    console.log('✅ MongoDB database setup completed!')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ MongoDB database setup failed:', error)
    process.exit(1)
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupMongoDB()
}

export default setupMongoDB