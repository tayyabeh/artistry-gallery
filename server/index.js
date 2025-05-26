require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MongoDB URI not found in environment variables');
  process.exit(1);
}

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/artworks', require('./routes/artworks'));
app.use('/api/users', require('./routes/users'));
app.use('/api/comments', require('./routes/comments'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
