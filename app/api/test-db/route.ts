import { NextRequest, NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection from API route...')
    
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
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        environment: isVercel ? 'Vercel' : 'Local',
        databaseType: databaseUrl?.includes('mongodb.net') ? 'MongoDB Atlas' : 'Local MongoDB',
        collections: collections.map(c => c.name)
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful but could not list collections'
    })
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    
    let errorMessage = 'Unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}