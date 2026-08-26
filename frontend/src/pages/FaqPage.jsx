import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState(['0-0']); // first item open by default

  const faqData = [
    {
      category: 'Orders & Shipping',
      items: [
        { q: 'How long does shipping take?', a: 'We offer complimentary express shipping on all Australian orders. Standard delivery is 2-4 business days and express is 1-2 business days from dispatch. Orders are generally processed within 1-2 business days.' },
        { q: 'Do you ship internationally?', a: 'Currently, we ship within Australia only. International shipping is planned for the near future. Sign up to our newsletter to be notified when international shipping launches.' },
        { q: 'How can I track my order?', a: 'Once your order is dispatched, you will receive an email with your tracking number and a direct link to track your parcel via Australia Post.' },
      ]
    },
    {
      category: 'Returns & Refunds',
      items: [
        { q: 'What is your return policy?', a: 'We offer a 30-day change-of-mind return policy on unworn, unaltered items in original packaging. Items showing signs of wear, or custom-made pieces, are not eligible for change-of-mind returns. Your statutory rights under Australian Consumer Law always apply.' },
        { q: 'How do I request a refund?', a: 'Email us at lincytitus8@gmail.com with your order number, name, reason for return, and supporting photos. We will respond within 1-2 business days with return instructions.' },
      ]
    },
    {
      category: 'Products & Care',
      items: [
        { q: 'How do I care for my gold-plated jewellery?', a: 'To maintain the lustre of your gold-plated pieces: remove jewellery before showering, swimming or exercising; avoid direct contact with perfume, hairspray or lotions; store in our velvet pouch when not wearing; clean gently with a soft, dry cloth.' },
        { q: 'How long does gold plating last?', a: 'With proper care, our 18K and 22K gold plating can last 1-3 years or more. Pieces with thicker plating and those cared for correctly will maintain their lustre significantly longer.' },
      ]
    },
    {
      category: 'Account & Payment',
      items: [
        { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards (Visa, Mastercard) through our secure Stripe gateway, as well as Apple Pay and Google Pay. All payments are SSL encrypted.' },
        { q: 'Is it safe to store my payment details?', a: 'Yes — we use Stripe, a PCI DSS Level 1 compliant payment processor. We never store your full card details on our servers.' },
      ]
    }
  ];

  const toggleItem = (key) => {
    setOpenItems(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const filteredCategories = faqData.map((cat, catIdx) => {
    const items = cat.items.filter(item =>
      !searchQuery ||
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...cat, catIdx, items };
  }).filter(cat => cat.items.length > 0);

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="section-subtitle">Help &amp; Information</p>
          <h1>Frequently Asked Questions</h1>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 800, paddingBottom: 80, paddingTop: 40 }}>
        {/* Search */}
        <div className="search-form" style={{ marginBottom: 40, border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '6px 16px' }}>
          <Search style={{ width: 18, height: 18, color: 'var(--slate)' }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search FAQs (e.g. shipping, care, returns)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* FAQs */}
        {filteredCategories.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--slate)', padding: 40 }}>No FAQs found matching "{searchQuery}".</p>
        ) : (
          filteredCategories.map(cat => (
            <div key={cat.category} style={{ marginBottom: 36 }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, color: 'var(--onyx)', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                {cat.category}
              </h3>
              <div className="product-accordion">
                {cat.items.map((item, itemIdx) => {
                  const key = `${cat.catIdx}-${itemIdx}`;
                  const isOpen = openItems.includes(key);
                  return (
                    <div key={item.q} className="accordion-item">
                      <button className="accordion-header" onClick={() => toggleItem(key)}>
                        {item.q}
                        {isOpen ? <ChevronUp style={{ width: 16 }} /> : <ChevronDown style={{ width: 16 }} />}
                      </button>
                      {isOpen && (
                        <div className="accordion-body">
                          <p>{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
