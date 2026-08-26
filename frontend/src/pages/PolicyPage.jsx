import React from 'react';
import { useSearchParams } from 'react-router-dom';

export default function PolicyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'privacy';

  const d = new Date();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentDateStr = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms & Conditions' },
    { id: 'shipping', label: 'Shipping & Delivery' },
    { id: 'refunds', label: 'Returns & Refunds' },
  ];

  const contentMap = {
    privacy: {
      title: 'Privacy Policy',
      html: `
        <div style="font-family: var(--font-sans); color: var(--slate); font-size: 14px; line-height: 1.7;">
          <p style="margin-bottom: 24px; font-style: italic; font-size: 13px;">Last updated: ${currentDateStr}</p>
          <p style="margin-bottom: 20px;">
            At Abel's By Lincy, accessible from <a href="https://abelsbylincy.com" target="_blank" style="color: var(--gold); text-decoration: underline;">abelsbylincy.com</a>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Abel's By Lincy and how we use it.
          </p>
          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">1. Information We Collect</h3>
          <p style="margin-bottom: 16px;">We collect personal details provided during checkout or account creation, including your name, delivery address, email, phone number, and order preferences.</p>
          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">2. How We Use Your Information</h3>
          <p style="margin-bottom: 16px;">We use your data to process orders, send dispatch tracking updates, maintain your active shopping bag, manage VIP accounts, and ensure Australian Privacy compliance.</p>
          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">3. Payment Security & Third Parties</h3>
          <p style="margin-bottom: 16px;">Payment details are processed through encrypted gateways (such as Stripe). We do not store complete credit card numbers on our servers.</p>
          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">4. Australian Privacy Compliance</h3>
          <p style="margin-bottom: 16px;">We comply with the Australian Privacy Principles (APPs) under the <em>Privacy Act 1988</em> (Cth). For queries, email <a href="mailto:lincytitus8@gmail.com" style="color: var(--gold); font-weight: 600;">lincytitus8@gmail.com</a>.</p>
        </div>
      `
    },
    terms: {
      title: 'Terms & Conditions',
      html: `
        <div style="font-family: var(--font-sans); color: var(--slate); font-size: 14px; line-height: 1.7;">
          <p style="margin-bottom: 24px; font-style: italic; font-size: 13px;">Last updated: ${currentDateStr}</p>
          <p style="margin-bottom: 20px;">Welcome to Abel's By Lincy. These Terms &amp; Conditions apply to your use of abelsbylincy.com and any purchase made through the Website.</p>
          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">1. About Us</h3>
          <p style="margin-bottom: 16px;">Operated by Abels by Lincy · Email: lincytitus8@gmail.com · Phone: +61 435 927 824</p>
          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">2. Australian Consumer Law (ACL)</h3>
          <p style="margin-bottom: 16px;">Our products come with non-excludable guarantees under Australian Consumer Law. You are entitled to a repair, replacement, or refund for major quality failures.</p>
        </div>
      `
    },
    shipping: {
      title: 'Shipping & Delivery Policy',
      html: `
        <div style="font-family: var(--font-sans); color: var(--slate); font-size: 14px; line-height: 1.7;">
          <p style="margin-bottom: 24px; font-style: italic; font-size: 13px;">Last updated: ${currentDateStr}</p>
          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">1. All-Inclusive Free Express Shipping</h3>
          <p style="margin-bottom: 16px;">We offer complimentary Express Shipping on all Australian orders. Orders are processed within 1-2 business days and delivered via Australia Post Express Insured.</p>
          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">2. Delivery Timelines</h3>
          <p style="margin-bottom: 16px;">Express Shipping: 1–2 business days. Standard Shipping: 2–4 business days across Australia.</p>
        </div>
      `
    },
    refunds: {
      title: 'Returns & Refund Policy',
      html: `
        <div style="font-family: var(--font-sans); color: var(--slate); font-size: 14px; line-height: 1.7;">
          <p style="margin-bottom: 24px; font-style: italic; font-size: 13px;">Last updated: ${currentDateStr}</p>
          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">1. 30-Day Change-of-Mind Returns</h3>
          <p style="margin-bottom: 16px;">We offer a voluntary 30-day return policy for unused items in original signature packaging. Custom or worn items are excluded.</p>
          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; color: var(--onyx);">2. Faulty Items &amp; ACL Rights</h3>
          <p style="margin-bottom: 16px;">If your piece has a manufacturing fault, contact lincytitus8@gmail.com with your order number for a full repair, replacement, or refund.</p>
        </div>
      `
    }
  };

  const currentPolicy = contentMap[activeTab] || contentMap.privacy;

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="section-subtitle" id="policy-date">Updated: {months[d.getMonth()]} {d.getFullYear()}</p>
          <h1 id="policy-title">{currentPolicy.title}</h1>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 900, paddingBottom: 80, paddingTop: 40 }}>
        {/* Policy Tab Buttons */}
        <div className="policy-tabs" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 40, justifyContent: 'center' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              className={`btn-secondary${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setSearchParams({ tab: t.id })}
              style={{ fontSize: 13 }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Policy Content */}
        <div className="checkout-card" style={{ padding: 32 }}>
          <div dangerouslySetInnerHTML={{ __html: currentPolicy.html }} />
          <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--slate)' }}>
            For any legal or policy inquiries, please email <a href="mailto:lincytitus8@gmail.com" style={{ color: 'var(--gold)', fontWeight: 600 }}>lincytitus8@gmail.com</a>.
          </div>
        </div>
      </div>
    </>
  );
}
