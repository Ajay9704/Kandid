import { mongoAdapter } from '../lib/db/mongo-adapter'

async function checkUser() {
  console.log('👤 Checking demo user...')
  
  try {
    const demoUser = await mongoAdapter.users.findUserByEmail('demo@linkbird.com')
    
    if (demoUser) {
      console.log('✅ Demo user found:')
      console.log('ID:', demoUser.id)
      console.log('Name:', demoUser.name)
      console.log('Email:', demoUser.email)
      console.log('Email Verified:', demoUser.emailVerified)
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