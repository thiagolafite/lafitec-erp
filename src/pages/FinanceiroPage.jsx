import React, { useState } from 'react';
import { DollarSign, Plus, CheckCircle, Clock, ArrowUpRight, ArrowDownLeft, Filter, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Modal } from '../components/Modal';

export const FinanceiroPage = ({ showToast }) => {
  const { empresa, user } = useAuth();
  const [filterTipo, setFilterTipo] = useState('ALL'); // ALL, Receber, Pagar
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, Pendente, Pago
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    descricao: '',
    tipo: 'Receber',
    valor: '',
    status: 'Pendente',
    dataVencimento: new Date().toISOString().split('T')[0]
  });

  if (!empresa) return null;

  const financeiro = storage.getFinanceiro(empresa.id);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Summaries
  const totalReceberPendente = financeiro
    .filter(f => f.tipo === 'Receber' && f.status === 'Pendente')
    .reduce((acc, f) => acc + f.valor, 0);

  const totalPagarPendente = financeiro
    .filter(f => f.tipo === 'Pagar' && f.status === 'Pendente')
    .reduce((acc, f) => acc + f.valor, 0);

  const totalPago = financeiro
    .filter(f => f.status === 'Pago')
    .reduce((acc, f) => acc + (f.tipo === 'Receber' ? f.valor : -f.valor), 0);

  const filteredFinanceiro = financeiro.filter(f => {
    if (filterTipo !== 'ALL' && f.tipo !== filterTipo) return false;
    if (filterStatus !== 'ALL' && f.status !== filterStatus) return false;
    return true;
  });

  const handleOpenModal = () => {
    setFormData({
      descricao: '',
      tipo: 'Receber',
      valor: '',
      status: 'Pendente',
      dataVencimento: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      storage.saveFinanceiro(formData, empresa.id, user.nome);
      showToast('success', 'Lançamento financeiro registrado com sucesso!');
      setIsModalOpen(false);
    } catch (err) {
      showToast('error', 'Erro ao registrar lançamento.');
    }
  };

  const handleMarcarComoPago = (item) => {
    try {
      storage.marcarComoPago(item.id, empresa.id, user.nome);
      showToast('success', `Lançamento "${item.descricao}" marcado como PAGO!`);
    } catch (err) {
      showToast('error', 'Erro ao dar baixa no lançamento.');
    }
  };

  const handleDelete = (item) => {
    if (window.confirm(`Excluir o lançamento "${item.descricao}"?`)) {
      try {
        storage.deleteFinanceiro(item.id, empresa.id, user.nome);
        showToast('warning', `Lançamento removido.`);
      } catch (err) {
        showToast('error', 'Erro ao excluir lançamento.');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Gestão Financeira</h1>
          <p>Controle de Contas a Pagar e Receber da empresa {empresa.nome}</p>
        </div>
        <button className="btn btn-accent" onClick={handleOpenModal}>
          <Plus size={18} /> Novo Lançamento
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">A Receber (Pendente)</div>
            <div className="stat-val" style={{ color: '#10B981' }}>{formatCurrency(totalReceberPendente)}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Entradas futuras</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
            <ArrowUpRight size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">A Pagar (Pendente)</div>
            <div className="stat-val" style={{ color: '#EF4444' }}>{formatCurrency(totalPagarPendente)}</div>
            <div style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '4px' }}>Compromissos pendentes</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' }}>
            <ArrowDownLeft size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Saldo Liquidado</div>
            <div className="stat-val" style={{ color: totalPago >= 0 ? '#00C896' : '#EF4444' }}>
              {formatCurrency(totalPago)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Realizado no caixa</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(10, 37, 64, 0.1)', color: '#0A2540' }}>
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div className="card-title">
            <DollarSign size={20} style={{ color: '#00C896' }} /> Lançamentos Financeiros
          </div>

          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              style={{ width: 'auto', fontSize: '0.85rem' }}
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="Receber">Contas a Receber</option>
              <option value="Pagar">Contas a Pagar</option>
            </select>

            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: 'auto', fontSize: '0.85rem' }}
            >
              <option value="ALL">Todos os Status</option>
              <option value="Pendente">Apenas Pendentes</option>
              <option value="Pago">Apenas Pagos</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Descrição do Lançamento</th>
                <th>Tipo</th>
                <th>Vencimento</th>
                <th>Valor (R$)</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredFinanceiro.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#64748B', padding: '3rem 1rem' }}>
                    Nenhum lançamento localizado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredFinanceiro.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0A2540' }}>{item.descricao}</div>
                    </td>
                    <td>
                      {item.tipo === 'Receber' ? (
                        <span className="badge badge-success">Receber</span>
                      ) : (
                        <span className="badge badge-danger">Pagar</span>
                      )}
                    </td>
                    <td style={{ color: '#64748B' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} /> {new Date(item.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="font-mono" style={{
                      fontWeight: 800,
                      color: item.tipo === 'Receber' ? '#10B981' : '#EF4444'
                    }}>
                      {item.tipo === 'Pagar' ? '-' : '+'}{formatCurrency(item.valor)}
                    </td>
                    <td>
                      {item.status === 'Pago' ? (
                        <span className="badge badge-success">
                          <CheckCircle size={12} /> Pago
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          <Clock size={12} /> Pendente
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {item.status === 'Pendente' && (
                          <button
                            className="btn btn-accent btn-sm"
                            onClick={() => handleMarcarComoPago(item)}
                            title="Marcar como Pago (Dar Baixa)"
                          >
                            <CheckCircle size={14} /> Dar Baixa
                          </button>
                        )}
                        <button
                          className="btn-icon"
                          onClick={() => handleDelete(item)}
                          title="Excluir Lançamento"
                          style={{ color: '#EF4444' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Lançamento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Lançamento Financeiro"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Descrição do Lançamento</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="Ex: Aluguel do Escritório / Venda de Serviço"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tipo de Lançamento</label>
              <select
                className="form-select"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                <option value="Receber">Conta a Receber (+)</option>
                <option value="Pagar">Conta a Pagar (-)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                required
                placeholder="0.00"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Data de Vencimento</label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.dataVencimento}
                onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status Inicial</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', backgroundColor: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-accent">
              Registrar Lançamento
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
