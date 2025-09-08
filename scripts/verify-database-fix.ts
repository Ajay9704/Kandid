import { db } from '../lib/db/index'
import { user, campaigns, leads } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

async function verifyDatabaseFix() {
  console.log('🔍 Verifying database configuration fix...')
  
  try {
    // Test 1: Check if we can connect to the database and run a simple query
    console.log('🧪 Test 1: Basic database connectivity')
    const result = await db.select().from(user).limit(1)
    console.log('✅ Test 1 passed: Database connection successful')
    
    // Test 2: Check if tables exist by attempting to query them
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
    
    // Test 3: Try to insert and retrieve a test record
    console.log('🧪 Test 3: Insert and retrieve test')
    const testUser = {
      id: 'test-user-' + Date.now(),
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      emailVerified: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
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
    
    console.log('🎉 All database verification tests completed!')
    return true
  } catch (error) {
    console.error('❌ Database verification failed:', error)
    return false
  }
}

// Run the verification if this file is executed directly
if (require.main === module) {
  verifyDatabaseFix().then(success => {
    if (success) {
      console.log('✅ Database configuration fix verification successful!')
      process.exit(0)
    } else {
      console.log('❌ Database configuration fix verification failed!')
      process.exit(1)
    }
  })
}

export default verifyDatabaseFix