import { db } from '../lib/db/index'

async function verifyDatabaseConfig() {
  console.log('🔍 Verifying database configuration...')
  
  try {
    if (!db) {
      throw new Error('Database not initialized')
    }
    
    // Test database connectivity by listing collections
    const collections = await db.listCollections().toArray()
    console.log('✅ Database connection successful')
    console.log('📊 Collections found:', collections.map(c => c.name))
    
    console.log('🎉 Database configuration verified successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Database configuration verification failed:', error)
    process.exit(1)
  }
}

verifyDatabaseConfig()