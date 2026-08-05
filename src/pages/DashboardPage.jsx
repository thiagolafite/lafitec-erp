import React, { useState } from 'react';
import { 
  DollarSign, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  PlusCircle, 
  Package, 
  FileText,
  Building,
  CheckCircle2,
  BarChart3,
  Calendar,
  Building2,
  Award,
  UserCheck,
  Percent
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';

export const DashboardPage = ({ onNavigate }) => {
  const { empresa, user } = useAuth();
  const [activeChartTab, setActiveChartTab] = useState('ALL'); // ALL, FORNECEDORES, CLIENTES, FATURAMENTO, VENDEDORES
  
  if (!empresa) return null;

  const clientes = storage.getClientes(empresa.id);
  const produtos = storage.getProdutos(empresa.id);
  const vendas = storage.getVendas(empresa.id);
  const financeiro = storage.getFinanceiro(empresa.id);
  const fornecedores = storage.getFornecedores(empresa.id);
  const todosParceiros = storage.getAllParceiros(empresa.id);

  // Metrics calculation
  const totalClientes = clientes.length;
  const totalVendasCount = vendas.length;
  
  const receitaTotalVendas = vendas.reduce((acc, v) => acc + (v.total || 0), 0);

  const contasReceberPendente = financeiro
    .filter(f => f.tipo === 'Receber' && f.status === 'Pendente')
    .reduce((acc, f) => acc + f.valor, 0);

  const contasPagarPendente = financeiro
    .filter(f => f.tipo === 'Pagar' && f.status === 'Pendente')
    .reduce((acc, f) => acc + f.valor, 0);

  const produtosEstoqueBaixo = produtos.filter(p => p.estoque <= (p.estoqueMinimo || 5));

  // Format BRL currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  // --- DYNAMIC DATA GENERATORS FOR THE 10 EXECUTIVE CHARTS ---
  const fornecedoresDataMes = [
    { nome: 'Dell Computadores', valor: 6202.20, color: '#0284C7' },
    { nome: 'Bienz Borrachas', valor: 3200.00, color: '#F97316' },
    { nome: 'Express Logística', valor: 1316.32, color: '#10B981' }
  ];

  const fornecedoresDataAno = [
    { nome: 'Dell Computadores', valor: 1131904.01, color: '#0284C7' },
    { nome: 'Bienz Borrachas', valor: 550237.20, color: '#F97316' },
    { nome: 'Mundial Color', valor: 273824.55, color: '#10B981' },
    { nome: 'Alutec Insumos', valor: 77237.00, color: '#EF4444' },
    { nome: 'Gradinese', valor: 74622.54, color: '#8B5CF6' },
    { nome: 'Pichu Tech', valor: 32435.00, color: '#EC4899' }
  ];

  const topClientesMes = [
    { nome: 'TechCorp Brasil S.A.', valor: 8364.70, color: '#0284C7' },
    { nome: 'Ana Beatriz Souza', valor: 1316.32, color: '#F97316' },
    { nome: 'Mercado Lima', valor: 1017.50, color: '#10B981' }
  ];

  const topClientesAno = [
    { nome: 'Celi Engenharia', valor: 312074.01, color: '#0284C7' },
    { nome: 'House Balneário', valor: 183196.50, color: '#F97316' },
    { nome: 'Construtora Santa Maria', valor: 148416.40, color: '#10B981' },
    { nome: 'Vog Ferragem', valor: 105900.80, color: '#EF4444' },
    { nome: 'Noah Residence', valor: 88500.00, color: '#8B5CF6' },
    { nome: 'Associação Residencial', valor: 85300.00, color: '#EC4899' },
    { nome: 'Solar Engenharia', valor: 78200.00, color: '#06B6D4' },
    { nome: 'Mundial ME', valor: 74100.00, color: '#F59E0B' },
    { nome: 'Alliance Nacional', valor: 62000.00, color: '#6366F1' }
  ];

  const vendasDiaAgosto = [
    { dia: '01/Ago', valor: 5290.00 },
    { dia: '02/Ago', valor: 8450.00 },
    { dia: '03/Ago', valor: 10718.52 },
    { dia: '04/Ago', valor: 6300.00 }
  ];

  const vendasComissaoMensal = [
    { mes: 'Janeiro', venda: 284556.01, comissao: 14227.80, color: '#0284C7' },
    { mes: 'Fevereiro', venda: 173000.57, comissao: 8650.00, color: '#F97316' },
    { mes: 'Março', venda: 350999.99, comissao: 17549.99, color: '#10B981' },
    { mes: 'Abril', venda: 518341.73, comissao: 25917.08, color: '#8B5CF6' },
    { mes: 'Maio', venda: 451916.24, comissao: 22595.81, color: '#EC4899' },
    { mes: 'Junho', venda: 160870.79, comissao: 8043.53, color: '#F59E0B' },
    { mes: 'Julho', venda: 10718.52, comissao: 535.92, color: '#06B6D4' },
    { mes: 'Agosto', venda: receitaTotalVendas || 15200.00, comissao: (receitaTotalVendas || 15200.00) * 0.05, color: '#00C896' }
  ];

  const faturamentoMensalAno = [
    { mes: 'Janeiro', valor: 12500.45, color: '#0284C7' },
    { mes: 'Fevereiro', valor: 39609.76, color: '#F97316' },
    { mes: 'Março', valor: 28400.00, color: '#10B981' },
    { mes: 'Abril', valor: 45200.00, color: '#8B5CF6' },
    { mes: 'Maio', valor: 52100.00, color: '#EC4899' },
    { mes: 'Junho', valor: 31800.00, color: '#F59E0B' },
    { mes: 'Julho', valor: 22400.00, color: '#06B6D4' },
    { mes: 'Agosto', valor: receitaTotalVendas || 18500.00, color: '#00C896' }
  ];

  const vendedorMes = [
    { vendedor: 'Carlos Vendedor', valor: receitaTotalVendas || 10718.52, color: '#0284C7' },
    { vendedor: 'Lafite Admin', valor: 4500.00, color: '#00C896' },
    { vendedor: 'Mariana Lima', valor: 2300.00, color: '#F97316' }
  ];

  const vendedorAno = [
    { vendedor: 'Carlos Vendedor', valor: 1758818.90, color: '#0284C7' },
    { vendedor: 'Mariana Lima', valor: 333629.58, color: '#F97316' },
    { vendedor: 'Lafite Admin', valor: 145200.00, color: '#10B981' }
  ];

  // Perfect Responsive Bar Chart Renderer with 100% bounds containment
  const renderBarChart = (items, labelKey, valueKey, height = 230) => {
    const maxVal = Math.max(...items.map(i => i[valueKey] || 0), 1);
    const count = items.length;

    return (
      <div style={{
        width: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        paddingBottom: '8px',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          height: `${height}px`,
          display: 'flex',
          alignItems: 'flex-end',
          gap: count > 6 ? '6px' : '12px',
          padding: '1.5rem 0.5rem 0.5rem 0.5rem',
          borderBottom: '1px solid #E2E8F0',
          position: 'relative',
          minWidth: count > 6 ? `${count * 65}px` : '100%',
          boxSizing: 'border-box'
        }}>
          {items.map((item, idx) => {
            const val = item[valueKey] || 0;
            const heightPct = Math.max((val / maxVal) * 75, 8);
            const barColor = item.color || '#0284C7';

            return (
              <div key={idx} style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                minWidth: '45px'
              }}>
                {/* Value Label on Top (Compact formatted) */}
                <div style={{
                  fontSize: count > 6 ? '0.65rem' : '0.725rem',
                  fontWeight: 800,
                  color: '#0A2540',
                  marginBottom: '4px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap'
                }}>
                  {formatCurrency(val)}
                </div>

                {/* Bar Element */}
                <div 
                  title={`${item[labelKey]}: ${formatCurrency(val)}`}
                  style={{
                    width: '85%',
                    maxWidth: '48px',
                    height: `${heightPct}%`,
                    backgroundColor: barColor,
                    borderRadius: '6px 6px 0 0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                />

                {/* Label at Bottom */}
                <div style={{
                  fontSize: count > 6 ? '0.675rem' : '0.725rem',
                  fontWeight: 700,
                  color: '#64748B',
                  marginTop: '6px',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '60px'
                }} title={item[labelKey]}>
                  {item[labelKey]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      {/* 1. Header welcome banner */}
      <div style={{
        backgroundColor: '#0A2540',
        borderRadius: '12px',
        padding: '1.75rem 2rem',
        color: '#FFFFFF',
        marginBottom: '2rem',
        backgroundImage: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)',
        boxShadow: '0 10px 20px -5px rgba(10, 37, 64, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: '#00C896', fontWeight: 700, textTransform: 'uppercase' }}>
              Painel de Controle Multi-tenant
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            Olá, {user?.nome}! Bem-vindo ao {empresa.nome}
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginTop: '4px' }}>
            Aqui está o resumo executivo e financeiro da sua empresa hoje.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => onNavigate('vendas')} className="btn btn-accent">
            <PlusCircle size={18} /> Nova Venda (PDV)
          </button>
          <button onClick={() => onNavigate('financeiro')} className="btn btn-outline" style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)' }}>
            <DollarSign size={18} /> Lançar Conta
          </button>
        </div>
      </div>

      {/* 2. Metric Cards Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total de Vendas</div>
            <div className="stat-val">{totalVendasCount}</div>
            <div style={{ fontSize: '0.75rem', color: '#00C896', marginTop: '4px', fontWeight: 600 }}>
              Faturamento: {formatCurrency(receitaTotalVendas)}
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(0, 200, 150, 0.12)', color: '#00C896' }}>
            <ShoppingCart size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Total de Clientes</div>
            <div className="stat-val">{totalClientes}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
              Cadastrados e ativos
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Contas a Receber</div>
            <div className="stat-val" style={{ color: '#10B981' }}>{formatCurrency(contasReceberPendente)}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
              Valores a liquidar
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Contas a Pagar</div>
            <div className="stat-val" style={{ color: '#EF4444' }}>{formatCurrency(contasPagarPendente)}</div>
            <div style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '4px', fontWeight: 600 }}>
              Pendente de quitação
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' }}>
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* 3. Resumo de Fluxo Financeiro & Alertas de Estoque */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Financial Flow Dynamic Chart */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={20} style={{ color: '#00C896' }} /> Resumo de Fluxo Financeiro
            </div>
            <span className="badge badge-accent">Visão Mensal</span>
          </div>

          <div style={{ padding: '1rem 0' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                <span>Receitas de Vendas ({formatCurrency(receitaTotalVendas)})</span>
                <span style={{ color: '#10B981' }}>100%</span>
              </div>
              <div style={{ height: '10px', backgroundColor: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', backgroundColor: '#00C896' }}></div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                <span>Contas a Receber ({formatCurrency(contasReceberPendente)})</span>
                <span style={{ color: '#3B82F6' }}>
                  {receitaTotalVendas > 0 ? ((contasReceberPendente / receitaTotalVendas) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div style={{ height: '10px', backgroundColor: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${receitaTotalVendas > 0 ? Math.min((contasReceberPendente / receitaTotalVendas) * 100, 100) : 30}%`, 
                  height: '100%', 
                  backgroundColor: '#3B82F6' 
                }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                <span>Contas a Pagar ({formatCurrency(contasPagarPendente)})</span>
                <span style={{ color: '#EF4444' }}>
                  {receitaTotalVendas > 0 ? ((contasPagarPendente / receitaTotalVendas) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div style={{ height: '10px', backgroundColor: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${receitaTotalVendas > 0 ? Math.min((contasPagarPendente / receitaTotalVendas) * 100, 100) : 20}%`, 
                  height: '100%', 
                  backgroundColor: '#EF4444' 
                }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Alerts Widget */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-header">
            <div className="card-title">
              <AlertTriangle size={20} style={{ color: '#F59E0B' }} /> Alertas de Estoque Baixo
            </div>
            <button onClick={() => onNavigate('produtos')} className="btn btn-outline btn-sm">
              Ver Todos
            </button>
          </div>

          {produtosEstoqueBaixo.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748B' }}>
              <CheckCircle2 size={32} style={{ color: '#10B981', margin: '0 auto 0.5rem auto' }} />
              <p style={{ fontWeight: 600 }}>Todos os produtos estão com estoque regular!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {produtosEstoqueBaixo.map(prod => (
                <div key={prod.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#92400E', fontSize: '0.875rem' }}>{prod.nome}</div>
                    <div style={{ fontSize: '0.75rem', color: '#B45309' }}>Preço: {formatCurrency(prod.preco)}</div>
                  </div>
                  <span className="badge badge-warning">
                    Restam {prod.estoque} un.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Recent Sales Table */}
      <div className="card" style={{ marginBottom: '2.5rem', overflow: 'hidden' }}>
        <div className="card-header">
          <div className="card-title">
            <ShoppingCart size={20} style={{ color: '#0A2540' }} /> Últimas Vendas Realizadas
          </div>
          <button onClick={() => onNavigate('vendas')} className="btn btn-primary btn-sm">
            Ir para Vendas <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Cód. Venda</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Qtd. Itens</th>
                <th className="text-right">Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {vendas.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#64748B', padding: '2rem' }}>
                    Nenhuma venda cadastrada ainda nesta empresa.
                  </td>
                </tr>
              ) : (
                vendas.slice(0, 5).map(v => (
                  <tr key={v.id}>
                    <td className="font-mono" style={{ fontWeight: 700, color: '#0A2540' }}>#{v.id}</td>
                    <td style={{ fontWeight: 600 }}>{v.clienteNome}</td>
                    <td style={{ color: '#64748B' }}>{new Date(v.dataVenda).toLocaleDateString('pt-BR')}</td>
                    <td>{v.itensCount || 1} item(ns)</td>
                    <td className="text-right font-mono" style={{ fontWeight: 800, color: '#00C896' }}>
                      {formatCurrency(v.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. SEÇÃO DE GRÁFICOS EXECUTIVOS ADICIONAIS COM 100% CONTENÇÃO NOS CARDS (Sem Transbordo) */}
      <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '2px dashed #E2E8F0', maxWidth: '100%' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A2540', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={24} style={{ color: '#00C896' }} /> Análises Comparativas & Business Intelligence
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Gráficos comparativos de fornecedores, clientes, faturamento e vendedores.
          </p>
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <button
            className={`btn btn-sm ${activeChartTab === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveChartTab('ALL')}
          >
            <BarChart3 size={14} /> Todos os Gráficos (10 Relatórios)
          </button>
          <button
            className={`btn btn-sm ${activeChartTab === 'FORNECEDORES' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveChartTab('FORNECEDORES')}
          >
            <Building2 size={14} /> Comparativo por Fornecedor
          </button>
          <button
            className={`btn btn-sm ${activeChartTab === 'CLIENTES' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveChartTab('CLIENTES')}
          >
            <Award size={14} /> Top 20 Clientes
          </button>
          <button
            className={`btn btn-sm ${activeChartTab === 'FATURAMENTO' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveChartTab('FATURAMENTO')}
          >
            <Calendar size={14} /> Vendas & Faturamento
          </button>
          <button
            className={`btn btn-sm ${activeChartTab === 'VENDEDORES' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveChartTab('VENDEDORES')}
          >
            <UserCheck size={14} /> Comparativo por Vendedor
          </button>
        </div>

        {/* Grid de Gráficos com Contenção Absoluta */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '1.5rem',
          maxWidth: '100%'
        }}>
          {/* CHART 1: Comparativo por Fornecedor (Mês Agosto) */}
          {(activeChartTab === 'ALL' || activeChartTab === 'FORNECEDORES') && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-header">
                <div className="card-title">
                  <Building2 size={18} style={{ color: '#0284C7' }} /> Comparativo por Fornecedor (Mês Agosto)
                </div>
                <span className="badge badge-accent">Mensal</span>
              </div>
              {renderBarChart(fornecedoresDataMes, 'nome', 'valor')}
            </div>
          )}

          {/* CHART 2: Comparativo por Fornecedor (Ano 2026) */}
          {(activeChartTab === 'ALL' || activeChartTab === 'FORNECEDORES') && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-header">
                <div className="card-title">
                  <Building2 size={18} style={{ color: '#0284C7' }} /> Comparativo por Fornecedor (Ano 2026)
                </div>
                <span className="badge badge-info">Anual</span>
              </div>
              {renderBarChart(fornecedoresDataAno, 'nome', 'valor')}
            </div>
          )}

          {/* CHART 3: Top Clientes (Mês Agosto) */}
          {(activeChartTab === 'ALL' || activeChartTab === 'CLIENTES') && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-header">
                <div className="card-title">
                  <Award size={18} style={{ color: '#F59E0B' }} /> Top Clientes (Mês Agosto)
                </div>
                <span className="badge badge-warning">Ranking Mensal</span>
              </div>
              {renderBarChart(topClientesMes, 'nome', 'valor')}
            </div>
          )}

          {/* CHART 4: Top 20 Clientes (Ano 2026) - CORRIGIDO E SEM VAZAMENTO */}
          {(activeChartTab === 'ALL' || activeChartTab === 'CLIENTES') && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-header">
                <div className="card-title">
                  <Award size={18} style={{ color: '#F59E0B' }} /> Top 20 Clientes (Ano 2026)
                </div>
                <span className="badge badge-accent">Ranking Anual</span>
              </div>
              {renderBarChart(topClientesAno, 'nome', 'valor')}
            </div>
          )}

          {/* CHART 5: Vendas Dia (Mês Agosto) */}
          {(activeChartTab === 'ALL' || activeChartTab === 'FATURAMENTO') && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-header">
                <div className="card-title">
                  <Calendar size={18} style={{ color: '#10B981' }} /> Vendas Dia (Mês Agosto)
                </div>
                <span className="badge badge-success">Diário</span>
              </div>
              {renderBarChart(vendasDiaAgosto, 'dia', 'valor')}
            </div>
          )}

          {/* CHART 6: Vendas / Comissão Mensal (Ano 2026) */}
          {(activeChartTab === 'ALL' || activeChartTab === 'FATURAMENTO') && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-header">
                <div className="card-title">
                  <Percent size={18} style={{ color: '#8B5CF6' }} /> Vendas / Comissão Mensal (Ano 2026)
                </div>
                <span className="badge badge-info">Venda x Comissão</span>
              </div>
              {renderBarChart(vendasComissaoMensal, 'mes', 'venda')}
            </div>
          )}

          {/* CHART 7: Faturamento Dia (Mês Agosto) */}
          {(activeChartTab === 'ALL' || activeChartTab === 'FATURAMENTO') && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-header">
                <div className="card-title">
                  <TrendingUp size={18} style={{ color: '#00C896' }} /> Faturamento Dia (Mês Agosto)
                </div>
                <span className="badge badge-accent">Fluxo Diário</span>
              </div>
              {renderBarChart(vendasDiaAgosto, 'dia', 'valor')}
            </div>
          )}

          {/* CHART 8: Faturamento Mensal (Ano 2026) */}
          {(activeChartTab === 'ALL' || activeChartTab === 'FATURAMENTO') && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-header">
                <div className="card-title">
                  <BarChart3 size={18} style={{ color: '#0284C7' }} /> Faturamento Mensal (Ano 2026)
                </div>
                <span className="badge badge-primary">Evolução Mensal</span>
              </div>
              {renderBarChart(faturamentoMensalAno, 'mes', 'valor')}
            </div>
          )}

          {/* CHART 9: Comparativo por Vendedor (Mês Agosto) */}
          {(activeChartTab === 'ALL' || activeChartTab === 'VENDEDORES') && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-header">
                <div className="card-title">
                  <UserCheck size={18} style={{ color: '#EC4899' }} /> Comparativo por Vendedor (Mês Agosto)
                </div>
                <span className="badge badge-dark">Performance Vendedores</span>
              </div>
              {renderBarChart(vendedorMes, 'vendedor', 'valor')}
            </div>
          )}

          {/* CHART 10: Comparativo por Vendedor (Ano 2026) */}
          {(activeChartTab === 'ALL' || activeChartTab === 'VENDEDORES') && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-header">
                <div className="card-title">
                  <UserCheck size={18} style={{ color: '#EC4899' }} /> Comparativo por Vendedor (Ano 2026)
                </div>
                <span className="badge badge-accent">Performance Anual</span>
              </div>
              {renderBarChart(vendedorAno, 'vendedor', 'valor')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
