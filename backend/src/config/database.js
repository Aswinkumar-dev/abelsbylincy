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
