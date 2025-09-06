import { db } from '../lib/db'
import { user } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

async function checkUser() {
  console.log('👤 Checking demo user...')
  
  try {
    const demoUser = await db.select().from(user).where(eq(user.email, 'demo@linkbird.com')).limit(1)
    
    if (demoUser.length > 0) {
      console.log('✅ Demo user found:')
      console.log('ID:', demoUser[0].id)
      console.log('Name:', demoUser[0].name)
      console.log('Email:', demoUser[0].email)
      console.log('Email Verified:', demoUser[0].emailVerified)
    } else {
      console.log('❌ Demo user not found')
    }
    
  } catch (error) {
    console.error('❌ Error checking user:', error)
  }
}

checkUser().then(() => process.exit(0)).catch((error) => {
  console.error('❌ Check failed:', error)
  process.exit(1)
})