import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Truck, 
  Building2, 
  ShoppingCart, 
  DollarSign, 
  BarChart3, 
  ShieldCheck, 
  Globe, 
  ChevronDown, 
  ChevronRight,
  FolderOpen,
  Lock,
  MapPin,
  Car,
  ArrowDownLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';

export const Sidebar = ({ currentTab, setCurrentTab }) => {
  const { empresa, switchDemoEmpresa } = useAuth();
  const empresas = storage.getAllEmpresas();

  // Accordion open states
  const [openSections, setOpenSections] = useState({
    cadastros: true,
    financeiro: true,
    relatorios: true,
    sistema: true
  });

  const toggleSection = (sectionKey) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const getPlanoBadgeClass = (plano) => {
    switch (plano) {
      case 'Premium': return 'badge-accent';
      case 'Pro': return 'badge-info';
      default: return 'badge-dark';
    }
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-logo">
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #00D69F 0%, #00C896 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#05291E',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0, 200, 150, 0.3)'
        }}>
          <ShieldCheck size={24} />
        </div>
        <div>
          <div className="sidebar-brand">Lafitec<span>ERP</span></div>
          <div style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.04em' }}>
            GESTÃO INTEGRA & SEGURA
          </div>
        </div>
      </div>

      {/* Multi-tenant Context Widget */}
      <div style={{
        padding: '0.875rem 1rem',
        margin: '1rem 0.75rem 0.5rem 0.75rem',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Empresa Ativa
          </span>
          {empresa && (
            <span className={`badge ${getPlanoBadgeClass(empresa.plano)}`}>
              {empresa.plano}
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.875rem', color: '#FFFFFF', marginBottom: '8px' }}>
          <Building2 size={16} style={{ color: '#00C896', flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {empresa ? empresa.nome : 'Sem Empresa'}
          </span>
        </div>

        {/* Demo Switcher */}
        <select 
          className="form-select"
          value={empresa ? empresa.id : ''}
          onChange={(e) => switchDemoEmpresa(e.target.value)}
          style={{
            padding: '4px 8px',
            fontSize: '0.75rem',
            backgroundColor: '#0A2540',
            color: '#FFFFFF',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '6px'
          }}
        >
          {empresas.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.nome} ({emp.plano})
            </option>
          ))}
        </select>
      </div>

      {/* Accordion Categorized Navigation */}
      <nav className="sidebar-nav" style={{ overflowY: 'auto' }}>
        
        {/* Direct Link: Dashboard */}
        <button
          className={`sidebar-item ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('dashboard')}
          style={{ marginBottom: '0.75rem' }}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        {/* Category: CADASTROS & ESTOQUE */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div 
            onClick={() => toggleSection('cadastros')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.35rem 0.5rem',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <span>Cadastros & Estoque</span>
            {openSections.cadastros ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>

          {openSections.cadastros && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingLeft: '0.25rem', marginTop: '0.25rem' }}>
              <button
                className={`sidebar-item ${currentTab === 'clientes' ? 'active' : ''}`}
                onClick={() => setCurrentTab('clientes')}
              >
                <Users size={18} />
                <span>Clientes</span>
              </button>

              <button
                className={`sidebar-item ${currentTab === 'produtos' ? 'active' : ''}`}
                onClick={() => setCurrentTab('produtos')}
              >
                <Package size={18} />
                <span>Produtos & Estoque</span>
              </button>

              <button
                className={`sidebar-item ${currentTab === 'entradas_estoque' ? 'active' : ''}`}
                onClick={() => setCurrentTab('entradas_estoque')}
                style={{ color: currentTab === 'entradas_estoque' ? '#FFFFFF' : '#00C896' }}
              >
                <ArrowDownLeft size={18} />
                <span>Entrada de Estoque</span>
              </button>

              <button
                className={`sidebar-item ${currentTab === 'transportadoras' ? 'active' : ''}`}
                onClick={() => setCurrentTab('transportadoras')}
              >
                <Truck size={18} />
                <span>Transportadoras</span>
              </button>

              <button
                className={`sidebar-item ${currentTab === 'fornecedores' ? 'active' : ''}`}
                onClick={() => setCurrentTab('fornecedores')}
              >
                <Building2 size={18} />
                <span>Fornecedores</span>
              </button>
            </div>
          )}
        </div>

        {/* Category: FINANCEIRO, VENDAS & VISITAS */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div 
            onClick={() => toggleSection('financeiro')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.35rem 0.5rem',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <span>Financeiro & Vendas</span>
            {openSections.financeiro ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>

          {openSections.financeiro && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingLeft: '0.25rem', marginTop: '0.25rem' }}>
              <button
                className={`sidebar-item ${currentTab === 'vendas' ? 'active' : ''}`}
                onClick={() => setCurrentTab('vendas')}
              >
                <ShoppingCart size={18} />
                <span>Vendas (PDV)</span>
              </button>

              <button
                className={`sidebar-item ${currentTab === 'visitas' ? 'active' : ''}`}
                onClick={() => setCurrentTab('visitas')}
              >
                <Car size={18} />
                <span>Gestão de Visitas & Rotas</span>
              </button>

              <button
                className={`sidebar-item ${currentTab === 'financeiro' ? 'active' : ''}`}
                onClick={() => setCurrentTab('financeiro')}
              >
                <DollarSign size={18} />
                <span>Contas a Pagar/Receber</span>
              </button>
            </div>
          )}
        </div>

        {/* Category: RELATÓRIOS */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div 
            onClick={() => toggleSection('relatorios')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.35rem 0.5rem',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <span>Relatórios</span>
            {openSections.relatorios ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>

          {openSections.relatorios && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingLeft: '0.25rem', marginTop: '0.25rem' }}>
              <button
                className={`sidebar-item ${currentTab === 'relatorios' ? 'active' : ''}`}
                onClick={() => setCurrentTab('relatorios')}
              >
                <BarChart3 size={18} />
                <span>Relatórios Financeiro/Vendas</span>
              </button>
            </div>
          )}
        </div>

        {/* Category: SISTEMA */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div 
            onClick={() => toggleSection('sistema')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.35rem 0.5rem',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <span>Sistema & Segurança</span>
            {openSections.sistema ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>

          {openSections.sistema && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingLeft: '0.25rem', marginTop: '0.25rem' }}>
              <button
                className={`sidebar-item ${currentTab === 'seguranca' ? 'active' : ''}`}
                onClick={() => setCurrentTab('seguranca')}
              >
                <ShieldCheck size={18} />
                <span>Segurança & Empresa</span>
              </button>
            </div>
          )}
        </div>

        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)', margin: '0.75rem 0' }}></div>

        {/* Landing Page link */}
        <button
          className="sidebar-item"
          onClick={() => setCurrentTab('landing')}
          style={{ color: '#00C896' }}
        >
          <Globe size={18} />
          <span>Ver Landing Page</span>
        </button>
      </nav>

      {/* Security badge footer */}
      <div style={{
        padding: '0.875rem 1rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.75rem',
        color: '#94A3B8'
      }}>
        <Lock size={14} style={{ color: '#00C896' }} />
        <span>Isolamento Multi-tenant Ativo</span>
      </div>
    </aside>
  );
};
