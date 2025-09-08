import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

// More robust serverless environment detection
const isServerless = () => {
  // Check for Vercel environment
  if (process.env.VERCEL === '1' || process.env.NOW_REGION || process.env.VERCEL_ENV) {
    console.log('🔍 Detected Vercel environment')
    return true
  }
  
  // Check for other serverless platforms
  if (process.env.NEXT_RUNTIME === 'edge' || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    console.log('🔍 Detected other serverless environment')
    return true
  }
  
  // Check for production environment that might be serverless
  if (process.env.NODE_ENV === 'production' && !process.env.DEVELOPMENT) {
    console.log('🔍 Detected production environment (assuming serverless)')
    return true
  }
  
  console.log('🔍 Not in serverless environment')
  return false
}

console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`)
console.log(`🔧 Vercel: ${process.env.VERCEL || 'not set'}`)
console.log(`🔧 VERCEL_ENV: ${process.env.VERCEL_ENV || 'not set'}`)
console.log(`🔧 NEXT_RUNTIME: ${process.env.NEXT_RUNTIME || 'not set'}`)

let sqlite: Database.Database
let db: ReturnType<typeof drizzle>

// Function to initialize database schema
const initializeSchema = (sqlite: Database.Database) => {
  const migrations = [
    `CREATE TABLE IF NOT EXISTS \`user\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`name\` text NOT NULL,
      \`email\` text NOT NULL,
      \`emailVerified\` integer DEFAULT false NOT NULL,
      \`image\` text,
      \`password\` text,
      \`createdAt\` integer NOT NULL,
      \`updatedAt\` integer NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS \`session\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`expiresAt\` integer NOT NULL,
      \`token\` text NOT NULL,
      \`createdAt\` integer NOT NULL,
      \`updatedAt\` integer NOT NULL,
      \`ipAddress\` text,
      \`userAgent\` text,
      \`userId\` text NOT NULL,
      FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`,
    `CREATE TABLE IF NOT EXISTS \`account\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`accountId\` text NOT NULL,
      \`providerId\` text NOT NULL,
      \`userId\` text NOT NULL,
      \`accessToken\` text,
      \`refreshToken\` text,
      \`idToken\` text,
      \`accessTokenExpiresAt\` integer,
      \`refreshTokenExpiresAt\` integer,
      \`scope\` text,
      \`password\` text,
      \`createdAt\` integer NOT NULL,
      \`updatedAt\` integer NOT NULL,
      FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`,
    `CREATE TABLE IF NOT EXISTS \`verification\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`identifier\` text NOT NULL,
      \`value\` text NOT NULL,
      \`expiresAt\` integer NOT NULL,
      \`createdAt\` integer,
      \`updatedAt\` integer
    );`,
    `CREATE TABLE IF NOT EXISTS \`campaigns\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`name\` text NOT NULL,
      \`status\` text DEFAULT 'draft' NOT NULL,
      \`description\` text,
      \`total_leads\` integer DEFAULT 0,
      \`successful_leads\` integer DEFAULT 0,
      \`response_rate\` real DEFAULT 0,
      \`user_id\` text NOT NULL,
      \`created_at\` integer NOT NULL,
      \`updated_at\` integer NOT NULL,
      FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`,
    `CREATE TABLE IF NOT EXISTS \`leads\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`name\` text NOT NULL,
      \`email\` text NOT NULL,
      \`company\` text,
      \`position\` text,
      \`linkedin_url\` text,
      \`profile_image\` text,
      \`location\` text,
      \`status\` text DEFAULT 'pending' NOT NULL,
      \`connection_status\` text DEFAULT 'not_connected',
      \`sequence_step\` integer DEFAULT 0,
      \`last_contact_date\` integer,
      \`last_activity\` text,
      \`last_activity_date\` integer,
      \`notes\` text,
      \`campaign_id\` text NOT NULL,
      \`user_id\` text NOT NULL,
      \`created_at\` integer NOT NULL,
      \`updated_at\` integer NOT NULL,
      FOREIGN KEY (\`campaign_id\`) REFERENCES \`campaigns\`(\`id\`) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`,
    `CREATE TABLE IF NOT EXISTS \`linkedin_accounts\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`name\` text NOT NULL,
      \`linkedin_url\` text NOT NULL,
      \`is_active\` integer DEFAULT true,
      \`daily_limit\` integer DEFAULT 50,
      \`weekly_limit\` integer DEFAULT 200,
      \`current_daily_count\` integer DEFAULT 0,
      \`current_weekly_count\` integer DEFAULT 0,
      \`last_reset_date\` integer,
      \`user_id\` text NOT NULL,
      \`created_at\` integer NOT NULL,
      \`updated_at\` integer NOT NULL,
      FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`,
    `CREATE TABLE IF NOT EXISTS \`campaign_sequences\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`campaign_id\` text NOT NULL,
      \`step_number\` integer NOT NULL,
      \`step_type\` text NOT NULL,
      \`title\` text NOT NULL,
      \`content\` text NOT NULL,
      \`delay_days\` integer DEFAULT 0,
      \`is_active\` integer DEFAULT true,
      \`created_at\` integer NOT NULL,
      \`updated_at\` integer NOT NULL,
      FOREIGN KEY (\`campaign_id\`) REFERENCES \`campaigns\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`,
    `CREATE TABLE IF NOT EXISTS \`activity_logs\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`lead_id\` text,
      \`campaign_id\` text,
      \`activity_type\` text NOT NULL,
      \`description\` text NOT NULL,
      \`metadata\` text,
      \`user_id\` text NOT NULL,
      \`created_at\` integer NOT NULL,
      FOREIGN KEY (\`lead_id\`) REFERENCES \`leads\`(\`id\`) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (\`campaign_id\`) REFERENCES \`campaigns\`(\`id\`) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`,
    `CREATE TABLE IF NOT EXISTS \`messages\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`lead_id\` text NOT NULL,
      \`campaign_id\` text,
      \`sequence_step_id\` text,
      \`message_type\` text NOT NULL,
      \`subject\` text,
      \`content\` text NOT NULL,
      \`status\` text DEFAULT 'draft',
      \`sent_at\` integer,
      \`read_at\` integer,
      \`replied_at\` integer,
      \`user_id\` text NOT NULL,
      \`created_at\` integer NOT NULL,
      \`updated_at\` integer NOT NULL,
      FOREIGN KEY (\`lead_id\`) REFERENCES \`leads\`(\`id\`) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (\`campaign_id\`) REFERENCES \`campaigns\`(\`id\`) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (\`sequence_step_id\`) REFERENCES \`campaign_sequences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS \`session_token_unique\` ON \`session\` (\`token\`);`,
    `CREATE UNIQUE INDEX IF NOT EXISTS \`user_email_unique\` ON \`user\` (\`email\`);`,
    `CREATE INDEX IF NOT EXISTS \`lead_campaign_id_idx\` ON \`leads\` (\`campaign_id\`);`,
    `CREATE INDEX IF NOT EXISTS \`lead_user_id_idx\` ON \`leads\` (\`user_id\`);`,
    `CREATE INDEX IF NOT EXISTS \`campaign_user_id_idx\` ON \`campaigns\` (\`user_id\`);`
  ]
  
  migrations.forEach((migration, index) => {
    try {
      sqlite.exec(migration)
      console.log(`✅ Migration ${index + 1}/${migrations.length} executed`)
    } catch (error) {
      console.error(`❌ Failed to execute migration ${index + 1}:`, error)
    }
  })
  
  console.log('✅ Database schema initialized successfully')
}

// Check if we should use in-memory database
const useInMemoryDatabase = () => {
  // Use in-memory database if explicitly set in environment
  if (process.env.DATABASE_URL === ':memory:') {
    return true
  }
  
  // Use in-memory database in serverless environments
  return isServerless()
}

// For serverless environments or when explicitly requested, use in-memory database
if (useInMemoryDatabase()) {
  console.log('☁️  Using in-memory database')
  sqlite = new Database(':memory:')
  db = drizzle(sqlite, { schema })
  
  // Run initial setup to create tables
  try {
    initializeSchema(sqlite)
    console.log('✅ In-memory database initialized with all tables')
  } catch (error) {
    console.error('❌ Failed to initialize in-memory database schema:', error)
  }
} else {
  // For development/local environments, try to use file-based database
  let dbPath = process.env.DATABASE_URL || './sqlite.db'

  // Remove any protocol prefix (like sqlite:) if present
  if (dbPath.startsWith('sqlite:')) {
    dbPath = dbPath.substring(7) // Remove 'sqlite:' prefix
  }

  // Handle relative paths properly
  if (dbPath.startsWith('./') || dbPath.startsWith('.\\')) {
    dbPath = join(process.cwd(), dbPath.substring(2))
  } else if (dbPath.startsWith('/') || dbPath.startsWith('\\')) {
    // Already an absolute path, keep as is
  } else if (!dbPath.includes('/') && !dbPath.includes('\\') && dbPath.endsWith('.db')) {
    // If it's just a filename ending with .db, put it in the current directory
    dbPath = join(process.cwd(), dbPath)
  } else if (!dbPath.includes('/') && !dbPath.includes('\\') && !dbPath.includes('.')) {
    // If it's just a name without extension, add .db and put in current directory
    dbPath = join(process.cwd(), `${dbPath}.db`)
  }

  console.log(`📁 Database path: ${dbPath}`)

  // Ensure the directory exists (but only if it's not the current directory)
  const separatorIndex = Math.max(dbPath.lastIndexOf('/'), dbPath.lastIndexOf('\\'))
  if (separatorIndex > 0) {
    const dbDir = dbPath.substring(0, separatorIndex)
    if (dbDir !== process.cwd() && !existsSync(dbDir)) {
      try {
        console.log(`📁 Creating database directory: ${dbDir}`)
        mkdirSync(dbDir, { recursive: true })
      } catch (error) {
        console.warn(`⚠️  Could not create database directory: ${error}`)
      }
    }
  }

  try {
    sqlite = new Database(dbPath, { 
      fileMustExist: false // Don't require file to exist
    })
    db = drizzle(sqlite, { schema })
    console.log(`✅ File-based database connected successfully at ${dbPath}`)
  } catch (error) {
    console.error('❌ Failed to initialize file-based database:', error)
    console.log('🔄 Falling back to in-memory database')
    
    // Fallback to in-memory database
    sqlite = new Database(':memory:')
    db = drizzle(sqlite, { schema })
    
    // Initialize schema in fallback database
    try {
      initializeSchema(sqlite)
    } catch (schemaError) {
      console.error('❌ Failed to initialize schema in fallback database:', schemaError)
    }
    
    console.log('✅ Using in-memory database as fallback')
  }
}

export { db }