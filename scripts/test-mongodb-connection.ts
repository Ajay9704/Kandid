import { MongoClient } from 'mongodb'

async function testMongoDBConnection() {
  console.log('🔍 Testing MongoDB connection...')
  
  try {
    // Test with local MongoDB
    const mongoUrl = 'mongodb://localhost:27017/linkbird'
    
    // Create MongoDB client
    const client = new MongoClient(mongoUrl, {
      // Serverless-friendly options
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    })
    
    // Connect to MongoDB
    await client.connect()
    console.log('✅ MongoDB connection successful!')
    
    const db = client.db('linkbird')
    
    // Test creating a collection
    const testCollection = db.collection('test_collection')
    
    // Test inserting data
    const insertResult = await testCollection.insertOne({
      name: 'Test Entry',
      createdAt: new Date()
    })
    console.log('✅ Data inserted successfully:', insertResult.insertedId)
    
    // Test querying data
    const queryResult = await testCollection.findOne({
      _id: insertResult.insertedId
    })
    console.log('✅ Data query successful:', queryResult)
    
    // Clean up
    await testCollection.drop()
    console.log('✅ Cleanup completed')
    
    // Close connection
    await client.close()
    
    console.log('🎉 All MongoDB tests passed!')
    return true
  } catch (error) {
    console.error('❌ MongoDB test failed:', error)
    return false
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testMongoDBConnection().then(success => {
    if (success) {
      console.log('✅ MongoDB test successful!')
      process.exit(0)
    } else {
      console.log('❌ MongoDB test failed!')
      process.exit(1)
    }
  })
}

export default testMongoDBConnection