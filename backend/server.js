const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const User = require('./Users');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY';

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Use environment variable for MongoDB in production, fallback to local
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/linkedin_auth_db";

mongoose.connect(MONGO_URI)
  .then(() => console.log("🚀 Successfully connected to MongoDB!"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


// ----------------- ROUTES -----------------

// 1. REGISTER ROUTE
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // This triggers your userSchema.pre('save') hook to hash the password!
    const user = await User.create({ name, email, password });

    res.status(201).json({ success: true, message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. LOGIN ROUTE
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user and explicitly include password since 'select: false' is on the schema
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Trigger your custom schema method from User.js
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

  res.cookie('token', token, {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',  // ✅ Automatically true in production
  maxAge: 24 * 60 * 60 * 1000
});

    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. SESSION CHECK ROUTE
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
});

// 4. LOGOUT ROUTE
app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// Start the server when run directly (local dev). When deployed on Vercel
// the builder will import this file as a module — do not call listen there.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
} else {
  module.exports = app;
}
