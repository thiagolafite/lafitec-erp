import React, { useState } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = '560px' }) => {
  const [isShaking, setIsShaking] = useState(false);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    // Impede o fechamento acidental ao clicar fora: o modal só fecha no botão explícito (X ou Cancelar)
    if (e.target === e.currentTarget) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div 
        className={`modal-content ${isShaking ? 'modal-shake' : ''}`}
        style={{ maxWidth }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Fechar" title="Fechar Janela (X)">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

