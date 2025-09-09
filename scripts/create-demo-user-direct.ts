import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

async function createDemoUser() {
  console.log('🔐 Creating demo user...')
  
  try {
    // Connect directly to MongoDB
    const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/linkbird'
    const client = new MongoClient(mongoUrl)
    
    await client.connect()
    console.log('✅ MongoDB connected successfully!')
    
    const db = client.db('linkbird')
    
    // Clean up existing demo user
    await db.collection('users').deleteOne({ email: 'demo@linkbird.com' })
    console.log('🗑️ Cleaned up existing demo user (if any)')
    
    // Hash password
    const hashedPassword = await bcrypt.hash('demo123456', 12)
    
    // Create demo user directly in database
    const result = await db.collection('users').insertOne({
      id: 'demo-user-id',
      name: 'Demo User',
      email: 'demo@linkbird.com',
      password: hashedPassword,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    
    console.log('✅ Demo user created successfully!')
    console.log('📧 Email: demo@linkbird.com')
    console.log('🔑 Password: demo123456')
    console.log('🎉 You can now sign in with these credentials')
    
    await client.close()
  } catch (error) {
    console.error('❌ Error creating demo user:', error)
  }
}

createDemoUser()