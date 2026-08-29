const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Run schema migrations to add columns if missing
async function runMigrations(connection) {
  try {
    // 1. Check products columns
    const [prodCols] = await connection.query('SHOW COLUMNS FROM products');
    const colNames = prodCols.map(c => c.Field);
    
    if (!colNames.includes('specifications')) {
      await connection.query('ALTER TABLE products ADD COLUMN specifications JSON NULL AFTER care_instructions');
      console.log('Migrated: Added specifications column to products table.');
    }
    if (!colNames.includes('colors')) {
      await connection.query('ALTER TABLE products ADD COLUMN colors VARCHAR(255) NULL AFTER specifications');
      console.log('Migrated: Added colors column to products table.');
    }

    // 2. Check product_images columns
    const [imgCols] = await connection.query('SHOW COLUMNS FROM product_images');
    const imgColNames = imgCols.map(c => c.Field);
    
    if (!imgColNames.includes('color')) {
      await connection.query('ALTER TABLE product_images ADD COLUMN color VARCHAR(50) NULL AFTER is_primary');
      console.log('Migrated: Added color column to product_images table.');
    }

    // 3. Check payments columns for Stripe integration
    try {
      const [payCols] = await connection.query('SHOW COLUMNS FROM payments');
      const payColNames = payCols.map(c => c.Field);
      
      if (!payColNames.includes('idempotency_key')) {
        await connection.query('ALTER TABLE payments ADD COLUMN idempotency_key VARCHAR(255) NULL AFTER stripe_payment_intent_id, ADD UNIQUE KEY uq_payments_idempotency_key (idempotency_key)');
        console.log('Migrated: Added idempotency_key column to payments table.');
      }
      if (!payColNames.includes('card_brand')) {
        await connection.query('ALTER TABLE payments ADD COLUMN card_brand VARCHAR(30) NULL AFTER payment_method_type');
        console.log('Migrated: Added card_brand column to payments table.');
      }
      if (!payColNames.includes('card_last4')) {
        await connection.query('ALTER TABLE payments ADD COLUMN card_last4 CHAR(4) NULL AFTER card_brand');
        console.log('Migrated: Added card_last4 column to payments table.');
      }
    } catch (payErr) {
      console.warn('⚠️ Payments table migration note:', payErr.message);
    }

    // 4. Check users columns for stripe_customer_id
    try {
      const [userCols] = await connection.query('SHOW COLUMNS FROM users');
      const userColNames = userCols.map(c => c.Field);
      
      if (!userColNames.includes('stripe_customer_id')) {
        await connection.query('ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255) NULL AFTER profile_image_url, ADD UNIQUE KEY uq_users_stripe_customer_id (stripe_customer_id)');
        console.log('Migrated: Added stripe_customer_id column to users table.');
      }
    } catch (userErr) {
      console.warn('⚠️ Users table migration note:', userErr.message);
    }
  } catch (err) {
    console.error('⚠️ Database migration warning (tables may not exist yet):', err.message);
  }
}

// Test connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database pool initialized successfully.');
    await runMigrations(connection);
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
})();

module.exports = pool;
