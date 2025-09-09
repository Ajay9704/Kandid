import { mongoAdapter } from '../lib/db/mongo-adapter'

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...')
    
    // Import and initialize database
    const { initializeDatabase } = await import('../lib/db')
    await initializeDatabase()
    
    // Check for demo user specifically
    const demoUser = await mongoAdapter.users.findUserByEmail('demo@linkbird.com')
    if (demoUser) {
      console.log('✅ Demo user found:')
      console.log('  -', demoUser.name, '(', demoUser.email, ')')
      console.log('  - ID:', demoUser.id)
    } else {
      console.log('ℹ️  Demo user not found')
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