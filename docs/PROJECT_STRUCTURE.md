# EV Bunker Project Structure

This document outlines the optimized file structure for the EV Bunker project.

## Root Directory

```
ev-bunker/
├── .git/                    # Git repository files
├── .gitignore              # Git ignore rules
├── docs/                   # Documentation files
├── public/                 # Static assets
├── redis/                  # Redis server installation (for real-time features)
├── src/                    # Source code
├── tests/                  # Test files
├── package.json            # Project dependencies and scripts
├── package-lock.json       # Locked dependency versions
├── tsconfig.json           # TypeScript configuration
├── tsconfig.jest.json      # Jest-specific TypeScript configuration
├── tsconfig.seed.json      # Database seeding TypeScript configuration
├── next.config.ts          # Next.js configuration
├── postcss.config.mjs      # PostCSS configuration
├── eslint.config.mjs       # ESLint configuration
├── jest.config.js          # Jest configuration
├── seed.ts                 # Database seeding script
└── setup.ts               # Test setup file
```

## Documentation (docs/)

All documentation files have been moved to the `docs/` directory for better organization:
- API documentation
- Setup guides
- Implementation summaries
- Test plans
- README files
- Payment flow fixes documentation

## Source Code (src/)

```
src/
├── app/                    # Next.js app directory with pages and API routes
│   ├── api/                # API routes
│   │   ├── payment/        # Payment-related API endpoints
│   │   ├── stations/       # Station-related API endpoints
│   │   ├── bookings/       # Booking-related API endpoints
│   │   └── test*/          # Test API endpoints
│   ├── test-payment/       # Test payment page
│   └── ...                 # Other pages
├── components/             # React components organized by section
│   ├── dashboard/          # Dashboard-specific components
│   ├── landing/            # Landing page components
│   └── ui/                 # Reusable UI components
├── hooks/                  # Custom React hooks
└── lib/                    # Utility libraries and services
```

## Tests (tests/)

```
tests/
├── unit/                  # Unit tests for individual components and functions
├── integration/           # Integration tests for API and service interactions
├── e2e/                   # End-to-end tests
├── __mocks__/            # Mock implementations for testing
├── setup.ts              # Test environment setup
└── README.md             # Testing guidelines
```

## Redis Server (redis/)

```
redis/
├── Redis-x64-5.0.14.1/    # Redis server installation
│   ├── redis-server.exe    # Redis server executable
│   ├── redis-cli.exe       # Redis command-line interface
│   └── ...                 # Other Redis files
└── Redis-x64-5.0.14.1.zip # Redis installation archive
```

## Public Assets (public/)

```
public/
├── assets/                # Images, logos, and other static assets
└── favicon.ico           # Website favicon
```

## Key Improvements

1. **Reduced File Clutter**: Moved 28 documentation files to a dedicated `docs/` directory
2. **Organized Tests**: Structured tests into unit, integration, and e2e directories
3. **Clean Root Directory**: Removed unnecessary files and directories from the project root
4. **Updated .gitignore**: Added rules to exclude large binary files and temporary files
5. **Removed Large Dependencies**: Eliminated redis binaries that can be installed as needed
6. **Enhanced Payment Flow**: Added comprehensive payment flow testing and verification endpoints
7. **Improved API Structure**: Organized API endpoints into logical groups
8. **Redis Setup**: Redis server installed and running for real-time features

This structure makes the project more maintainable and easier to navigate while keeping all essential files organized.