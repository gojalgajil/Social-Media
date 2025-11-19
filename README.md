# Social Media App

## Installation

1. Install dependencies for API:
```bash
cd api
npm install
```

2. Install dependencies for Client:
```bash
cd client
npm install
```

## Setup

1. Set up the database (PostgreSQL)
2. Update the DATABASE_URL in api/.env
3. Generate and run migrations:
```bash
cd api
npx prisma generate
npx prisma db push
```

## Running the Application

Start the API server:
```bash
cd api
npm run dev
```
The API will run on http://localhost:3000

Start the React client:
```bash
cd client
npm start
```
The client will run on http://localhost:3001 and proxy API requests to http://localhost:3000

## Features

- User registration and login
- JWT authentication
- Redux for global user state management
- Protected routes
- File upload support for user profiles

## API Endpoints

- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/user/me - Get authenticated user profile (requires token)

## Redux Store

The client uses Redux Toolkit for state management with:
- User slice for authentication state
- Async thunks for API calls
- Persistent token storage in localStorage
