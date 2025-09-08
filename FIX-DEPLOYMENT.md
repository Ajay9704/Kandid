# Fixing SQLite Database Deployment Issues on Vercel

## Problem Summary

The application is encountering "SQLITE_CANTOPEN" errors when deployed to Vercel because it's trying to access a file-based SQLite database in a serverless environment where the filesystem is read-only.

## Root Cause

1. **Serverless Environment Limitations**: Vercel's serverless functions run in a read-only filesystem
2. **Database Initialization Logic**: The application needs to detect when it's running in a serverless environment and switch to using an in-memory database

## Solution

### 1. Ensure Environment Variables are Set Correctly

Make sure your `vercel.json` file has the correct configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "includeFiles": [
          "lib/**",
          "components/**",
          "app/**",
          "scripts/**"
        ]
      }
    }
  ],
  "env": {
    "DATABASE_URL": ":memory:"
  },
  "build": {
    "env": {
      "DATABASE_URL": ":memory:"
    }
  }
}
```

### 2. Verify Database Initialization Logic

The database initialization code in `lib/db/index.ts` should automatically detect serverless environments and use an in-memory database. The current implementation should work correctly, but let's verify the key parts:

```typescript
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

// Check if we should use in-memory database
const useInMemoryDatabase = () => {
  // Use in-memory database if explicitly set in environment
  if (process.env.DATABASE_URL === ':memory:') {
    return true
  }
  
  // Use in-memory database in serverless environments
  return isServerless()
}
```

### 3. Test the Fix

Run the verification script to ensure the database configuration is working correctly:

```bash
npm run verify-db-fix
```

### 4. Deploy to Vercel

1. Commit all changes to your repository
2. Push to the branch connected to your Vercel project
3. Vercel will automatically deploy the application with the correct environment variables

## Additional Recommendations

### For Production Applications

For production applications, consider migrating to a managed database service:

1. **Vercel Postgres**: If you're using Vercel, their managed Postgres service is a good option
2. **Supabase**: A Firebase-like backend with PostgreSQL
3. **PlanetScale**: Serverless MySQL database
4. **MongoDB Atlas**: Managed MongoDB service

To switch to a managed database:

1. Update the `DATABASE_URL` environment variable to point to your managed database
2. Update the Drizzle configuration in `drizzle.config.ts`
3. Update the database adapter in `lib/db/index.ts`

### Environment-Specific Configuration

Make sure you have the correct environment variables set in your Vercel project settings:

```bash
# Database (automatically set to :memory: for serverless)
DATABASE_URL=:memory:

# Better Auth Secret (generate a random string)
BETTER_AUTH_SECRET=your-random-secret-key-here

# Better Auth URL (your deployed URL)
BETTER_AUTH_URL=https://your-app.vercel.app

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# App URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Troubleshooting

If you continue to experience issues:

1. Check the Vercel logs for initialization messages
2. Ensure the `DATABASE_URL` environment variable is set to `:memory:` in your Vercel project settings
3. Verify that the database initialization code in `lib/db/index.ts` is running correctly
4. The schema should be automatically created when the application starts

## Verification

After deployment, you can verify the fix by:

1. Checking the Vercel logs for successful database initialization
2. Testing the API endpoints:
   - `/api/leads` should return lead data
   - `/api/campaigns` should work when authenticated
3. Ensuring no "SQLITE_CANTOPEN" errors appear in the logs

This fix ensures that the application works correctly in both local development and serverless deployment environments without requiring any code changes when switching between environments.