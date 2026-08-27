import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, CreditCard, Smartphone, Check, Lock } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const STEPS = ['Shipping', 'Payment', 'Review & Place'];

export default function CheckoutPage() {
  const { cart, currentUser, formatMoney, placeOrder, showToast } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [paymentTab, setPaymentTab] = useState('card');
  const [completedOrder, setCompletedOrder] = useState(null);
  const [saveAddress, setSaveAddress] = useState(false);

  const savedAddress = (() => {
    try { return JSON.parse(localStorage.getItem('abl_saved_address')); } catch { return null; }
  })();

  const [formData, setFormData] = useState({
    firstName: currentUser?.name?.split(' ')[0] || savedAddress?.firstName || '',
    lastName: currentUser?.name?.split(' ').slice(1).join(' ') || savedAddress?.lastName || '',
    email: currentUser?.email || savedAddress?.email || '',
    phone: savedAddress?.phone || '',
    address: savedAddress?.address || '',
    city: savedAddress?.city || '',
    postcode: savedAddress?.postcode || '',
  });

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  // Auth guard
  useEffect(() => {
    if (!currentUser) navigate('/account');
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    const { firstName, lastName, email, phone, address, city, postcode } = formData;
    if (!firstName || !lastName || !email || !phone || !address || !city || !postcode) {
      showToast('Please fill in all required shipping fields', 'alert-circle');
      return;
    }
    if (saveAddress) {
      localStorage.setItem('abl_saved_address', JSON.stringify(formData));
    } else {
      localStorage.removeItem('abl_saved_address');
    }
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExpressPay = (provider) => {
    showToast(`Authenticating with ${provider}...`, 'loader');
    setTimeout(() => handlePlaceOrder(), 1000);
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) { showToast('Your bag is empty', 'alert-circle'); return; }
    const order = placeOrder(formData, paymentTab);
    if (order) {
      setCompletedOrder(order);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Step 3: Confirmation
  if (step === 3 && completedOrder) {
    return (
      <div className="container" style={{ padding: '40px 16px 80px 16px', textAlign: 'center', maxWidth: 600 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
          <Check style={{ width: 42, height: 42 }} />
        </div>
        <p className="section-subtitle" style={{ color: 'var(--success)', marginBottom: 8 }}>Payment Successful</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 600, marginBottom: 14 }}>Order Confirmed!</h1>
        <p style={{ fontSize: 15, color: 'var(--slate)', marginBottom: 24, lineHeight: 1.6 }}>
          Thank you, <strong>{formData.firstName || 'Valued Client'}</strong>. Your gold-plated jewellery order <strong>{completedOrder.id}</strong> has been received. A tax invoice and dispatch tracker have been dispatched to <strong>{formData.email || 'your email'}</strong>.
        </p>
        <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-lg)', padding: 20, textAlign: 'left', fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
          <p style={{ marginBottom: 6 }}><strong>Delivery Address:</strong> {formData.address}, {formData.city} {formData.postcode} NSW</p>
          <p style={{ marginBottom: 6 }}><strong>Payment Method:</strong> {paymentTab === 'express' ? 'Apple Pay / Google Pay (Biometric Encrypted)' : 'Stripe Card (•••• 8892)'}</p>
          <p style={{ marginBottom: 0 }}><strong>Status:</strong> Dispatched via Australia Post Express Insured</p>
        </div>
        <div className="confirmation-btn-group">
          <Link to="/" className="btn-primary" style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}>Return to Storefront</Link>
          <Link to="/account" className="btn-secondary" style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}>View in My Account</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="section-subtitle">Encrypted Stripe Gateway</p>
          <h1>Secure Checkout</h1>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1000, paddingBottom: 60 }}>
        {/* Stepper */}
        <div className="checkout-stepper">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`step-item${step === i ? ' active' : step > i ? ' completed' : ''}`}>
                <div className="step-circle">{step > i ? '✓' : i + 1}</div>
                <span>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className="stepper-line" />}
            </React.Fragment>
          ))}
        </div>

        <div className="checkout-layout">
          {/* Left: Step Forms */}
          <div>
            <div className="checkout-card">
              {/* STEP 0: Shipping */}
              {step === 0 && (
                <form onSubmit={handleShippingSubmit}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, margin: 0 }}>1. Shipping Details</h3>
                    {savedAddress && <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600 }}>✓ Auto-filled from saved address</span>}
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">First Name *</label>
                      <input type="text" className="form-control" value={formData.firstName} onChange={e => setFormData(f => ({...f, firstName: e.target.value}))} placeholder="e.g. Sarah" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name *</label>
                      <input type="text" className="form-control" value={formData.lastName} onChange={e => setFormData(f => ({...f, lastName: e.target.value}))} placeholder="e.g. Jenkins" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email for Tracking *</label>
                    <input type="email" className="form-control" value={formData.email} onChange={e => setFormData(f => ({...f, email: e.target.value}))} placeholder="e.g. sarah@example.com" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Phone (For Courier Updates) *</label>
                    <input type="tel" className="form-control" value={formData.phone} onChange={e => setFormData(f => ({...f, phone: e.target.value}))} placeholder="e.g. +61 412 345 678" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Street Address *</label>
                    <input type="text" className="form-control" value={formData.address} onChange={e => setFormData(f => ({...f, address: e.target.value}))} placeholder="e.g. 42 George Street, Apt 3B" required />
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">City / Suburb *</label>
                      <input type="text" className="form-control" value={formData.city} onChange={e => setFormData(f => ({...f, city: e.target.value}))} placeholder="e.g. Sydney" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Postcode *</label>
                      <input type="text" className="form-control" value={formData.postcode} onChange={e => setFormData(f => ({...f, postcode: e.target.value}))} placeholder="e.g. 2000" required />
                    </div>
                  </div>
                  <div style={{ margin: '10px 0 20px 0', background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
                    <label className="filter-checkbox-label" style={{ fontSize: 13, color: 'var(--onyx)', cursor: 'pointer', userSelect: 'none' }}>
                      <input type="checkbox" className="filter-checkbox" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} />
                      <span><strong>Save these details</strong> for faster 1-click checkout next time</span>
                    </label>
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                    Continue to Payment <ArrowRight style={{ width: 14, height: 14 }} />
                  </button>
                </form>
              )}

              {/* STEP 1: Payment */}
              {step === 1 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, margin: 0 }}>2. Payment Method</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>
                      <ShieldCheck style={{ width: 15, height: 15 }} /> 256-bit SSL Encrypted
                    </div>
                  </div>

                  {/* Payment Tabs */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                    {[
                      { id: 'card', label: 'Credit / Debit Card', icon: <CreditCard style={{ width: 20, height: 20 }} /> },
                      { id: 'express', label: 'Apple Pay / Google Pay', icon: <Smartphone style={{ width: 20, height: 20 }} /> },
                    ].map(tab => (
                      <div key={tab.id} onClick={() => setPaymentTab(tab.id)} style={{ flex: 1, border: `2px solid ${paymentTab === tab.id ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', padding: '14px 10px', textAlign: 'center', background: paymentTab === tab.id ? 'var(--cream)' : 'var(--cloud-white)', cursor: 'pointer' }}>
                        <div style={{ color: paymentTab === tab.id ? 'var(--gold)' : 'var(--slate)', marginBottom: 4 }}>{tab.icon}</div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--onyx)', margin: 0 }}>{tab.label}</p>
                      </div>
                    ))}
                  </div>

                  {paymentTab === 'card' ? (
                    <div>
                      <div className="form-group">
                        <label className="form-label">Card Number</label>
                        <div style={{ position: 'relative' }}>
                          <input type="text" className="form-control" defaultValue="4532 •••• •••• 8892" placeholder="4532 0000 0000 0000" />
                          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, background: '#1A1F71', color: '#fff', padding: '2px 6px', borderRadius: 3 }}>VISA</span>
                            <span style={{ fontSize: 10, fontWeight: 700, background: '#EB001B', color: '#fff', padding: '2px 6px', borderRadius: 3 }}>MC</span>
                          </div>
                        </div>
                      </div>
                      <div className="form-grid-2">
                        <div className="form-group">
                          <label className="form-label">Expiry Date</label>
                          <input type="text" className="form-control" defaultValue="08 / 28" placeholder="MM / YY" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Security CVC</label>
                          <input type="password" className="form-control" defaultValue="892" placeholder="CVC" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Cardholder Name</label>
                        <input type="text" className="form-control" defaultValue={`${formData.firstName} ${formData.lastName}`.trim() || 'CARDHOLDER NAME'} placeholder="Name as printed on card" />
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                        <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { setStep(0); window.scrollTo({top:0,behavior:'smooth'}); }}>Back</button>
                        <button className="btn-primary" style={{ flex: 2 }} onClick={() => { setStep(2); window.scrollTo({top:0,behavior:'smooth'}); }}>Review Order <ArrowRight style={{ width: 14 }} /></button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '10px 0' }}>
                      <p style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 16, textAlign: 'center' }}>
                        Pay instantly with your biometric wallet (FaceID / TouchID / Google Account).
                      </p>
                      <button onClick={() => handleExpressPay('Apple Pay')} style={{ width: '100%', height: 50, background: '#000', color: '#fff', borderRadius: 'var(--radius-md)', border: 'none', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', marginBottom: 12 }}>
                        <svg width="20" height="20" viewBox="0 0 170 170" fill="currentColor"><path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12-14.42-6.09-9.35-10.99-19.8-14.69-31.33-3.7-11.53-5.55-22.6-5.55-33.22 0-14.8 3.7-27.18 11.09-37.13 7.39-9.95 16.74-15.02 28.05-15.22 4.35 0 9.47 1.25 15.35 3.75 5.88 2.5 9.79 3.86 11.73 4.09 1.74-.23 5.87-1.63 12.38-4.2 6.51-2.58 11.73-3.76 15.66-3.53 11.53.65 20.89 4.9 28.07 12.73-10.23 6.19-15.24 14.68-15.02 25.46.22 8.48 3.59 15.77 10.09 21.86 6.51 6.1 14.24 9.57 23.2 10.44-2.18 6.52-4.68 12.72-7.51 18.59zM119.22 33.04c0-7.39 2.61-14.35 7.83-20.88C132.27 5.63 138.8.84 146.64 0c.22 1.09.33 2.18.33 3.26 0 7.39-2.83 14.68-8.48 21.86-5.66 7.18-12.4 11.2-20.24 12.07-.44-1.31-.67-2.69-.67-4.15z"/></svg>
                        <span>Pay with Apple Pay</span>
                      </button>
                      <button onClick={() => handleExpressPay('Google Pay')} style={{ width: '100%', height: 50, background: '#fff', color: '#3c4043', borderRadius: 'var(--radius-md)', border: '1px solid #dadce0', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', marginBottom: 16, boxShadow: '0 1px 3px rgba(60,64,67,0.15)' }}>
                        <svg width="22" height="22" viewBox="0 0 48 48"><path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/><path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/><path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.91l7.35-5.73z"/><path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/></svg>
                        <span>Buy with GPay</span>
                      </button>
                      <button className="btn-secondary" style={{ width: '100%' }} onClick={() => { setStep(0); window.scrollTo({top:0,behavior:'smooth'}); }}>Back</button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Review */}
              {step === 2 && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, marginBottom: 16 }}>3. Review Order</h3>
                  <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20, fontSize: 13, lineHeight: 1.6 }}>
                    <p style={{ marginBottom: 6 }}><strong>Deliver To:</strong> {formData.firstName} {formData.lastName}</p>
                    <p style={{ marginBottom: 6 }}><strong>Address:</strong> {formData.address}, {formData.city} {formData.postcode} NSW</p>
                    <p style={{ marginBottom: 6 }}><strong>Contact:</strong> {formData.email} · {formData.phone}</p>
                    <p style={{ marginBottom: 0 }}><strong>Payment:</strong> {paymentTab === 'express' ? 'Apple Pay / Google Pay' : 'Stripe Card (•••• 8892)'}</p>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 20 }}>
                    By clicking "Place Order", you authorize Abel's By Lincy to charge <strong>{formatMoney(subtotal)}</strong> to your selected payment method.
                  </p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { setStep(1); window.scrollTo({top:0,behavior:'smooth'}); }}>Back</button>
                    <button className="btn-primary" style={{ flex: 2 }} onClick={handlePlaceOrder}>
                      Place Order · {formatMoney(subtotal)} <Lock style={{ width: 14 }} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Bag Summary */}
          <div>
            <div style={{ background: 'var(--cloud-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20 }}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 600, marginBottom: 14 }}>Bag Items ({cart.length})</h4>
              <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 14 }}>
                {cart.map(item => (
                  <div key={`${item.id}-${item.size}`} style={{ display: 'flex', gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--border-light)' }}>
                    <img src={item.image} style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} alt={item.name} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--onyx)', margin: 0 }}>{item.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--slate)', margin: '2px 0 0 0' }}>Qty: {item.quantity} · {formatMoney(item.price)}</p>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{formatMoney(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="summary-row" style={{ fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: 'var(--slate)' }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>{formatMoney(subtotal)}</span>
              </div>
              <div className="summary-row" style={{ fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: 'var(--slate)' }}>Express Shipping</span>
                <span style={{ fontWeight: 600, color: 'var(--success)' }}>FREE (Included)</span>
              </div>
              <div className="summary-row summary-total" style={{ fontSize: 16, marginTop: 10, paddingTop: 10 }}>
                <span>Total</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--onyx)' }}>{formatMoney(subtotal)}</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--slate)', fontStyle: 'italic', marginTop: 8, textAlign: 'center' }}>
                * Product prices are all-inclusive of GST &amp; Express Shipping. No extra fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
