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
        'SELECT id FROM product_variants WHERE product_id = ? ORDER BY is_default DESC, id ASC LIMIT 1',
        [productId]
      );
      if (vars.length > 0) {
        targetVariantId = vars[0].id;
      }
    } catch (_) {}
  }

  if (!targetVariantId) return;

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
