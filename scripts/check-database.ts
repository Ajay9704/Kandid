import { db } from '../lib/db/index'
import { sql } from 'drizzle-orm'

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...')
    
    // Test the connection by running a simple query
    const result = await db.run(sql`SELECT 1 as connected`)
    console.log('✅ Database connection successful!')
    
    // Try to list tables
    try {
      const tables = await db.all(sql`SELECT name FROM sqlite_master WHERE type='table'`)
      console.log('📋 Database tables:', tables.map((t: any) => t.name))
    } catch (tableError) {
      console.log('⚠️ Could not list tables:', tableError instanceof Error ? tableError.message : 'Unknown error')
    }
    
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error instanceof Error ? error.message : 'Unknown error')
    console.log('💡 This might be expected in some environments like Vercel')
    return false
  }
}

checkDatabase().then(success => {
  if (success) {
    console.log('✅ Database check completed successfully!')
    process.exit(0)
  } else {
    console.log('❌ Database check failed!')
    process.exit(1)
  }
})