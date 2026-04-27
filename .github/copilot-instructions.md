# Copilot Instructions for Maalem-app

This document provides guidance for GitHub Copilot and other AI assistants working in this repository.

## Project Overview

**Maalem-app** is a Progressive Web App (PWA) marketplace platform that connects clients with artisans for home services. The project uses an npm monorepo workspace structure with two main applications:

- **Frontend**: React/Vite PWA (React 19, TypeScript, Tailwind CSS)
- **Backend**: Firestore rules and configuration
- **Vork**: A separate Next.js 15 TypeScript application (appears to be experimental/legacy - separate from main frontend)

### Key Technologies
- **Frontend**: React 19 + Vite, Tailwind CSS, TypeScript, Lucide React icons
- **Backend**: Firebase (Firestore, Auth), Supabase
- **APIs**: Google Gemini AI, Geofire for geolocation
- **PWA**: Vite PWA plugin with automatic updates, offline support, caching strategies

## Build, Test, and Lint Commands

### Frontend (main app)
```bash
# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

### Root workspace commands
```bash
# Frontend dev
npm run frontend:dev

# Frontend build
npm run frontend:build
```

### Vork (Next.js app)
```bash
# Development (port 4028)
cd vork && npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format

# Serve production build
npm run serve
```

**No test commands currently exist** — the project lacks unit/integration tests in package.json scripts.

## High-Level Architecture

### Frontend (Vite/React)

**Structure:**
- `src/components/` - Reusable UI components (organized by feature/type)
- `src/views/` - Page-level components and screen views
- `src/services/` - API clients (Firebase, Supabase, external APIs)
- `src/context/` - React Context for state management (AuthContext, etc.)
- `src/hooks/` - Custom React hooks (useAppLogic, etc.)
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions
- `src/data/` - Mock data and constants (CATEGORIES, etc.)
- `src/styles/` - Global styles
- `src/scripts/` - Build/utility scripts

**State Management:**
- Uses React Context (AuthContext is the primary context)
- Auth state drives the view/role-based rendering (useAuth hook provides authUser, userProfile, userRole)

**View System:**
- Role-based rendering: Client vs Artisan interfaces
- Lazy-loaded view components using React.lazy for code splitting
- Error boundaries and offline detection included
- Toast notifications for user feedback
- Smart avatar components

**PWA Features:**
- Vite PWA plugin with automatic service worker updates
- Multi-level caching strategy (Firebase, Supabase storage, Google Fonts, etc.)
- Manifest includes maskable icons for mobile
- Support for offline mode (OfflineView component)
- PWA install prompt component (InstallPWA)

### Backend
- Firestore rules in `backend/firestore.rules` (currently permissive: `allow read, write: if true`)
- No server-side logic; primarily configuration

### Vork (Next.js)
- Separate Next.js 15 application (independent from main Vite frontend)
- Uses same styling (Tailwind) and linting standards
- May be for admin/dashboard purposes
- Has components and styles directories

## Key Conventions

### Code Style
- **Single quotes** for strings (enforced via ESLint in vork)
- **Semicolons** required (Prettier rule)
- **Print width**: 100 characters
- **Tab width**: 2 spaces
- **Trailing commas**: ES5 style (objects/arrays only, not function args)
- **TypeScript strict mode**: Enabled in vork

### Import Paths
- Path alias `@/*` maps to project root in frontend (tsconfig: `@/*: .//*`)
- Path alias `@/*` maps to `./src/*` in vork (tsconfig)
- Prefer absolute imports over relative paths

### Component Organization
- Components use `.tsx` extension for React components
- React.lazy() used for code splitting main views
- Components destructure props for clarity
- Lazy imports pattern: `React.lazy(() => import('./path').then(m => ({ default: m.ExportName })))`

### TypeScript
- Target: ES2022 (frontend), ES2017 (vork)
- JSX: `react-jsx` (frontend), `preserve` (vork - uses Next.js compiler)
- Module resolution: `bundler` (frontend), `bundler` (vork)
- `allowJs: true` in both
- Unused variables prefixed with `_` are ignored (ESLint rule)
- `no-explicit-any` triggers warnings, not errors

### Environment Variables
**Frontend** (.env):
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GEMINI_API_KEY
```
All frontend env vars must be prefixed with `VITE_` to be exposed to the browser.

### Dependencies to Know
- **firebase**: For authentication and Firestore database
- **@supabase/supabase-js**: For additional backend services
- **lucide-react**: Icon library (used extensively)
- **geofire-common**: Geolocation/distance calculations
- **@google/generative-ai**: Gemini AI API client
- **vite-plugin-pwa**: PWA service worker and manifest generation
- **clsx / tailwind-merge**: For conditional CSS classes

### Linting & Formatting Rules (Vork - Next.js)
- ESLint extends `next/core-web-vitals`, `eslint:recommended`, `@typescript-eslint/recommended`
- Prettier is integrated via `eslint-plugin-prettier`
- Console methods: `console.warn`, `console.error`, `console.info` allowed; `console.log` triggers warning
- No explicit any: Warnings only
- Critical dependencies in vork/package.json marked in `rocketCritical` section—do not remove

### File Organization Notes
- `vork_img/` directory contains PNG icons (72x72 to 512x512 for PWA) and test output images
- Should be referenced in frontend `public/icons/` for PWA manifest
- `supabase_rls_fix.sql` at root indicates RLS policies were modified (not currently in use)

## Important Notes

1. **PWA Manifest**: Icons in `vork_img/` should be properly placed in `frontend/public/icons/` for PWA to work correctly
2. **Firestore Rules**: Currently permissive in development; RLS needs proper setup before production
3. **Vork separation**: The `vork/` Next.js app appears to be a separate experimental project—clarify its role with the team
4. **No tests**: Consider adding test scripts (Jest/Vitest) for the frontend
5. **API keys sensitive**: All Firebase and Gemini keys must be in `.env` and never committed

## Monorepo Workspace Structure

```
root package.json defines workspaces: ["frontend", "backend"]
├── frontend/ (React/Vite PWA)
├── backend/ (Firestore config)
└── vork/ (Next.js - separate, not in workspaces array)
```

Commands run from root apply to workspaced packages. The `vork/` directory is independent and must be run separately.
