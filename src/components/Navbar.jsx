import React from 'react';
import { User, LogOut, ShieldCheck, Building, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ currentTabTitle, setCurrentTab }) => {
  const { user, empresa, logout } = useAuth();

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>Lafitec ERP</span>
        <ChevronRight size={16} style={{ color: '#CBD5E1' }} />
        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0A2540' }}>{currentTabTitle}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Company Quick Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          backgroundColor: '#F1F5F9',
          borderRadius: '20px',
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: '#0A2540'
        }}>
          <Building size={14} style={{ color: '#00C896' }} />
          <span>{empresa?.nome}</span>
        </div>

        {/* User profile dropdown info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#0A2540',
            color: '#00C896',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}>
            {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0A2540', lineHeight: 1.2 }}>
              {user?.nome}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              {user?.tipo === 'Admin' ? 'Administrador' : 'Funcionário'}
            </span>
          </div>

          <button 
            onClick={logout} 
            className="btn btn-outline btn-sm"
            title="Sair do Sistema"
            style={{ marginLeft: '8px', color: '#EF4444', borderColor: '#FCA5A5' }}
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};
