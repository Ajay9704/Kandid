import { db } from '../lib/db/index'
import { sql } from 'drizzle-orm'

async function verifyDatabaseConfig() {
  console.log('🔍 Verifying database configuration...')
  
  try {
    // Test a simple query to check if the database is working
    const result = await db.run(sql`SELECT 1 as test`)
    console.log('✅ Database connection successful')
    console.log('📊 Test query result')
    
    // Try to query the user table (it might not exist yet, but that's okay)
    try {
      const users = await db.run(sql`SELECT * FROM user LIMIT 1`)
      console.log('✅ User table accessible')
    } catch (error) {
      console.log('ℹ️  User table not yet created or empty (this is normal during initial setup)')
    }
    
    console.log('🎉 Database configuration verified successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Database configuration verification failed:', error)
    process.exit(1)
  }
}

verifyDatabaseConfig()