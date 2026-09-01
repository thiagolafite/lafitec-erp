import React from 'react';
import { User, LogOut, ShieldCheck, Building, ChevronRight, Plus, FileSpreadsheet, Sparkles, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ currentTabTitle, setCurrentTab }) => {
  const { user, empresa, logout } = useAuth();

  return (
    <header className="topbar">
      {/* Breadcrumb Path */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          backgroundColor: '#F1F5F9',
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#576F86'
        }}>
          <ShieldCheck size={14} style={{ color: '#00C896' }} />
          <span>Lafitec ERP</span>
        </div>
        <ChevronRight size={15} style={{ color: '#CBD5E1' }} />
        <span style={{
          fontFamily: 'Outfit',
          fontSize: '1.05rem',
          fontWeight: 800,
          color: '#071527',
          letterSpacing: '-0.01em'
        }}>
          {currentTabTitle}
        </span>
      </div>

      {/* Right Controls & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Quick Action Button: Novo Orçamento with Glow */}
        <button
          onClick={() => setCurrentTab('orcamentos')}
          className="btn btn-accent btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 800,
            padding: '0.48rem 1rem',
            borderRadius: '10px'
          }}
          title="Elaborar Novo Orçamento Comercial"
        >
          <Plus size={15} /> + Novo Orçamento
        </button>

        {/* Company Quick Badge with active dot */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          backgroundColor: '#F8FAFD',
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: '#071527',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#00F5A0', boxShadow: '0 0 6px #00F5A0' }}></span>
          <Building2 size={14} style={{ color: '#008764' }} />
          <span>{empresa?.nome}</span>
        </div>

        {/* User Profile Capsule */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '4px 6px 4px 10px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #071527 0%, #102A48 100%)',
            color: '#00F5A0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.9rem',
            border: '2px solid #00F5A0'
          }}>
            {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', marginRight: '4px' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#071527', lineHeight: 1.1 }}>
              {user?.nome}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#576F86', fontWeight: 600 }}>
              {user?.tipo === 'Admin' ? 'Administrador' : 'Operador'}
            </span>
          </div>

          <button 
            onClick={logout} 
            className="btn btn-outline btn-sm"
            title="Encerrar sessão e sair do sistema"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#DC2626',
              borderColor: '#FECACA',
              backgroundColor: '#FEF2F2',
              fontWeight: 700,
              padding: '0.35rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.8rem'
            }}
          >
            <LogOut size={14} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};
