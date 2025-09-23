# EV Bunker - Electric Vehicle Charging Stations

Find, book, and pay for EV charging stations seamlessly with EV Bunker. Revolutionizing the electric vehicle charging experience.

## Features

- Real-time charging station availability
- Instant booking and payment processing
- Route optimization to nearest stations
- User reviews and ratings
- Admin dashboard for station management

## Authentication System

This project includes a complete authentication and authorization system. For detailed information, see [AUTHENTICATION.md](AUTHENTICATION.md).

### User Roles

1. **Client (EV User)**
   - Login/signup only via Google OAuth
   - Automatically creates user record on first login

2. **Admin**
   - Login/signup via email and password
   - Default credentials: admin@ebunker.com / admin123

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js (Auth.js)
- **Database**: SQLite with Prisma ORM
- **Security**: JWT, bcrypt, HTTP-only cookies

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see .env.example)
4. Run database migrations: `npx prisma migrate dev`
5. Seed the database: `npm run seed`
6. Start the development server: `npm run dev`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed the database with default data
- `npm test` - Run authentication tests

## Security Features

- Password hashing with bcrypt
- JWT-based session management
- Refresh token rotation
- CSRF protection
- Role-based access control
- Input validation and sanitization
- Rate limiting on auth endpoints

## Testing

This project includes comprehensive tests for the authentication system. See the [tests/README.md](tests/README.md) for more information.

To run tests:
```bash
npm test
```