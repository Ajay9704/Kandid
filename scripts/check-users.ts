import { db } from '../lib/db/index'
import { user } from '../lib/db/schema'
import { desc } from 'drizzle-orm'

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...')
    
    // Test querying users
    const allUsers = await db.select().from(user).orderBy(desc(user.createdAt)).limit(5)
    console.log(`✅ Found ${allUsers.length} users`)
    
    if (allUsers.length > 0) {
      console.log('📋 Sample users:')
      allUsers.forEach(u => {
        console.log(`  - ${u.name} (${u.email})`)
      })
    }
    
    return true
  } catch (error) {
    console.error('❌ User check failed:', error)
    return false
  }
}

checkUsers().then(success => {
  if (success) {
    console.log('✅ User check completed successfully!')
    process.exit(0)
  } else {
    console.log('❌ User check failed!')
    process.exit(1)
  }
})