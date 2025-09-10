/**
 * Script to test database connection
 * This script can be used to verify database connectivity in Vercel environment
 */

import { initializeDatabase } from '@/lib/db'

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...')
  
  try {
    // Check if we're in a Vercel environment
    const isVercel = process.env.VERCEL === '1'
    console.log(`🔧 Environment: ${isVercel ? 'Vercel' : 'Local'}`)
    
    // Check DATABASE_URL environment variable
    const databaseUrl = process.env.DATABASE_URL
    console.log(`🔧 DATABASE_URL: ${databaseUrl ? 'Set' : 'Not set'}`)
    if (databaseUrl) {
      console.log(`🔗 Database type: ${databaseUrl.includes('mongodb.net') ? 'MongoDB Atlas' : 'Local MongoDB'}`)
    }
    
    // Try to initialize the database
    console.log('🔄 Initializing database connection...')
    const result = await initializeDatabase()
    console.log('✅ Database connection successful!')
    
    // Test a simple query
    if (result.db) {
      console.log('🔄 Testing database query...')
      await result.db.admin().ping()
      console.log('✅ Database query successful!')
      
      // List collections
      console.log('🔄 Listing collections...')
      const collections = await result.db.listCollections().toArray()
      console.log(`✅ Found ${collections.length} collections`)
      collections.forEach(collection => {
        console.log(`  - ${collection.name}`)
      })
    }
    
    console.log('🎉 All tests passed!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    
    // Provide specific error messages
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error('\n💡 Connection refused. This typically means:')
        console.error('  - The database server is not accessible')
        console.error('  - The connection string is incorrect')
        console.error('  - For Vercel deployment, you must use MongoDB Atlas instead of localhost')
      } else if (error.message.includes('authentication')) {
        console.error('\n💡 Authentication failed. Check your database credentials.')
      } else if (error.message.includes('DATABASE_URL')) {
        console.error('\n💡 DATABASE_URL environment variable is not set.')
        console.error('  - For Vercel deployment, set DATABASE_URL in your project settings')
        console.error('  - For local development, ensure .env.local is configured correctly')
      }
    }
    
    process.exit(1)
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDatabaseConnection()
}

export default testDatabaseConnection