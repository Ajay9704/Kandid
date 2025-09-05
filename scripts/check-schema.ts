import { db } from '../lib/db'
import { sql } from 'drizzle-orm'

async function checkSchema() {
  try {
    // Check what tables exist
    const tables = await db.all(sql`SELECT name FROM sqlite_master WHERE type='table'`)
    console.log('Tables:', tables)
    
    // Check leads table structure
    const leadsSchema = await db.all(sql`PRAGMA table_info(leads)`)
    console.log('Leads table columns:', leadsSchema)
    
    // Check campaigns table structure
    const campaignsSchema = await db.all(sql`PRAGMA table_info(campaigns)`)
    console.log('Campaigns table columns:', campaignsSchema)
    
  } catch (error) {
    console.error('Error checking schema:', error)
  }
}

checkSchema()