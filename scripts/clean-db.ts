import { MongoClient } from 'mongodb'

async function cleanDatabase() {
  console.log('🧹 Cleaning database...')
  
  try {
    // Connect directly to MongoDB
    const client = new MongoClient('mongodb://localhost:27017')
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db('linkbird')
    
    // Delete all data from collections
    await db.collection('users').deleteMany({})
    console.log('🗑️  Deleted all users')
    
    await db.collection('campaigns').deleteMany({})
    console.log('🗑️  Deleted all campaigns')
    
    await db.collection('leads').deleteMany({})
    console.log('🗑️  Deleted all leads')
    
    await client.close()
    console.log('✅ Database cleaned successfully')
  } catch (error) {
    console.error('❌ Database cleaning failed:', error)
  }
}

cleanDatabase()