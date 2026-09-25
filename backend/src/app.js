const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/error.middleware');

// Routes imports
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const reviewRoutes = require('./routes/review.routes');
const adminRoutes = require('./routes/admin.routes');
const cmsRoutes = require('./routes/cms.routes');
const contactRoutes = require('./routes/contact.routes');
const newsletterRoutes = require('./routes/newsletter.routes');
const couponRoutes = require('./routes/coupon.routes');
const wishlistRoutes = require('./routes/wishlist.routes');

const app = express();

// CORS config
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express parser with raw buffer preservation for Stripe webhook verification
app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    if (req.originalUrl && req.originalUrl.includes('/webhook')) {
      req.body = buf; // preserve raw body buffer for stripe validation
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Serverless URL normalizer (handles cases where Vercel rewrites strip /api prefix)
app.use((req, res, next) => {
  if (req.url && !req.url.startsWith('/api') && req.url !== '/' && !req.url.startsWith('/health')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  next();
});

// Root & Health check endpoints
app.get(['/', '/api'], (req, res) => {
  res.status(200).json({
    success: true,
    message: "Abel's By Lincy Backend API is active and running!",
    version: "1.0.0",
    health: "/health"
  });
});

app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date() });
});

app.get(['/db-status', '/api/db-status'], async (req, res) => {
  const db = require('./config/database');
  try {
    const [rows] = await db.query('SELECT 1 as connected');
    const [prodCount] = await db.query('SELECT count(*) as total FROM products');
    let orderCount = 0;
    let orderError = null;
    try {
      const [oCount] = await db.query('SELECT count(*) as total FROM orders');
      orderCount = oCount[0]?.total ?? 0;
    } catch (oe) {
      orderError = oe.message;
    }

    res.status(200).json({
      success: true,
      connected: true,
      dbHost: process.env.DB_HOST || 'default (localhost)',
      dbName: process.env.DB_NAME || 'default',
      dbUser: process.env.DB_USER || 'default',
      productsInMySQL: prodCount[0]?.total ?? 0,
      ordersInMySQL: orderCount,
      orderError: orderError
    });
  } catch (err) {
    res.status(200).json({
      success: false,
      connected: false,
      dbHost: process.env.DB_HOST || 'not configured (defaults to 127.0.0.1)',
      dbName: process.env.DB_NAME || 'not configured',
      error: err.message,
      code: err.code
    });
  }
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Base route handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found.' });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
