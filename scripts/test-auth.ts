import { auth } from '../lib/auth'

async function testAuth() {
  console.log('🧪 Testing authentication system...')
  
  try {
    // Test sign in with demo user
    const signInResult = await auth.api.signInEmail({
      body: {
        email: 'demo@linkbird.com',
        password: 'demo123456'
      }
    })

    if (signInResult.error) {
      console.error('❌ Sign in failed:', signInResult.error)
    } else {
      console.log('✅ Sign in successful!')
      console.log('User:', signInResult.data?.user?.name)
    }

  } catch (error) {
    console.error('❌ Auth test failed:', error)
  }
}

testAuth().then(() => process.exit(0)).catch((error) => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})