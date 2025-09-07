import { authOptions } from '../lib/auth'
import CredentialsProvider from "next-auth/providers/credentials"

async function testAuth() {
  console.log('🧪 Testing authentication system...')
  
  try {
    // Test credential validation with demo user
    const credentialsProvider = authOptions.providers?.find(
      (provider) => provider.id === 'credentials'
    ) as any
    
    if (!credentialsProvider) {
      console.error('❌ Credentials provider not found')
      return
    }

    const result = await credentialsProvider.authorize({
      email: 'demo@linkbird.com',
      password: 'demo123456'
    })

    if (result) {
      console.log('✅ Authentication validation successful!')
      console.log('User:', result.name)
      console.log('Email:', result.email)
      console.log('ID:', result.id)
    } else {
      console.error('❌ Authentication validation failed')
    }

    // Test with invalid credentials
    const invalidResult = await credentialsProvider.authorize({
      email: 'invalid@example.com',
      password: 'wrongpassword'
    })

    if (invalidResult) {
      console.log('⚠️ Invalid credentials were accepted (demo mode)')
    } else {
      console.log('✅ Invalid credentials properly rejected')
    }

  } catch (error) {
    console.error('❌ Auth test failed:', error)
  }
}

testAuth().then(() => process.exit(0)).catch((error) => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})