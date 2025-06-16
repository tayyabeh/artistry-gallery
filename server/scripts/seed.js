const path = require('path');
const dotenv = require('dotenv');

// Load .env from server directory
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

console.log('Loading .env from:', envPath);
if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI not found. Please verify your .env file at:', envPath);
  console.log('Current .env contents:');
  try {
    const fs = require('fs');
    console.log(fs.readFileSync(envPath, 'utf8'));
  } catch (err) {
    console.error('Could not read .env file:', err.message);
  }
  process.exit(1);
}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Artwork = require('../models/Artwork');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

const connectWithRetry = async () => {
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    
    // Test connection before proceeding
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    
    // Verify connection is established
    await mongoose.connection.db.admin().ping();
    console.log('✅ Successfully connected to MongoDB Atlas');
    return true;
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    
    if (process.env.MONGODB_FALLBACK_URI) {
      console.log('Attempting fallback connection...');
      try {
        await mongoose.connect(process.env.MONGODB_FALLBACK_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000
        });
        console.log('✅ Connected using fallback URI');
        return true;
      } catch (fallbackErr) {
        console.error('❌ Fallback connection failed:', fallbackErr.message);
      }
    }
    
    console.log('Retrying connection in 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    return connectWithRetry();
  }
};

const seedDatabase = async () => {
  try {
    const isConnected = await connectWithRetry();
    if (!isConnected) {
      throw new Error('Could not establish database connection');
    }
    
    // Set timeout for database operations
    mongoose.connection.on('timeout', () => {
      throw new Error('Database operation timed out');
    });

    console.log('Clearing existing data...');
    
    // Clear collections with timeout protection
    await Promise.all([
      User.deleteMany({}).maxTimeMS(30000),
      Artwork.deleteMany({}).maxTimeMS(30000),
      Category.deleteMany({}).maxTimeMS(30000),
      Order.deleteMany({}).maxTimeMS(30000),
      Cart.deleteMany({}).maxTimeMS(30000)
    ]);

    console.log('Cleared existing data');

    // Create sample users
    const users = [
      {
        name: 'Admin User',
        username: 'admin',
        email: 'admin@artistryhub.com',
        password: await bcrypt.hash('password123', 10),
        role: 'admin',
        isVerified: true,
        avatar: 'https://example.com/avatars/admin.jpg'
      },
      {
        name: 'Artist One',
        username: 'artist1',
        email: 'artist1@artistryhub.com',
        password: await bcrypt.hash('password123', 10),
        role: 'artist',
        isVerified: true,
        bio: 'Digital artist specializing in fantasy landscapes',
        avatar: 'https://example.com/avatars/artist1.jpg'
      },
      {
        name: 'Regular User',
        username: 'user1',
        email: 'user1@artistryhub.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
        isVerified: true,
        avatar: 'https://example.com/avatars/user1.jpg'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    // Create sample categories
    const categories = [
      { name: 'Digital Painting', slug: 'digital-painting' },
      { name: 'Photography', slug: 'photography' },
      { name: '3D Art', slug: '3d-art', isFeatured: true },
      { name: 'Illustration', slug: 'illustration' },
      { name: 'Abstract', slug: 'abstract', isFeatured: true }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Create sample artworks
    const artworks = [
      {
        title: 'Mountain Sunset',
        image: 'https://example.com/artworks/mountain-sunset.jpg',
        description: 'Beautiful digital painting of mountains at sunset',
        price: 49.99,
        category: createdCategories[0]._id,
        creator: createdUsers[1]._id,
        tags: ['landscape', 'sunset', 'mountains'],
        licenseType: 'standard',
        isFeatured: true
      },
      {
        title: 'Urban Photography',
        image: 'https://example.com/artworks/urban-photo.jpg',
        description: 'Black and white urban photography',
        price: 29.99,
        category: createdCategories[1]._id,
        creator: createdUsers[1]._id,
        tags: ['photography', 'blackandwhite', 'urban'],
        licenseType: 'extended'
      },
      {
        title: 'Abstract Composition',
        image: 'https://example.com/artworks/abstract-comp.jpg',
        description: 'Vibrant abstract digital composition',
        price: 39.99,
        category: createdCategories[4]._id,
        creator: createdUsers[1]._id,
        tags: ['abstract', 'colorful', 'modern'],
        licenseType: 'standard',
        isFeatured: true
      }
    ];

    const createdArtworks = await Artwork.insertMany(artworks);
    console.log(`Created ${createdArtworks.length} artworks`);

    // Update category artwork counts
    for (const category of createdCategories) {
      const count = await Artwork.countDocuments({ category: category._id });
      category.artworkCount = count;
      await category.save();
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('🚨 SEEDING FAILED:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
