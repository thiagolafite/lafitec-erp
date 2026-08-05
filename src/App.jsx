import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientesPage } from './pages/ClientesPage';
import { ProdutosPage } from './pages/ProdutosPage';
import { TransportadorasPage } from './pages/TransportadorasPage';
import { FornecedoresPage } from './pages/FornecedoresPage';
import { VendasPage } from './pages/VendasPage';
import { FinanceiroPage } from './pages/FinanceiroPage';
import { RelatoriosPage } from './pages/RelatoriosPage';
import { SegurancaPage } from './pages/SegurancaPage';
import { VisitasPage } from './pages/VisitasPage';
import { EntradaEstoquePage } from './pages/EntradaEstoquePage';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', backgroundColor: '#0A2540', color: 'white', flexDirection: 'column', gap: '1rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255,255,255,0.1)',
          borderTopColor: '#00C896',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ fontWeight: 600 }}>Carregando Lafitec ERP...</span>
      </div>
    );
  }

  if (currentTab === 'landing') {
    return (
      <LandingPage
        onGoToLogin={() => setCurrentTab('login')}
        onSelectPlanRegister={(plan) => setCurrentTab('login')}
      />
    );
  }

  if (!isAuthenticated || currentTab === 'login') {
    return (
      <LoginPage
        onGoToLanding={() => setCurrentTab('landing')}
      />
    );
  }

  const tabTitles = {
    dashboard: 'Dashboard Analítico',
    clientes: 'Gestão de Clientes',
    produtos: 'Produtos & Estoque',
    entradas_estoque: 'Entrada de Estoque & Rastreabilidade',
    transportadoras: 'Cadastro de Transportadoras',
    fornecedores: 'Cadastro de Fornecedores',
    vendas: 'Ponto de Venda (PDV)',
    visitas: 'Gestão de Visitas & Rotas Comerciais',
    financeiro: 'Gestão Financeira (Contas)',
    relatorios: 'Relatórios Gerenciais',
    seguranca: 'Segurança & Empresa'
  };

  return (
    <div className="app-container">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <div className="main-content">
        <Navbar currentTabTitle={tabTitles[currentTab] || 'Lafitec ERP'} setCurrentTab={setCurrentTab} />
        
        <main className="page-body">
          {currentTab === 'dashboard' && <DashboardPage onNavigate={setCurrentTab} />}
          {currentTab === 'clientes' && <ClientesPage showToast={showToast} />}
          {currentTab === 'produtos' && <ProdutosPage showToast={showToast} />}
          {currentTab === 'entradas_estoque' && <EntradaEstoquePage showToast={showToast} />}
          {currentTab === 'transportadoras' && <TransportadorasPage showToast={showToast} />}
          {currentTab === 'fornecedores' && <FornecedoresPage showToast={showToast} />}
          {currentTab === 'vendas' && <VendasPage showToast={showToast} />}
          {currentTab === 'visitas' && <VisitasPage showToast={showToast} />}
          {currentTab === 'financeiro' && <FinanceiroPage showToast={showToast} />}
          {currentTab === 'relatorios' && <RelatoriosPage showToast={showToast} />}
          {currentTab === 'seguranca' && <SegurancaPage showToast={showToast} />}
        </main>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
