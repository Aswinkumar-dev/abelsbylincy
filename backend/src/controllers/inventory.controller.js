const db = require('../config/database');
const { getStoredProducts, saveStoredProducts } = require('../utils/fileStore');

const ensureInventoryTables = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS inventory_movements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        variant_id INT NULL,
        movement_type VARCHAR(50) NOT NULL,
        quantity INT NOT NULL,
        reference_type VARCHAR(50) NULL,
        reference_id INT NULL,
        note TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_im_variant (variant_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  } catch (err) {
    console.warn('⚠️ inventory_movements table creation note:', err.message);
  }
};

/**
 * Adjust stock for a single product / variant and record in MySQL inventory_movements
 */
const adjustStock = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    const { productId, sku, delta, newQty, reason, movementType } = req.body;
    const deltaNum = parseInt(delta, 10) || 0;

    if (!productId && !sku) {
      return res.status(400).json({ success: false, message: 'Product ID or SKU is required.' });
    }

    await ensureInventoryTables();

    // 1. Locate product and its default/active variant in MySQL
    let targetVariantId = null;
    let targetProductId = null;
    let currentVarStock = 10;
    let productName = 'Jewellery Piece';
    let productSku = sku || 'ABL-JEW';
    let productUuid = productId || '';

    try {
      const cleanId = String(productId || '').trim();
      const cleanSku = String(sku || '').trim();

      const [pRows] = await db.query(
        `SELECT p.id, p.uuid, p.name, p.sku, p.slug, pv.id as variant_id, pv.stock_quantity as variant_stock, pv.sku as variant_sku
         FROM products p
         LEFT JOIN product_variants pv ON p.id = pv.product_id
         WHERE p.id = ? OR p.uuid = ? OR p.sku = ? OR p.slug = ? OR pv.id = ? OR pv.sku = ?
         ORDER BY pv.is_default DESC, pv.id ASC LIMIT 1`,
        [
          (!isNaN(cleanId) && Number(cleanId) > 0) ? Number(cleanId) : -1,
          cleanId,
          cleanSku,
          cleanId,
          (!isNaN(cleanId) && Number(cleanId) > 0) ? Number(cleanId) : -1,
          cleanSku
        ]
      );

      if (pRows.length > 0) {
        const row = pRows[0];
        targetProductId = row.id;
        targetVariantId = row.variant_id;
        currentVarStock = Number(row.variant_stock !== null && row.variant_stock !== undefined ? row.variant_stock : 10);
        productName = row.name || productName;
        productSku = row.sku || row.variant_sku || productSku;
        productUuid = row.uuid || productUuid;
      }
    } catch (findErr) {
      console.warn('⚠️ Product lookup in adjustStock note:', findErr.message);
    }

    // Determine target quantity
    let calculatedStock;
    if (newQty !== undefined && newQty !== null && !isNaN(Number(newQty))) {
      calculatedStock = Math.max(0, Number(newQty));
    } else {
      calculatedStock = Math.max(0, currentVarStock + deltaNum);
    }
    const effectiveDelta = deltaNum !== 0 ? deltaNum : (calculatedStock - currentVarStock);

    // 2. Update stock in MySQL product_variants and products tables
    if (targetVariantId) {
      try {
        await db.query('UPDATE product_variants SET stock_quantity = ? WHERE id = ?', [calculatedStock, targetVariantId]);
      } catch (_) {}
    }
    if (targetProductId) {
      try {
        await db.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [calculatedStock, targetProductId]);
        await db.query('UPDATE product_variants SET stock_quantity = ? WHERE product_id = ?', [calculatedStock, targetProductId]);
      } catch (_) {}
    }

    // 3. Log movement into inventory_movements table
    const type = movementType || (effectiveDelta > 0 ? 'restock' : 'adjustment');
    const note = reason || (effectiveDelta > 0 ? `Stock intake (+${effectiveDelta})` : `Stock reduction (${effectiveDelta})`);

    let movementRecordId = null;
    try {
      const [insertRes] = await db.query(
        `INSERT INTO inventory_movements (variant_id, movement_type, quantity, reference_type, note)
         VALUES (?, ?, ?, 'manual_adjustment', ?)`,
        [targetVariantId || null, type, effectiveDelta, note]
      );
      movementRecordId = insertRes.insertId;
    } catch (logErr) {
      console.warn('⚠️ Failed to insert into inventory_movements:', logErr.message);
    }

    // 4. Update fileStore fallback if available
    try {
      const fileProds = getStoredProducts() || [];
      const updated = fileProds.map(fp => {
        const match = (productId && (fp.id === productId || fp.uuid === productId)) ||
                      (sku && fp.sku && fp.sku.toLowerCase() === sku.toLowerCase()) ||
                      (productName && fp.name && fp.name.toLowerCase() === productName.toLowerCase());
        if (match) {
          return { ...fp, stockQty: calculatedStock, stock_quantity: calculatedStock, inStock: calculatedStock > 0 };
        }
        return fp;
      });
      saveStoredProducts(updated);
    } catch (_) {}

    const movementObj = {
      id: movementRecordId ? `sh_${movementRecordId}` : `sh_${Date.now()}`,
      dbId: movementRecordId,
      productId: productUuid || productId,
      sku: productSku,
      productName,
      change: effectiveDelta,
      reason: note,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      stockAfter: calculatedStock,
      timestamp: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      message: `Stock updated for ${productName} (${calculatedStock} units remaining)`,
      newStock: calculatedStock,
      movement: movementObj
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Restock all low-stock items by adding fixed quantity and logging to inventory_movements
 */
const restockAllLowStock = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    const qtyToAdd = parseInt(req.body?.quantity, 10) || 10;
    const threshold = parseInt(req.body?.threshold, 10) || 8;

    await ensureInventoryTables();

    // Query all variants / products at or below threshold
    let variantsToRestock = [];
    try {
      const [rows] = await db.query(
        `SELECT pv.id as variant_id, pv.product_id, pv.sku as variant_sku, pv.stock_quantity, p.name, p.sku, p.uuid 
         FROM product_variants pv
         JOIN products p ON pv.product_id = p.id
         WHERE pv.stock_quantity <= ? AND p.is_active = TRUE`,
        [threshold]
      );
      variantsToRestock = rows;
    } catch (_) {}

    const recordedMovements = [];

    for (const v of variantsToRestock) {
      const nextQty = (v.stock_quantity || 0) + qtyToAdd;
      try {
        await db.query('UPDATE product_variants SET stock_quantity = ? WHERE id = ?', [nextQty, v.variant_id]);
        await db.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [nextQty, v.product_id]);

        const [mRes] = await db.query(
          `INSERT INTO inventory_movements (variant_id, movement_type, quantity, reference_type, note)
           VALUES (?, 'restock', ?, 'batch_restock', ?)`,
          [v.variant_id, qtyToAdd, `Batch restock low stock (+${qtyToAdd})`]
        );

        recordedMovements.push({
          id: `sh_${mRes.insertId}`,
          dbId: mRes.insertId,
          productId: v.uuid || String(v.product_id),
          sku: v.sku || v.variant_sku || 'ABL-JEW',
          productName: v.name,
          change: qtyToAdd,
          reason: `Batch restock low stock (+${qtyToAdd})`,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          stockAfter: nextQty,
          timestamp: new Date().toISOString()
        });
      } catch (_) {}
    }

    // Also update fileStore
    try {
      const fileProds = getStoredProducts() || [];
      const updated = fileProds.map(fp => {
        const cur = Number(fp.stockQty ?? fp.stock_quantity ?? 0);
        if (cur <= threshold) {
          const next = cur + qtyToAdd;
          return { ...fp, stockQty: next, stock_quantity: next, inStock: true };
        }
        return fp;
      });
      saveStoredProducts(updated);
    } catch (_) {}

    return res.status(200).json({
      success: true,
      message: `Restocked ${variantsToRestock.length} low items by +${qtyToAdd}`,
      restockedCount: variantsToRestock.length,
      movements: recordedMovements
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all inventory movements history from MySQL inventory_movements
 */
const getInventoryHistory = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    await ensureInventoryTables();

    let movements = [];
    try {
      const [rows] = await db.query(
        `SELECT im.*, pv.sku as variant_sku, pv.product_id, pv.stock_quantity as current_stock, p.name as product_name, p.sku as product_sku, p.uuid as product_uuid
         FROM inventory_movements im
         LEFT JOIN product_variants pv ON im.variant_id = pv.id
         LEFT JOIN products p ON pv.product_id = p.id
         ORDER BY im.created_at DESC
         LIMIT 500`
      );

      movements = rows.map(r => ({
        id: `sh_${r.id}`,
        dbId: r.id,
        productId: r.product_uuid || String(r.product_id || r.variant_id || ''),
        sku: r.product_sku || r.variant_sku || 'ABL-JEW',
        productName: r.product_name || 'Jewellery Selection',
        change: r.quantity,
        reason: r.note || r.movement_type || 'Stock movement',
        date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
        stockAfter: r.current_stock !== null && r.current_stock !== undefined ? r.current_stock : 10,
        timestamp: r.created_at
      }));
    } catch (queryErr) {
      console.warn('⚠️ getInventoryHistory DB error:', queryErr.message);
    }

    return res.status(200).json({
      success: true,
      history: movements
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adjustStock,
  restockAllLowStock,
  getInventoryHistory
};
