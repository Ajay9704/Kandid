# Linkbird Replica

A replica of the Linkbird platform for LinkedIn automation and lead generation.

## Description

This application is a replica of the Linkbird platform, designed for LinkedIn automation and lead generation. It includes features for campaign management, lead tracking, and messaging automation.

## Features

- Campaign management
- Lead tracking and management
- LinkedIn account integration
- Automated messaging sequences
- Analytics and reporting
- User authentication

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: SQLite with Drizzle ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: Zustand, TanStack Query
- **Real-time**: Socket.IO

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

4. Set up the database:
   ```bash
   npm run db:setup
   ```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
```

### Deployment

The application is configured to work with Vercel's serverless environment. For deployment instructions, see [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md).

## Database Configuration

The application automatically detects the environment and configures the database accordingly:

- **Development**: Uses file-based SQLite database (`./sqlite.db`)
- **Production (Vercel)**: Uses in-memory SQLite database

For more details about database configuration and deployment, see:
- [DATABASE-FIX-SUMMARY.md](DATABASE-FIX-SUMMARY.md)
- [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)
- [VERCEL-DEPLOYMENT-FIX.md](VERCEL-DEPLOYMENT-FIX.md)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter
- `npm run db:setup` - Set up database
- `npm run db:seed` - Seed database with sample data
- `npm run verify-db-fix` - Verify database configuration fix

## Troubleshooting

If you encounter any issues, check the following:

1. **Database Connection Issues**: See [VERCEL-DEPLOYMENT-FIX.md](VERCEL-DEPLOYMENT-FIX.md)
2. **Authentication Issues**: Check environment variables and NextAuth configuration
3. **API Route Issues**: Check the API route implementations in `app/api/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is for educational purposes only.