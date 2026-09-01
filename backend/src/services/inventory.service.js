const db = require('../config/database');

/**
 * Adjusts variant inventory levels and logs movement
 * @param {object} connection - DB connection/transaction instance
 * @param {number} variantId - Product variant ID
 * @param {number} quantity - Quantity change (negative for sales, positive for restocks)
 * @param {string} movementType - 'sale', 'purchase', 'return', 'adjustment', 'damage', 'restock'
 * @param {string} referenceType - 'order', 'adjustment_sheet', etc.
 * @param {number} referenceId - Reference row ID
 * @param {string} note - Optional narrative description
 */
const adjustStock = async (connection, variantId, quantity, movementType, referenceType = null, referenceId = null, note = null) => {
  if (quantity < 0) {
    const deductQty = Math.abs(quantity);
    const [result] = await connection.query(
      'UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?',
      [deductQty, variantId, deductQty]
    );

    if (result && result.affectedRows === 0) {
      throw new Error(`INSUFFICIENT_STOCK: Item variant #${variantId} has insufficient stock.`);
    }
  } else {
    await connection.query(
      'UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?',
      [quantity, variantId]
    );
  }

  // Log inventory movement
  try {
    await connection.query(
      `INSERT INTO inventory_movements (variant_id, movement_type, quantity, reference_type, reference_id, note)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [variantId, movementType, quantity, referenceType, referenceId, note]
    );
  } catch {}
};

module.exports = {
  adjustStock
};
