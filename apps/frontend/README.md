# Frontend - Maalem App

React/Vite Progressive Web App for the Maalem marketplace platform.

## Quick Start

```bash
# From root directory
npm run dev

# Or from frontend directory
cd frontend && npm run dev
```

Frontend runs at **http://localhost:3000**

## 📁 Project Structure

```
src/
├── components/           # UI components
│   ├── ui/              # Basic UI elements (buttons, inputs, cards)
│   ├── form/            # Form-specific components
│   ├── chat/            # Chat interface components
│   ├── layout/          # Layout wrappers
│   ├── Navigation/      # Navbar, Header, ViewSwitcher
│   ├── Shared/          # Shared utilities (Avatar, CategoryIcon)
│   └── common/          # Common components (Toast, ErrorBoundary)
│
├── views/               # Page-level screens
│   ├── auth/            # Login, Register, Verify Email
│   ├── client/          # Client interface screens
│   ├── artisan/         # Artisan interface screens
│   └── common/          # Shared screens (OfflineView)
│
├── services/            # API clients & configuration
│   ├── firebase.config.ts    # Firebase initialization
│   ├── supabase.config.ts    # Supabase initialization
│   ├── auth.service.ts       # Authentication
│   ├── order.service.ts      # Order management
│   ├── location.service.ts   # Geolocation
│   ├── ai/                   # AI services
│   │   ├── geminiService.ts  # Chatbot
│   │   └── imageGenService.ts # Image generation
│   └── recommendation.service.ts  # Recommendations
│
├── hooks/               # Custom React hooks
│   ├── useAppLogic.ts   # Main app orchestration
│   ├── useAuthLogic.ts  # Authentication flow
│   ├── useChatsLogic.ts # Chat management
│   └── useOrdersLogic.ts # Order management
│
├── context/             # React Context (State)
│   └── AuthContext.tsx  # User auth & profile state
│
├── types/               # TypeScript definitions
├── utils/               # Utility functions
├── data/                # Mock data & constants
├── styles/              # Global styles
│
├── App.tsx              # Root component
└── main.tsx             # Entry point
```

## 🛠️ Development

### Environment Variables

Create `frontend/.env`:

```env
# Firebase (required)
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Supabase (required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Google Gemini (required for chatbot)
VITE_GEMINI_API_KEY=your_gemini_key
```

See [Setup Guide](../docs/SETUP.md) for getting API keys.

### Commands

```bash
npm run dev        # Start development server (port 3000)
npm run build      # Production build
npm run preview    # Preview production build locally
```

## 📱 PWA Features

This is a **Progressive Web App** with:

- **Offline Support**: Works without internet (cached data)
- **Auto-Update**: Service worker checks for updates
- **Installable**: Can be added to home screen
- **Fast Loading**: Aggressive caching for quick startup

### Service Worker

Managed by Vite PWA plugin. See `vite.config.ts` for caching strategies.

### Icons

PWA icons in `public/icons/` (72x72 to 512x512). Referenced in manifest via `vite.config.ts`.

## 🎨 Styling

Uses **Tailwind CSS** for utility-first styling.

- **Theme**: Dark theme with accent colors
- **Colors**: Indigo primary, dark background
- **Responsive**: Mobile-first design

## 🔄 State Management

**Primary**: React Context (`AuthContext`)
- User authentication state
- User profile & role
- Provided via `useAuth()` hook

**Component State**: React `useState` for local state

**Data Fetching**: Services (firebase.service, order.service, etc.)

## 🚀 Build & Deployment

### Build

```bash
npm run build
```

Creates optimized build in `dist/` directory.

### Deploy to Vercel

1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel settings
3. Vercel auto-deploys on git push

```bash
# Manual build
npm run build
# Deploy dist/ to Vercel
```

## 🐛 Troubleshooting

**Port 3000 in use**
```bash
npm run dev -- --port 5173
```

**Hot reload not working**
- Ensure file is saved
- Check browser console for errors

**Environment variables not loading**
- Must start with `VITE_`
- Restart dev server after changes

See [Setup Guide Troubleshooting](../docs/SETUP.md#troubleshooting).

## 📊 Performance

- **Code Splitting**: Views are lazily loaded
- **Bundle Size**: ~150KB gzipped (main bundle)
- **Caching**: Multi-level PWA caching (up to 1 year for fonts)
- **Lighthouse**: Target score 90+ on all metrics

## 🔒 Security

- API keys in `.env` only (never committed)
- Firebase Auth handles tokens
- Firestore rules must be enabled (currently permissive)
- CSP headers recommended for deployment

## 📚 Related Documentation

- **Setup Guide**: [docs/SETUP.md](../docs/SETUP.md)
- **Architecture**: [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- **Backend**: [backend/README.md](../backend/README.md)
- **Database**: [docs/database/README.md](../docs/database/README.md)
- **Code Conventions**: [.github/copilot-instructions.md](../.github/copilot-instructions.md)

## 💡 Tips

- Use Chrome DevTools > Application tab to inspect PWA cache
- Test offline mode: DevTools > Network > Offline
- Generate Lighthouse report: Ctrl+Shift+I > Lighthouse
- Check service worker: DevTools > Application > Service Workers

---

Made with ❤️ using React, Vite, and Tailwind CSS
