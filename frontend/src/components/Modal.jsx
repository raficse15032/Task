import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1050,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }}
      />
      {/* Dialog */}
      <div
        style={{
          position: 'relative', zIndex: 1,
          background: '#fff', borderRadius: '10px',
          width: '100%', maxWidth: '460px', maxHeight: '80vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          margin: '0 16px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <h6 style={{ margin: 0, fontWeight: 600, fontSize: '15px' }}>{title}</h6>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '20px', lineHeight: 1, cursor: 'pointer', color: '#888', padding: '0 2px' }}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '12px 20px 16px', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
