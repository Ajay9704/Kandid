import { db } from '../lib/db'
import { COLLECTIONS } from '../lib/db/schema'

async function checkSchema() {
  try {
    if (!db) {
      throw new Error('Database not initialized')
    }
    
    // Check what collections exist
    const collections = await db.listCollections().toArray()
    console.log('Collections:', collections.map(c => c.name))
    
    // Check leads collection structure
    try {
      const leadsCount = await db.collection(COLLECTIONS.LEADS).countDocuments()
      console.log(`Leads collection: ${leadsCount} documents`)
    } catch (error) {
      console.log('Leads collection not accessible:', error)
    }
    
    // Check campaigns collection structure
    try {
      const campaignsCount = await db.collection(COLLECTIONS.CAMPAIGNS).countDocuments()
      console.log(`Campaigns collection: ${campaignsCount} documents`)
    } catch (error) {
      console.log('Campaigns collection not accessible:', error)
    }
    
  } catch (error) {
    console.error('Error checking schema:', error)
  }
}

checkSchema()