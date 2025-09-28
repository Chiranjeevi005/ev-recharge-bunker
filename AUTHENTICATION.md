# EV Bunker Authentication System

This document explains the complete authentication and authorization system for the EV Bunker web application.

## Table of Contents

1. [User Roles](#user-roles)
2. [Security Features](#security-features)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [Middleware](#middleware)
7. [Environment Variables](#environment-variables)
8. [Default Credentials](#default-credentials)

## User Roles

### 1. Client (EV User)
- Login/signup only via Google OAuth
- Automatically creates user record in database on first login
- Role: `"client"`

### 2. Admin
- Login/signup via email and password
- Default password: `admin123`
- Role: `"admin"`

## Security Features

### Password Security
- Passwords are hashed using bcrypt with 12 rounds
- Hashed passwords are stored in the database
- Never store plain text passwords

### Session Management
- JWT-based session management for admin users
- Access tokens with 15-minute expiration
- Refresh token rotation with secure HTTP-only cookies
- Tokens are signed with a secret key

### Protection Mechanisms
- CSRF protection on all state-changing requests
- Role-based access control (RBAC) for protected routes
- Input validation & sanitization
- Rate limiting on login endpoints (to prevent brute-force attacks)
- HTTPS-ready configuration

## Database Schema

The authentication system uses MongoDB for data storage:

```
Collections:
- admins: Stores admin user information
- clients: Stores client user information
- accounts: Stores account information for clients
- sessions: Stores session information
```

## API Endpoints

### Admin Authentication
- `POST /api/auth/admin/register` - Register a new admin
- `POST /api/auth/admin/login` - Login as admin (returns JWT and sets refresh token cookie)
- `POST /api/auth/logout` - Logout (clears refresh token cookie)

### Client Authentication
- Google OAuth login is handled through NextAuth.js
- The client is automatically redirected to Google for authentication

### Protected Routes
- `GET /api/protected` - Requires authentication
- `POST /api/protected` - Requires admin role

## Frontend Components

### Login Page
- Located at `/login`
- Tab-based interface for admin and client login
- Admin login form with email/password
- Client login button for Google OAuth

### Dashboards
- Admin Dashboard: `/dashboard/admin`
- Client Dashboard: `/dashboard/client`

### Authentication Hook
- `useAuth()` hook for client-side authentication management

## Middleware

### Route Protection
- Middleware automatically protects dashboard routes based on user roles
- Unauthenticated users are redirected to `/login`
- Users with incorrect roles are redirected to their appropriate dashboard

## Environment Variables

Create a `.env` file with the following variables:

```env
# Auth.js
AUTH_SECRET="your-super-secret-key-change-this-in-production"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Database
DATABASE_URL="mongodb://localhost:27017/ev_bunker"
```

## Default Credentials

After running the seed script, a default admin user is created:

- Email: `admin@ebunker.com`
- Password: `admin123`

**Important:** Change this password in production!

## Testing the Authentication System

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3002/login`
3. For admin login, use the credentials provided above
4. For client registration and login, use the client registration form

## Role-Based Access Control

The system implements RBAC through:

1. Database role field for each user
2. Middleware that checks roles for protected routes
3. API middleware for protecting API endpoints
4. Session callbacks that attach role information

## Security Best Practices Implemented

1. **Password Hashing**: All passwords are hashed with bcrypt
2. **JWT Security**: Short-lived access tokens with refresh token rotation
3. **HTTP-Only Cookies**: Refresh tokens stored securely
4. **CSRF Protection**: Built-in CSRF protection for state-changing requests
5. **Input Validation**: All inputs are validated and sanitized
6. **Rate Limiting**: Login endpoints are rate-limited
7. **HTTPS Ready**: Configuration supports HTTPS deployment