# Maalem App - Marketplace Platform

<div align="center">

**Maalem** is a modern Progressive Web App (PWA) marketplace platform connecting clients with local artisans for home services.

[Quick Start](#quick-start) • [Documentation](#documentation) • [Architecture](#architecture) • [Deployment](#deployment)

</div>

## 🎯 Overview

Maalem connects homeowners with trusted local craftspeople for services like:
- Plumbing, carpentry, electrical work
- Painting, renovation, maintenance
- And 10+ other home service categories

### ✨ Key Features

- **Progressive Web App (PWA)**: Installable on mobile with offline support and auto-updates
- **Role-Based Interfaces**: Separate experiences for clients and artisans
- **Real-Time Chat**: Direct messaging between clients and service providers (WebSocket)
- **Geolocation**: Real-time distance calculations and location-based recommendations
- **Order Management**: Complete workflow from request to completion with ratings and photos
- **AI-Powered**: Chatbot assistant and image generation for service listings
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Scalable Architecture**: Independent frontend and backend for easy deployment

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/iyad05-20/Maalem-app.git
cd Maalem-app

# Install dependencies (all workspaces)
npm install

# Configure environment
cp apps/frontend/.env.example apps/frontend/.env
cp apps/backend/.env.example apps/backend/.env
# Edit both .env files with your API keys

# Start both frontend and backend
npm run dev

# Or run separately:
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:3001
```

See [Complete Setup Guide](docs/SETUP.md) for detailed instructions.

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[SETUP.md](docs/SETUP.md)** | Installation & configuration guide |
| **[MONOREPO_STRUCTURE.md](docs/MONOREPO_STRUCTURE.md)** | Project structure & workspace setup |
| **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | System design & component structure |
| **[API.md](docs/API.md)** | Backend API endpoint documentation |
| **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** | Deployment to Vercel (frontend) & Heroku (backend) |
| **[database/README.md](docs/database/README.md)** | Database schemas & configurations |
| **.github/copilot-instructions.md** | Code conventions & style guide |

## 🏗️ Architecture

### ✨ New Scalable Architecture (v2.0)

**Previously**: Monolithic app on Vercel with Firestore backend  
**Now**: Separated frontend and backend for independent scaling

### Tech Stack

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS (Vercel)
- **Backend**: Node.js + Express + WebSocket (Heroku)
- **Database**: Firebase (Firestore) or Supabase (PostgreSQL)
- **Real-Time**: Socket.io WebSockets
- **APIs**: Google Gemini (AI), Cloudflare AI (Image Generation)
- **Type Sharing**: Shared TypeScript types via npm workspaces

### Project Structure

```
maalem-app/
├── apps/
│   ├── frontend/              # React/Vite PWA (Vercel)
│   │   ├── src/
│   │   │   ├── components/   # UI components
│   │   │   ├── views/        # Page screens
│   │   │   ├── services/
│   │   │   │   ├── api.client.ts      # NEW: HTTP client
│   │   │   │   ├── websocket.client.ts # NEW: WebSocket client
│   │   │   │   └── ...other services
│   │   │   └── ...
│   │   ├── package.json
│   │   └── .env.example
│   │
│   └── backend/              # Express API (Heroku)
│       ├── src/
│       │   ├── server.ts     # Entry point
│       │   ├── routes/       # API endpoints
│       │   ├── controllers/  # Business logic
│       │   ├── services/     # Database access
│       │   ├── middleware/   # Auth, error handling
│       │   └── websocket/    # Socket.io setup
│       ├── dist/             # Compiled output
│       ├── package.json
│       ├── Procfile          # Heroku config
│       └── .env.example
│
├── shared/                   # Shared types (npm workspace)
│   ├── types/
│   │   ├── User.ts          # User types
│   │   ├── Order.ts         # Order types
│   │   ├── API.ts           # Response types
│   │   └── index.ts         # Exports
│   └── package.json
│
├── archived/                 # Old projects
│   └── vork/                 # Previous v1 project
│
├── docs/                     # Documentation
│   ├── SETUP.md
│   ├── MONOREPO_STRUCTURE.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── database/
│
├── package.json              # Root monorepo config
└── README.md
```

See [Monorepo Structure Guide](docs/MONOREPO_STRUCTURE.md) for details.

## 💻 Development

### Start All Services

```bash
npm run dev           # Frontend (3000) + Backend (3001)
```

### Start Individual Services

```bash
npm run dev:frontend  # http://localhost:3000 (Vite)
npm run dev:backend   # http://localhost:3001 (Express)
```

### Build All

```bash
npm run build         # Build frontend + backend
npm run build:frontend
npm run build:backend
npm run type-check    # TypeScript validation
```

### Environment Variables

**Frontend** (`apps/frontend/.env`):
```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
VITE_GEMINI_API_KEY=...
```

**Backend** (`apps/backend/.env`):
```env
PORT=3001
JWT_SECRET=your-secret-key
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

See [SETUP.md](docs/SETUP.md) for complete setup instructions.

## 🌐 Deployment

### Frontend → Vercel

```bash
npm run build:frontend
# Deploy dist/ folder to Vercel
```

1. Connect GitHub to Vercel
2. Set `VITE_API_URL` to your backend URL (e.g., Heroku)
3. Vercel auto-deploys on push

### Backend → Heroku

```bash
npm run build:backend
# Deploy to Heroku
```

```bash
heroku login
heroku create maalem-backend
git push heroku main
```

Set environment variables:
```bash
heroku config:set -a maalem-backend \
  JWT_SECRET=your-secret \
  FIREBASE_SERVICE_ACCOUNT='{}' \
  ...
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete deployment guide.

## 🔍 Architecture Highlights

### Data Flow

```
User → Frontend UI → api.client.ts → Backend API → Firebase/Supabase
                    ↓
                  WebSocket Socket.io ← Backend broadcasts events
```

### Real-Time Features

- Chat messages sent over WebSocket
- Order status updates pushed to clients
- User presence tracking (online/offline)
- Notifications delivered via WebSocket

### Authentication

- JWT tokens issued by backend on login
- Tokens stored in localStorage
- Backend validates tokens on each request
- Automatic token refresh before expiry

## 🔒 Security

- **Backend-Only DB Access**: Frontend never touches database
- **JWT Authentication**: Stateless auth with tokens
- **CORS**: Restricted to authorized domains
- **Environment Variables**: Credentials in backend only
- **WebSocket Auth**: Tokens validated on connection

## 🐛 Troubleshooting

**Backend won't start**
```bash
# Check environment variables
cat apps/backend/.env

# Check port 3001 availability
lsof -i :3001
```

**Frontend can't reach backend**
```bash
# Verify VITE_API_URL is correct
cat apps/frontend/.env

# Test backend is running
curl http://localhost:3001/health
```

**WebSocket connection fails**
- Check VITE_WS_URL is correct
- Verify backend is running
- Check browser console for errors

See [SETUP.md](docs/SETUP.md#troubleshooting) for more solutions.

## 📖 Additional Resources

- **Setup Guide**: [docs/SETUP.md](docs/SETUP.md)
- **Monorepo Structure**: [docs/MONOREPO_STRUCTURE.md](docs/MONOREPO_STRUCTURE.md)
- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **API Reference**: [docs/API.md](docs/API.md)
- **Deployment**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Code Conventions**: [.github/copilot-instructions.md](.github/copilot-instructions.md)

## 📞 Support

- 📋 Create an [Issue](https://github.com/iyad05-20/Maalem-app/issues) for bugs
- 💬 Check [Discussions](https://github.com/iyad05-20/Maalem-app/discussions) for questions
- 📧 For security issues, email the maintainers privately

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

<div align="center">

**[Setup Guide](docs/SETUP.md)** • **[Architecture](docs/MONOREPO_STRUCTURE.md)** • **[Deployment](docs/DEPLOYMENT.md)** • **[API Reference](docs/API.md)**

Made with ❤️ by the Maalem team

</div>
