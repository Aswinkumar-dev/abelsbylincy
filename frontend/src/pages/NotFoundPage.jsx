import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FFFFFF',
      padding: '40px 24px',
      boxSizing: 'border-box',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        <p className="section-subtitle" style={{ fontSize: 13, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: 8 }}>
          Page Not Found
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 96, color: 'var(--gold)', fontWeight: 700, margin: '0 0 8px 0', lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 600, color: 'var(--onyx)', marginBottom: 16 }}>
          Lost in Elegance
        </h2>
        <p style={{ color: 'var(--slate)', fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
          The page you're looking for has been moved, renamed, or doesn't exist.
        </p>

        <div>
          <Link to="/" className="btn-primary" style={{ padding: '15px 32px', fontSize: 13, letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Return to Store <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </div>
    </div>
  );
}
