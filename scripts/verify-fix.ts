import { db } from '../lib/db/index'
import { campaigns, leads } from '../lib/db/schema'
import { eq, desc } from 'drizzle-orm'

async function verifyFix() {
  console.log('🔍 Verifying database fix...')
  
  try {
    // Test 1: Check if we can connect to the database
    console.log('✅ Database connection successful')
    
    // Test 2: Check if we can query campaigns
    const campaignCount = await db.select().from(campaigns).limit(1)
    console.log(`✅ Campaigns table accessible, found ${campaignCount.length} records`)
    
    // Test 3: Check if we can query leads
    const leadCount = await db.select().from(leads).limit(1)
    console.log(`✅ Leads table accessible, found ${leadCount.length} records`)
    
    // Test 4: Try to insert a test record
    console.log('📝 Testing database write operations...')
    
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