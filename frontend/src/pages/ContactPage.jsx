import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ContactPage() {
  const { handleContactForm } = useStore();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, subject, message } = formData;
    if (!name || !email || !subject || !message) return;
    handleContactForm(name, email, subject, message);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="section-subtitle">We'd Love to Hear from You</p>
          <h1>Contact Our Atelier</h1>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80, paddingTop: 40 }}>
        <div className="contact-layout">

          {/* Contact Info Cards */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600, marginBottom: 12 }}>Get in Touch</h2>
            <p style={{ color: 'var(--slate)', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
              Whether you have a question about custom sizing, bespoke design requests, or order tracking, our Sydney jewellery specialists are here to assist.
            </p>

            <div className="contact-info-cards">
              <div className="contact-info-card">
                <MapPin className="contact-info-icon" />
                <div>
                  <h4 className="contact-info-title">Atelier Location</h4>
                  <p className="contact-info-text">Sydney, New South Wales, Australia</p>
                  <p style={{ fontSize: 12, color: 'var(--slate)' }}>By appointment only</p>
                </div>
              </div>

              <div className="contact-info-card">
                <Phone className="contact-info-icon" />
                <div>
                  <h4 className="contact-info-title">Phone &amp; WhatsApp</h4>
                  <p className="contact-info-text">
                    <a href="tel:+61435927824" style={{ color: 'inherit' }}>+61 435 927 824</a>
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--slate)' }}>Mon–Fri: 9am – 5pm AEST</p>
                </div>
              </div>

              <div className="contact-info-card">
                <Mail className="contact-info-icon" />
                <div>
                  <h4 className="contact-info-title">Direct Email</h4>
                  <p className="contact-info-text">
                    <a href="mailto:lincytitus8@gmail.com" style={{ color: 'var(--gold)' }}>lincytitus8@gmail.com</a>
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--slate)' }}>Replies within 24 hours</p>
                </div>
              </div>

              <div className="contact-info-card">
                <Clock className="contact-info-icon" />
                <div>
                  <h4 className="contact-info-title">Client Care Hours</h4>
                  <p className="contact-info-text">Monday – Saturday: 9:00am – 6:00pm</p>
                  <p style={{ fontSize: 12, color: 'var(--slate)' }}>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="checkout-card">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 600, marginBottom: 20 }}>Send a Message</h3>

            {submitted && (
              <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: 16, borderRadius: 'var(--radius-md)', marginBottom: 20, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <MessageSquare style={{ width: 18 }} />
                <span>Thank you! Your message has been sent. We'll reply within 24 hours.</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Your Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Sarah Mitchell"
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="sarah@example.com"
                  value={formData.email}
                  onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Ring sizing enquiry / Custom design request"
                  value={formData.subject}
                  onChange={e => setFormData(f => ({ ...f, subject: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea
                  className="form-control"
                  rows={5}
                  placeholder="How can we assist you today?"
                  value={formData.message}
                  onChange={e => setFormData(f => ({ ...f, message: e.target.value }))}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Send Message <Send style={{ width: 14 }} />
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  );
}
