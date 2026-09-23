const db = require('../config/database');
const {
  getStoredCoupons,
  saveStoredCoupons,
  getDeletedCouponCodes,
  addDeletedCouponCode
} = require('../utils/fileStore');

const DEFAULT_SEED_COUPONS = [
  { id: 'cp1', code: 'WELCOME10', label: 'Welcome 10% Off', discountType: 'percentage', value: 10, minOrder: 50, maxDiscount: 20, expiry: '2026-12-31', active: true, usageLimit: 100, perCustomerLimit: 1 },
  { id: 'cp2', code: 'FIRSTORDER', label: 'First Order Special', discountType: 'percentage', value: 15, minOrder: 80, maxDiscount: 30, expiry: '2026-12-31', active: true, usageLimit: 50, perCustomerLimit: 1 }
];

/**
 * Fetch all active coupons from MySQL and FileStore, excluding deleted coupons
 */
const fetchAllCombinedCoupons = async () => {
  const deletedCodes = new Set((getDeletedCouponCodes() || []).map(c => String(c).trim().toUpperCase()));

  // 1. Also fetch any deleted codes recorded in MySQL
  try {
    const [delRows] = await db.query('SELECT code FROM deleted_coupons');
    if (Array.isArray(delRows)) {
      delRows.forEach(r => {
        if (r.code) deletedCodes.add(String(r.code).trim().toUpperCase());
      });
    }
  } catch (err) {
    // ignore if table not ready
  }

  let dbCoupons = [];
  try {
    const [rows] = await db.query('SELECT * FROM coupons ORDER BY created_at ASC');
    if (Array.isArray(rows) && rows.length > 0) {
      dbCoupons = rows
        .map(r => ({
          id: r.id || `cp_${r.code}`,
          code: String(r.code).trim().toUpperCase(),
          label: r.label || r.code,
          discountType: r.discount_type || 'percentage',
          value: Number(r.value) || 0,
          minOrder: Number(r.min_order) || 0,
          maxDiscount: r.max_discount !== null ? Number(r.max_discount) : null,
          expiry: r.expiry || '',
          active: Boolean(r.active),
          usageLimit: Number(r.usage_limit) || 100,
          perCustomerLimit: Number(r.per_customer_limit) || 1
        }))
        .filter(c => !deletedCodes.has(c.code));
    }
  } catch (err) {
    console.warn('⚠️ Coupon DB query note:', err.message);
  }

  const fileCoupons = (getStoredCoupons() || []).filter(c => !deletedCodes.has(String(c.code).trim().toUpperCase()));

  const couponMap = new Map();

  // 1. Seed defaults if both DB and file are empty and not deleted
  if (dbCoupons.length === 0 && fileCoupons.length === 0) {
    DEFAULT_SEED_COUPONS.forEach(cp => {
      const code = String(cp.code).trim().toUpperCase();
      if (!deletedCodes.has(code)) {
        couponMap.set(code, cp);
      }
    });
  }

  // 2. Add / merge File coupons first (base fallback)
  fileCoupons.forEach(cp => {
    const code = String(cp.code).trim().toUpperCase();
    if (deletedCodes.has(code)) return;
    couponMap.set(code, {
      id: cp.id || `cp_${code}`,
      code,
      label: cp.label || code,
      discountType: cp.discountType || cp.discount_type || 'percentage',
      value: Number(cp.value) || 0,
      minOrder: Number(cp.minOrder !== undefined ? cp.minOrder : (cp.min_order !== undefined ? cp.min_order : 0)),
      maxDiscount: cp.maxDiscount !== undefined && cp.maxDiscount !== null ? Number(cp.maxDiscount) : (cp.max_discount !== undefined && cp.max_discount !== null ? Number(cp.max_discount) : null),
      expiry: cp.expiry || '',
      active: cp.active !== undefined ? Boolean(cp.active) : true,
      usageLimit: Number(cp.usageLimit || cp.usage_limit) || 100,
      perCustomerLimit: Number(cp.perCustomerLimit || cp.per_customer_limit) || 1
    });
  });

  // 3. Add MySQL coupons LAST (MySQL database is ALWAYS authoritative and overrides file cache)
  dbCoupons.forEach(cp => {
    const code = String(cp.code).trim().toUpperCase();
    if (!deletedCodes.has(code)) {
      couponMap.set(code, {
        ...(couponMap.get(code) || {}),
        ...cp
      });
    }
  });

  return Array.from(couponMap.values()).filter(c => !deletedCodes.has(c.code));
};

const getAllCoupons = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const coupons = await fetchAllCombinedCoupons();
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

const createOrUpdateCoupon = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const { id, code, label, discountType, value, minOrder, maxDiscount, expiry, active, usageLimit, perCustomerLimit } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const couponId = id || `cp_${cleanCode}`;
    const couponObj = {
      id: couponId,
      code: cleanCode,
      label: label || cleanCode,
      discountType: discountType || 'percentage',
      value: Number(value) || 0,
      minOrder: Number(minOrder) || 0,
      maxDiscount: maxDiscount !== undefined && maxDiscount !== null && maxDiscount !== '' ? Number(maxDiscount) : null,
      expiry: expiry || '',
      active: active !== undefined ? Boolean(active) : true,
      usageLimit: Number(usageLimit) || 100,
      perCustomerLimit: Number(perCustomerLimit) || 1
    };

    // 1. Remove from deleted coupons (if recreating)
    try {
      await db.query('DELETE FROM deleted_coupons WHERE UPPER(code) = ?', [cleanCode]);
    } catch (_) {}

    const curDeleted = getDeletedCouponCodes();
    const updatedDeleted = curDeleted.filter(c => c !== cleanCode);
    try {
      const { TMP_DELETED_COUPONS_FILE, DELETED_COUPONS_FILE } = require('../utils/fileStore');
      // Update memory & files
      saveStoredCoupons(getStoredCoupons().filter(c => String(c.code).trim().toUpperCase() !== cleanCode));
    } catch (_) {}

    // 2. Upsert into MySQL
    try {
      await db.query(
        `INSERT INTO coupons (id, code, label, discount_type, value, min_order, max_discount, expiry, active, usage_limit, per_customer_limit)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           label = VALUES(label),
           discount_type = VALUES(discount_type),
           value = VALUES(value),
           min_order = VALUES(min_order),
           max_discount = VALUES(max_discount),
           expiry = VALUES(expiry),
           active = VALUES(active),
           usage_limit = VALUES(usage_limit),
           per_customer_limit = VALUES(per_customer_limit),
           updated_at = NOW()`,
        [
          couponId,
          cleanCode,
          couponObj.label,
          couponObj.discountType,
          couponObj.value,
          couponObj.minOrder,
          couponObj.maxDiscount,
          couponObj.expiry || null,
          couponObj.active ? 1 : 0,
          couponObj.usageLimit,
          couponObj.perCustomerLimit
        ]
      );
    } catch (dbErr) {
      console.warn('⚠️ Coupon DB upsert note:', dbErr.message);
    }

    // 3. Upsert into fileStore
    const curStored = getStoredCoupons() || [];
    const existingIdx = curStored.findIndex(c => String(c.code).trim().toUpperCase() === cleanCode || c.id === couponId);
    if (existingIdx >= 0) {
      curStored[existingIdx] = { ...curStored[existingIdx], ...couponObj };
    } else {
      curStored.push(couponObj);
    }
    saveStoredCoupons(curStored);

    res.status(200).json({
      success: true,
      coupon: couponObj,
      message: `Coupon "${cleanCode}" saved successfully.`
    });
  } catch (error) {
    next(error);
  }
};

const deleteCoupon = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const { codeOrId } = req.params;
    if (!codeOrId) {
      return res.status(400).json({ success: false, message: 'Coupon code or ID is required.' });
    }

    const clean = String(codeOrId).trim().toUpperCase();

    // 1. Add to permanent deleted coupon blacklist
    addDeletedCouponCode(clean);

    // 2. Delete and insert into MySQL deleted_coupons
    try {
      await db.query('DELETE FROM coupons WHERE UPPER(code) = ? OR id = ?', [clean, codeOrId]);
      await db.query('INSERT IGNORE INTO deleted_coupons (code) VALUES (?)', [clean]);
    } catch (dbErr) {
      console.warn('⚠️ Delete coupon DB note:', dbErr.message);
    }

    // 3. Delete from FileStore
    const stored = getStoredCoupons() || [];
    const updated = stored.filter(c => String(c.code).trim().toUpperCase() !== clean && c.id !== codeOrId);
    saveStoredCoupons(updated);

    res.status(200).json({ success: true, message: `Coupon "${clean}" deleted successfully.` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCoupons,
  createOrUpdateCoupon,
  deleteCoupon
};
