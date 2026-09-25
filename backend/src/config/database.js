const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'abels_ecommerce',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 4000,
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
    if (!colNames.includes('sku')) {
      await connection.query('ALTER TABLE products ADD COLUMN sku VARCHAR(120) NULL AFTER slug');
      try {
        await connection.query('ALTER TABLE products ADD UNIQUE KEY uq_products_sku (sku)');
      } catch {}
      console.log('Migrated: Added sku column to products table.');
    }
    if (!colNames.includes('price')) {
      await connection.query('ALTER TABLE products ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER description');
      console.log('Migrated: Added price column to products table.');
    }
    if (!colNames.includes('is_best_seller')) {
      await connection.query('ALTER TABLE products ADD COLUMN is_best_seller TINYINT(1) NOT NULL DEFAULT 0 AFTER is_new_arrival');
      console.log('Migrated: Added is_best_seller column to products table.');
    }
    if (!colNames.includes('is_active')) {
      await connection.query('ALTER TABLE products ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1');
      console.log('Migrated: Added is_active column to products table.');
    }

    // 2. Check product_images columns
    const [imgCols] = await connection.query('SHOW COLUMNS FROM product_images');
    const imgColNames = imgCols.map(c => c.Field);
    
    if (!imgColNames.includes('color')) {
      await connection.query('ALTER TABLE product_images ADD COLUMN color VARCHAR(50) NULL AFTER is_primary');
      console.log('Migrated: Added color column to product_images table.');
    }

    // 3. Ensure orders, order_addresses, order_items, payments, refunds, and stripe_webhook_events tables exist
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          uuid VARCHAR(100) NULL,
          order_number VARCHAR(100) UNIQUE NOT NULL,
          user_id INT NULL,
          guest_email VARCHAR(255) NULL,
          currency VARCHAR(10) DEFAULT 'AUD',
          subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
          discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
          tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
          shipping_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
          total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
          status VARCHAR(50) DEFAULT 'confirmed',
          payment_status VARCHAR(50) DEFAULT 'paid',
          fulfillment_status VARCHAR(50) DEFAULT 'unfulfilled',
          shipping_method_id INT NULL,
          tracking_number VARCHAR(100) NULL,
          placed_at DATETIME NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_orders_user (user_id),
          INDEX idx_orders_email (guest_email),
          INDEX idx_orders_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      try {
        const [oCols] = await connection.query('SHOW COLUMNS FROM orders');
        const oColNames = oCols.map(c => c.Field);
        if (oColNames.includes('currency')) {
          await connection.query("ALTER TABLE orders MODIFY COLUMN currency VARCHAR(10) DEFAULT 'AUD'");
        } else {
          await connection.query("ALTER TABLE orders ADD COLUMN currency VARCHAR(10) DEFAULT 'AUD' AFTER guest_email");
        }
        if (oColNames.includes('user_id')) {
          await connection.query("ALTER TABLE orders MODIFY COLUMN user_id INT NULL");
        }
        if (oColNames.includes('guest_email')) {
          await connection.query("ALTER TABLE orders MODIFY COLUMN guest_email VARCHAR(255) NULL");
        }
      } catch (oErr) {
        console.warn('Orders column migration note:', oErr.message);
      }

      await connection.query(`
        CREATE TABLE IF NOT EXISTS order_addresses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          address_type VARCHAR(20) DEFAULT 'shipping',
          first_name VARCHAR(100) NULL,
          last_name VARCHAR(100) NULL,
          company VARCHAR(255) NULL,
          address_line_1 VARCHAR(255) NULL,
          address_line_2 VARCHAR(255) NULL,
          suburb VARCHAR(100) NULL,
          state VARCHAR(100) NULL,
          postcode VARCHAR(20) NULL,
          country VARCHAR(100) DEFAULT 'Australia',
          country_code VARCHAR(10) DEFAULT 'AU',
          phone VARCHAR(50) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_order_addr (order_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          product_id VARCHAR(100) NULL,
          variant_id INT NULL,
          sku VARCHAR(100) NULL,
          product_name VARCHAR(255) NOT NULL,
          variant_name VARCHAR(100) NULL,
          quantity INT NOT NULL DEFAULT 1,
          unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
          discount_amount DECIMAL(10, 2) DEFAULT 0,
          tax_amount DECIMAL(10, 2) DEFAULT 0,
          total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
          product_image_url TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_order_items (order_id),
          INDEX idx_product (product_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS payments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NULL,
          stripe_payment_intent_id VARCHAR(255) NULL,
          idempotency_key VARCHAR(255) NULL,
          payment_method_type VARCHAR(50) DEFAULT 'card',
          card_brand VARCHAR(30) NULL,
          card_last4 CHAR(4) NULL,
          amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
          currency VARCHAR(10) DEFAULT 'AUD',
          status VARCHAR(50) DEFAULT 'succeeded',
          failure_code VARCHAR(100) NULL,
          failure_message TEXT NULL,
          paid_at DATETIME NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_payments_order (order_id),
          INDEX idx_payments_intent (stripe_payment_intent_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS refunds (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          payment_id INT NULL,
          stripe_refund_id VARCHAR(255) NULL,
          amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
          status VARCHAR(50) DEFAULT 'succeeded',
          reason VARCHAR(255) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_refunds_order (order_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS stripe_webhook_events (
          id INT AUTO_INCREMENT PRIMARY KEY,
          stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
          event_type VARCHAR(100) NOT NULL,
          payload LONGTEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

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
      if (payColNames.includes('provider')) {
        await connection.query("ALTER TABLE payments MODIFY COLUMN provider VARCHAR(50) DEFAULT 'stripe'");
      }
      if (payColNames.includes('amount_received')) {
        await connection.query("ALTER TABLE payments MODIFY COLUMN amount_received DECIMAL(10,2) DEFAULT 0");
      }
    } catch (payErr) {
      console.warn('⚠️ Payments & orders table migration note:', payErr.message);
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

    // 5. Check categories table for Silver Collections & Seasonal Collections
    try {
      const [existingCats] = await connection.query('SELECT slug FROM categories');
      const catSlugs = existingCats.map(c => c.slug);
      if (!catSlugs.includes('silver-collections')) {
        await connection.query(
          `INSERT INTO categories (name, slug, description, image_url, sort_order, is_active)
           VALUES ('Silver Collections', 'silver-collections', 'Exquisite sterling silver jewellery and artisanal pieces.', 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796760/abels_by_lincy/silver_collection_category.webp', 7, TRUE)`
        );
        console.log('Migrated: Seeded Silver Collections into categories table.');
      }
      if (!catSlugs.includes('seasonal-collections')) {
        await connection.query(
          `INSERT INTO categories (name, slug, description, image_url, sort_order, is_active)
           VALUES ('Seasonal Collections', 'seasonal-collections', 'Curated seasonal jewellery pieces and limited releases.', 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796758/abels_by_lincy/Sesonal_collections_category.png', 8, TRUE)`
        );
        console.log('Migrated: Seeded Seasonal Collections into categories table.');
      }
      if (!catSlugs.includes('pair-collections')) {
        await connection.query(
          `INSERT INTO categories (name, slug, description, image_url, sort_order, is_active)
           VALUES ('Pair Collections', 'pair-collections', 'Curated pair collections, matching sets, and coordinated fine jewellery.', 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796758/abels_by_lincy/Sesonal_collections_category.png', 9, TRUE)`
        );
        console.log('Migrated: Seeded Pair Collections into categories table.');
      }
    } catch (catErr) {
      // ignore if categories table is not created yet
    }

    // 6. Check password_reset_tokens table
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          token_hash VARCHAR(255) NOT NULL,
          expires_at DATETIME NOT NULL,
          used_at DATETIME NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_user_created (user_id, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    } catch (tokenTableErr) {
      console.warn('⚠️ Password reset tokens migration note:', tokenTableErr.message);
    }

    // 7. Check user_carts table for persistent multi-device cart
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS user_carts (
          user_email VARCHAR(255) PRIMARY KEY,
          user_id INT NULL,
          cart_json LONGTEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('Migrated: Ensured user_carts table exists.');
    } catch (cartTableErr) {
      console.warn('⚠️ User carts table migration note:', cartTableErr.message);
    }

    // 8. Check contact_messages table
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'unread',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('Migrated: Ensured contact_messages table exists.');
    } catch (contactTableErr) {
      console.warn('⚠️ Contact messages table migration note:', contactTableErr.message);
    }

    // 9. Check newsletter_subscribers table
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          id VARCHAR(100) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          status VARCHAR(50) DEFAULT 'Active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('Migrated: Ensured newsletter_subscribers table exists.');
    } catch (subTableErr) {
      console.warn('⚠️ Newsletter table migration note:', subTableErr.message);
    }

    // 10. Check reviews table & columns
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS reviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          product_id VARCHAR(100) NOT NULL,
          product_name VARCHAR(255) NULL,
          user_id INT NULL,
          user_email VARCHAR(255) NULL,
          author_name VARCHAR(255) NULL,
          rating INT NOT NULL DEFAULT 5,
          title VARCHAR(255) NULL,
          review_text TEXT NULL,
          is_verified_purchase TINYINT(1) DEFAULT 1,
          status VARCHAR(50) DEFAULT 'approved',
          reply TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_prod (product_id),
          INDEX idx_user (user_id),
          INDEX idx_user_email (user_email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      const [revCols] = await connection.query('SHOW COLUMNS FROM reviews');
      const revColNames = revCols.map(c => c.Field);

      if (!revColNames.includes('product_name')) {
        await connection.query('ALTER TABLE reviews ADD COLUMN product_name VARCHAR(255) NULL AFTER product_id');
        console.log('Migrated: Added product_name column to reviews table.');
      }
      if (!revColNames.includes('user_email')) {
        await connection.query('ALTER TABLE reviews ADD COLUMN user_email VARCHAR(255) NULL AFTER user_id');
        console.log('Migrated: Added user_email column to reviews table.');
      }
      if (!revColNames.includes('author_name')) {
        await connection.query('ALTER TABLE reviews ADD COLUMN author_name VARCHAR(255) NULL AFTER user_email');
        console.log('Migrated: Added author_name column to reviews table.');
      }
      if (!revColNames.includes('reply')) {
        await connection.query('ALTER TABLE reviews ADD COLUMN reply TEXT NULL AFTER status');
        console.log('Migrated: Added reply column to reviews table.');
      }
      if (revColNames.includes('order_id')) {
        await connection.query('ALTER TABLE reviews MODIFY COLUMN order_id INT NULL');
      }
      if (revColNames.includes('user_id')) {
        await connection.query('ALTER TABLE reviews MODIFY COLUMN user_id INT NULL');
      }
      if (revColNames.includes('product_id')) {
        await connection.query('ALTER TABLE reviews MODIFY COLUMN product_id VARCHAR(100) NOT NULL');
      }
      console.log('Migrated: Ensured reviews table & columns exist.');
    } catch (revTableErr) {
      console.warn('⚠️ Reviews table migration note:', revTableErr.message);
    }

    // 11. Check deleted_reviews table
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS deleted_reviews (
          id VARCHAR(100) PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('Migrated: Ensured deleted_reviews table exists.');
    } catch (delRevErr) {
      console.warn('⚠️ Deleted reviews table migration note:', delRevErr.message);
    }

    // 12. Check coupons table
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS coupons (
          id VARCHAR(100) PRIMARY KEY,
          code VARCHAR(100) UNIQUE NOT NULL,
          label VARCHAR(255) NULL,
          discount_type VARCHAR(50) DEFAULT 'percentage',
          value DECIMAL(10, 2) NOT NULL DEFAULT 0,
          discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
          min_order DECIMAL(10, 2) DEFAULT 0,
          max_discount DECIMAL(10, 2) NULL,
          expiry VARCHAR(50) NULL,
          expires_at DATETIME NULL,
          active TINYINT(1) DEFAULT 1,
          is_active TINYINT(1) DEFAULT 1,
          usage_limit INT DEFAULT 100,
          per_customer_limit INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      const [cpCols] = await connection.query('SHOW COLUMNS FROM coupons');
      const cpColNames = cpCols.map(c => c.Field);

      if (!cpColNames.includes('label')) {
        await connection.query('ALTER TABLE coupons ADD COLUMN label VARCHAR(255) NULL AFTER code');
      }
      if (!cpColNames.includes('discount_type')) {
        await connection.query("ALTER TABLE coupons ADD COLUMN discount_type VARCHAR(50) DEFAULT 'percentage' AFTER label");
      }
      if (!cpColNames.includes('value')) {
        await connection.query('ALTER TABLE coupons ADD COLUMN value DECIMAL(10, 2) NOT NULL DEFAULT 0 AFTER discount_type');
      }
      if (!cpColNames.includes('discount_value')) {
        await connection.query('ALTER TABLE coupons ADD COLUMN discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0 AFTER value');
      }
      if (!cpColNames.includes('min_order')) {
        await connection.query('ALTER TABLE coupons ADD COLUMN min_order DECIMAL(10, 2) DEFAULT 0 AFTER discount_value');
      }
      if (!cpColNames.includes('max_discount')) {
        await connection.query('ALTER TABLE coupons ADD COLUMN max_discount DECIMAL(10, 2) NULL AFTER min_order');
      }
      if (!cpColNames.includes('expiry')) {
        await connection.query('ALTER TABLE coupons ADD COLUMN expiry VARCHAR(50) NULL AFTER max_discount');
      }
      if (!cpColNames.includes('expires_at')) {
        await connection.query('ALTER TABLE coupons ADD COLUMN expires_at DATETIME NULL AFTER expiry');
      }
      if (!cpColNames.includes('active')) {
        await connection.query('ALTER TABLE coupons ADD COLUMN active TINYINT(1) DEFAULT 1 AFTER expires_at');
      }
      if (!cpColNames.includes('is_active')) {
        await connection.query('ALTER TABLE coupons ADD COLUMN is_active TINYINT(1) DEFAULT 1 AFTER active');
      }
      if (!cpColNames.includes('usage_limit')) {
        await connection.query('ALTER TABLE coupons ADD COLUMN usage_limit INT DEFAULT 100 AFTER is_active');
      }
      if (!cpColNames.includes('per_customer_limit')) {
        await connection.query('ALTER TABLE coupons ADD COLUMN per_customer_limit INT DEFAULT 1 AFTER usage_limit');
      }

      console.log('Migrated: Ensured coupons table and all columns exist.');
    } catch (couponErr) {
      console.warn('⚠️ Coupons table migration note:', couponErr.message);
    }

    // 13. Check deleted_coupons table
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS deleted_coupons (
          code VARCHAR(100) PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('Migrated: Ensured deleted_coupons table exists.');
    } catch (delCpErr) {
      console.warn('⚠️ Deleted coupons table migration note:', delCpErr.message);
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
