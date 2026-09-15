import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, AlertTriangle, Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function CartPage() {
  const { cart, products, updateCartQty, removeFromCart, toggleWishlist, wishlist, formatMoney, currentUser } = useStore();
  const navigate = useNavigate();
  const freeShippingThreshold = 60;

  // Enrich cart items with live stock & availability data while preserving items permanently
  const enrichedCart = (cart || []).map(item => {
    const liveProduct = (products || []).find(p => p.id === item.id);
    const isOutOfStock = !liveProduct || !liveProduct.inStock || (liveProduct.stockQty !== undefined && liveProduct.stockQty <= 0);
    const maxAvailable = liveProduct?.stockQty ?? 0;
    const isOverStock = !isOutOfStock && liveProduct && liveProduct.stockQty > 0 && item.quantity > liveProduct.stockQty;
    return {
      ...item,
      liveProduct,
      isOutOfStock,
      maxAvailable,
      isOverStock
    };
  });

  const inStockItems = enrichedCart.filter(i => !i.isOutOfStock);
  const outOfStockItems = enrichedCart.filter(i => i.isOutOfStock);
  
  const subtotal = inStockItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - subtotal);
  const freeShipProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const standardShippingFee = inStockItems.length > 0 ? (subtotal >= freeShippingThreshold ? 0 : 10) : 0;
  const cartTotal = subtotal + standardShippingFee;

  const handleCheckout = () => {
    if (inStockItems.length === 0) return;
    if (!currentUser) { navigate('/account'); return; }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 16px', textAlign: 'center' }}>
        <ShoppingBag style={{ width: 64, height: 64, color: 'var(--border)', marginBottom: 24 }} />
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, marginBottom: 12 }}>Your bag is empty</h2>
        <p style={{ color: 'var(--slate)', marginBottom: 28 }}>Discover our curated collection of fine jewellery.</p>
        <Link to="/shop" className="btn-primary">Shop All Jewellery <ArrowRight style={{ width: 16 }} /></Link>
      </div>
    );
  }

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="section-subtitle">Review Your Selection</p>
          <h1>Shopping Bag</h1>
        </div>
      </div>

      <div className="container cart-layout">
        {/* Cart Items List */}
        <div className="cart-items">
          {/* Out of Stock Saved Items Banner */}
          {outOfStockItems.length > 0 && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#92400E' }}>
              <AlertTriangle style={{ width: 18, height: 18, color: '#D97706', flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ display: 'block', marginBottom: 2, color: '#78350F' }}>
                  {outOfStockItems.length} piece{outOfStockItems.length > 1 ? 's' : ''} in your bag {outOfStockItems.length > 1 ? 'are' : 'is'} currently out of stock
                </strong>
                <span>
                  They remain safely saved in your bag for when they restock. You can continue and proceed to checkout with available in-stock items.
                </span>
              </div>
            </div>
          )}

          {/* Free shipping progress (calculated on available items) */}
          {inStockItems.length > 0 && (
            remainingForFreeShip > 0 ? (
              <div className="free-shipping-bar">
                <p style={{ fontSize: 13, marginBottom: 8 }}>
                  Spend <strong>{formatMoney(remainingForFreeShip)}</strong> more for Free Standard Shipping
                </p>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${freeShipProgress}%` }} />
                </div>
              </div>
            ) : (
              <div className="free-shipping-bar free-shipping-bar--achieved">
                <Truck style={{ width: 16, height: 16 }} />
                <span>You've unlocked Free Standard Shipping!</span>
              </div>
            )
          )}

          {enrichedCart.map(item => {
            const isWishlisted = wishlist.includes(item.id);
            return (
              <div key={`${item.id}-${item.size}`} className="cart-item" style={{ opacity: item.isOutOfStock ? 0.88 : 1, borderLeft: item.isOutOfStock ? '3px solid #EF4444' : undefined }}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-item-img"
                  style={{ filter: item.isOutOfStock ? 'grayscale(25%)' : undefined }}
                  onError={(e) => {
                    const filename = (item.image || '').split('/').pop();
                    e.target.onerror = null;
                    e.target.src = `/assets/${decodeURIComponent(filename)}`;
                  }}
                />
                
                <div className="cart-item-details">
                  <p className="cart-item-name">{item.name}</p>
                  {item.size && <p className="cart-item-size">Size: {item.size}</p>}
                  
                  {/* Out of Stock / Low Stock Indicators */}
                  {item.isOutOfStock ? (
                    <div style={{ marginTop: 4 }}>
                      <span style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-block' }}>
                        OUT OF STOCK
                      </span>
                      <p style={{ fontSize: 11.5, color: '#DC2626', margin: '4px 0 0 0', fontWeight: 500 }}>
                        Currently sold out. Saved in your bag for when it restocks.
                      </p>
                    </div>
                  ) : item.isOverStock ? (
                    <p style={{ fontSize: 11.5, color: '#D97706', margin: '4px 0 0 0', fontWeight: 600 }}>
                      ⚠️ Only {item.maxAvailable} unit{item.maxAvailable > 1 ? 's' : ''} left in stock.
                    </p>
                  ) : null}

                  <p className="cart-item-price" style={{ marginTop: 6 }}>{formatMoney(item.price)}</p>
                </div>

                <div className="cart-item-controls">
                  <div className="qty-control">
                    <button
                      className="qty-btn"
                      onClick={() => updateCartQty(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || item.isOutOfStock}
                      title={item.isOutOfStock ? 'Item is out of stock' : 'Decrease quantity'}
                    >
                      <Minus style={{ width: 12 }} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => {
                        if (!item.isOutOfStock) {
                          if (item.maxAvailable && item.quantity >= item.maxAvailable) {
                            return;
                          }
                          updateCartQty(item.id, item.quantity + 1);
                        }
                      }}
                      disabled={item.isOutOfStock || (item.maxAvailable > 0 && item.quantity >= item.maxAvailable)}
                      title={item.isOutOfStock ? 'Item is out of stock' : 'Increase quantity'}
                    >
                      <Plus style={{ width: 12 }} />
                    </button>
                  </div>

                  <p className="cart-item-total">{formatMoney(item.price * item.quantity)}</p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      className="cart-item-remove"
                      onClick={() => toggleWishlist(item.id)}
                      title={isWishlisted ? 'Saved in wishlist' : 'Move to wishlist'}
                      style={{ color: isWishlisted ? 'var(--danger)' : 'var(--slate)' }}
                    >
                      <Heart style={{ width: 15, fill: isWishlisted ? 'var(--danger)' : 'none' }} />
                    </button>
                    <button
                      className="cart-item-remove"
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                      title="Remove from bag"
                    >
                      <Trash2 style={{ width: 15 }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <div className="cart-summary-card">
            <h3 className="cart-summary-title">Order Summary</h3>

            <div className="summary-row" style={{ marginTop: 14 }}>
              <span>Available Items ({inStockItems.reduce((s,i) => s+i.quantity, 0)})</span>
              <span>{formatMoney(subtotal)}</span>
            </div>

            {outOfStockItems.length > 0 && (
              <div className="summary-row" style={{ color: '#DC2626', fontSize: 12.5 }}>
                <span>Saved Out-of-Stock ({outOfStockItems.reduce((s,i) => s+i.quantity, 0)})</span>
                <span>$0.00</span>
              </div>
            )}

            <div className="summary-row">
              <span>Standard Shipping</span>
              <span style={{ color: standardShippingFee === 0 ? 'var(--success)' : 'var(--onyx)', fontWeight: 600 }}>
                {inStockItems.length === 0 ? '$0.00' : (standardShippingFee === 0 ? 'FREE' : formatMoney(standardShippingFee))}
              </span>
            </div>

            <div className="summary-row summary-total">
              <span>Total</span>
              <span>{formatMoney(cartTotal)}</span>
            </div>

            {inStockItems.length === 0 ? (
              <div style={{ marginTop: 16 }}>
                <button
                  type="button"
                  className="btn-primary"
                  disabled
                  style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed', background: '#9CA3AF', borderColor: '#9CA3AF' }}
                >
                  All Items Out of Stock
                </button>
                <p style={{ fontSize: 12, color: 'var(--slate)', textAlign: 'center', marginTop: 8 }}>
                  Your items will remain saved in your bag until they are restocked.
                </p>
              </div>
            ) : (
              <button className="btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={handleCheckout}>
                Proceed to Checkout {outOfStockItems.length > 0 ? `(${inStockItems.length} In-Stock)` : ''} <ArrowRight style={{ width: 16 }} />
              </button>
            )}

            <Link to="/shop" className="btn-secondary" style={{ width: '100%', textAlign: 'center', marginTop: 10, display: 'block' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
