import React from 'react';
import { LogOut, ChevronRight, Plus, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ currentTabTitle, setCurrentTab }) => {
  const { user, empresa, logout } = useAuth();

  return (
    <header className="topbar">
      {/* Breadcrumb Path */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          backgroundColor: '#1A1A1A',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 600,
          letterSpacing: '0.06em',
          color: '#FFFFFF'
        }}>
          <span style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: '1.5px solid #C9A962',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.6rem',
            fontWeight: 700,
            color: '#C9A962'
          }}>LL</span>
          <span>LAFITE LIMA</span>
        </div>
        <ChevronRight size={15} style={{ color: '#A3A3A3' }} />
        <span style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '1rem',
          fontWeight: 700,
          color: '#1A1A1A',
          letterSpacing: '-0.01em'
        }}>
          {currentTabTitle}
        </span>
      </div>

      {/* Right Controls & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Quick Action Button: Novo Orçamento */}
        <button
          onClick={() => setCurrentTab('orcamentos')}
          className="btn btn-accent btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 600,
            padding: '0.48rem 1rem',
            borderRadius: '4px'
          }}
          title="Elaborar Novo Orçamento Comercial"
        >
          <Plus size={15} /> Novo Orçamento
        </button>

        {/* Company Quick Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          backgroundColor: '#FAFAFA',
          border: '1px solid #E0E0E0',
          borderRadius: '4px',
          fontSize: '0.8rem',
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 600,
          color: '#1A1A1A'
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#C9A962' }}></span>
          <Building2 size={14} style={{ color: '#C9A962' }} />
          <span>{empresa?.nome}</span>
        </div>

        {/* User Profile Capsule */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '4px 8px 4px 10px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E0E0E0',
          borderRadius: '4px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#1A1A1A',
            color: '#C9A962',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            fontSize: '0.85rem',
            border: '1.5px solid #C9A962'
          }}>
            {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', marginRight: '4px' }}>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.1 }}>
              {user?.nome}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#666666', fontWeight: 600 }}>
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
              fontWeight: 600,
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.75rem'
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
