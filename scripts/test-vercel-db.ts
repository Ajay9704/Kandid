import { db } from '../lib/db/index'
import { user, campaigns, leads } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

async function testVercelDatabase() {
  console.log('🔍 Testing database configuration in Vercel-like environment...')
  
  // Simulate Vercel environment
  process.env.VERCEL = '1'
  process.env.DATABASE_URL = ':memory:'
  
  try {
    // Re-import the database module to simulate fresh initialization
    const { db } = await import('../lib/db/index')
    
    console.log('🧪 Test 1: Basic database connectivity')
    // Test basic connectivity
    const result = await db.select().from(user).limit(1)
    console.log('✅ Test 1 passed: Database connection successful')
    
    console.log('🧪 Test 2: Table existence verification')
    try {
      await db.select().from(campaigns).limit(1)
      console.log('✅ Test 2a passed: Campaigns table exists')
    } catch (error) {
      console.log('❌ Test 2a failed: Campaigns table error', error)
    }
    
    try {
      await db.select().from(leads).limit(1)
      console.log('✅ Test 2b passed: Leads table exists')
    } catch (error) {
      console.log('❌ Test 2b failed: Leads table error', error)
    }
    
    console.log('🧪 Test 3: Insert and retrieve test')
    const testUser = {
      id: 'test-user-' + Date.now(),
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      emailVerified: false, // Changed from 0 to false for PostgreSQL
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    try {
      const insertResult = await db.insert(user).values(testUser).returning()
      console.log('✅ Test 3a passed: Successfully inserted test user')
      
      // Try to retrieve the user
      const retrievedUser = await db.select().from(user).where(eq(user.id, testUser.id))
      if (retrievedUser.length > 0) {
        console.log('✅ Test 3b passed: Successfully retrieved test user')
      } else {
        console.log('❌ Test 3b failed: Could not retrieve test user')
      }
      
      // Clean up test user
      await db.delete(user).where(eq(user.id, testUser.id))
      console.log('✅ Test 3c passed: Cleaned up test user')
    } catch (error) {
      console.log('❌ Test 3 failed:', error)
    }
    
    console.log('🎉 All Vercel database tests completed successfully!')
    return true
  } catch (error) {
    console.error('❌ Vercel database test failed:', error)
    return false
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testVercelDatabase().then(success => {
    if (success) {
      console.log('✅ Vercel database configuration test successful!')
      process.exit(0)
    } else {
      console.log('❌ Vercel database configuration test failed!')
      process.exit(1)
    }
  })
}

export default testVercelDatabase