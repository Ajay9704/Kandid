# Linkbird - Lead Management Platform

A modern lead management platform built with Next.js 15, featuring comprehensive lead tracking, campaign management, and analytics.

## 🚀 Features

- **Authentication System**: Email/password and Google OAuth integration
- **Lead Management**: Comprehensive lead tracking with detailed views
- **Campaign Management**: Create and manage marketing campaigns
- **Real-time Analytics**: Track performance metrics and conversion rates
- **Responsive Design**: Mobile-first design with dark/light theme support
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **State Management**: Zustand + TanStack Query
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd linkbird-replica
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and update with your values:

```bash
cp .env.example .env.local
```

Update the following variables in `.env.local`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/linkbird"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set up the database

Create a PostgreSQL database and run migrations:

```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

### Users Table
- `id`: Primary key
- `email`: User email (unique)
- `name`: User full name
- `image`: Profile image URL
- `emailVerified`: Email verification status
- `createdAt`, `updatedAt`: Timestamps

### Campaigns Table
- `id`: Primary key
- `name`: Campaign name
- `status`: Campaign status (draft, active, paused, completed)
- `description`: Campaign description
- `totalLeads`: Total number of leads
- `successfulLeads`: Number of successful conversions
- `responseRate`: Campaign response rate percentage
- `userId`: Foreign key to users table
- `createdAt`, `updatedAt`: Timestamps

### Leads Table
- `id`: Primary key
- `name`: Lead full name
- `email`: Lead email address
- `company`: Lead's company
- `status`: Lead status (pending, contacted, responded, converted)
- `lastContactDate`: Date of last contact
- `notes`: Additional notes about the lead
- `campaignId`: Foreign key to campaigns table
- `userId`: Foreign key to users table
- `createdAt`, `updatedAt`: Timestamps

## 🔧 API Routes

### Authentication
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signout` - Sign out user
- `GET /api/auth/session` - Get current session

### Leads
- `GET /api/leads` - Get all leads with filtering
- `POST /api/leads` - Create new lead
- `PUT /api/leads/[id]` - Update lead
- `DELETE /api/leads/[id]` - Delete lead

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create new campaign
- `PUT /api/campaigns/[id]` - Update campaign
- `DELETE /api/campaigns/[id]` - Delete campaign

## 🎨 UI Components

The application uses a comprehensive set of reusable UI components:

- **Layout Components**: Sidebar, Header, Navigation
- **Data Display**: Tables, Cards, Badges, Progress bars
- **Forms**: Input fields, Buttons, Select dropdowns
- **Overlays**: Modals, Sheets, Tooltips
- **Feedback**: Loading states, Error boundaries

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🌙 Theme Support

Built-in support for light and dark themes with system preference detection.

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production

Make sure to set these in your deployment platform:

```env
DATABASE_URL=your-production-database-url
BETTER_AUTH_SECRET=your-production-secret
BETTER_AUTH_URL=https://your-domain.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── (dashboard)/       # Dashboard layout group
│   ├── auth/              # Authentication pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   └── ui/               # UI component library
├── lib/                  # Utility libraries
│   ├── db/               # Database configuration
│   ├── auth.ts           # Authentication setup
│   ├── store.ts          # Zustand store
│   └── utils.ts          # Utility functions
├── public/               # Static assets
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the demo video for UI/UX reference

## 🎯 Demo

Live demo: [Your Vercel URL]

Demo credentials:
- Email: demo@linkbird.com
- Password: demo123

---

Built with ❤️ using Next.js 15 and modern web technologies.