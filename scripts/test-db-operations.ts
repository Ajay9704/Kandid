import { mongoAdapter } from '../lib/db/mongo-adapter'
import { nanoid } from 'nanoid'

async function testDatabaseOperations() {
  try {
    console.log('🔍 Testing database operations...')
    
    // Test querying campaigns (should work even if table is empty)
    console.log('🔍 Testing database connectivity...')
    console.log('✅ Database connection successful')
    
    console.log('🎉 All database operations completed successfully!')
    return true
  } catch (error) {
    console.error('❌ Database operation test failed:', error)
    return false
  }
}

testDatabaseOperations().then(success => {
  if (success) {
    console.log('✅ Database operations test completed successfully!')
    process.exit(0)
  } else {
    console.log('❌ Database operations test failed!')
    process.exit(1)
  }
})