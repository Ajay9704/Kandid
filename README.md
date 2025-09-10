# Kandid Assignment - Real-time Campaign and Lead Management System

## Overview
I built this Next.js application to manage marketing campaigns and leads with real-time updates. It provides a dashboard to track campaign performance, monitor leads, and see activity instantly.

## Features

### Real-time Updates
- Campaign status changes reflect instantly across clients  
- Lead updates are broadcasted live  
- Dashboard metrics refresh automatically  
- Toggle live updates on/off  

### Campaign Management
- Create, edit, and delete campaigns  
- Track performance metrics  
- Monitor lead engagement and response rates  
- Manage campaign sequences  

### Lead Management
- Add, update, and delete leads  
- Track lead and connection status  
- Monitor activity and engagement  
- Filter and search leads  

### Analytics
- Real-time dashboard with key metrics  
- Campaign performance insights  
- Lead status distribution  
- Activity logs  

<<<<<<< HEAD
## Demo Credentials
Email: demo@linkbird.com
Password: demo123456

shell
Copy code
=======
>>>>>>> cc7d1f6 (vercel -> mongo-db atlas)

## Getting Started

### Prerequisites
- Node.js 18+  
- npm or yarn  

### Installation
```bash
npm install
Development
bash
Copy code
npm run dev
<<<<<<< HEAD
Runs on: http://localhost:3000

Environment Variables
Create .env.local with:

ini
Copy code
=======
```
Runs on: http://localhost:3000

### Environment Variables
Create .env.local with:

```
>>>>>>> cc7d1f6 (vercel -> mongo-db atlas)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL=mongodb://localhost:27017/linkbird   # for local dev
<<<<<<< HEAD
Database Setup
Local Development (MongoDB)
Install and start MongoDB

Use: mongodb://localhost:27017/linkbird

Production (MongoDB Atlas)
Create a free cluster on MongoDB Atlas

Add DB user with read/write access

Configure IP access (add your IP or 0.0.0.0/0)

Copy the connection string

Add it as DATABASE_URL in Vercel

API Endpoints
Campaigns
GET /api/campaigns – List campaigns

POST /api/campaigns – Create campaign

GET /api/campaigns/[id] – Get details
=======
```

### Database Setup

#### Local Development (MongoDB)
- Install and start MongoDB
- Use: mongodb://localhost:27017/linkbird

#### Production (MongoDB Atlas)
- Create a free cluster on MongoDB Atlas
- Add DB user with read/write access
- Configure IP access (add your IP or 0.0.0.0/0)
- Copy the connection string
- Add it as DATABASE_URL in Vercel
>>>>>>> cc7d1f6 (vercel -> mongo-db atlas)

PUT /api/campaigns/[id] – Update campaign

<<<<<<< HEAD
DELETE /api/campaigns/[id] – Delete campaign

Leads
GET /api/leads – List leads

POST /api/leads – Create lead

GET /api/leads/[id] – Get details

PUT /api/leads/[id] – Update lead

DELETE /api/leads/[id] – Delete lead
=======
### Campaigns
- GET /api/campaigns – List campaigns
- POST /api/campaigns – Create campaign
- GET /api/campaigns/[id] – Get details
- PUT /api/campaigns/[id] – Update campaign
- DELETE /api/campaigns/[id] – Delete campaign

### Leads
- GET /api/leads – List leads
- POST /api/leads – Create lead
- GET /api/leads/[id] – Get details
- PUT /api/leads/[id] – Update lead
- DELETE /api/leads/[id] – Delete lead

## Real-time Implementation

### Event Flow
1. API processes request
2. After DB update, an event is emitted
3. Clients receive the event
4. React Query invalidates and refetches data

### Listeners
- Campaign pages → campaigns_updated
- Lead pages → leads_updated
- Dashboard → listens for both

### Data Consistency
- React Query ensures fresh data
- Optimistic UI updates feel instant
- Automatic refetching prevents stale data
>>>>>>> cc7d1f6 (vercel -> mongo-db atlas)

Real-time Implementation
Event Flow
API processes request

<<<<<<< HEAD
After DB update, an event is emitted

Clients receive the event

React Query invalidates and refetches data

Listeners
Campaign pages → campaigns_updated

Lead pages → leads_updated

Dashboard → listens for both

Data Consistency
React Query ensures fresh data

Optimistic UI updates feel instant

Automatic refetching prevents stale data

Troubleshooting
Real-time Updates Not Working
Check console for socket errors

Verify .env.local

Ensure socket server is running

Data Not Updating
Check API responses

Verify DB connection

Confirm event emission

Database Issues
Ensure MongoDB is running locally

Check DATABASE_URL

For Vercel, use MongoDB Atlas
=======
### Real-time Updates Not Working
- Check console for socket errors
- Verify .env.local
- Ensure socket server is running

### Data Not Updating
- Check API responses
- Verify DB connection
- Confirm event emission

### Database Issues
- Ensure MongoDB is running locally
- Check DATABASE_URL
- For Vercel, use MongoDB Atlas
## Demo Credentials
Email: demo@linkbird.com
Password: demo123456
>>>>>>> cc7d1f6 (vercel -> mongo-db atlas)
