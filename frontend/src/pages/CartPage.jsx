import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function CartPage() {
  const { cart, updateCartQty, removeFromCart, formatMoney, settings, currentUser } = useStore();
  const navigate = useNavigate();
  const freeShippingThreshold = 60;

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - subtotal);
  const freeShipProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const standardShippingFee = subtotal >= freeShippingThreshold ? 0 : 10;
  const cartTotal = subtotal + standardShippingFee;

  const handleCheckout = () => {
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
        {/* Cart Items */}
        <div className="cart-items">
          {/* Free shipping progress */}
          {remainingForFreeShip > 0 ? (
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
          )}

          {cart.map(item => (
            <div key={`${item.id}-${item.size}`} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-item-img" />
              <div className="cart-item-details">
                <p className="cart-item-name">{item.name}</p>
                {item.size && <p className="cart-item-size">Size: {item.size}</p>}
                <p className="cart-item-price">{formatMoney(item.price)}</p>
              </div>
              <div className="cart-item-controls">
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => updateCartQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                    <Minus style={{ width: 12 }} />
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateCartQty(item.id, item.quantity + 1)}>
                    <Plus style={{ width: 12 }} />
                  </button>
                </div>
                <p className="cart-item-total">{formatMoney(item.price * item.quantity)}</p>
                <button className="cart-item-remove" onClick={() => removeFromCart(item.id)} aria-label="Remove">
                  <Trash2 style={{ width: 15 }} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="cart-summary">
          <div className="cart-summary-card">
            <h3 className="cart-summary-title">Order Summary</h3>

            <div className="summary-row" style={{ marginTop: 14 }}>
              <span>Subtotal ({cart.reduce((s,i) => s+i.quantity, 0)} items)</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Standard Shipping</span>
              <span style={{ color: standardShippingFee === 0 ? 'var(--success)' : 'var(--onyx)', fontWeight: 600 }}>
                {standardShippingFee === 0 ? 'FREE' : formatMoney(standardShippingFee)}
              </span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>{formatMoney(cartTotal)}</span>
            </div>

            <button className="btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={handleCheckout}>
              Proceed to Checkout <ArrowRight style={{ width: 16 }} />
            </button>
            <Link to="/shop" className="btn-secondary" style={{ width: '100%', textAlign: 'center', marginTop: 10, display: 'block' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
