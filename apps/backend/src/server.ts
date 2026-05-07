import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.routes.js';
import orderRoutes from './routes/order.routes.js';
import artisanRoutes from './routes/artisan.routes.js';
import chatRoutes from './routes/chat.routes.js';

// Import services
import { initializeFirebase } from './services/firebase.service.js';

// Initialize environment variables
dotenv.config();

// Initialize Firebase
initializeFirebase();

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'https://vork-app-v2-main.vercel.app',
];

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(null, false);
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS bloqué : origine non autorisée → ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/chat', chatRoutes); // AI Chat + Image Generation

// WebSocket setup
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a room for a specific order
  socket.on('join-order', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`User ${socket.id} joined order ${orderId}`);
  });

  // Handle chat messages
  socket.on('send-message', (data) => {
    const { orderId, senderId, text } = data;
    io.to(`order-${orderId}`).emit('receive-message', {
      orderId,
      senderId,
      text,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { orderId, userId } = data;
    socket.to(`order-${orderId}`).emit('user-typing', { userId });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server ready for connections`);
});

export { app, io };
