const db = require('../config/database');
const { getStoredReviews, saveStoredReviews, getStoredProducts, getDeletedReviewIds, addDeletedReviewId } = require('../utils/fileStore');

/**
 * Helper to fetch all combined reviews from MySQL and FileStore
 */
const fetchAllCombinedReviews = async () => {
  const deletedIds = new Set((getDeletedReviewIds() || []).map(String));

  // Also fetch any deleted review IDs recorded in MySQL
  try {
    const [delRows] = await db.query('SELECT id FROM deleted_reviews');
    if (Array.isArray(delRows)) {
      delRows.forEach(r => {
        if (r.id) deletedIds.add(String(r.id));
      });
    }
  } catch (_) {}

  let dbReviews = [];

  try {
    const [rows] = await db.query(
      `SELECT r.*, u.first_name, u.last_name, u.email as user_email_account, u.profile_image_url
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC`
    );
    if (Array.isArray(rows)) {
      dbReviews = rows
        .filter(r => !deletedIds.has(String(r.id)))
        .map(r => ({
          id: r.id,
          productId: String(r.product_id),
          productName: r.product_name || '',
          userId: r.user_id || null,
          userEmail: r.user_email || r.user_email_account || '',
          author: r.author_name || [r.first_name, r.last_name].filter(Boolean).join(' ') || (r.user_email || r.user_email_account || '').split('@')[0] || 'Customer',
          rating: Number(r.rating) || 5,
          title: r.title || `${r.rating || 5} Star Rating`,
          text: r.review_text || '',
          is_verified_purchase: Boolean(r.is_verified_purchase),
          status: r.status || 'approved',
          reply: r.reply || '',
          createdAt: r.created_at || new Date().toISOString(),
          created_at: r.created_at || new Date().toISOString()
        }));
    }
  } catch (err) {
    // MySQL offline / not available fallback
    console.warn('⚠️ Review DB query note:', err.message);
  }

  const fileReviews = (getStoredReviews() || []).filter(r => !deletedIds.has(String(r.id)));
  const reviewMap = new Map();

  // 1. Add file reviews first (as baseline fallback)
  fileReviews.forEach(r => {
    const key = String(r.id);
    if (deletedIds.has(key)) return;
    reviewMap.set(key, {
      id: r.id,
      productId: String(r.productId || r.product_id),
      productName: r.productName || r.product_name || '',
      userId: r.userId || r.user_id || null,
      userEmail: r.userEmail || r.user_email || '',
      author: r.author || r.author_name || (r.userEmail || r.user_email || '').split('@')[0] || 'Customer',
      rating: Number(r.rating) || 5,
      title: r.title || `${r.rating || 5} Star Rating`,
      text: r.text || r.review_text || '',
      is_verified_purchase: r.is_verified_purchase !== undefined ? Boolean(r.is_verified_purchase) : true,
      status: r.status || 'approved',
      reply: r.reply || '',
      createdAt: r.createdAt || r.created_at || new Date().toISOString(),
      created_at: r.created_at || r.createdAt || new Date().toISOString()
    });
  });

  // 2. MySQL database reviews take absolute precedence
  dbReviews.forEach(r => {
    const key = String(r.id);
    if (!deletedIds.has(key)) {
      reviewMap.set(key, {
        ...(reviewMap.get(key) || {}),
        ...r
      });
    }
  });

  return Array.from(reviewMap.values()).filter(r => !deletedIds.has(String(r.id))).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

const getAllReviews = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const reviews = await fetchAllCombinedReviews();
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

const getProductReviews = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const { productId } = req.params;
    const allReviews = await fetchAllCombinedReviews();
    const pid = String(productId || '').trim().toLowerCase();

    let identifiers = new Set([pid]);
    try {
      const numId = parseInt(pid.replace(/[^0-9]/g, ''), 10);
      const [prods] = await db.query(
        'SELECT id, name, slug, sku FROM products WHERE id = ? OR slug = ? OR sku = ? LIMIT 1',
        [!isNaN(numId) ? numId : -1, pid, pid]
      );
      if (prods && prods.length > 0) {
        const p = prods[0];
        if (p.id) identifiers.add(String(p.id).toLowerCase());
        if (p.slug) identifiers.add(String(p.slug).toLowerCase());
        if (p.sku) identifiers.add(String(p.sku).toLowerCase());
        if (p.name) identifiers.add(String(p.name).toLowerCase());
      }
    } catch (_) {}

    const reviews = allReviews.filter(r => {
      if (r.status !== 'approved') return false;
      const rProd = String(r.productId || '').trim().toLowerCase();
      const rName = String(r.productName || '').trim().toLowerCase();
      return identifiers.has(rProd) || (rName && identifiers.has(rName));
    });
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    let userId = req.user?.id;
    const { productId, productName, rating, title, reviewText, authorName, userEmail } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ success: false, message: 'Product ID and rating (1-5) are required.' });
    }

    const cleanEmail = (req.user?.email || userEmail || '').trim().toLowerCase();
    const cleanAuthor = (
      authorName ||
      req.user?.name ||
      [req.user?.first_name, req.user?.last_name].filter(Boolean).join(' ') ||
      (cleanEmail ? cleanEmail.split('@')[0] : '') ||
      'Customer'
    ).trim();

    // Look up userId by email if not present
    if (!userId && cleanEmail) {
      try {
        const [uRows] = await db.query('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
        if (uRows && uRows.length > 0) {
          userId = uRows[0].id;
        }
      } catch (err) {
        console.warn('⚠️ User lookup note:', err.message);
      }
    }

    // 1. Strict Lifetime Review Check: maximum 5 reviews per user for a product
    const allReviews = await fetchAllCombinedReviews();
    const existingUserReviews = allReviews.filter(r => 
      String(r.productId) === String(productId) &&
      (
        (userId && r.userId && String(r.userId) === String(userId)) ||
        (cleanEmail && r.userEmail && r.userEmail.toLowerCase() === cleanEmail) ||
        (cleanAuthor && r.author && r.author.toLowerCase() === cleanAuthor.toLowerCase())
      )
    );

    if (existingUserReviews.length >= 5) {
      return res.status(400).json({
        success: false,
        message: 'oops! You have reached the limit of 5 reviews for this product'
      });
    }

    // Determine product name if not passed
    let finalProdName = productName || '';
    if (!finalProdName) {
      try {
        const products = getStoredProducts() || [];
        const p = products.find(item => String(item.id) === String(productId) || String(item.sku) === String(productId));
        if (p) finalProdName = p.name;
      } catch {}
    }

    // Check if user has ordered the product to set is_verified_purchase
    let isVerifiedPurchase = true;
    if (userId) {
      try {
        const [purchases] = await db.query(
          `SELECT oi.id 
           FROM order_items oi
           JOIN orders o ON oi.order_id = o.id
           WHERE o.user_id = ? AND oi.product_id = ? AND o.payment_status = 'paid'`,
          [userId, productId]
        );
        if (purchases && purchases.length > 0) {
          isVerifiedPurchase = true;
        }
      } catch (purchaseErr) {
        console.warn('⚠️ Purchase check note:', purchaseErr.message);
      }
    }

    const reviewId = `rev_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const newReview = {
      id: reviewId,
      productId: String(productId),
      productName: finalProdName || 'Fine Jewellery',
      userId: userId || null,
      userEmail: cleanEmail || '',
      author: cleanAuthor,
      author_name: cleanAuthor,
      rating: Number(rating) || 5,
      title: title || `${rating} Star Rating`,
      text: reviewText || '',
      review_text: reviewText || '',
      is_verified_purchase: isVerifiedPurchase,
      status: 'approved',
      reply: '',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      created_at: new Date().toISOString()
    };

    // Determine product ID & name dynamically
    let realProductId = null;
    const numId = parseInt(String(productId).replace(/[^0-9]/g, ''), 10);
    if (!isNaN(numId) && numId > 0) realProductId = numId;
    try {
      const [pRows] = await db.query(
        'SELECT id, name FROM products WHERE id = ? OR slug = ? OR sku = ? OR name = ? LIMIT 1',
        [realProductId || -1, String(productId), String(productId), String(productName || '')]
      );
      if (pRows.length > 0) {
        realProductId = pRows[0].id;
        if (!finalProdName) finalProdName = pRows[0].name;
      }
    } catch (_) {}

    // 1. Try MySQL insert with dynamic column inspection
    let lastDbError = null;
    try {
      try {
        await db.query('ALTER TABLE reviews MODIFY COLUMN user_id INT NULL');
        await db.query('ALTER TABLE reviews MODIFY COLUMN order_id INT NULL');
      } catch (_) {}

      const [rCols] = await db.query('SHOW COLUMNS FROM reviews');
      const rColNames = rCols.map(c => c.Field);
      const userIdCol = rCols.find(c => c.Field === 'user_id');
      const isUserIdStrictNotNull = userIdCol && userIdCol.Null === 'NO';

      if (!userId && isUserIdStrictNotNull) {
        try {
          const [uRows] = await db.query('SELECT id FROM users ORDER BY id ASC LIMIT 1');
          if (uRows.length > 0) userId = uRows[0].id;
        } catch (_) {}
      }

      const iCols = ['rating'];
      const iPlaceholders = ['?'];
      const iVals = [Number(rating) || 5];

      if (rColNames.includes('product_id')) { 
        iCols.push('product_id'); 
        iPlaceholders.push('?'); 
        iVals.push(realProductId || productId); 
      }
      if (rColNames.includes('product_name')) { 
        iCols.push('product_name'); 
        iPlaceholders.push('?'); 
        iVals.push(finalProdName || 'Fine Jewellery'); 
      }
      if (rColNames.includes('user_id')) {
        if (userId !== null && userId !== undefined) {
          iCols.push('user_id'); 
          iPlaceholders.push('?'); 
          iVals.push(userId); 
        } else if (!isUserIdStrictNotNull) {
          iCols.push('user_id'); 
          iPlaceholders.push('NULL');
        }
      }
      if (rColNames.includes('user_email')) { 
        iCols.push('user_email'); 
        iPlaceholders.push('?'); 
        iVals.push(cleanEmail || null); 
      }
      if (rColNames.includes('author_name')) { 
        iCols.push('author_name'); 
        iPlaceholders.push('?'); 
        iVals.push(cleanAuthor || 'Customer'); 
      }
      if (rColNames.includes('title')) { 
        iCols.push('title'); 
        iPlaceholders.push('?'); 
        iVals.push(title || `${rating} Star Rating`); 
      }
      if (rColNames.includes('review_text')) { 
        iCols.push('review_text'); 
        iPlaceholders.push('?'); 
        iVals.push(reviewText || ''); 
      }
      if (rColNames.includes('is_verified_purchase')) { 
        iCols.push('is_verified_purchase'); 
        iPlaceholders.push('?'); 
        iVals.push(isVerifiedPurchase ? 1 : 0); 
      }
      if (rColNames.includes('status')) { 
        iCols.push('status'); 
        iPlaceholders.push("'approved'"); 
      }
      if (rColNames.includes('order_id')) { 
        iCols.push('order_id'); 
        iPlaceholders.push('NULL'); 
      }

      const [result] = await db.query(
        `INSERT INTO reviews (${iCols.join(', ')}) VALUES (${iPlaceholders.join(', ')})`,
        iVals
      );
      if (result && result.insertId) {
        newReview.id = result.insertId;
      }
    } catch (dbErr) {
      lastDbError = dbErr.message;
      console.warn('⚠️ Review DB insert note (fallback to fileStore):', dbErr.message);
    }

    // 2. Persist to fileStore & memory
    const curStored = getStoredReviews() || [];
    curStored.unshift(newReview);
    saveStoredReviews(curStored);

    res.status(201).json({
      success: true,
      reviewId: newReview.id,
      review: newReview,
      dbSaved: !lastDbError,
      dbError: lastDbError,
      message: 'Review submitted successfully! Thank you.'
    });
  } catch (error) {
    next(error);
  }
};

const updateReviewStatus = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'hidden'

    if (!status || !['approved', 'hidden'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status (approved or hidden) is required.' });
    }

    // 1. Update in MySQL
    try {
      const numId = parseInt(id, 10);
      await db.query(
        'UPDATE reviews SET status = ? WHERE id = ? OR id = ?',
        [status, id, !isNaN(numId) ? numId : -1]
      );
    } catch (dbErr) {
      console.warn('⚠️ Update status DB note:', dbErr.message);
    }

    // 2. Update in FileStore
    const stored = getStoredReviews() || [];
    const updated = stored.map(r => String(r.id) === String(id) ? { ...r, status } : r);
    saveStoredReviews(updated);

    res.status(200).json({ success: true, message: `Review status updated to ${status}` });
  } catch (error) {
    next(error);
  }
};

const replyToReview = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const { id } = req.params;
    const { reply } = req.body;

    // 1. Update in MySQL
    try {
      const numId = parseInt(id, 10);
      await db.query(
        'UPDATE reviews SET reply = ? WHERE id = ? OR id = ?',
        [reply || null, id, !isNaN(numId) ? numId : -1]
      );
    } catch (dbErr) {
      console.warn('⚠️ Review reply DB note:', dbErr.message);
    }

    // 2. Update in FileStore
    const stored = getStoredReviews() || [];
    const updated = stored.map(r => String(r.id) === String(id) ? { ...r, reply: reply || '' } : r);
    saveStoredReviews(updated);

    res.status(200).json({ success: true, message: 'Reply saved successfully.' });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const { id } = req.params;

    // 1. Add to permanent deleted review blacklist
    addDeletedReviewId(id);

    // 2. Delete and record in MySQL
    try {
      const numId = parseInt(id, 10);
      await db.query('DELETE FROM reviews WHERE id = ? OR id = ?', [id, !isNaN(numId) ? numId : -1]);
      await db.query('INSERT IGNORE INTO deleted_reviews (id) VALUES (?)', [String(id)]);
    } catch (dbErr) {
      console.warn('⚠️ Delete review DB note:', dbErr.message);
    }

    // 3. Delete from FileStore
    const stored = getStoredReviews() || [];
    const updated = stored.filter(r => String(r.id) !== String(id));
    saveStoredReviews(updated);

    res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReviews,
  getProductReviews,
  createReview,
  updateReviewStatus,
  replyToReview,
  deleteReview
};
