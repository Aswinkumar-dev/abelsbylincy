import React, { useState } from 'react';
import { Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ContactPage() {
  const { handleContactForm } = useStore();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [emailError, setEmailError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (emailVal) => {
    if (!emailVal.trim()) {
      return 'Email address is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal.trim())) {
      return 'Please enter a valid email address (e.g. name@example.com).';
    }
    return '';
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setFormData(f => ({ ...f, email: val }));
    if (emailError) {
      setEmailError(validateEmail(val));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, message } = formData;
    
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }

    if (!name.trim() || !message.trim()) return;

    setEmailError('');
    handleContactForm(name, email, 'Contact Inquiry', message);
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="section-subtitle">We'd Love to Hear from You</p>
          <h1>Contact Us</h1>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 60, paddingTop: 12 }}>
        <div className="contact-layout">

          {/* Contact Info Cards Column */}
          <div>
            <p className="section-subtitle" style={{ textAlign: 'left' }}>Direct Client Services</p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 600, marginBottom: 16, color: 'var(--onyx)' }}>Get in Touch</h2>
            <p style={{ color: 'var(--slate)', fontSize: 14, marginBottom: 36, lineHeight: 1.7 }}>
              Whether you have a question about our jewellery, shipping, or order tracking, our Sydney team is here to assist.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="contact-card-item">
                <div className="contact-icon-box">
                  <Phone style={{ width: 22, height: 22 }} />
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--onyx)', marginBottom: 4 }}>Phone &amp; WhatsApp</h4>
                  <p style={{ fontSize: 14, color: 'var(--slate)', margin: 0 }}>
                    <a href="tel:+61435927824" style={{ color: 'inherit', textDecoration: 'underline' }}>+61 435 927 824</a>
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--slate-light)', margin: '2px 0 0 0' }}>Mon–Fri: 9am – 5pm AEST</p>
                </div>
              </div>

              <div className="contact-card-item">
                <div className="contact-icon-box">
                  <Mail style={{ width: 22, height: 22 }} />
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--onyx)', marginBottom: 4 }}>Direct Email</h4>
                  <p style={{ fontSize: 14, color: 'var(--gold-dark)', margin: 0, fontWeight: 600 }}>
                    <a href="mailto:lincytitus8@gmail.com" style={{ color: 'inherit', textDecoration: 'underline' }}>lincytitus8@gmail.com</a>
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--slate-light)', margin: '2px 0 0 0' }}>Replies within 24 hours</p>
                </div>
              </div>

              <div className="contact-card-item">
                <div className="contact-icon-box">
                  <Clock style={{ width: 22, height: 22 }} />
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--onyx)', marginBottom: 4 }}>Client Care Hours</h4>
                  <p style={{ fontSize: 14, color: 'var(--slate)', margin: 0 }}>Monday – Saturday: 9:00am – 6:00pm</p>
                  <p style={{ fontSize: 12, color: 'var(--slate-light)', margin: '2px 0 0 0' }}>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Card Column */}
          <div style={{ background: '#FFFFFF', padding: 36, borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 600, marginBottom: 8, color: 'var(--onyx)' }}>Send a Message</h3>
            <p style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 24 }}>Fill out the form below and our team will get back to you promptly.</p>

            {submitted && (
              <div style={{ background: 'var(--cream)', color: 'var(--onyx)', border: '1px solid var(--gold)', padding: 16, borderRadius: 8, marginBottom: 24, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 style={{ width: 20, height: 20, color: 'var(--gold)' }} />
                <span>Thank you! Your message has been sent. We will reply within 24 hours.</span>
              </div>
            )}

            <form noValidate onSubmit={handleSubmit}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--onyx)', marginBottom: 6 }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--onyx)', marginBottom: 6 }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  className="form-control"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: emailError ? '1px solid #e53e3e' : '1px solid var(--border)',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease'
                  }}
                  value={formData.email}
                  onChange={handleEmailChange}
                  onBlur={() => setEmailError(validateEmail(formData.email))}
                  required
                />
                {emailError && (
                  <span style={{ color: '#e53e3e', fontSize: 12, marginTop: 6, display: 'block', fontWeight: 500 }}>
                    {emailError}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--onyx)', marginBottom: 6 }}>
                  Message *
                </label>
                <textarea
                  className="form-control"
                  rows={5}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  value={formData.message}
                  onChange={e => setFormData(f => ({ ...f, message: e.target.value }))}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px 28px', fontSize: 13, letterSpacing: '0.1em' }}>
                Send Message <Send style={{ width: 14, height: 14, marginLeft: 6, display: 'inline-block', verticalAlign: 'middle' }} />
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  );
}
