# API Documentation

This document outlines the backend API endpoints for the Maalem marketplace platform.

## Base URL
- **Development**: `http://localhost:3001/api`
- **Production**: `https://maalem-backend.herokuapp.com/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

All responses follow this format:

```json
{
  "success": boolean,
  "data": {},
  "error": "error message",
  "message": "success message"
}
```

## Error Codes

- `UNAUTHORIZED` (401): Missing or invalid token
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid input data
- `INTERNAL_SERVER_ERROR` (500): Server error

## Endpoints

### Authentication Endpoints

#### Register
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "John Doe",
  "userType": "client" | "artisan"
}

Response:
{
  "success": true,
  "data": {
    "userId": "user-123",
    "token": "jwt-token",
    "user": { /* UserProfile */ }
  }
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": { /* UserProfile */ }
  }
}
```

#### Logout
```
POST /auth/logout
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Refresh Token
```
POST /auth/refresh-token

Response:
{
  "success": true,
  "data": {
    "token": "new-jwt-token"
  }
}
```

### Order Endpoints

#### Get All Orders
```
GET /orders?status=pending&page=1&limit=10
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "items": [ /* Order[] */ ],
    "total": 50,
    "page": 1,
    "pageSize": 10,
    "hasMore": true
  }
}
```

#### Get Order Details
```
GET /orders/:orderId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": { /* OrderDetail */ }
}
```

#### Create Order
```
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "categoryId": "plumbing",
  "title": "Fix leaky faucet",
  "description": "Kitchen sink faucet is leaking",
  "budget": 50,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, NYC"
  },
  "scheduledDate": "2024-02-15T10:00:00Z"
}

Response:
{
  "success": true,
  "data": { /* Order */ }
}
```

#### Update Order
```
PUT /orders/:orderId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "status": "in_progress"
}

Response:
{
  "success": true,
  "message": "Order updated"
}
```

#### Accept Order (Artisan)
```
POST /orders/:orderId/accept
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Order accepted",
  "data": { /* Order */ }
}
```

#### Complete Order
```
POST /orders/:orderId/complete
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Order completed",
  "data": { /* Order */ }
}
```

### Artisan Endpoints

#### Get All Artisans
```
GET /artisans?category=plumbing&minRating=4&page=1
Content-Type: application/json

Response:
{
  "success": true,
  "data": {
    "items": [ /* ArtisanProfile[] */ ],
    "total": 100,
    "hasMore": true
  }
}
```

#### Get Artisan Profile
```
GET /artisans/:artisanId

Response:
{
  "success": true,
  "data": { /* ArtisanProfile with reviews and stats */ }
}
```

#### Update Artisan Profile
```
PUT /artisans/:artisanId
Authorization: Bearer <token>
Content-Type: application/json

{
  "bio": "Expert plumber with 10 years experience",
  "hourlyRate": 50,
  "categories": ["plumbing", "general-maintenance"]
}

Response:
{
  "success": true,
  "message": "Profile updated"
}
```

#### Get Artisan's Orders
```
GET /artisans/:artisanId/orders
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": { /* Order[] */ }
}
```

#### Get Artisan's Reviews
```
GET /artisans/:artisanId/reviews

Response:
{
  "success": true,
  "data": [ /* Review[] */ ]
}
```

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:3001', {
  auth: { token: 'jwt-token' }
});
```

### Chat Events
```javascript
// Join order chat
socket.emit('join-order', 'order-123');

// Send message
socket.emit('send-message', {
  orderId: 'order-123',
  senderId: 'user-456',
  text: 'Message content'
});

// Receive message
socket.on('receive-message', (data) => {
  console.log(`${data.senderId}: ${data.text}`);
});

// Typing indicator
socket.emit('typing', {
  orderId: 'order-123',
  userId: 'user-456'
});

socket.on('user-typing', (data) => {
  console.log(`${data.userId} is typing...`);
});
```

### Order Events
```javascript
// Order created
socket.on('order:created', (data) => {
  console.log('New order:', data.orderId);
});

// Order status updated
socket.on('order:updated', (data) => {
  console.log('Order status:', data.status);
});

// Artisan accepted order
socket.on('order:accepted', (data) => {
  console.log('Artisan accepted:', data.artisanId);
});
```

### Notification Events
```javascript
socket.on('notification:new', (data) => {
  console.log('Notification:', data.message);
});
```

## Rate Limiting

- Auth endpoints: 5 requests per minute per IP
- API endpoints: 100 requests per minute per authenticated user
- WebSocket: 50 messages per minute per user

## Best Practices

1. Always include error handling for failed requests
2. Implement token refresh before expiry
3. Validate input on client side before sending
4. Use pagination for large result sets
5. Reconnect WebSocket with exponential backoff on failure
6. Cache responses where appropriate (GET requests)

## Troubleshooting

**401 Unauthorized**
- Check that token is included in Authorization header
- Verify token hasn't expired
- Ensure token format is: `Bearer <token>`

**403 Forbidden**
- Your user role doesn't have permission for this action
- Contact admin if you believe this is an error

**CORS Error**
- Ensure backend is running
- Check that frontend URL is in CORS whitelist

**WebSocket Connection Failed**
- Verify WebSocket URL is correct
- Check that token is valid
- Ensure backend server is running
