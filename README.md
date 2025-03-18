# We Wire - Currency Conversion Platform

A full-stack currency conversion platform built with NestJS and React, featuring secure authentication, real-time currency conversion, and comprehensive transaction tracking.

## Demo

<video width="100%" controls>
  <source src="https://pub-bac1839243454103b0992ac4d61bd168.r2.dev/2025-03-18%2006-24-10.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

Demo video not loaded ? [Watch Video Here](https://pub-bac1839243454103b0992ac4d61bd168.r2.dev/2025-03-18%2006-24-10.mp4)

## Project Overview

We Wire is a modern currency conversion platform that allows users to:

- Perform secure currency conversions
- Track conversion history
- Access real-time exchange rates
- Manage their transactions through a user-friendly dashboard

## Architecture

### System Flow

![System Flow Chart](assets/flow-chart.png)

### Data Model

![Entity Relationship Diagram](assets/erd.png)

### Request Flow

![Sequence Diagram](assets/sequence-diagram.png)

## Project Structure

This project is organized into two main directories:

- `backend/` - NestJS backend application
- `frontend/` - React frontend application built with Vite

## Core Features

### Backend Features

- **Authentication & Security**

  - Secure JWT-based authentication
  - Protection against replay attacks
  - Rate limiting middleware
  - CORS protection
  - Secure headers implementation

- **Currency Operations**

  - Real-time exchange rates integration
  - Currency conversion functionality
  - Transaction history tracking
  - PostgreSQL data persistence

- **API Endpoints**
  - POST /api/auth/login - User authentication
  - GET /api/exchange-rates - Current exchange rates
  - POST /api/convert - Currency conversion
  - GET /api/user/transactions - Transaction history

### Frontend Features

- **User Interface**

  - Responsive design with Tailwind CSS
  - Interactive currency converter
  - Transaction history dashboard
  - User-friendly error handling

- **Technical Features**
  - RTK Query for state management
  - Form validation with react-hook-form
  - Reusable UI components
  - TypeScript integration

## Tech Stack

### Backend

- NestJS with TypeScript
- PostgreSQL database
- TypeORM for database management
- JWT for authentication
- Class-validator for DTO validation
- Jest for testing

### Frontend

- React 18+
- TypeScript
- Vite
- RTK Query
- React Hook Form
- Tailwind CSS
- React Router

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm (preferred) or npm

### Environment Variables

#### Backend (.env.example)

```properties
APP_NAME="Backend Api Test"
APP_PORT=3000
APP_ENV=development
APP_ENCRYPTION_KEY=your_encryption_key
DB_URL=postgresql://username:password@localhost:5432/database_name
TEST_DB_URL=postgresql://username:password@localhost:5432/test_database_name
JWT_SECRET=your_jwt_secret_key
OPEN_EXCHANGE_APP_ID=your_open_exchange_rate_api_key
REDIS_DB_URL=redis://localhost:6379
```

#### Frontend (.env.example)

```properties
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME="We Wire"
```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file with necessary environment variables (see .env.example)
4. Run database migrations:
   ```bash
   npm run migration:run
   ```
5. Start the development server:
   ```bash
   npm run start:dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Security Features

- Protection against replay attacks using nonces
- Timestamped JWT tokens with short validity
- Rate limiting to prevent API abuse
- Secure headers implementation
- CORS configuration
- Request sanitization
- Request size limiting

## Testing

### Backend Tests

```bash
cd backend
npm run test        # Unit tests
npm run test:e2e    # E2E tests
npm run test:cov    # Test coverage
```

## API Documentation

The API documentation is available [here](https://documenter.getpostman.com/view/24185831/2sAYkDMfuP)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
