import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

async function createDemoUser() {
  console.log('🔐 Creating demo user...')
  
  try {
    // Clean up existing demo user
    await db.delete(schema.user).where(eq(schema.user.email, 'demo@linkbird.com'))
    console.log('🗑️ Cleaned up existing demo user')
    
    // Hash password
    const hashedPassword = await bcrypt.hash('demo123456', 12)
    
    // Create demo user directly in database
    await db.insert(schema.user).values({
      id: crypto.randomUUID(),
      name: 'Demo User',
      email: 'demo@linkbird.com',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    
    console.log('✅ Demo user created successfully!')
    console.log('📧 Email: demo@linkbird.com')
    console.log('🔑 Password: demo123456')
    console.log('🎉 You can now sign in with these credentials')
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error)
  }
}

createDemoUser()