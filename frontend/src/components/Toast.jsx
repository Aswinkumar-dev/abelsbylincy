import React, { useEffect } from 'react';
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
  const { toasts, removeToast } = useStore();
  if (!toasts.length) return null;
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: 340 }}>
      {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={removeToast} />)}
    </div>
  );
}
