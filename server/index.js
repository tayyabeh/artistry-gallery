require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database fallback for when MongoDB is unavailable
let inMemoryDb = {
  users: [],
  artworks: [],
  comments: []
};

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;
let dbConnected = false;

// Configure MongoDB connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Increased timeout to 30 seconds
  socketTimeoutMS: 45000, // Increased socket timeout
  family: 4, // Force IPv4
  ssl: true,
  // Remove these options if using newer MongoDB versions
  // tls: true,
  // tlsAllowInvalidCertificates: true,
};

// Function to attempt MongoDB connection
const connectToMongoDB = async (uri, options, retryCount = 0) => {
  try {
    console.log(`Attempting to connect to MongoDB (Attempt ${retryCount + 1})...`);
    await mongoose.connect(uri, options);
    console.log('✅ Connected to MongoDB successfully!');
    dbConnected = true;
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // If this was the primary connection attempt, try the fallback
    if (retryCount === 0 && process.env.MONGODB_FALLBACK_URI) {
      console.log('Attempting to connect to fallback MongoDB...');
      try {
        await mongoose.connect(process.env.MONGODB_FALLBACK_URI, options);
        console.log('✅ Connected to fallback MongoDB successfully!');
        dbConnected = true;
        return true;
      } catch (fallbackError) {
        console.error('❌ Fallback MongoDB connection error:', fallbackError.message);
      }
    }
    
    // If we've tried less than 3 times, retry the connection
    if (retryCount < 2) {
      console.log(`Retrying connection in 3 seconds... (${retryCount + 1}/3)`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return connectToMongoDB(uri, options, retryCount + 1);
    }
    
    console.log('🔄 All MongoDB connection attempts failed. Starting with in-memory database fallback.');
    return false;
  }
};

// Start connection process
if (!mongoUri) {
  console.error('MongoDB URI not found in environment variables');
  console.log('Starting server with in-memory database only');
} else {
  // Remove TLS options from URI if they're in connection options
  const cleanUri = mongoUri.split('&').filter(param => 
    !param.startsWith('tls=') && 
    !param.startsWith('tlsAllowInvalidCertificates=')
  ).join('&');
  
  connectToMongoDB(cleanUri, mongooseOptions).then(() => {
    // Connection attempt handled in the function
  });
}

// In-memory database fallback middleware
app.use((req, res, next) => {
  if (dbConnected) {
    return next();
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    dbConnected,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/artworks', require('./routes/artworks'));
app.use('/api/users', require('./routes/users'));
app.use('/api/comments', require('./routes/comments'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✨ Server running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
});
