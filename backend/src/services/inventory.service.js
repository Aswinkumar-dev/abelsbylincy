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
 * @param {number|string} productId - Optional fallback product ID / SKU if variantId is not directly supplied
 */
const adjustStock = async (connection, variantId, quantity, movementType, referenceType = null, referenceId = null, note = null, productId = null, productName = null, productSlug = null, productSku = null) => {
  let targetVariantId = variantId;

  if (!targetVariantId && (productId || productName || productSlug || productSku)) {
    try {
      const cleanP = productId ? String(productId).trim() : '';
      const numP = (!isNaN(cleanP) && Number(cleanP) > 0) ? Number(cleanP) : -1;
      const cleanName = productName ? String(productName).trim() : '';
      const cleanSlug = productSlug ? String(productSlug).trim() : '';
      const cleanSku = productSku ? String(productSku).trim() : '';

      const [vars] = await connection.query(
        `SELECT pv.id FROM product_variants pv 
         LEFT JOIN products p ON pv.product_id = p.id 
         WHERE (pv.id = ?) 
            OR (pv.sku = ? AND ? != '') 
            OR (p.id = ?) 
            OR (p.uuid = ? AND ? != '') 
            OR (p.sku = ? AND ? != '') 
            OR (pv.sku = ? AND ? != '')
            OR (p.slug = ? AND ? != '') 
            OR (p.name = ? AND ? != '')
         ORDER BY pv.is_default DESC, pv.id ASC LIMIT 1`,
        [
          numP, 
          cleanSku, cleanSku, 
          numP, 
          cleanP, cleanP, 
          cleanSku, cleanSku, 
          cleanP, cleanP, 
          cleanSlug, cleanSlug, 
          cleanName, cleanName
        ]
      );
      if (vars.length > 0) {
        targetVariantId = vars[0].id;
      }
    } catch (e) {
      console.warn('⚠️ Error finding targetVariantId for stock adjustment:', e.message);
    }
  }

  if (targetVariantId) {
    if (quantity < 0) {
      const deductQty = Math.abs(quantity);
      await connection.query(
        'UPDATE product_variants SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 0) - ?) WHERE id = ?',
        [deductQty, targetVariantId]
      );
    } else {
      await connection.query(
        'UPDATE product_variants SET stock_quantity = COALESCE(stock_quantity, 0) + ? WHERE id = ?',
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
    } catch (logErr) {
      console.warn('⚠️ Inventory movement log error:', logErr.message);
    }
  }
};

/**
 * Idempotently deducts stock for an entire order exactly once.
 * If inventory_movements already contains records for this order, it safely skips.
 */
const adjustOrderStockOnce = async (connection, orderId, orderNumber, items) => {
  if (!orderId || !Array.isArray(items) || items.length === 0) return;

  try {
    const [existing] = await connection.query(
      `SELECT id FROM inventory_movements 
       WHERE reference_type = 'orders' AND reference_id = ? AND movement_type = 'sale' LIMIT 1`,
      [orderId]
    );

    if (existing.length > 0) {
      return; // Already deducted for this order!
    }

    for (const item of items) {
      const qty = parseInt(item.quantity || 1, 10);
      const varId = item.variant_id || item.variantId || null;
      const prodId = item.product_id || item.productId || item.id || item.sku || null;
      const prodName = (item.name || item.product_name || item.productName || '').trim();
      const prodSlug = (item.slug || '').trim();
      const prodSku = (item.sku || '').trim();

      await adjustStock(
        connection,
        varId,
        -qty,
        'sale',
        'orders',
        orderId,
        `Sale order #${orderNumber || orderId}`,
        prodId,
        prodName,
        prodSlug,
        prodSku
      );
    }
  } catch (err) {
    console.warn('⚠️ adjustOrderStockOnce note:', err.message);
  }
};

module.exports = {
  adjustStock,
  adjustOrderStockOnce
};
