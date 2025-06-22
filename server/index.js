require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server: SocketServer } = require('socket.io');
// CORS configuration
const corsOptions = {
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true,
};
const io = new SocketServer(server, { cors: corsOptions });



// Middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Increase request body size limit (base64 images can be several MB)
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Serve static files from the project root's 'public/uploads' directory
const projectRoot = path.join(__dirname, '..');
const uploadsDir = path.join(projectRoot, 'public', 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploads with proper headers
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, path) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Serve other static files from the project root's public directory
app.use(express.static(path.join(projectRoot, 'public')));

// Flag to track if MongoDB connected successfully
let mongoConnected = false;

// In-memory database fallback for when MongoDB is unavailable
let inMemoryDb = {
  users: [],
  artworks: [],
  comments: []
};

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  mongoConnected = true;
  console.log('Connected to MongoDB Atlas');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  
  // Try fallback connection
  console.log('Attempting fallback MongoDB connection...');
  mongoose.connect(process.env.MONGODB_FALLBACK_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connected to fallback MongoDB'))
  .catch(fallbackErr => {
    console.error('Fallback MongoDB connection failed:', fallbackErr);
    process.exit(1);
  });
});

// In-memory database fallback middleware
// Fallback mock handlers are only active when we are NOT connected to MongoDB
app.use((req, res, next) => {
  if (mongoConnected) {
    return next(); // real DB is up – skip mocks
  }
  // Add in-memory database to request object
  req.inMemoryDb = inMemoryDb;
  
  // For demonstration/development - creating a temporary mock user
  if (req.url === '/api/users/login' && req.method === 'POST') {
    const { email, password } = req.body;
    if (email === 'test@example.com' && password === 'password') {
      const mockToken = 'mock_jwt_token_' + Date.now();
      return res.json({ token: mockToken });
    }
  }
  
  // Mock for user registration
  if (req.url === '/api/users/register' && req.method === 'POST') {
    const user = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryDb.users.push(user);
    const mockToken = 'mock_jwt_token_' + Date.now();
    return res.json({ token: mockToken });
  }
  
  // Mock for get current user
  if (req.url === '/api/users/me' && req.method === 'GET') {
    return res.json({
      id: '123456',
      username: 'testuser',
      email: 'test@example.com',
      displayName: 'Test User',
      profileImage: '/images/default-avatar.png'
    });
  }
  
  next();
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Import routes
const usersRouter = require('./routes/users');
const artworksRouter = require('./routes/artworks');
const ordersRouter = require('./routes/orders');

// Mount routes
app.use('/api/users', usersRouter);
app.use('/api/artworks', artworksRouter);
app.use('/api/orders', ordersRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/comments', require('./routes/comments'));
// Chat routes
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/messages', require('./routes/messages'));

io.on('connection', (socket) => {
  console.log('💬 Socket connected', socket.id);
  socket.on('join', (conversationId) => {
    socket.join(conversationId);
  });
  socket.on('message', (msg) => {
    // echo to room
    io.to(msg.conversationId).emit('message', msg);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✨ Server running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
});
