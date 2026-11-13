import React, { useState, useMemo } from 'react';
import { FileText, ShoppingCart, Calendar, DollarSign, Package } from 'lucide-react';
import { Modal } from './Modal';
import { storage } from '../services/storage';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(val) || 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
};

const getStatusBadgeClass = (status) => {
  const s = (status || '').toLowerCase();
  if (s.includes('aprov') || s.includes('conclu') || s.includes('fatur') || s.includes('pago')) return 'badge-success';
  if (s.includes('rejeit') || s.includes('cancel') || s.includes('estorn')) return 'badge-danger';
  if (s.includes('enviad') || s.includes('negoc') || s.includes('rascunho')) return 'badge-warning';
  return 'badge-accent';
};

export const VinculosModal = ({ isOpen, onClose, entityType, entity, empresaId }) => {
  const [activeTab, setActiveTab] = useState('orcamentos');

  const { orcamentosVinculados, vendasVinculadas } = useMemo(() => {
    if (!isOpen || !entity || !empresaId) {
      return { orcamentosVinculados: [], vendasVinculadas: [] };
    }

    const todosOrcamentos = storage.getOrcamentos(empresaId) || [];
    const todasVendas = storage.getVendas(empresaId) || [];
    const entityNameLower = (entity.nome || '').trim().toLowerCase();

    let orcs = [];
    let vends = [];

    if (entityType === 'cliente') {
      orcs = todosOrcamentos.filter(o => o.clienteId === entity.id);
      vends = todasVendas.filter(v => v.clienteId === entity.id);
    } else if (entityType === 'fornecedor') {
      orcs = todosOrcamentos.filter(o =>
        o.fornecedorId === entity.id ||
        (Array.isArray(o.itens) && o.itens.some(it => it.fornecedorId === entity.id))
      );
      const orcIdsDoFornecedor = new Set(orcs.map(o => o.id));
      vends = todasVendas.filter(v =>
        v.fornecedorId === entity.id ||
        (v.orcamentoId && orcIdsDoFornecedor.has(v.orcamentoId)) ||
        (Array.isArray(v.itens) && v.itens.some(it => it.fornecedorId === entity.id))
      );
    } else if (entityType === 'produto') {
      orcs = todosOrcamentos.filter(o =>
        Array.isArray(o.itens) &&
        o.itens.some(it =>
          it.produtoId === entity.id ||
          (entityNameLower && (it.nome || it.produtoNome || '').trim().toLowerCase() === entityNameLower)
        )
      );
      vends = todasVendas.filter(v =>
        Array.isArray(v.itens) &&
        v.itens.some(it =>
          it.produtoId === entity.id ||
          (entityNameLower && (it.produtoNome || it.nome || '').trim().toLowerCase() === entityNameLower)
        )
      );
    } else if (entityType === 'transportadora') {
      orcs = todosOrcamentos.filter(o =>
        o.transportadoraId === entity.id ||
        (entityNameLower && (o.transportadoraNome || '').trim().toLowerCase() === entityNameLower)
      );
      const orcIdsDaTransp = new Set(orcs.map(o => o.id));
      vends = todasVendas.filter(v =>
        v.transportadoraId === entity.id ||
        (entityNameLower && (v.transportadoraNome || '').trim().toLowerCase() === entityNameLower) ||
        (v.orcamentoId && orcIdsDaTransp.has(v.orcamentoId))
      );
    }

    return { orcamentosVinculados: orcs, vendasVinculadas: vends };
  }, [isOpen, entity, entityType, empresaId]);

  if (!isOpen || !entity) return null;

  const entityLabels = {
    cliente: 'Cliente',
    fornecedor: 'Fornecedor',
    produto: 'Produto',
    transportadora: 'Transportadora'
  };

  const totalOrcamentosValor = orcamentosVinculados.reduce((acc, o) => acc + (parseFloat(o.total) || 0), 0);
  const totalVendasValor = vendasVinculadas.reduce((acc, v) => acc + (parseFloat(v.total) || 0), 0);

  const getProductQty = (itens) => {
    if (!Array.isArray(itens) || entityType !== 'produto') return 0;
    const entityNameLower = (entity.nome || '').trim().toLowerCase();
    return itens
      .filter(it =>
        it.produtoId === entity.id ||
        (entityNameLower && (it.produtoNome || it.nome || '').trim().toLowerCase() === entityNameLower)
      )
      .reduce((acc, it) => acc + (parseFloat(it.quantidade) || 0), 0);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Orçamentos & Pedidos Vinculados — ${entityLabels[entityType] || 'Registro'}: ${entity.nome}`}
      maxWidth="960px"
    >
      {/* KPIs de Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(201, 169, 98, 0.16)', color: '#92702B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Orçamentos Vinculados</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1A1A1A' }}>
              {orcamentosVinculados.length} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>({formatCurrency(totalOrcamentosValor)})</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Pedidos de Venda</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1A1A1A' }}>
              {vendasVinculadas.length} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>({formatCurrency(totalVendasValor)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #C9A962', marginBottom: '1rem', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'orcamentos' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('orcamentos')}
        >
          <FileText size={14} /> Orçamentos ({orcamentosVinculados.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'pedidos' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('pedidos')}
        >
          <ShoppingCart size={14} /> Pedidos de Venda ({vendasVinculadas.length})
        </button>
      </div>

      {/* Lista de Orçamentos */}
      {activeTab === 'orcamentos' && (
        <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Data</th>
                <th>{entityType === 'cliente' ? 'Fornecedor' : 'Cliente'}</th>
                {entityType === 'produto' && <th>Qtd. Item</th>}
                <th>Cond. Pagto</th>
                <th>Status</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orcamentosVinculados.length === 0 ? (
                <tr>
                  <td colSpan={entityType === 'produto' ? 7 : 6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                    Nenhum orçamento vinculado a este cadastro.
                  </td>
                </tr>
              ) : (
                orcamentosVinculados.map(orc => (
                  <tr key={orc.id}>
                    <td className="font-mono" style={{ fontWeight: 700, color: '#1A1A1A' }}>{orc.numero || '-'}</td>
                    <td style={{ color: '#64748B' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} /> {formatDate(orc.dataEmissao)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {entityType === 'cliente' ? (orc.fornecedorNome || '-') : (orc.clienteNome || '-')}
                    </td>
                    {entityType === 'produto' && (
                      <td className="font-mono" style={{ fontWeight: 700 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Package size={13} style={{ color: '#C9A962' }} /> {getProductQty(orc.itens)}
                        </span>
                      </td>
                    )}
                    <td style={{ color: '#64748B' }}>{orc.condicaoPagamento || '-'}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(orc.status)}`}>{orc.status || 'Rascunho'}</span>
                    </td>
                    <td className="text-right font-mono" style={{ fontWeight: 800, color: '#1A1A1A' }}>
                      {formatCurrency(orc.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Lista de Pedidos de Venda */}
      {activeTab === 'pedidos' && (
        <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Data</th>
                <th>Cliente</th>
                {entityType === 'produto' && <th>Qtd. Item</th>}
                <th>Cond. Pagto</th>
                <th>Status</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {vendasVinculadas.length === 0 ? (
                <tr>
                  <td colSpan={entityType === 'produto' ? 7 : 6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                    Nenhum pedido de venda vinculado a este cadastro.
                  </td>
                </tr>
              ) : (
                vendasVinculadas.map(v => (
                  <tr key={v.id}>
                    <td className="font-mono" style={{ fontWeight: 700, color: '#1A1A1A' }}>{v.numeroVenda || v.id?.slice(0, 8)}</td>
                    <td style={{ color: '#64748B' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} /> {formatDate(v.dataVenda)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{v.clienteNome || '-'}</td>
                    {entityType === 'produto' && (
                      <td className="font-mono" style={{ fontWeight: 700 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Package size={13} style={{ color: '#C9A962' }} /> {getProductQty(v.itens)}
                        </span>
                      </td>
                    )}
                    <td style={{ color: '#64748B' }}>{v.condicaoPagamento || '-'}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(v.status)}`}>{v.status || 'Concluida'}</span>
                    </td>
                    <td className="text-right font-mono" style={{ fontWeight: 800, color: '#1A1A1A' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <DollarSign size={13} style={{ color: '#059669' }} /> {formatCurrency(v.total)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="modal-footer" style={{ padding: '1rem 0 0 0', backgroundColor: 'transparent', marginTop: '1rem' }}>
        <button type="button" className="btn btn-outline" onClick={onClose}>Fechar</button>
      </div>
    </Modal>
  );
};
