# Deployment Guide for Linkbird Replica

This guide explains how to deploy the Linkbird Replica application to Vercel, with special considerations for the SQLite database configuration.

## Vercel Deployment Configuration

The application is configured to work with Vercel's serverless environment through the following settings:

### Environment Variables

The application automatically detects when it's running in a serverless environment (like Vercel) and switches to using an in-memory database. This is configured in `vercel.json`:

```json
{
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

### How It Works

1. **Serverless Detection**: The database initialization code in `lib/db/index.ts` detects when the application is running in a serverless environment (Vercel, AWS Lambda, etc.)

2. **In-Memory Database**: When running in a serverless environment, the application automatically uses an in-memory SQLite database (`:memory:`) instead of a file-based database

3. **Schema Initialization**: All necessary database tables are created automatically when the application starts

## Deployment Steps

### 1. Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository or upload your code

### 2. Configure Project Settings

1. **Framework Preset**: Select "Next.js"
2. **Root Directory**: Leave as default (root)
3. **Build and Output Settings**: Use default settings

### 3. Environment Variables

The following environment variables should be set in your Vercel project settings:

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

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## Troubleshooting

### "SQLITE_CANTOPEN" Error

If you see this error, it means the application is trying to use a file-based SQLite database in a serverless environment where the filesystem is read-only.

**Solution**: 
1. Ensure the `DATABASE_URL` environment variable is set to `:memory:` in your Vercel project settings
2. Verify that the `vercel.json` file is in your project root with the correct configuration

### Database Schema Issues

If you encounter issues with missing tables:

1. Check the Vercel logs for initialization messages
2. Ensure the database initialization code in `lib/db/index.ts` is running correctly
3. The schema should be automatically created when the application starts

## Local Development vs Production

| Environment | Database Type | Persistence | Notes |
|-------------|---------------|-------------|-------|
| Local Development | File-based (`./sqlite.db`) | Persistent | Data survives application restarts |
| Vercel Production | In-memory (`:memory:`) | Ephemeral | Data is lost when the serverless function is recycled |

## Best Practices for Serverless Deployment

1. **Use the in-memory database**: This is the recommended approach for serverless environments
2. **Implement data persistence**: For production applications, consider using a managed database service (PostgreSQL, MySQL) instead of SQLite
3. **Handle cold starts**: Serverless functions may take time to start, which includes database initialization
4. **Monitor logs**: Keep an eye on Vercel logs for any database-related errors

## Alternative: Using a Managed Database

For production applications, consider migrating to a managed database service:

1. **PostgreSQL**: Use services like Vercel Postgres, Supabase, or AWS RDS
2. **MySQL**: Use services like PlanetScale or AWS RDS
3. **MongoDB**: Use MongoDB Atlas

To switch to a managed database:

1. Update the `DATABASE_URL` environment variable to point to your managed database
2. Update the Drizzle configuration in `drizzle.config.ts`
3. Update the database adapter in `lib/db/index.ts`