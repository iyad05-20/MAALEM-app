# Setup Guide - Maalem App

Complete instructions for setting up the Maalem-app monorepo for development.

## Prerequisites

- **Node.js**: v18+ (check with `node -v`)
- **npm**: v9+ (check with `npm -v`)
- **Git**: For version control
- **Code Editor**: VS Code recommended

## Quick Start (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/iyad05-20/Maalem-app.git
cd Maalem-app

# 2. Install dependencies (monorepo)
npm install

# 3. Create environment files
cp frontend/.env.example frontend/.env

# 4. Add your API keys to frontend/.env (see Configuration section)

# 5. Start development
npm run dev
```

Frontend runs at **http://localhost:3000**

---

## Detailed Setup

### 1. Clone Repository

```bash
git clone https://github.com/iyad05-20/Maalem-app.git
cd Maalem-app
```

### 2. Install Dependencies

This project uses **npm workspaces**. Running `npm install` at the root installs dependencies for all workspaces (frontend + backend).

```bash
npm install
```

Workspaces defined in root `package.json`:
- `frontend/` - React/Vite PWA
- `backend/` - Firestore config + API routes

**Note**: `vork/` is a separate Next.js project (see [Vork Separation](#vork-separation))

### 3. Project Structure

```
maalem-app/
├── frontend/               # React/Vite PWA (main app)
│   ├── src/
│   │   ├── components/    # UI components (organized by type)
│   │   ├── views/         # Page-level screens
│   │   ├── services/      # API clients & config
│   │   ├── hooks/         # Custom React hooks
│   │   ├── context/       # React Context (Auth, etc.)
│   │   ├── types/         # TypeScript definitions
│   │   └── ...
│   ├── api/               # Vercel serverless functions
│   ├── public/            # Static assets & PWA icons
│   ├── .env.example       # Environment template
│   └── package.json
├── backend/               # Firebase rules & API config
│   ├── firebase/
│   │   ├── rules/
│   │   └── firestore.rules
│   ├── api/              # Serverless functions (Vercel)
│   ├── config/
│   └── package.json
├── vork/                  # Separate Next.js project (see below)
├── docs/                  # Documentation
│   ├── database/
│   ├── guides/
│   └── ...
└── .github/
    └── copilot-instructions.md
```

### 4. Environment Configuration

#### Frontend Environment Variables

Create `frontend/.env`:

```bash
# Copy from template
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env` and add your API keys:

```env
# Firebase Configuration (Required)
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Supabase Configuration (Required for file uploads)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Google Gemini AI (Required for chatbot)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Cloudflare AI (Required for image generation)
# Note: These are used by API routes, not frontend directly
# Set them in your deployment platform (Vercel) environment
```

**Important**: 
- All frontend variables must be prefixed with `VITE_` to be exposed to the browser
- Never commit `.env` files with real keys
- Use `.env.local` for local development (ignored by git)

#### Getting API Keys

**Firebase**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing
3. Click "Add app" and choose Web
4. Copy the Firebase config object

**Supabase**
1. Go to [Supabase](https://supabase.com)
2. Create a new project or select existing
3. Go to Settings > API
4. Copy URL and anon key

**Google Gemini**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key"
3. Create new API key

**Cloudflare AI**
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to Account > API Tokens
3. Create token for image generation APIs
4. Get Account ID from Account > Workers & Pages

### 5. Run Development Server

**Frontend (Main App)**

```bash
# From root directory
npm run dev
```

Runs on **http://localhost:3000**

**Or from frontend directory**

```bash
cd frontend
npm run dev
```

**Vork (Separate Next.js Project)**

```bash
cd vork
npm run dev
```

Runs on **http://localhost:4028**

### 6. Development Workflow

**File Changes Auto-Reload**: 
- Both Vite and Next.js include hot module replacement
- Changes to files auto-reload in browser

**TypeScript Checking**:
```bash
# Frontend
cd frontend
npx tsc --noEmit

# Vork
cd vork
npm run type-check
```

**Linting & Formatting** (Vork only):
```bash
cd vork
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
npm run format      # Format code
```

Frontend currently has no linting setup.

### 7. Build for Production

**Frontend**

```bash
npm run build
```

Generates optimized build in `frontend/dist/`

**Vork**

```bash
cd vork
npm run build
```

### 8. Testing

Currently, the project **has no test suite**. Consider adding:

```bash
# To add testing (future)
cd frontend
npm install -D vitest @testing-library/react @testing-library/dom
```

---

## Vork Separation

**`vork/`** is a **separate Next.js 15 project** that runs independently.

### Why Separate?
- Different framework (Next.js vs React/Vite)
- Different build system & deployment
- Unclear current purpose/role

### Running Vork
```bash
cd vork
npm install
npm run dev  # Runs on http://localhost:4028
```

### Is Vork Still Used?
- Check with the team about the purpose and current usage
- If legacy/archived: Consider moving to separate repository
- If active: Document its role clearly

---

## Troubleshooting

### Port Already in Use
```bash
# Frontend port 3000 in use
npm run dev -- --port 5173

# Or kill the process
# Windows: netstat -ano | findstr :3000
# macOS/Linux: lsof -i :3000
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Firebase Connection Issues
- Verify Firebase project settings
- Check API key permissions in Firebase Console
- Ensure Firestore database is created
- Check security rules aren't blocking access

### Environment Variables Not Loading
- Ensure variables start with `VITE_`
- Restart dev server after changing `.env`
- Check file is saved and in correct location

### Import Path Errors
- Frontend uses `@/*` alias (maps to root of frontend)
- Vork uses `@/*` alias (maps to `src/`)
- Check import statements match your project

---

## IDE Setup (VS Code)

**Recommended Extensions**:
- ESLint
- Prettier - Code formatter
- TypeScript Vue Plugin (for better type support)
- Tailwind CSS IntelliSense
- Firebase Explorer

**Workspace Settings** (.vscode/settings.json):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## Deployment

### Frontend (Vercel)

1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel project settings
3. Set root directory to `frontend/`
4. Deploy

### Vork (if needed)

Deploy separately:
1. Create new Vercel project
2. Set root directory to `vork/`
3. Deploy

### Firebase/Supabase

- No deployment needed (managed services)
- Ensure production RLS policies are configured
- Monitor quotas and pricing

---

## Next Steps

1. **Read Architecture**: See `docs/ARCHITECTURE.md`
2. **Understand Code Style**: See `.github/copilot-instructions.md`
3. **Check Database Setup**: See `docs/database/README.md`
4. **Review Security**: See `backend/README.md`

---

## Additional Resources

- **Frontend Framework**: [React Docs](https://react.dev)
- **Build Tool**: [Vite Docs](https://vitejs.dev)
- **Styling**: [Tailwind CSS Docs](https://tailwindcss.com)
- **Backend**: [Firebase Docs](https://firebase.google.com/docs)
- **Database**: [Supabase Docs](https://supabase.com/docs)

---

## Getting Help

- Check `.github/copilot-instructions.md` for code conventions
- Review `docs/ARCHITECTURE.md` for system design
- Open an issue on GitHub with detailed error messages
