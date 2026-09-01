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
  ArrowDownLeft,
  FileSpreadsheet,
  CreditCard,
  Zap,
  Sparkles,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';

export const Sidebar = ({ currentTab, setCurrentTab }) => {
  const { empresa, switchDemoEmpresa, logout } = useAuth();
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
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #00F5A0 0%, #00C896 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#032318',
          fontWeight: 900,
          boxShadow: '0 0 20px rgba(0, 245, 160, 0.4)',
          position: 'relative'
        }}>
          <ShieldCheck size={26} />
        </div>
        <div>
          <div className="sidebar-brand">Lafitec<span>ERP</span></div>
          <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Enterprise Edition
          </div>
        </div>
      </div>

      {/* Multi-tenant Context Box */}
      <div style={{
        padding: '0.95rem 1.1rem',
        margin: '1rem 0.85rem 0.5rem 0.85rem',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00F5A0', boxShadow: '0 0 8px #00F5A0' }}></span>
            <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Ambiente Ativo
            </span>
          </div>
          {empresa && (
            <span className={`badge ${getPlanoBadgeClass(empresa.plano)}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
              {empresa.plano}
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.875rem', color: '#FFFFFF', marginBottom: '10px' }}>
          <Building2 size={16} style={{ color: '#00F5A0', flexShrink: 0 }} />
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
            padding: '5px 8px',
            fontSize: '0.75rem',
            backgroundColor: '#071527',
            color: '#FFFFFF',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            fontWeight: 600
          }}
        >
          {empresas.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.nome} ({emp.plano})
            </option>
          ))}
        </select>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav" style={{ overflowY: 'auto' }}>
        
        {/* Direct Link: Dashboard */}
        <button
          className={`sidebar-item ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('dashboard')}
          style={{ marginBottom: '0.85rem' }}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard Analítico</span>
        </button>

        {/* Category: CADASTROS & ESTOQUE */}
        <div style={{ marginBottom: '0.85rem' }}>
          <div 
            onClick={() => toggleSection('cadastros')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.4rem 0.6rem',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
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
                style={{ color: currentTab === 'entradas_estoque' ? '#00F5A0' : '#38BDF8' }}
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

              <button
                className={`sidebar-item ${currentTab === 'condicoes_pagamento' ? 'active' : ''}`}
                onClick={() => setCurrentTab('condicoes_pagamento')}
              >
                <CreditCard size={18} />
                <span>Condições de Pagamento</span>
              </button>
            </div>
          )}
        </div>

        {/* Category: FINANCEIRO, VENDAS & VISITAS */}
        <div style={{ marginBottom: '0.85rem' }}>
          <div 
            onClick={() => toggleSection('financeiro')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.4rem 0.6rem',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <span>Comercial & Financeiro</span>
            {openSections.financeiro ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>

          {openSections.financeiro && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingLeft: '0.25rem', marginTop: '0.25rem' }}>
              <button
                className={`sidebar-item ${currentTab === 'orcamentos' ? 'active' : ''}`}
                onClick={() => setCurrentTab('orcamentos')}
                style={{ color: currentTab === 'orcamentos' ? '#00F5A0' : '#00F5A0' }}
              >
                <FileSpreadsheet size={18} />
                <span>Orçamentos Comerciais</span>
              </button>

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
                <span>Contas a Pagar / Receber</span>
              </button>
            </div>
          )}
        </div>

        {/* Category: RELATÓRIOS */}
        <div style={{ marginBottom: '0.85rem' }}>
          <div 
            onClick={() => toggleSection('relatorios')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.4rem 0.6rem',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <span>Inteligência & BI</span>
            {openSections.relatorios ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>

          {openSections.relatorios && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingLeft: '0.25rem', marginTop: '0.25rem' }}>
              <button
                className={`sidebar-item ${currentTab === 'relatorios' ? 'active' : ''}`}
                onClick={() => setCurrentTab('relatorios')}
              >
                <BarChart3 size={18} />
                <span>Relatórios Executivos</span>
              </button>
            </div>
          )}
        </div>

        {/* Category: SISTEMA */}
        <div style={{ marginBottom: '0.85rem' }}>
          <div 
            onClick={() => toggleSection('sistema')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.4rem 0.6rem',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <span>Configurações</span>
            {openSections.sistema ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>

          {openSections.sistema && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingLeft: '0.25rem', marginTop: '0.25rem' }}>
              <button
                className={`sidebar-item ${currentTab === 'seguranca' ? 'active' : ''}`}
                onClick={() => setCurrentTab('seguranca')}
              >
                <ShieldCheck size={18} />
                <span>Segurança & Auditoria</span>
              </button>
            </div>
          )}
        </div>

        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '0.75rem 0' }}></div>

        {/* Landing Page link */}
        <button
          className="sidebar-item"
          onClick={() => setCurrentTab('landing')}
          style={{ color: '#00F5A0' }}
        >
          <Globe size={18} />
          <span>Portal & Landing Page</span>
        </button>

        {/* Sair da Conta */}
        <button
          className="sidebar-item"
          onClick={logout}
          style={{
            color: '#F87171',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            marginTop: '0.4rem',
            fontWeight: 700
          }}
          title="Encerrar sessão e sair da conta"
        >
          <LogOut size={18} />
          <span>Sair da Conta</span>
        </button>
      </nav>

      {/* Security badge footer */}
      <div style={{
        padding: '0.95rem 1.1rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.725rem',
        color: '#94A3B8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Lock size={13} style={{ color: '#00F5A0' }} />
          <span>Isolamento Multi-tenant</span>
        </div>
        <span style={{ color: '#00F5A0', fontWeight: 800 }}>100% SEGURO</span>
      </div>
    </aside>
  );
};
