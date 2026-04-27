# Maalem Backend API Server

Express.js backend for the Maalem marketplace platform. Handles all business logic, database access, authentication, and real-time WebSocket communication.

## 🚀 Quick Start

```bash
# Install dependencies (from root or this directory)
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Firebase credentials and settings

# Development server
npm run dev          # Starts on http://localhost:3001 with hot-reload

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
src/
├── server.ts           # Express app initialization & WebSocket setup
├── routes/             # API route handlers
│   ├── auth.routes.ts      # Authentication endpoints
│   ├── order.routes.ts     # Order management
│   └── artisan.routes.ts   # Artisan profiles & listings
├── controllers/        # Business logic (implementation pending)
│   ├── auth.controller.ts
│   ├── order.controller.ts
│   └── artisan.controller.ts
├── services/           # Database access & external APIs
│   ├── firebase.service.ts # Firebase Admin SDK
│   ├── auth.service.ts
│   ├── order.service.ts
│   └── artisan.service.ts
├── middleware/         # Express middleware
│   ├── auth.middleware.ts  # JWT token validation
│   ├── error.middleware.ts
│   └── cors.middleware.ts
├── types/              # Backend-specific TypeScript types
├── utils/              # Helper functions
└── websocket/          # Socket.io configuration (in server.ts)
```

## 🔌 API Endpoints

See [docs/API.md](../docs/API.md) for complete API documentation.

### Quick Overview

```
POST   /api/auth/register        # User registration
POST   /api/auth/login           # User login
POST   /api/auth/logout          # User logout
POST   /api/auth/refresh-token   # Refresh JWT token

GET    /api/orders               # Get all orders (paginated)
GET    /api/orders/:orderId      # Get order details
POST   /api/orders               # Create new order
PUT    /api/orders/:orderId      # Update order
POST   /api/orders/:orderId/accept    # Accept order (artisan)
POST   /api/orders/:orderId/complete  # Complete order

GET    /api/artisans             # Get all artisans (filtered)
GET    /api/artisans/:artisanId  # Get artisan profile
PUT    /api/artisans/:artisanId  # Update profile
GET    /api/artisans/:artisanId/orders   # Get artisan's orders
GET    /api/artisans/:artisanId/reviews  # Get artisan's reviews
```

## 🔌 WebSocket Events

Real-time communication via Socket.io:

```javascript
// Join order chat
socket.emit('join-order', 'order-123');

// Send chat message
socket.emit('send-message', {
  orderId: 'order-123',
  senderId: 'user-456',
  text: 'Message content'
});

// Receive message
socket.on('receive-message', (data) => { ... });

// Typing indicator
socket.emit('typing', { orderId, userId });
socket.on('user-typing', (data) => { ... });

// Order status update
socket.on('order:updated', (data) => { ... });
```

See [docs/API.md](../docs/API.md) for full WebSocket documentation.

## 🔐 Environment Variables

Required environment variables in `.env`:

```env
# Server
PORT=3001
NODE_ENV=development

# Frontend CORS
FRONTEND_URL=http://localhost:3000

# JWT Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=7d

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Supabase (alternative)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key

# Logging
LOG_LEVEL=info
```

See `.env.example` for more details.

## 🔑 Getting Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Project Settings → Service Accounts tab
4. Click "Generate New Private Key"
5. Copy the entire JSON file contents
6. Paste into `FIREBASE_SERVICE_ACCOUNT` env var (as JSON string)

## 🛠 Development

### Start Server with Hot-Reload
```bash
npm run dev
```

The server will automatically restart when you modify files in `src/`.

### Type Checking
```bash
npm run type-check
```

### Code Linting
```bash
npm run lint
```

### Build TypeScript
```bash
npm run build
```

Output goes to `dist/` directory.

## 📦 Dependencies

### Core
- **express**: HTTP server framework
- **socket.io**: WebSocket real-time communication
- **firebase-admin**: Firebase Admin SDK
- **jsonwebtoken**: JWT token generation & validation
- **bcryptjs**: Password hashing
- **cors**: Cross-Origin Resource Sharing
- **dotenv**: Environment variable loading

### Dev
- **typescript**: TypeScript compiler
- **ts-node**: Run TypeScript directly
- **@types/express**: Express type definitions
- **@types/node**: Node.js type definitions

## 🚀 Deployment

### Deploy to Heroku

```bash
# First time
heroku login
heroku create maalem-backend

# Set environment variables
heroku config:set -a maalem-backend JWT_SECRET=your-secret
heroku config:set -a maalem-backend FIREBASE_SERVICE_ACCOUNT='...'

# Deploy
git push heroku main

# View logs
heroku logs -a maalem-backend --tail
```

### Deploy to Other Platforms

The backend is a standard Node.js/Express app. It can be deployed to:
- AWS EC2, Lambda, Elastic Beanstalk
- Google Cloud Run, App Engine
- Azure App Service
- DigitalOcean App Platform
- Railway, Render, Fly.io

See [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for detailed deployment guide.

## 🔒 Security Checklist

- [ ] `JWT_SECRET` is strong and unique
- [ ] Firebase credentials stored as env var (never in code)
- [ ] `FRONTEND_URL` restricted to production domain
- [ ] HTTPS enforced in production
- [ ] Rate limiting configured
- [ ] Input validation on all endpoints
- [ ] Database access properly authorized
- [ ] Sensitive logs don't expose credentials

## 🐛 Troubleshooting

**Port 3001 already in use**
```bash
PORT=3002 npm run dev
```

**Firebase connection fails**
```bash
# Verify service account JSON is valid
node -e "console.log(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))"
```

**Environment variables not loading**
```bash
# Make sure .env file exists and is in backend directory
ls -la .env
```

**WebSocket connection fails**
- Check `FRONTEND_URL` matches your frontend's actual URL
- Verify JWT token is valid
- Check browser console for connection errors

## 📖 Documentation

- **Full API Reference**: [docs/API.md](../docs/API.md)
- **Deployment Guide**: [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)
- **Monorepo Structure**: [docs/MONOREPO_STRUCTURE.md](../docs/MONOREPO_STRUCTURE.md)
- **Shared Types**: [shared/types/](../shared/types/)

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Add tests for new functionality
4. Ensure type checking passes: `npm run type-check`
5. Commit: `git commit -m "feat: add my feature"`
6. Push: `git push origin feature/my-feature`
7. Create Pull Request

## 📞 Support

- 📋 Issues: [GitHub Issues](https://github.com/iyad05-20/Maalem-app/issues)
- 💬 Questions: [GitHub Discussions](https://github.com/iyad05-20/Maalem-app/discussions)
- 🔒 Security: Email maintainers privately

---

Made with ❤️ as part of the Maalem project
