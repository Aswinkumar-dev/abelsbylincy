const db = require('../config/database');

/**
 * Adjusts variant inventory levels and logs movement
 * @param {object} connection - DB connection/transaction instance
 * @param {number} variantId - Product variant ID
 * @param {number} quantity - Quantity change (negative for sales, positive for restocks)
 * @param {string} movementType - 'sale', 'purchase', 'return', 'adjustment', 'damage', 'restock'
 * @param {string} referenceType - 'orders', 'adjustment_sheet', etc.
 * @param {number} referenceId - Reference row ID
 * @param {string} note - Optional narrative description
 * @param {number} productId - Optional fallback product ID if variantId is not directly supplied
 */
const adjustStock = async (connection, variantId, quantity, movementType, referenceType = null, referenceId = null, note = null, productId = null) => {
  let targetVariantId = variantId;

  if (!targetVariantId && productId) {
    try {
      const [vars] = await connection.query(
        `SELECT pv.id FROM product_variants pv 
         LEFT JOIN products p ON pv.product_id = p.id 
         WHERE pv.id = ? OR pv.sku = ? OR p.id = ? OR p.uuid = ? OR p.sku = ? OR p.slug = ? OR (p.name = ? AND p.name != '')
         ORDER BY pv.is_default DESC, pv.id ASC LIMIT 1`,
        [productId, productId, productId, productId, productId, productId, productId]
      );
      if (vars.length > 0) {
        targetVariantId = vars[0].id;
      }
    } catch (_) {}
  }

  if (targetVariantId) {
    if (quantity < 0) {
      const deductQty = Math.abs(quantity);
      await connection.query(
        'UPDATE product_variants SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?',
        [deductQty, targetVariantId]
      );
    } else {
      await connection.query(
        'UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?',
        [quantity, targetVariantId]
      );
    }
  }

  if (productId) {
    try {
      if (quantity < 0) {
        await connection.query(
          `UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?) 
           WHERE id = ? OR uuid = ? OR sku = ? OR slug = ? OR (name = ? AND name != '')`,
          [Math.abs(quantity), productId, productId, productId, productId, productId]
        );
      } else {
        await connection.query(
          `UPDATE products SET stock_quantity = stock_quantity + ? 
           WHERE id = ? OR uuid = ? OR sku = ? OR slug = ? OR (name = ? AND name != '')`,
          [quantity, productId, productId, productId, productId, productId]
        );
      }
    } catch (_) {}
  }

  // Log inventory movement
  try {
    await connection.query(
      `INSERT INTO inventory_movements (variant_id, movement_type, quantity, reference_type, reference_id, note)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [targetVariantId, movementType, quantity, referenceType, referenceId, note]
    );
  } catch {}
};

module.exports = {
  adjustStock
};
