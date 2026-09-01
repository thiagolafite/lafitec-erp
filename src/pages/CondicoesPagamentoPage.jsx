import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Calendar, 
  DollarSign, 
  Percent, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  ListOrdered, 
  HelpCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Modal } from '../components/Modal';

export const CondicoesPagamentoPage = ({ showToast }) => {
  const { empresa, user } = useAuth();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('TODOS'); // 'TODOS' | 'VISTA' | 'PARCELADO'

  // Form State
  const [formDescricao, setFormDescricao] = useState('');
  const [formIntervaloDias, setFormIntervaloDias] = useState('');
  const [formPercentualCusto, setFormPercentualCusto] = useState(0);
  const [formCustoFixo, setFormCustoFixo] = useState(0);
  const [formOrdem, setFormOrdem] = useState(1);
  const [formImprimeNoPedido, setFormImprimeNoPedido] = useState(true);

  if (!empresa) return null;

  const condicoes = storage.getCondicoesPagamento(empresa.id);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const handleOpenModal = (cond = null) => {
    if (cond) {
      setEditingId(cond.id);
      setFormDescricao(cond.descricao || '');
      setFormIntervaloDias(cond.intervaloDias || '');
      setFormPercentualCusto(cond.percentualCustoFinanceiro || 0);
      setFormCustoFixo(cond.custoFinanceiroFixo || 0);
      setFormOrdem(cond.ordem !== undefined ? cond.ordem : 1);
      setFormImprimeNoPedido(cond.imprimeNoPedido !== undefined ? cond.imprimeNoPedido : true);
    } else {
      setEditingId(null);
      setFormDescricao('');
      setFormIntervaloDias('30');
      setFormPercentualCusto(0);
      setFormCustoFixo(0);
      setFormOrdem(condicoes.length + 1);
      setFormImprimeNoPedido(true);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formDescricao.trim()) {
      showToast('error', 'Informe a descrição da condição de pagamento.');
      return;
    }

    try {
      const payload = {
        id: editingId,
        descricao: formDescricao.trim(),
        intervaloDias: formIntervaloDias.trim() || '0',
        percentualCustoFinanceiro: parseFloat(formPercentualCusto) || 0,
        custoFinanceiroFixo: parseFloat(formCustoFixo) || 0,
        ordem: parseInt(formOrdem) || 1,
        imprimeNoPedido: Boolean(formImprimeNoPedido)
      };

      storage.saveCondicaoPagamento(payload, empresa.id, user.nome);
      showToast('success', editingId ? 'Condição de pagamento atualizada!' : 'Condição de pagamento cadastrada com sucesso!');
      setIsModalOpen(false);
      setEditingId(null);
    } catch (err) {
      showToast('error', err.message || 'Erro ao salvar condição de pagamento.');
    }
  };

  const handleDelete = (id, descricao) => {
    if (!window.confirm(`Deseja realmente excluir a condição "${descricao}"?`)) return;
    try {
      storage.deleteCondicaoPagamento(id, empresa.id, user.nome);
      showToast('success', `Condição "${descricao}" excluída com sucesso.`);
    } catch (err) {
      showToast('error', err.message || 'Erro ao excluir.');
    }
  };

  // Helper to parse interval days for live preview
  const parseIntervalPreview = (str) => {
    const rawParts = (str || '')
      .split(/[\s,;/]+/)
      .map(s => s.trim())
      .filter(Boolean);
    
    if (rawParts.length === 0) {
      return [{ parcela: 1, dias: 0, label: 'À Vista (Imediato)' }];
    }

    return rawParts.map((p, idx) => {
      const d = parseInt(p, 10);
      const dias = isNaN(d) ? 0 : d;
      return {
        parcela: idx + 1,
        dias,
        label: dias === 0 ? 'À Vista (Imediato)' : `${dias} dias`
      };
    });
  };

  const previewParcelas = parseIntervalPreview(formIntervaloDias);

  // Filter conditions
  const filteredCondicoes = condicoes.filter(c => {
    const matchSearch = searchTerm === '' || 
      c.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.intervaloDias && c.intervaloDias.includes(searchTerm));

    const isVista = (c.intervaloDias === '0' || c.intervaloDias === '' || c.parcelasCount === 1 && c.intervaloDias === '0');
    const matchTipo = filterTipo === 'TODOS' || 
      (filterTipo === 'VISTA' && isVista) || 
      (filterTipo === 'PARCELADO' && !isVista);

    return matchSearch && matchTipo;
  });

  // KPIs
  const totalGeral = condicoes.length;
  const countVista = condicoes.filter(c => c.intervaloDias === '0' || c.intervaloDias === '').length;
  const countParcelado = condicoes.filter(c => c.intervaloDias !== '0' && c.intervaloDias !== '').length;
  const countComCusto = condicoes.filter(c => (c.percentualCustoFinanceiro > 0 || c.custoFinanceiroFixo > 0)).length;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Condições & Formas de Pagamento</h1>
          <p>Configure regras de parcelamento, prazos, custos financeiros e ordem de exibição para orçamentos e vendas</p>
        </div>
        <button className="btn btn-accent" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nova Condição de Pagamento
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Cadastradas</div>
            <div className="stat-val">{totalGeral}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(10, 37, 64, 0.08)', color: 'var(--primary-dark)' }}>
            <CreditCard size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Pagamento À Vista</div>
            <div className="stat-val">{countVista}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(0, 200, 150, 0.12)', color: '#00C896' }}>
            <DollarSign size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">A Prazo / Parceladas</div>
            <div className="stat-val" style={{ color: '#2563EB' }}>{countParcelado}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB' }}>
            <Calendar size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Com Custo Financeiro</div>
            <div className="stat-val" style={{ color: '#D97706' }}>{countComCusto}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#D97706' }}>
            <Percent size={24} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        {/* Filter and Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${filterTipo === 'TODOS' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterTipo('TODOS')}
            >
              Todas ({totalGeral})
            </button>
            <button
              className={`btn btn-sm ${filterTipo === 'VISTA' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterTipo('VISTA')}
            >
              À Vista ({countVista})
            </button>
            <button
              className={`btn btn-sm ${filterTipo === 'PARCELADO' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterTipo('PARCELADO')}
            >
              A Prazo ({countParcelado})
            </button>
          </div>

          <div style={{ position: 'relative', minWidth: '280px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Buscar por descrição ou intervalo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          </div>
        </div>

        {/* Master Table */}
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Ordem</th>
                <th>Descrição da Condição</th>
                <th>Intervalo de Dias (Prazos)</th>
                <th>Parcelas</th>
                <th>% Custo Financeiro</th>
                <th>Custo Fixo (R$)</th>
                <th>Imprime no Pedido</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCondicoes.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#64748B', padding: '3.5rem 1rem' }}>
                    <CreditCard size={44} style={{ opacity: 0.35, marginBottom: '0.75rem', display: 'inline-block' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-dark)' }}>Nenhuma condição de pagamento cadastrada</div>
                    <div style={{ fontSize: '0.8125rem', marginTop: '4px' }}>Cadastre opções como À Vista, 30 Dias, 30/60/90 para facilitar a negociação nos orçamentos.</div>
                  </td>
                </tr>
              ) : (
                filteredCondicoes.map(cond => (
                  <tr key={cond.id}>
                    <td>
                      <span className="badge badge-dark font-mono" style={{ fontWeight: 800 }}>
                        #{cond.ordem || 1}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: '0.925rem' }}>
                        {cond.descricao}
                      </div>
                    </td>
                    <td>
                      <span className="font-mono" style={{ color: '#0A2540', fontWeight: 600 }}>
                        {cond.intervaloDias || '0 (À Vista)'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {cond.parcelasCount || 1}x parcela(s)
                      </span>
                    </td>
                    <td>
                      {cond.percentualCustoFinanceiro > 0 ? (
                        <span style={{ color: '#D97706', fontWeight: 700 }}>
                          +{Number(cond.percentualCustoFinanceiro).toFixed(2)}%
                        </span>
                      ) : (
                        <span style={{ color: '#64748B' }}>0,00%</span>
                      )}
                    </td>
                    <td>
                      {cond.custoFinanceiroFixo > 0 ? (
                        <span style={{ color: '#D97706', fontWeight: 700 }}>
                          {formatCurrency(cond.custoFinanceiroFixo)}
                        </span>
                      ) : (
                        <span style={{ color: '#64748B' }}>R$ 0,00</span>
                      )}
                    </td>
                    <td>
                      {cond.imprimeNoPedido !== false ? (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} /> Sim
                        </span>
                      ) : (
                        <span className="badge badge-dark">
                          <XCircle size={12} /> Não
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button
                          className="btn-icon"
                          title="Editar Condição"
                          onClick={() => handleOpenModal(cond)}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Excluir Condição"
                          onClick={() => handleDelete(cond.id, cond.descricao)}
                          style={{ color: '#DC2626' }}
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

      {/* ========================================================================= */}
      {/* MODAL: NOVA / EDITAR CONDIÇÃO DE PAGAMENTO (FIEL AO PROJETO E SCREENSHOT) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isModalOpen}
        title={editingId ? 'Editar Condição de Pagamento' : 'Nova Condição de Pagamento'}
        onClose={() => setIsModalOpen(false)}
        maxWidth="620px"
      >
        <form onSubmit={handleSave}>
          <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
            
            {/* Descrição */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>
                Descrição: *
              </label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="Ex: 30 / 60 Dias, Boleto 28DD, À Vista PIX..."
                value={formDescricao}
                onChange={(e) => setFormDescricao(e.target.value)}
                autoFocus
              />
            </div>

            {/* Intervalo de dias */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>
                Intervalo de dias: *
              </label>
              <input
                type="text"
                className="form-input font-mono"
                placeholder="Ex: 30, 60 ou 30 60 90 (0 para à vista)"
                value={formIntervaloDias}
                onChange={(e) => setFormIntervaloDias(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontStyle: 'italic', marginTop: '4px', display: 'block' }}>
                Informe o número de dias da parcela e pressione enter ou separe por vírgula, e assim para as demais.
              </span>
            </div>

            {/* Live Installments Simulator Box */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px dashed #CBD5E1', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                Simulação de Parcelas ({previewParcelas.length}x):
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {previewParcelas.map((p, i) => (
                  <span key={i} className="badge badge-info font-mono" style={{ fontSize: '0.75rem' }}>
                    {p.parcela}ª Parc: {p.label}
                  </span>
                ))}
              </div>
            </div>

            {/* % Custo Financeiro & Custo Financeiro R$ */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">% Custo Financeiro:</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="0.00"
                    value={formPercentualCusto}
                    onChange={(e) => setFormPercentualCusto(e.target.value)}
                  />
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontWeight: 700 }}>
                    %
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Custo Financeiro R$:</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="0.00"
                    value={formCustoFixo}
                    onChange={(e) => setFormCustoFixo(e.target.value)}
                  />
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontWeight: 700 }}>
                    R$
                  </span>
                </div>
              </div>
            </div>

            {/* Ordem & Imprime no Pedido */}
            <div className="form-row" style={{ alignItems: 'center' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Ordem de Exibição:</label>
                <input
                  type="number"
                  min="1"
                  className="form-input font-mono"
                  value={formOrdem}
                  onChange={(e) => setFormOrdem(parseInt(e.target.value) || 1)}
                  style={{ maxWidth: '140px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Imprime no Pedido:</label>
                <div style={{ display: 'inline-flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                  <button
                    type="button"
                    onClick={() => setFormImprimeNoPedido(true)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      backgroundColor: formImprimeNoPedido ? '#00C896' : '#FFFFFF',
                      color: formImprimeNoPedido ? '#05291E' : '#64748B',
                      transition: 'all 0.2s'
                    }}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormImprimeNoPedido(false)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      backgroundColor: !formImprimeNoPedido ? '#64748B' : '#FFFFFF',
                      color: !formImprimeNoPedido ? '#FFFFFF' : '#64748B',
                      transition: 'all 0.2s'
                    }}
                  >
                    Não
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Modal Footer Actions */}
          <div className="modal-footer" style={{ padding: 0, background: 'none', borderTop: '1px solid #E2E8F0', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-start', gap: '8px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, padding: '0.65rem 1.5rem' }}
            >
              <CheckCircle2 size={16} />
              Salvar
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsModalOpen(false)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <XCircle size={16} />
              Voltar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
