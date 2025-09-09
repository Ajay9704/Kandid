import { mongoAdapter } from '@/lib/db/mongo-adapter'
import bcrypt from 'bcryptjs'
import { initializeDatabase, db } from '@/lib/db'

// Set default database URL if not present
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'mongodb://localhost:27017/linkbird'
}

async function createDemoUser() {
  console.log('🔐 Creating demo user...')
  
  try {
    // Initialize database
    await initializeDatabase()
    
    // Clean up existing demo user
    if (db) {
      await db.collection('users').deleteOne({ email: 'demo@linkbird.com' })
      console.log('🗑️ Cleaned up existing demo user (if any)')
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('demo123456', 12)
    
    // Create demo user using the adapter
    const result = await mongoAdapter.users.createUser({
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
    console.log('🆔 User ID:', result.id)
    console.log('🎉 You can now sign in with these credentials')
  } catch (error) {
    console.error('❌ Error creating demo user:', error)
  }
}

createDemoUser()