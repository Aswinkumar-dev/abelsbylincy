import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { CheckCircle, AlertCircle, Heart, X, Download, Loader } from 'lucide-react';

const iconMap = {
  'check': CheckCircle,
  'alert-circle': AlertCircle,
  'heart': Heart,
  'download': Download,
  'loader': Loader,
};

function ToastItem({ toast, onRemove }) {
  if (toast.type === 'cart') {
    return (
      <div
        style={{
          background: '#22252A',
          color: '#FFFFFF',
          padding: '14px 24px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          fontSize: '15px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          gap: '24px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <span>{toast.msg}</span>
        {toast.action && (
          <Link
            to={toast.action.link}
            onClick={() => onRemove(toast.id)}
            style={{
              color: 'var(--gold)',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '15px',
              transition: 'opacity 0.2s'
            }}
          >
            {toast.action.label}
          </Link>
        )}
      </div>
    );
  }

  const Icon = iconMap[toast.type] || CheckCircle;
  return (
    <div className="toast" style={{ display: 'flex', alignItems: 'center', gap: '10px', animation: 'none' }}>
      <Icon style={{ width: 18, height: 18, color: 'var(--gold)', flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 13 }}>{toast.msg}</span>
      <button onClick={() => onRemove(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)', padding: 0 }}>
        <X style={{ width: 14, height: 14 }} />
      </button>
    </div>
  );
}

export default function Toast() {
  const { toasts, removeToast, clearToasts } = useStore();
  const location = useLocation();

  // Remove all notifications when customer moves to another page
  useEffect(() => {
    if (toasts.length > 0) {
      clearToasts();
    }
  }, [location.pathname]);

  if (!toasts.length) return null;

  const hasCartToast = toasts.some(t => t.type === 'cart');

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '30px',
        left: hasCartToast ? '50%' : 'auto',
        right: hasCartToast ? 'auto' : '24px',
        transform: hasCartToast ? 'translateX(-50%)' : 'none',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: 420
      }}
    >
      {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={removeToast} />)}
    </div>
  );
}
