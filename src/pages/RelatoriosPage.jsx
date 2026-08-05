import React, { useState } from 'react';
import { BarChart3, FileSpreadsheet, Printer, TrendingUp, DollarSign, ShoppingCart, Users, Calendar, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';

export const RelatoriosPage = () => {
  const { empresa } = useAuth();
  const [reportType, setReportType] = useState('financeiro'); // financeiro, vendas, estoque

  if (!empresa) return null;

  const vendas = storage.getVendas(empresa.id);
  const financeiro = storage.getFinanceiro(empresa.id);
  const clientes = storage.getClientes(empresa.id);
  const produtos = storage.getProdutos(empresa.id);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const totalVendasVal = vendas.reduce((a, b) => a + (b.total || 0), 0);
  const totalEntradasPagos = financeiro.filter(f => f.tipo === 'Receber' && f.status === 'Pago').reduce((a, b) => a + b.valor, 0);
  const totalSaidasPagos = financeiro.filter(f => f.tipo === 'Pagar' && f.status === 'Pago').reduce((a, b) => a + b.valor, 0);
  const saldoLiquidoRealizado = totalEntradasPagos - totalSaidasPagos;

  const totalEntradasPendentes = financeiro.filter(f => f.tipo === 'Receber' && f.status === 'Pendente').reduce((a, b) => a + b.valor, 0);
  const totalSaidasPendentes = financeiro.filter(f => f.tipo === 'Pagar' && f.status === 'Pendente').reduce((a, b) => a + b.valor, 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Relatórios Gerenciais & Analíticos</h1>
          <p>Relatórios consolidados de vendas, caixa e produtos da empresa {empresa.nome}</p>
        </div>

        <button className="btn btn-outline" onClick={() => window.print()}>
          <Printer size={16} /> Imprimir / Exportar PDF
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${reportType === 'financeiro' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setReportType('financeiro')}
        >
          <DollarSign size={16} /> Relatório Financeiro
        </button>
        <button
          className={`btn ${reportType === 'vendas' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setReportType('vendas')}
        >
          <ShoppingCart size={16} /> Relatório de Vendas
        </button>
        <button
          className={`btn ${reportType === 'estoque' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setReportType('estoque')}
        >
          <BarChart3 size={16} /> Posição de Estoque
        </button>
      </div>

      {/* Report Content */}
      {reportType === 'financeiro' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <DollarSign size={20} style={{ color: '#00C896' }} /> Balanço Financeiro Consolidado
            </div>
            <span className="badge badge-accent">Relatório em Tempo Real</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Entradas Efetuadas</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981', marginTop: '0.25rem' }}>
                {formatCurrency(totalEntradasPagos)}
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Saídas Efetuadas</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EF4444', marginTop: '0.25rem' }}>
                {formatCurrency(totalSaidasPagos)}
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Saldo Realizado</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: saldoLiquidoRealizado >= 0 ? '#00C896' : '#EF4444', marginTop: '0.25rem' }}>
                {formatCurrency(saldoLiquidoRealizado)}
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>A Receber (Previsão)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3B82F6', marginTop: '0.25rem' }}>
                {formatCurrency(totalEntradasPendentes)}
              </div>
            </div>
          </div>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0A2540', marginBottom: '1rem' }}>
            Detalhamento das Contas Financeiras ({financeiro.length})
          </h4>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Vencimento</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {financeiro.map(f => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 700 }}>{f.descricao}</td>
                    <td>
                      <span className={`badge ${f.tipo === 'Receber' ? 'badge-success' : 'badge-danger'}`}>
                        {f.tipo}
                      </span>
                    </td>
                    <td className="font-mono">{new Date(f.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td className="font-mono" style={{ fontWeight: 800, color: f.tipo === 'Receber' ? '#10B981' : '#EF4444' }}>
                      {formatCurrency(f.valor)}
                    </td>
                    <td>
                      <span className={`badge ${f.status === 'Pago' ? 'badge-success' : 'badge-warning'}`}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'vendas' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShoppingCart size={20} style={{ color: '#00C896' }} /> Relatório Consolidado de Vendas
            </div>
            <span className="badge badge-accent">Total: {formatCurrency(totalVendasVal)}</span>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Código Venda</th>
                  <th>Cliente</th>
                  <th>Data da Venda</th>
                  <th>Qtd Itens</th>
                  <th className="text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map(v => (
                  <tr key={v.id}>
                    <td className="font-mono" style={{ fontWeight: 700, color: '#0A2540' }}>#{v.id}</td>
                    <td style={{ fontWeight: 600 }}>{v.clienteNome}</td>
                    <td>{new Date(v.dataVenda).toLocaleString('pt-BR')}</td>
                    <td>{v.itensCount || 1} un.</td>
                    <td className="text-right font-mono" style={{ fontWeight: 800, color: '#00C896' }}>
                      {formatCurrency(v.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'estoque' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BarChart3 size={20} style={{ color: '#0A2540' }} /> Relatório de Posição de Estoque
            </div>
            <span className="badge badge-dark">{produtos.length} Produtos Cadastrados</span>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Preço Unitário</th>
                  <th>Estoque Atual</th>
                  <th>Valor Total em Estoque</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map(p => {
                  const valorTotalEstoque = p.preco * p.estoque;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700, color: '#0A2540' }}>{p.nome}</td>
                      <td className="font-mono">{formatCurrency(p.preco)}</td>
                      <td className="font-mono" style={{ fontWeight: 700 }}>{p.estoque} un.</td>
                      <td className="font-mono" style={{ fontWeight: 800, color: '#00C896' }}>
                        {formatCurrency(valorTotalEstoque)}
                      </td>
                      <td>
                        {p.estoque === 0 ? (
                          <span className="badge badge-danger">Esgotado</span>
                        ) : p.estoque <= 5 ? (
                          <span className="badge badge-warning">Estoque Baixo</span>
                        ) : (
                          <span className="badge badge-success">Normal</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
