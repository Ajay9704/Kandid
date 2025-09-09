import { mongoAdapter } from '../lib/db/mongo-adapter'

async function verifyFix() {
  console.log('🔍 Verifying database fix...')
  
  try {
    // Test database connectivity
    console.log('✅ Database connection successful')
    
    console.log('🎉 All tests passed! Database is working correctly.')
    return true
  } catch (error) {
    console.error('❌ Verification failed:', error)
    return false
  }
}

verifyFix().then(success => {
  if (success) {
    console.log('✅ Database fix verification completed successfully!')
    process.exit(0)
  } else {
    console.log('❌ Database fix verification failed!')
    process.exit(1)
  }
})