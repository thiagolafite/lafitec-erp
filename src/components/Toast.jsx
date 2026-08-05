import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const { type, message } = toast;

  const icons = {
    success: <CheckCircle2 size={20} className="text-emerald-500" style={{ color: '#00C896' }} />,
    warning: <AlertTriangle size={20} style={{ color: '#F59E0B' }} />,
    error: <XCircle size={20} style={{ color: '#EF4444' }} />
  };

  const bgColors = {
    success: '#ECFDF5',
    warning: '#FFFBEB',
    error: '#FEF2F2'
  };

  const borderColors = {
    success: '#00C896',
    warning: '#F59E0B',
    error: '#EF4444'
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 20px',
      backgroundColor: bgColors[type] || '#FFFFFF',
      borderLeft: `4px solid ${borderColors[type] || '#0A2540'}`,
      borderRadius: '8px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
      color: '#1E293B',
      fontWeight: 600,
      fontSize: '0.9rem',
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {icons[type]}
      <span>{message}</span>
      <button 
        onClick={onClose} 
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#64748B',
          marginLeft: '12px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
