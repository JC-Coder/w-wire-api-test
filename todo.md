# Take-Home Test: Currency Conversion Platform

## Overview
Hi, thank you for attempting our take-home test. We'd like you to build a mini currency conversion app. 
The application should provide currency conversion, signin functionality and protect against replay attacks, and include comprehensive functional tests.

## Requirements

### Backend (NestJS with TypeScript)
1. Set up a NestJS project with TypeScript.
2. Implement the following API endpoints:
   - POST /auth/login - User login (no signup required)
   - GET /exchange-rates - Current exchange rates for supported currencies
   - POST /convert - Perform a currency conversion
   - GET /user/transactions - Retrieve user's conversion history ( Users can only convert when they login )
3. You are permitted to integrate with an external API (e.g., Open Exchange Rates) to fetch exchange rate data.
4. Use PostgreSQL for storing user data and transaction history.
5. Implement measures to prevent replay attacks.
6. Write functional tests for key functionalities.
7. Implement proper error handling and validation.
8. Create a rate-limiting middleware to prevent API abuse.

### Frontend (React with TypeScript)
1. Set up a React project using Create React App with TypeScript or Next.js.
2. Implement the following pages/components:
   - Login page
   - Currency converter
   - User dashboard displaying transaction history
3. Use rtk query for state management and data fetching.
5. Implement client-side form validation for all inputs using react-hook-form and yup/zod for forms
6. Create reusable UI components for currency input and conversion display.
7. Use Tailwind CSS for styling, ensuring a responsive design.
8. Implement proper error handling and display user-friendly error messages.

### Security Focus
1. Implement protection against replay attacks in the authentication system. This could involve:
   - Using nonces (number used once) with each request
   - Implementing timestamped tokens with a short validity period
   - Maintaining a server-side cache of recently used tokens
2. Implement proper CORS settings to prevent unauthorized access to the API.


## Evaluation Criteria

1. Code quality, organization, and TypeScript usage
2. Implementation of security measures, especially replay attack prevention
3. Accuracy and efficiency of currency conversion functionality
4. Quality of functional tests
5. API design and implementation
6. Frontend architecture and user experience
7. Error handling and edge case management

## Submission Guidelines

1. Create a private GitHub repository for your project.
2. Include a README.md with:
   - Setup instructions
   - List of completed features and any known issues
3. Commit your code regularly to show your progress.
4. Once completed, share the link to your repository ( make it public )