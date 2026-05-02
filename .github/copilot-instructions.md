# Copilot Instructions for Maalem-app

This document guides GitHub Copilot and AI assistants working in this repository.

## Project Overview

**Maalem-app** is a Progressive Web App (PWA) marketplace platform connecting clients with artisans for home services. It uses an npm monorepo with three applications:

- **Frontend** (`apps/frontend/`): React 19 + Vite PWA, directly accesses Firestore
- **Backend** (`apps/backend/`): Node.js/Express, WebSocket support, emerging API layer (currently scaffolded)
- **Shared** (`shared/`): Shared TypeScript types between frontend and backend
- **Archived** (`archived/vork/`): Legacy Next.js project (not active)

### Key Technologies
- **Frontend**: React 19 + Vite, TypeScript, Tailwind CSS, Lucide React icons, Socket.io client
- **Backend**: Express, Socket.io, Firebase Admin SDK, TypeScript
- **Database**: Firebase (Firestore auth + database), Supabase (PostgreSQL alternative)
- **Real-time**: WebSocket (Socket.io) for chat and order updates
- **AI**: Google Gemini (chatbot), Cloudflare Workers AI (image generation)
- **PWA**: Vite PWA plugin with multi-level caching strategies

## Build, Test, and Lint Commands

### Root Workspace
```bash
# Start both frontend and backend simultaneously
npm run dev

# Build everything (frontend + backend)
npm run build

# Type checking across all workspaces
npm run type-check

# Lint all workspaces
npm run lint

# Test all workspaces (placeholder - no tests implemented)
npm run test
```

### Frontend Only
```bash
# Development server (http://localhost:3000)
npm run dev:frontend

# Production build
npm run build:frontend

# Preview production build locally
npm run preview --workspace=apps/frontend

# Type checking
npm run type-check --workspace=apps/frontend
```

### Backend Only
```bash
# Development server with hot-reload (http://localhost:3001)
npm run dev:backend

# Production build
npm run build:backend

# Start production server
npm start --workspace=apps/backend

# Type checking
npm run type-check --workspace=apps/backend

# Linting
npm run lint --workspace=apps/backend
```

### Important Notes
- **No test suite exists** — no Jest, Vitest, or similar test runners configured
- Both apps use **TypeScript strict mode** with path aliases (`@/*` for local, `@shared/*` for shared types)
- Frontend runs on port **3000**, backend on **3001** (configured in vite.config.ts and server.ts)

## High-Level Architecture

### Current State: Hybrid Architecture (Transitional)

The project is migrating from direct Firestore access to a backend API layer. **Currently, both patterns coexist:**

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (React 19 + Vite)                                      │
│                                                                 │
│  Views & Components (React.lazy for code splitting)             │
│    ↓                                                             │
│  Hooks: useAppLogic, useAuthLogic, useOrdersLogic, useChatsLogic│
│    ↓                                                             │
│  Services:                                                       │
│    • auth.service.ts → Firebase Auth + Firestore (users/artisans)
│    • order.service.ts → Firestore direct queries                │
│    • websocket.client.ts → Socket.io client (real-time events) │
│    • api.client.ts → Backend HTTP API (not widely used yet)     │
│    • firebase.config.ts → Firebase initialization               │
│    ↓                                                             │
│  ┌─────────────────────────────────────────────┐                │
│  │ FIRESTORE (reads & writes)                  │                │
│  │ Collections: users, artisans, orders,       │                │
│  │             chats, notifications, reviews   │                │
│  └─────────────────────────────────────────────┘                │
│    ↑                                             ↑                │
│    │ WebSocket Events                           │                │
│    │ (join-order, send-message, typing)         │                │
│    └─────────────────────────┬───────────────────┘                │
└─────────────────────────────┼──────────────────────────────────┘
                              │
┌─────────────────────────────┼──────────────────────────────────┐
│ BACKEND (Express + Socket.io)                                  │
│                                                                │
│  Routes (mostly scaffolded with TODO placeholders):            │
│    • /api/auth/* → JWT login/register/refresh (TODO)           │
│    • /api/orders/* → Order CRUD (TODO)                         │
│    • /api/artisans/* → Artisan profile/search (TODO)           │
│    • /api/chat → LLM chatbot + image generation (ACTIVE)       │
│                                                                │
│  WebSocket Setup (Socket.io):                                  │
│    • Listens for: join-order, send-message, typing             │
│    • Broadcasts to: order chat rooms                           │
│                                                                │
│  Services:                                                     │
│    • firebase.service.ts → Firebase Admin SDK                  │
│    • llm/llm-caller.ts → Google Gemini API                     │
│    • llm/image-generator.ts → Cloudflare Workers AI            │
└─────────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

**Structure:**
- `src/views/` - Page-level screens (auth, client UI, artisan UI, shared)
- `src/components/` - Reusable UI components (organized by type/feature)
- `src/hooks/` - Business logic hooks:
  - `useAppLogic` - Main orchestrator, state management
  - `useAuthLogic` - Authentication flow and user profile
  - `useOrdersLogic` - Active and archived orders + notifications
  - `useChatsLogic` - Real-time chat conversations
  - `useLocationTracker` - Geolocation tracking for artisans
- `src/services/` - API clients and external integrations
- `src/context/` - React Context (currently only `AuthContext` for user state)
- `src/types/` - TypeScript definitions
- `src/data/` - Mock data and constants (CATEGORIES)
- `src/utils/` - Helper functions

**State Management:**
- **React Context** (`AuthContext`) - User authentication and profile
- **Component State** (`useState`) - Local UI state
- **Firestore Real-time Listeners** (`onSnapshot`) - Live data updates for orders, chats, notifications
- **Custom Hooks** - Encapsulate complex state logic (`useAppLogic`, `useOrdersLogic`, etc.)

**Data Flow:**
```
User Action → Hook (useAppLogic) → Firestore Query/Update
                                  ↓
                            Real-time Listener (onSnapshot)
                                  ↓
                            Component Re-render
```

**Important**: Frontend components **directly access Firestore** using the SDK. This is intentional for now—the backend API layer exists but is not yet wired into the frontend. The backend is primarily used for:
- LLM chat endpoint (`/api/chat`)
- WebSocket real-time events
- Future: API-first migration (in progress)

### Backend Architecture

**Scaffolded Routes** (mostly TODO):
- `routes/auth.routes.ts` - Register, login, logout, token refresh
- `routes/order.routes.ts` - CRUD operations, accept, complete
- `routes/artisan.routes.ts` - Profile, filtering, reviews
- `routes/chat.routes.ts` - LLM chatbot (ACTIVE, uses Gemini API)

**Middleware:**
- `auth.middleware.ts` - JWT token validation (`verifyToken`, `verifyArtisan`, `verifyClient`)

**Services:**
- `firebase.service.ts` - Firebase Admin SDK initialization
- `llm/llm-caller.ts` - Gemini API integration with session management
- `llm/image-generator.ts` - Cloudflare Workers AI for image generation
- `llm/prompt-builder.ts` - Dynamic prompt construction for context-aware responses

**WebSocket (Socket.io):**
- Handles: chat messages, typing indicators, order events
- Real-time broadcasts to connected clients
- Configured with CORS to accept frontend URL

### Shared Types (`shared/`)

Located in `shared/types/`:
- `User.ts` - User and artisan profiles
- `Order.ts` - Order details and status
- `API.ts` - API response format, error codes, WebSocket message types

Imported in both frontend and backend using `@shared/types/*` path alias.

### PWA Features

- **Service Worker**: Vite PWA plugin manages auto-update and offline support
- **Caching Strategies**:
  - `CacheFirst`: Static assets, Google Fonts, Firebase libraries (cached up to 30 days)
  - `StaleWhileRevalidate`: Google Fonts stylesheets
  - All assets in `public/icons/` included for offline use
- **Manifest**: Configured in `vite.config.ts` with maskable icons (72x72 to 512x512)
- **Install Prompt**: `InstallPWA` component shows browser install banner

## Key Conventions

### Code Style
- **Quotes**: Single quotes for strings (TypeScript and JSX)
- **Semicolons**: Required (enforced via Prettier)
- **Print width**: 100 characters
- **Tab width**: 2 spaces
- **Trailing commas**: ES5 style (only in objects/arrays, not function parameters)
- **Type safety**: TypeScript strict mode enabled in both frontend and backend

### TypeScript Configuration

**Frontend** (`apps/frontend/tsconfig.json`):
- Target: ES2022
- JSX: react-jsx (automatic JSX transform)
- Paths: `@/*` → `./src/*`, `@shared/*` → `../../shared/*`
- Strict mode enabled

**Backend** (`apps/backend/tsconfig.json`):
- Target: ES2022
- Module: NodeNext (ESM)
- Paths: `@/*` → `./*`, `@shared/*` → `../../shared/*`
- Strict mode enabled

### Import Paths
- Use path aliases instead of relative imports: `import { X } from '@shared/types'`
- Prefer absolute imports for clarity and refactoring
- **Never use**: `../../../shared` (always use `@shared/types/`)

### React Component Patterns
- Components use `.tsx` extension
- Destructure props at function parameters
- Use `React.lazy()` for code splitting main views with lazy imports: 
  ```tsx
  const LoginView = React.lazy(() => 
    import('./views/auth/LoginView').then(m => ({ default: m.LoginView }))
  );
  ```
- Use custom hooks to extract business logic from components
- Favor functional components with hooks over class components

### Firestore Patterns (Frontend)

**Real-time Listeners:**
```typescript
// Use onSnapshot for reactive updates
const unsubscribe = onSnapshot(query, (snapshot) => {
  const data = snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  }));
});
```

**Collections Used:**
- `users` - Client profiles (email, name, avatar, favorites)
- `artisans` - Artisan profiles (services, rating, reviews count, online status)
- `orders` - Active orders (status: "EN ATTENTE D'EXPERT", "ACCEPTÉE", "TERMINÉE")
- `archivedOrders` - Completed orders (archive collection for history)
- `chats` - Conversations between clients and artisans (messages stored as sub-collection)
- `notifications` - User notifications (marked read/unread)
- `reviews` - Ratings and feedback for artisans

**Firestore Rules** (currently permissive for development):
```
allow read, write: if true
```
⚠️ **TODO**: Implement proper security rules before production.

### Backend API Patterns

**Route Handlers:**
- Routes are Express routers in `src/routes/`
- All protected routes must use `verifyToken` middleware
- Response format (standard across all endpoints):
  ```typescript
  {
    success: boolean,
    data?: T,
    error?: string,
    message?: string
  }
  ```

**Error Handling:**
- Use error middleware (defined in server.ts)
- Return appropriate HTTP status codes (401, 403, 404, 500)
- Include error code from `@shared/types/API.ErrorCode`

**Active Implementation:**
- `/api/chat` (POST) - LLM chatbot integration with session management
- All other routes contain TODO comments and need implementation

### Environment Variables

**Frontend** (`apps/frontend/.env`):
```
# Firebase (required for all Firestore features)
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID

# Backend API endpoints
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001

# Optional: Supabase (alternative to Firebase)
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY

# AI Services
VITE_GEMINI_API_KEY
```

**Backend** (`apps/backend/.env`):
```
# Server
PORT=3001
NODE_ENV=development

# Frontend CORS
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRY=7d

# Firebase (Admin SDK)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Optional: Supabase
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY

# Logging
LOG_LEVEL=info
```

**Important**: All frontend environment variables must be prefixed with `VITE_` to be exposed to the browser. Backend variables are server-only.

### Dependencies to Know

**Frontend:**
- `firebase` - Authentication and Firestore database
- `@supabase/supabase-js` - Supabase backend (alternative)
- `socket.io-client` - Real-time WebSocket client
- `lucide-react` - Icon library (used extensively for UI)
- `geofire-common` - Geolocation calculations
- `@google/generative-ai` - Google Gemini API client
- `vite-plugin-pwa` - PWA service worker and manifest
- `tailwind-merge` & `clsx` - CSS utility merging
- `react` v19, `react-dom` v19

**Backend:**
- `express` - HTTP server framework
- `socket.io` - WebSocket server for real-time events
- `firebase-admin` - Firebase Admin SDK
- `jsonwebtoken` - JWT token generation/verification
- `bcryptjs` - Password hashing (when implemented)
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

**Shared:**
- TypeScript type definitions only (no runtime dependencies)

## Important Notes & Migration Status

### Current Development State
1. **Frontend-Firestore Coupling**: The frontend still directly accesses Firestore for all data operations. This is intentional during transition period.
2. **Backend API Scaffolding**: Routes exist but are mostly `TODO` comments. The backend is actively used for:
   - `/api/chat` endpoint (Gemini chatbot + image generation)
   - WebSocket event broadcasting
3. **API Client Ready**: `api.client.ts` exists and is wired up, but not yet used by frontend components. Frontend components still use Firestore directly.
4. **No Tests**: The project currently lacks a test suite. Consider adding Jest/Vitest if expanding.

### Security Considerations
- ⚠️ **Firestore Rules**: Currently permissive (`allow read, write: if true`). Implement proper security rules before production.
- ✅ **Backend Routes**: Protected routes use JWT token validation via `verifyToken` middleware.
- ✅ **Environment Variables**: Firebase credentials stored in `.env`, never committed.
- ✅ **WebSocket Auth**: Socket.io connections validate JWT tokens on auth middleware (not yet implemented in routes).

### Known Issues & TODO Items
1. Backend authentication routes need implementation (currently placeholders)
2. Backend order/artisan routes need implementation (currently placeholders)
3. Firestore security rules need to be tightened
4. Frontend should gradually migrate to backend API instead of direct Firestore access
5. Frontend components should include error boundaries and loading states (partially done)

## Monorepo Workspace Structure

Root `package.json` defines three workspaces:
```json
"workspaces": ["apps/frontend", "apps/backend", "shared"]
```

### Directory Layout
```
maalem-app/
├── apps/
│   ├── frontend/              # React/Vite PWA (port 3000)
│   │   ├── src/
│   │   │   ├── components/   # UI components
│   │   │   ├── views/        # Page screens
│   │   │   ├── hooks/        # Business logic hooks
│   │   │   ├── services/     # Firebase, WebSocket, API clients
│   │   │   ├── context/      # React Context (AuthContext)
│   │   │   ├── types/        # Local type definitions
│   │   │   ├── utils/        # Helper functions
│   │   │   ├── data/         # Mock data (CATEGORIES)
│   │   │   ├── styles/       # Global CSS
│   │   │   ├── App.tsx       # Root component
│   │   │   └── main.tsx      # Entry point
│   │   ├── public/           # Static assets (icons for PWA)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts    # PWA plugin config
│   │   ├── .env.example
│   │   └── README.md
│   │
│   └── backend/              # Express server (port 3001)
│       ├── src/
│       │   ├── server.ts     # Express + Socket.io setup
│       │   ├── routes/       # API endpoint handlers
│       │   ├── controllers/  # Business logic (mostly empty)
│       │   ├── services/     # Firebase Admin, LLM services
│       │   ├── middleware/   # Auth validation, error handling
│       │   ├── types/        # Backend-specific types
│       │   ├── utils/        # Helper functions
│       │   ├── config/       # Configuration files
│       │   └── websocket/    # Socket.io events (in server.ts)
│       ├── dist/             # Compiled JavaScript
│       ├── package.json
│       ├── tsconfig.json
│       ├── .env.example
│       ├── Procfile          # Heroku deployment
│       └── README.md
│
├── shared/                   # Shared types (npm workspace)
│   ├── types/
│   │   ├── User.ts          # User & artisan profiles
│   │   ├── Order.ts         # Order details
│   │   ├── API.ts           # API response & error types
│   │   └── index.ts         # Exports
│   ├── utils/               # Shared utilities (if any)
│   ├── package.json
│   └── README.md
│
├── archived/                 # Deprecated/legacy projects
│   └── vork/                # Old Next.js 15 app (not active)
│
├── docs/                     # Project documentation
│   ├── SETUP.md             # Environment setup
│   ├── ARCHITECTURE.md      # System design
│   ├── API.md               # Backend API reference
│   ├── MONOREPO_STRUCTURE.md # Monorepo guide
│   ├── DEPLOYMENT.md        # Deployment procedures
│   └── database/            # Database schemas
│
├── .github/
│   ├── copilot-instructions.md  # This file
│   └── STRUCTURE_DECISIONS.md   # Open architecture questions
│
├── package.json             # Root monorepo config
├── package-lock.json
├── README.md               # Project overview
└── .gitignore
```

### Running Commands from Root vs. Workspace

**From root directory** (affects all workspaces):
```bash
npm run dev              # Runs dev in both frontend & backend
npm run build            # Builds both
npm run type-check       # Type checks both
npm run lint             # Lints both
```

**For specific workspace** (using --workspace flag):
```bash
npm run dev --workspace=apps/frontend
npm run build --workspace=apps/backend
npm run type-check --workspace=apps/frontend
```

**For independent operations** (cd into directory):
```bash
cd apps/frontend && npm run dev
cd apps/backend && npm run dev:backend
```

## Common Tasks & Patterns

### Adding a New Frontend Component
1. Create in `apps/frontend/src/components/` or `views/`
2. Import from `@shared/types/` if using shared types
3. Use TypeScript for type safety
4. Export from component file, import with relative or absolute path

### Calling Firestore from Frontend
```typescript
import { db } from '../services/firebase.config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// Real-time listener
const q = query(collection(db, 'artisans'), where('category', '==', 'plumbing'));
const unsubscribe = onSnapshot(q, (snapshot) => {
  const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
});
```

### Using WebSocket from Frontend
```typescript
import { wsClient } from '../services/websocket.client';

// Connect
await wsClient.connect(token);

// Send message
wsClient.sendMessage(orderId, userId, messageText);

// Listen to events
wsClient.on('chat:message', (data) => {
  console.log(data);
});
```

### Adding a Backend Route
1. Create route file in `apps/backend/src/routes/`
2. Use Express Router with `verifyToken` middleware for protected routes
3. Import any services needed (Firebase, LLM, etc.)
4. Return standard API response format
5. Register route in `server.ts` using `app.use()`

### Adding Shared Types
1. Create/edit file in `shared/types/`
2. Export from `shared/types/index.ts`
3. Import in both frontend and backend using `@shared/types/`

## Deployment

### Frontend → Vercel
- Automatic deployment on `git push` to main
- Requires `VITE_API_URL` and `VITE_WS_URL` environment variables in Vercel settings
- Build command: `npm run build` (defined in vite.config.ts)
- Output: `dist/` folder

### Backend → Heroku
- Deploy with `git push heroku main`
- Requires Firebase service account in `FIREBASE_SERVICE_ACCOUNT` env var
- Build command: `npm run build`
- Start command: `npm start`
- Procfile specifies: `web: npm start`

See `docs/DEPLOYMENT.md` for detailed deployment instructions.
