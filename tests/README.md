# Authentication Tests

This directory contains tests for the authentication system of the EV Bunker application.

## Test Files

1. **auth.test.ts** - Tests for authentication logic including:
   - Admin login with correct credentials
   - Admin login with incorrect credentials
   - JWT token generation and validation

2. **api.test.ts** - Tests for API authentication logic including:
   - Admin authentication logic
   - JWT token structure validation

## Running Tests

To run all tests:

```bash
npm test
```

To run tests in watch mode:

```bash
npm test -- --watch
```

## Test Coverage

The tests cover:

- Password hashing and validation
- JWT token generation and verification
- Admin credential validation
- Client OAuth flow simulation

## Technologies Used

- Jest for testing framework
- ts-jest for TypeScript support
- bcryptjs for password hashing simulation
- jsonwebtoken for JWT handling