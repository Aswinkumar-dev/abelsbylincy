import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, X, ZoomIn, Shield, Truck, RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore, doesReviewMatchProduct } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

export default function ProductPage() {
  const { products, addToCart, toggleWishlist, wishlist, currentUser, formatMoney, showToast, reviews: globalReviews, addReview } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('id');

  const product = products.find(p => p.id === productId || String(p.dbId) === String(productId) || p.slug === productId || p.sku === productId);

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [openTab, setOpenTab] = useState('craftsmanship');
  const [zoomOpen, setZoomOpen] = useState(false);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(1);

  const productReviews = (globalReviews || []).filter(r => {
    if (r.status === 'hidden') return false;
    return doesReviewMatchProduct(r, product) || (productId && String(r.productId).trim().toLowerCase() === String(productId).trim().toLowerCase());
  });

  const userReviewCount = (currentUser && productReviews)
    ? productReviews.filter(r => (
        (r.userId && currentUser.id && String(r.userId) === String(currentUser.id)) ||
        (r.userEmail && currentUser.email && r.userEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
        (r.author && currentUser.name && r.author.toLowerCase() === currentUser.name.toLowerCase()) ||
        (r.author && currentUser.email && r.author.toLowerCase() === currentUser.email.toLowerCase())
      )).length
    : 0;

  useEffect(() => {
    if (!productId) { navigate('/shop'); return; }
    if (!product) { navigate('/shop'); return; }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setSelectedImageIdx(0);
    setSelectedSize(product?.sizes?.[0] || '');
    // Reset color to empty so base product image is always shown first
    setSelectedColor('');
  }, [productId, product, navigate]);

  if (!product) return null;

  const isWishlisted = wishlist.includes(product.id);

  // Dynamic & future-proof related products selection algorithm
  const relatedProducts = React.useMemo(() => {
    if (!product || !products) return [];
    const sameCategory = products.filter(p => p.id !== product.id && p.category === product.category);
    const sameMaterialOrGem = products.filter(p =>
      p.id !== product.id &&
      p.category !== product.category &&
      (p.material === product.material || p.gemstone === product.gemstone)
    );
    const fallbackOther = products.filter(p =>
      p.id !== product.id &&
      p.category !== product.category &&
      p.material !== product.material &&
      p.gemstone !== product.gemstone
    );
    return [...sameCategory, ...sameMaterialOrGem, ...fallbackOther].slice(0, 4);
  }, [product, products]);

  // Build complete image list: Base Images first, then all variant color images so ALL thumbnails are always visible on the left
  const galleryItems = React.useMemo(() => {
    if (!product) return [];
    const items = [];
    const seenUrls = new Set();

    // 1. Base product images first
    const baseImgs = [
      ...(Array.isArray(product.images) ? product.images : []),
      product.image
    ].filter(Boolean);

    baseImgs.forEach(url => {
      if (!seenUrls.has(url)) {
        seenUrls.add(url);
        items.push({ url, color: '', isBase: true });
      }
    });

    // 2. All color variant images
    if (product.colorImages && typeof product.colorImages === 'object') {
      Object.entries(product.colorImages).forEach(([colorName, imgs]) => {
        if (Array.isArray(imgs)) {
          imgs.filter(Boolean).forEach(url => {
            if (!seenUrls.has(url)) {
              seenUrls.add(url);
              items.push({ url, color: colorName, isBase: false });
            }
          });
        }
      });
    }

    // Fallback if no images found
    if (items.length === 0) {
      items.push({ url: '/assets/necklace-hero.webp', color: '', isBase: true });
    }

    return items;
  }, [product]);

  const images = galleryItems.map(item => item.url);

  const handleThumbnailClick = (index) => {
    setSelectedImageIdx(index);
    const item = galleryItems[index];
    if (item && item.color) {
      setSelectedColor(item.color);
    } else {
      setSelectedColor('');
    }
  };

  const handleColorClick = (colorName) => {
    if (selectedColor?.toLowerCase() === colorName?.toLowerCase()) {
      // Toggle back to base image
      setSelectedColor('');
      setSelectedImageIdx(0);
    } else {
      setSelectedColor(colorName);
      // Find first image matching this color in galleryItems
      const colorIdx = galleryItems.findIndex(item => item.color?.toLowerCase() === colorName?.toLowerCase());
      if (colorIdx !== -1) {
        setSelectedImageIdx(colorIdx);
      }
    }
  };

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      showToast('Please select a size', 'alert-circle');
      return;
    }
    addToCart(product.id, qty, selectedSize, selectedColor);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) { showToast('Please sign in to leave a review', 'alert-circle'); return; }
    if (userReviewCount >= 5) {
      showToast('oops! You have reached the limit of 5 reviews for this product', 'alert-circle');
      return;
    }
    const authorUsername = currentUser.name || (currentUser.email ? currentUser.email.split('@')[0] : 'Verified Buyer');
    const res = await addReview({
      productId: product.dbId ? String(product.dbId) : product.id,
      productName: product.name,
      author: authorUsername,
      userEmail: currentUser.email || '',
      userId: currentUser.id || null,
      rating: reviewRating,
      text: reviewText,
      title: `${reviewRating} Star Rating`
    });
    if (res && res.success === false) {
      return;
    }
    setReviewText('');
    setReviewRating(1);
    setReviewFormOpen(false);
  };

  const accordionTabs = [
    { id: 'craftsmanship', label: 'Craftsmanship', content: 'Each piece in our collection is thoughtfully chosen for its beauty and everyday durability. Finished with multiple layers of 18K gold plating for a lasting shine, every item passes a strict quality inspection before it reaches you.' },
    { id: 'shipping', label: 'Shipping & Delivery', content: 'Complimentary standard shipping on Australian orders over $60. Orders are dispatched within 1-2 business days in our signature velvet presentation box. Track your parcel with our Australia Post tracking link sent via email.' },
    { id: 'care', label: 'Jewellery Care', content: `To maintain the lustre of your ${product.name}: Store in provided velvet pouch, avoid contact with water and perfumes, remove before exercising, clean gently with a soft dry cloth. With proper care, your gold plating will last 1-3+ years.` },
  ];

  return (
    <>
      {/* Breadcrumb Navigation Bar */}
      <div className="breadcrumb-bar">
        <div className="container">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/shop" className="breadcrumb-link">Shop</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to={`/shop?category=${product.category}`} className="breadcrumb-link" style={{ textTransform: 'capitalize' }}>{product.category}</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </div>
      </div>

      {/* Main PDP Grid Layout */}
      <div className="container">
        <div className="pdp-grid">

            {/* Left Column: Image Gallery */}
          <div className="pdp-gallery-wrapper">
            <div className="pdp-thumbnails">
              {galleryItems.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  className={`thumbnail-btn${i === selectedImageIdx ? ' active' : ''}`}
                  onClick={() => handleThumbnailClick(i)}
                  title={item.color ? `Color: ${item.color}` : 'Base image'}
                >
                  <img src={item.url} alt={`${product.name} thumbnail ${i + 1}`} />
                </button>
              ))}
            </div>

            <div className="pdp-main-image" onClick={() => setZoomOpen(true)}>
              <img
                src={images[selectedImageIdx] || product.image}
                alt={product.name}
                onError={(e) => {
                  const filename = (images[selectedImageIdx] || product.image || '').split('/').pop();
                  e.target.onerror = null;
                  e.target.src = `/assets/${decodeURIComponent(filename)}`;
                }}
              />
              <button className="product-zoom-btn" onClick={(e) => { e.stopPropagation(); setZoomOpen(true); }} aria-label="Zoom image" style={{ position: 'absolute', bottom: 12, right: 12, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                <ZoomIn style={{ width: 18, height: 18 }} />
              </button>
            </div>
          </div>

          {/* Right Column: Product Details */}
          <div className="pdp-info">
            <p className="pdp-header-category">{product.category}</p>
            <h1 className="pdp-title">{product.name}</h1>

            <div className="pdp-rating-row">
              <div className="stars" style={{ display: 'flex', color: 'var(--gold)' }}>
                {[1,2,3,4,5].map(i => {
                  const avg = productReviews.length > 0 ? (productReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / productReviews.length) : 5;
                  return <Star key={i} style={{ width: 14, height: 14, fill: i <= Math.round(avg) ? 'var(--gold)' : 'none', color: 'var(--gold)' }} />;
                })}
              </div>
              <span className="review-count" style={{ fontSize: 13, color: 'var(--slate)' }}>
                {productReviews.length > 0 ? `${(productReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / productReviews.length).toFixed(1)} (${productReviews.length} reviews)` : '(0 reviews)'}
              </span>
            </div>

            <div className="pdp-price-row" style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              {product.salePrice && product.salePrice > 0 && Number(product.salePrice) < Number(product.price) ? (
                <>
                  <span style={{ textDecoration: 'line-through', color: 'var(--slate)', fontSize: 20, fontWeight: 400 }}>{formatMoney(product.price)}</span>
                  <span className="pdp-price" style={{ fontSize: 28, fontWeight: 700, color: 'var(--onyx)' }}>{formatMoney(product.salePrice)}</span>
                </>
              ) : (
                <span className="pdp-price" style={{ fontSize: 28, fontWeight: 700, color: 'var(--onyx)' }}>{formatMoney(product.price)}</span>
              )}
            </div>

            <p className="pdp-description">{product.description}</p>

            {/* Quality Badges */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--onyx)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Truck style={{ width: 15, color: 'var(--gold)' }} /> Free Standard Shipping Over $60
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--onyx)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCcw style={{ width: 15, color: 'var(--gold)' }} /> 7-Day Easy Returns
              </span>
            </div>

            {/* Color Variant Options */}
            {(product.colors?.length > 0 || (product.colorImages && Object.keys(product.colorImages).length > 0)) && (
              <div className="pdp-option-group" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span className="pdp-option-label" style={{ margin: 0, fontWeight: 700 }}>
                    COLOR: {selectedColor ? selectedColor.toUpperCase() : 'DEFAULT'}
                  </span>
                  {selectedColor && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedColor('');
                        setSelectedImageIdx(0);
                      }}
                      style={{ fontSize: 12, color: 'var(--gold-dark)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      View Base Image
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {Array.from(new Set([
                    ...(product.colors || []),
                    ...Object.keys(product.colorImages || {})
                  ])).filter(c => c && c.trim()).map(col => {
                    const isSelected = selectedColor?.toLowerCase() === col?.toLowerCase();
                    return (
                      <button
                        key={col}
                        type="button"
                        className={`btn-secondary${isSelected ? ' active' : ''}`}
                        style={{
                          padding: '8px 16px',
                          fontSize: 13,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          borderColor: isSelected ? 'var(--gold)' : 'var(--border)',
                          background: isSelected ? 'var(--gold)' : 'transparent',
                          color: isSelected ? '#FFFFFF' : 'var(--onyx)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => handleColorClick(col)}
                      >
                        {col}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Options & Ring Size Guide */}
            {(product.sizes?.length > 0 || ((product.category && String(product.category).toLowerCase().includes('ring')) || (product.name && String(product.name).toLowerCase().includes('ring')))) && (
              <div className="pdp-option-group" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <span className="pdp-option-label" style={{ margin: 0, fontWeight: 700 }}>
                    {product.sizes?.length > 0 ? `SIZE: ${selectedSize || product.sizes[0]}` : 'SIZE: STANDARD / ADJUSTABLE FIT'}
                  </span>
                  {((product.category && String(product.category).toLowerCase().includes('ring')) || (product.name && String(product.name).toLowerCase().includes('ring'))) && (
                    <button
                      type="button"
                      onClick={() => setSizeModalOpen(true)}
                      style={{
                        fontSize: 12.5,
                        color: 'var(--gold-dark)',
                        textDecoration: 'underline',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontWeight: 600,
                        padding: '2px 0'
                      }}
                    >
                      <span>Ring Size Guide</span>
                    </button>
                  )}
                </div>
                {product.sizes?.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {product.sizes.map(s => (
                      <button
                        key={s}
                        type="button"
                        className={`btn-secondary${selectedSize === s ? ' active' : ''}`}
                        style={{
                          minWidth: 44,
                          padding: '8px 14px',
                          fontSize: 13,
                          borderColor: selectedSize === s ? 'var(--gold)' : 'var(--border)',
                          background: selectedSize === s ? 'var(--cream)' : 'none',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedSize(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quantity + Add to Cart Row */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>-</button>
                <span style={{ padding: '0 12px', fontSize: 14, fontWeight: 600 }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>+</button>
              </div>

              <button
                className="btn-primary"
                style={{ flex: 1, padding: '15px 28px', fontSize: 13, letterSpacing: '0.1em' }}
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingBag style={{ width: 16, height: 16, display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }} />
                {product.inStock ? 'ADD TO BAG' : 'SOLD OUT'}
              </button>

              <button
                className={`action-btn${isWishlisted ? ' active' : ''}`}
                style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => toggleWishlist(product.id)}
                title="Wishlist"
              >
                <Heart style={{ width: 20, height: 20, fill: isWishlisted ? 'var(--danger)' : 'none', color: isWishlisted ? 'var(--danger)' : 'currentColor' }} />
              </button>
            </div>

            {/* Accordion Info Tabs */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              {accordionTabs.map(tab => (
                <div key={tab.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <button
                    onClick={() => setOpenTab(openTab === tab.id ? '' : tab.id)}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: 'var(--onyx)' }}
                  >
                    {tab.label}
                    {openTab === tab.id ? <ChevronUp style={{ width: 16 }} /> : <ChevronDown style={{ width: 16 }} />}
                  </button>
                  {openTab === tab.id && (
                    <div style={{ paddingBottom: 16, fontSize: 13, lineHeight: 1.6, color: 'var(--slate)', textAlign: 'justify' }}>
                      <p style={{ margin: 0, textAlign: 'justify' }}>{tab.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="section-padding" style={{ background: 'var(--cream)' }}>
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">Client Experiences</p>
            <h2 className="section-title">Reviews ({productReviews.length})</h2>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            {currentUser && userReviewCount >= 5 ? (
              <div style={{
                maxWidth: 520,
                margin: '0 auto',
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: 8,
                padding: '12px 18px',
                color: '#B91C1C',
                fontSize: 13,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 6px rgba(185, 28, 28, 0.08)'
              }}>
                <span>oops! You have reached the limit of 5 reviews for this product</span>
              </div>
            ) : (
              <button className="btn-secondary" onClick={() => { if (!currentUser) { navigate('/account'); } else { setReviewFormOpen(r => !r); } }}>
                Write a Review {currentUser && userReviewCount > 0 ? `(${userReviewCount}/5)` : ''}
              </button>
            )}
          </div>

          {reviewFormOpen && currentUser && (
            <form onSubmit={handleReviewSubmit} style={{ maxWidth: 600, margin: '0 auto 24px auto', background: 'var(--cloud-white)', padding: 24, borderRadius: 8, border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: 8 }}>Rating (Mandatory)</p>
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {[1,2,3,4,5].map(i => (
                  <button key={i} type="button" onClick={() => setReviewRating(i)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Star style={{ width: 24, height: 24, fill: i <= reviewRating ? 'var(--gold)' : 'none', color: 'var(--gold)' }} />
                  </button>
                ))}
              </div>

              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate)', marginBottom: 8 }}>Feedback (Optional)</p>
              <textarea
                style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid var(--border)', fontSize: 14, outline: 'none', marginBottom: 16, boxSizing: 'border-box' }}
                rows={4}
                placeholder="write your feedback"
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-primary">Submit Review</button>
                <button type="button" className="btn-secondary" onClick={() => setReviewFormOpen(false)}>Cancel</button>
              </div>
            </form>
          )}

          {productReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4px 0 12px 0', color: 'var(--slate)' }}>
              <p style={{ fontSize: 15, textAlign: 'center', margin: 0 }}>No reviews yet. Be the first to review this piece!</p>
            </div>
          ) : (
            <div className="bs-grid">
              {productReviews.map(r => (
                <div key={r.id} style={{ background: 'var(--cloud-white)', padding: 20, borderRadius: 8, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold)', color: 'var(--onyx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                      {r.author?.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--onyx)', margin: 0 }}>{r.author}</p>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--slate)', margin: 0, marginTop: 2 }}>{r.date}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', color: 'var(--gold)', marginBottom: 8 }}>
                    {[...Array(r.rating || 5)].map((_, i) => <Star key={i} style={{ width: 13, height: 13, fill: 'var(--gold)', color: 'var(--gold)' }} />)}
                  </div>
                  {r.title && <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--onyx)', marginBottom: 6 }}>{r.title}</p>}
                  {r.text && <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--slate)', margin: 0 }}>{r.text}</p>}
                  {r.reply && (
                    <div style={{ background: 'var(--cream)', padding: 12, borderRadius: 6, marginTop: 10, fontSize: 12.5, borderLeft: '3px solid var(--gold)', lineHeight: 1.5 }}>
                      <strong style={{ color: 'var(--onyx)', display: 'block', marginBottom: 2 }}>Store Response:</strong>
                      <span style={{ color: 'var(--slate)' }}>{r.reply}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="section-padding">
          <div className="container">
            <div className="section-header">
              <p className="section-subtitle">You May Also Like</p>
              <h2 className="section-title">Related Pieces</h2>
            </div>
            <div className="bs-grid">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Zoom Modal */}
      {zoomOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setZoomOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
            <button onClick={() => setZoomOpen(false)} style={{ position: 'absolute', top: -40, right: 0, color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }}><X style={{ width: 24, height: 24 }} /></button>
            <img src={images[selectedImageIdx]} alt={product.name} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain' }} />
          </div>
        </div>
      )}

      {/* Ring Size Guide Modal */}
      {sizeModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setSizeModalOpen(false)}>
          <div style={{ background: '#fff', padding: 'clamp(20px, 4vw, 32px)', borderRadius: 12, maxWidth: 620, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 600, margin: 0, color: 'var(--onyx)' }}>Find Your Ring Size</h3>
              <button onClick={() => setSizeModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} aria-label="Close modal">
                <X style={{ width: 22, height: 22, color: 'var(--onyx)' }} />
              </button>
            </div>

            {/* Steps Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
              <div style={{ background: 'var(--cream)', padding: 14, borderRadius: 8, border: '1px solid var(--border)', textAlign: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, background: 'var(--gold-dark)', color: '#fff', borderRadius: '50%', fontWeight: 'bold', fontSize: 12, marginBottom: 8 }}>1</span>
                <p style={{ fontSize: 12, lineHeight: 1.4, color: 'var(--slate)', margin: 0 }}>Wrap a thin strip of paper or string around your finger.</p>
              </div>
              <div style={{ background: 'var(--cream)', padding: 14, borderRadius: 8, border: '1px solid var(--border)', textAlign: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, background: 'var(--gold-dark)', color: '#fff', borderRadius: '50%', fontWeight: 'bold', fontSize: 12, marginBottom: 8 }}>2</span>
                <p style={{ fontSize: 12, lineHeight: 1.4, color: 'var(--slate)', margin: 0 }}>Mark the exact spot where the ends meet.</p>
              </div>
              <div style={{ background: 'var(--cream)', padding: 14, borderRadius: 8, border: '1px solid var(--border)', textAlign: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, background: 'var(--gold-dark)', color: '#fff', borderRadius: '50%', fontWeight: 'bold', fontSize: 12, marginBottom: 8 }}>3</span>
                <p style={{ fontSize: 12, lineHeight: 1.4, color: 'var(--slate)', margin: 0 }}>Measure the length in mm to find your circumference.</p>
              </div>
            </div>

            {/* Size Conversion Chart Header */}
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: 'var(--onyx)', marginBottom: 12, borderLeft: '3px solid var(--gold-dark)', paddingLeft: 8 }}>
              Size Conversion Chart
            </h4>

            <div style={{ overflowX: 'auto', marginBottom: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: 'var(--onyx)', color: '#fff', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }}>
                    <th style={{ padding: '8px 6px' }}>AU / UK</th>
                    <th style={{ padding: '8px 6px' }}>US / CA</th>
                    <th style={{ padding: '8px 6px' }}>EU Size</th>
                    <th style={{ padding: '8px 6px' }}>Circumference</th>
                    <th style={{ padding: '8px 6px' }}>Diameter</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { au: 'H', us: '4', eu: '46.5', circ: '46.8 mm', dia: '14.8 mm' },
                    { au: 'J', us: '4.75', eu: '48', circ: '48.0 mm', dia: '15.3 mm' },
                    { au: 'L', us: '5.75', eu: '50', circ: '50.0 mm', dia: '15.9 mm' },
                    { au: 'M', us: '6.25', eu: '51', circ: '51.2 mm', dia: '16.2 mm' },
                    { au: 'N', us: '6.75', eu: '52', circ: '52.5 mm', dia: '16.5 mm' },
                    { au: 'O', us: '7.25', eu: '54', circ: '54.0 mm', dia: '17.2 mm' },
                    { au: 'P', us: '7.75', eu: '55', circ: '55.3 mm', dia: '17.5 mm' },
                    { au: 'Q', us: '8.25', eu: '57', circ: '57.0 mm', dia: '18.2 mm' },
                    { au: 'R', us: '8.75', eu: '58', circ: '58.3 mm', dia: '18.5 mm' },
                    { au: 'T', us: '9.75', eu: '61', circ: '60.8 mm', dia: '19.4 mm' },
                  ].map((row, idx) => (
                    <tr key={row.au} style={{ background: idx % 2 === 0 ? 'var(--cream)' : 'transparent', borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '7px 6px', fontWeight: 700, color: 'var(--gold-dark)' }}>{row.au}</td>
                      <td style={{ padding: '7px 6px', fontWeight: 600 }}>{row.us}</td>
                      <td style={{ padding: '7px 6px', color: 'var(--slate)' }}>{row.eu}</td>
                      <td style={{ padding: '7px 6px', color: 'var(--onyx)' }}>{row.circ}</td>
                      <td style={{ padding: '7px 6px', color: 'var(--slate)' }}>{row.dia}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Helpful tips */}
            <ul style={{ fontSize: 11.5, lineHeight: 1.6, color: 'var(--slate)', paddingLeft: 18, margin: 0, textAlign: 'left' }}>
              <li>Measure your finger at the end of the day when hands are at their normal temperature.</li>
              <li>Avoid measuring when your hands are cold, as fingers can be up to half a size smaller.</li>
              <li>If you are between two sizes, we recommend selecting the larger size for the most comfortable fit.</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
