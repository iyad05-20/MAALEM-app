# Monorepo Structure Overview

## Project Layout

```
maalem-app/
├── apps/
│   ├── frontend/              # React/Vite PWA (Vercel)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── views/
│   │   │   ├── services/
│   │   │   │   ├── api.client.ts      # NEW: HTTP client to backend
│   │   │   │   ├── websocket.client.ts # NEW: WebSocket client
│   │   │   │   └── ...existing services
│   │   │   └── ...
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── .env.example
│   │   └── README.md
│   │
│   └── backend/               # Node.js/Express (Heroku)
│       ├── src/
│       │   ├── server.ts      # Express entry point
│       │   ├── routes/        # API route handlers
│       │   │   ├── auth.routes.ts
│       │   │   ├── order.routes.ts
│       │   │   └── artisan.routes.ts
│       │   ├── controllers/   # Business logic
│       │   ├── services/      # Data access & external APIs
│       │   │   └── firebase.service.ts
│       │   ├── middleware/    # Express middleware
│       │   │   └── auth.middleware.ts
│       │   ├── types/         # Backend-specific types
│       │   ├── utils/         # Helper functions
│       │   └── websocket/     # Socket.io setup
│       ├── dist/              # Compiled JavaScript
│       ├── package.json
│       ├── tsconfig.json
│       ├── .env.example
│       ├── Procfile           # Heroku deployment
│       └── README.md
│
├── shared/                    # Shared code (npm workspace)
│   ├── types/
│   │   ├── User.ts           # User/auth types
│   │   ├── Order.ts          # Order types
│   │   ├── API.ts            # API response types
│   │   └── index.ts          # Centralized exports
│   ├── utils/                # Shared utility functions
│   ├── constants/            # Shared constants
│   ├── package.json
│   └── README.md
│
├── archived/                  # Old projects (not active)
│   └── vork/
│
├── docs/                      # Project documentation
│   ├── SETUP.md              # Development setup
│   ├── ARCHITECTURE.md       # System design
│   ├── API.md                # API documentation
│   ├── DEPLOYMENT.md         # Deployment procedures
│   ├── DATABASE.md
│   └── ...
│
├── package.json              # Root monorepo configuration
├── package-lock.json
├── README.md
└── .gitignore
```

## Workspace Setup

### Root package.json
- Defines `workspaces` array pointing to apps/frontend, apps/backend, shared
- Contains scripts for running all apps: `npm run dev`, `npm run build`, etc.
- Each workspace can be built independently

### Key Files Per App

**apps/frontend/**
- `package.json`: React, Vite, Socket.io client dependencies
- `tsconfig.json`: Paths configured to resolve `@shared/*` imports
- `.env.example`: VITE_API_URL, VITE_WS_URL configuration
- `vite.config.ts`: Frontend build configuration

**apps/backend/**
- `package.json`: Express, Socket.io server, Firebase Admin dependencies
- `tsconfig.json`: Paths configured to resolve `@shared/*` imports
- `.env.example`: PORT, JWT_SECRET, Firebase credentials
- `Procfile`: Heroku deployment configuration
- `src/server.ts`: Express app with WebSocket setup

**shared/**
- `package.json`: Minimal, marks this as a workspace
- `types/`: Type definitions shared by both apps
- No build step needed (TypeScript files imported directly)

## Code Sharing Pattern

### Importing Shared Types
```typescript
// In apps/frontend/src/services/api.client.ts
import { ApiResponse, ApiError } from '@shared/types/API';

// In apps/backend/src/routes/auth.routes.ts
import { LoginRequest, UserProfile } from '@shared/types/User';
```

### Why This Works
1. Both apps have path alias: `"@shared/*": ["../../shared/*"]`
2. TypeScript resolves imports at compile time
3. Each app bundles only the shared code it uses
4. No circular dependencies possible

## Independent Deployments

### Frontend (Vercel)
- Builds: `npm run build --workspace=apps/frontend`
- Output: Static files in `dist/`
- Deployment: Automatic on git push

### Backend (Heroku)
- Builds: `npm run build --workspace=apps/backend`
- Output: JavaScript in `dist/`
- Deployment: `git push heroku main` or manual deploy
- Stays running 24/7 (for APIs and WebSockets)

## Development Workflow

### Running Locally
```bash
# All in one: frontend + backend
npm run dev

# Or separate terminals:
npm run dev:frontend
npm run dev:backend
```

### Building
```bash
# Everything
npm run build

# Just frontend
npm run build:frontend

# Just backend
npm run build:backend
```

### Type Checking
```bash
npm run type-check
```

## Environment Variables

Each app has its own `.env` file:
- **apps/frontend/.env**: Frontend-only variables (public, can be in browser)
- **apps/backend/.env**: Backend-only variables (private, server-only)
- `shared/` has no env file (no runtime code)

## API Communication Flow

```
Frontend                Backend              Database
  ↓                       ↓                     ↓
User interaction   → HTTP request       → Firebase/Supabase
  ↓                       ↓                     ↓
api.client.ts      → Express routes    ← Query results
  ↓                       ↓                     ↓
Update UI          ← JSON response      
  ↓
WebSocket          ← Socket.io events (real-time)
  ↓
Real-time updates
```

## Adding New Features

### New API Endpoint
1. Create route in `apps/backend/src/routes/`
2. Create shared types in `shared/types/API.ts` (if needed)
3. Add endpoint to `apps/frontend/src/services/api.client.ts`
4. Call from frontend component

### New Shared Type
1. Create/update file in `shared/types/`
2. Export from `shared/types/index.ts`
3. Import in both apps using `@shared/types/`

### New Database Table
1. Update Firebase/Supabase schema
2. Create type definition in `shared/types/`
3. Create backend service in `apps/backend/src/services/`
4. Create API routes that use the service

## Next Steps

- [ ] Migrate API functions from `apps/frontend/api/` to `apps/backend/src/routes/`
- [ ] Implement authentication service with JWT tokens
- [ ] Set up database query services in backend
- [ ] Update frontend components to use new api.client
- [ ] Test WebSocket connections
- [ ] Deploy to staging environment
- [ ] Prepare production deployment

## Troubleshooting

**Workspace imports not resolving?**
- Run `npm install` from root
- Verify `tsconfig.json` paths are correct
- Check TypeScript version consistency

**Backend won't start?**
- Check `.env` file is present with all required variables
- Verify Firebase service account JSON is valid
- Check port 3001 isn't already in use

**Frontend can't reach backend?**
- Verify `VITE_API_URL` is correct
- Check backend is running
- Verify CORS is enabled on backend

**WebSocket connection fails?**
- Check `VITE_WS_URL` matches backend URL
- Verify WebSocket support in hosting (not free tier Heroku)
- Check token is valid in auth header
