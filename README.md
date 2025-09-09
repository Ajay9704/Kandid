# Kandid Assignment - Real-time Campaign and Lead Management System

## Overview

This is a Next.js application for managing marketing campaigns and leads with real-time updates. The application provides a dashboard for tracking campaign performance, managing leads, and monitoring activity.

## Features

### Real-time Updates
- Campaign status changes are reflected immediately across all connected clients
- Lead updates are broadcasted in real-time to all users
- Dashboard metrics update automatically without page refresh
- Live view toggle for enabling/disabling real-time updates

### Campaign Management
- Create, edit, and delete campaigns
- Track campaign performance metrics
- Monitor lead engagement and response rates
- Manage campaign sequences

### Lead Management
- Add, update, and delete leads
- Track lead status and connection status
- Monitor lead activity and engagement
- Filter and search leads

### Analytics
- Real-time dashboard with key metrics
- Campaign performance tracking
- Lead status distribution
- Activity logs

## Technical Implementation

### Real-time Architecture
The application uses a custom real-time update system built with:
- Socket.IO for WebSocket communication
- React Query for data fetching and caching
- Custom hooks for socket management
- Event-based updates for data consistency

### Key Components

#### Socket Provider
- `components/socket-provider.tsx` - Provides socket context to the application
- `lib/hooks/use-socket.ts` - Custom hook for socket connection management

#### Real-time Updates
- API routes emit events when data is modified
- Frontend components listen for events and invalidate queries
- React Query handles data synchronization

#### Data Models
- Campaigns with status tracking
- Leads with connection and engagement status
- User authentication and session management

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

The application will be available at http://localhost:3000

### Environment Variables
Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## API Endpoints

### Campaigns
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/[id]` - Get campaign details
- `PUT /api/campaigns/[id]` - Update campaign
- `DELETE /api/campaigns/[id]` - Delete campaign

### Leads
- `GET /api/leads` - List leads
- `POST /api/leads` - Create lead
- `GET /api/leads/[id]` - Get lead details
- `PUT /api/leads/[id]` - Update lead
- `DELETE /api/leads/[id]` - Delete lead

## Real-time Implementation Details

### Event Broadcasting
When data is modified through the API:
1. The API route processes the request
2. After successful database update, an event is emitted
3. Connected clients receive the event
4. Client-side queries are invalidated to fetch fresh data

### Event Listeners
Frontend components subscribe to relevant events:
- Campaign pages listen for `campaigns_updated` events
- Lead pages listen for `leads_updated` events
- Dashboard listens for both events to update metrics

### Data Consistency
- React Query ensures consistent data across components
- Optimistic updates provide immediate UI feedback
- Automatic refetching maintains data accuracy

## Troubleshooting

### Real-time Updates Not Working
1. Check browser console for socket connection errors
2. Verify environment variables are set correctly
3. Ensure the socket server is running

### Data Not Updating
1. Check API route responses
2. Verify database connections
3. Confirm event emission in API routes

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License
MIT