import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Building2, 
  FileText, 
  RotateCcw, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Upload, 
  CheckCircle2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Layers, 
  User, 
  DollarSign, 
  Info,
  Building,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Modal } from '../components/Modal';

export const EntradaEstoquePage = ({ showToast }) => {
  const { empresa, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('ALL');
  const [activeTab, setActiveTab] = useState('entradas'); // entradas, historico, alertas, xml

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEstornoModalOpen, setIsEstornoModalOpen] = useState(false);
  const [quickFornModalOpen, setQuickFornModalOpen] = useState(false);
  const [selectedEntradaEstorno, setSelectedEntradaEstorno] = useState(null);
  const [motivoEstornoText, setMotivoEstornoText] = useState('');

  const fornecedores = storage.getFornecedores(empresa?.id || '');
  const produtos = storage.getProdutos(empresa?.id || '');
  const entradas = storage.getEntradasEstoque(empresa?.id || '');
  const movimentacoes = storage.getMovimentacoesEstoque(empresa?.id || '');

  // Quick Supplier Creation State
  const [quickFornData, setQuickFornData] = useState({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    cidade: ''
  });

  // Initial Entry Form State
  const initialFormState = {
    tipoEntrada: 'Compra de fornecedor',
    motivo: 'Abastecimento de estoque de rotina',
    fornecedorId: fornecedores[0]?.id || '',
    numeroNotaFiscal: '',
    serieNotaFiscal: '1',
    observacoes: '',
    itens: [
      {
        produtoId: produtos[0]?.id || '',
        quantidade: 10,
        valorUnitario: produtos[0]?.precoCompra || 100.0,
        lote: 'LOT-2026-01',
        dataFabricacao: '',
        dataValidade: ''
      }
    ]
  };

  const [formData, setFormData] = useState(initialFormState);

  if (!empresa) return null;

  // Handle Quick Supplier Save
  const handleSaveQuickFornecedor = (e) => {
    e.preventDefault();
    if (!quickFornData.nome) return;

    try {
      const newForn = {
        ...quickFornData,
        tipo: 'Fornecedores',
        empresaId: empresa.id
      };
      storage.saveFornecedor(newForn, empresa.id, user.nome);
      setFormData(prev => ({ ...prev, fornecedorId: newForn.id }));
      setQuickFornModalOpen(false);
      setQuickFornData({ nome: '', cnpj: '', email: '', telefone: '', cidade: '' });
      showToast('success', `Fornecedor "${newForn.nome}" cadastrado e selecionado!`);
    } catch (err) {
      showToast('error', 'Erro ao cadastrar fornecedor.');
    }
  };

  // Add Item to Entry
  const handleAddItem = () => {
    if (produtos.length === 0) return;
    setFormData(prev => ({
      ...prev,
      itens: [
        ...prev.itens,
        {
          produtoId: produtos[0].id,
          quantidade: 1,
          valorUnitario: produtos[0].precoCompra || 50.0,
          lote: '',
          dataFabricacao: '',
          dataValidade: ''
        }
      ]
    }));
  };

  // Remove Item from Entry
  const handleRemoveItem = (index) => {
    if (formData.itens.length === 1) {
      showToast('error', 'A entrada deve possuir ao menos 1 produto.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index)
    }));
  };

  // Handle Item Change
  const handleItemChange = (index, field, value) => {
    const updated = [...formData.itens];
    updated[index][field] = value;

    if (field === 'produtoId') {
      const selectedProd = produtos.find(p => p.id === value);
      if (selectedProd) {
        updated[index].valorUnitario = selectedProd.precoCompra || 0;
      }
    }

    setFormData(prev => ({ ...prev, itens: updated }));
  };

  // Calculate Total Amount for Entry Form
  const totalFormValor = formData.itens.reduce((acc, it) => acc + ((parseFloat(it.quantidade) || 0) * (parseFloat(it.valorUnitario) || 0)), 0);

  // Submit Entry
  const handleSaveEntrada = (e) => {
    e.preventDefault();
    if (formData.itens.length === 0) {
      showToast('error', 'Adicione produtos à entrada.');
      return;
    }

    try {
      storage.saveEntradaEstoque(formData, empresa.id, user.nome);
      showToast('success', 'Entrada de estoque realizada e estoques atualizados com sucesso!');
      setIsModalOpen(false);
      setFormData(initialFormState);
    } catch (err) {
      showToast('error', 'Erro ao registrar entrada de estoque.');
    }
  };

  // Open Estorno Modal
  const handleOpenEstorno = (entrada) => {
    setSelectedEntradaEstorno(entrada);
    setMotivoEstornoText('');
    setIsEstornoModalOpen(true);
  };

  // Confirm Estorno
  const handleConfirmEstorno = (e) => {
    e.preventDefault();
    if (!selectedEntradaEstorno || !motivoEstornoText) {
      showToast('error', 'Informe o motivo do estorno.');
      return;
    }

    try {
      storage.estornarEntradaEstoque(selectedEntradaEstorno.id, motivoEstornoText, empresa.id, user.nome);
      showToast('success', `Estorno da Entrada #${selectedEntradaEstorno.numeroMovimentacao} realizado com sucesso! (Estoque revertido)`);
      setIsEstornoModalOpen(false);
      setSelectedEntradaEstorno(null);
    } catch (err) {
      showToast('error', err.message || 'Erro ao realizar estorno.');
    }
  };

  // Filtered Entradas
  const filteredEntradas = entradas.filter(e => {
    if (filterTipo !== 'ALL' && e.tipoEntrada !== filterTipo) return false;
    const term = searchTerm.toLowerCase();
    return (
      e.numeroMovimentacao.toLowerCase().includes(term) ||
      (e.fornecedorNome && e.fornecedorNome.toLowerCase().includes(term)) ||
      (e.numeroNotaFiscal && e.numeroNotaFiscal.toLowerCase().includes(term))
    );
  });

  // KPI Calculations
  const valorTotalEstoque = produtos.reduce((acc, p) => acc + ((parseFloat(p.estoque) || 0) * (parseFloat(p.precoCusto || p.precoCompra) || 0)), 0);
  const qtdTotalItensEstoque = produtos.reduce((acc, p) => acc + (parseFloat(p.estoque) || 0), 0);
  const entradasMesCount = entradas.length;

  // Alerts
  const produtosAbaixoMinimo = produtos.filter(p => (parseFloat(p.estoque) || 0) <= (parseFloat(p.estoqueMinimo) || 5));
  const produtosZerados = produtos.filter(p => (parseFloat(p.estoque) || 0) <= 0);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Entrada de Estoque & Rastreabilidade</h1>
          <p>Recebimento de mercadorias, lote, validade, rastreio completo e auditoria de {empresa.nome}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => setActiveTab('xml')}>
            <Upload size={18} /> Importar XML NF-e
          </button>
          <button className="btn btn-accent" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Nova Entrada de Estoque
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #00C896' }}>
          <div>
            <div className="stat-label">Valor Total em Estoque</div>
            <div className="stat-val" style={{ color: '#00C896' }}>R$ {valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Custo total dos produtos</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(0, 200, 150, 0.1)', color: '#00C896' }}>
            <DollarSign size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #3B82F6' }}>
          <div>
            <div className="stat-label">Qtd Total em Estoque</div>
            <div className="stat-val" style={{ color: '#3B82F6' }}>{qtdTotalItensEstoque} un.</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Unidades físicas armazenadas</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#DBEAFE', color: '#3B82F6' }}>
            <Package size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #8B5CF6' }}>
          <div>
            <div className="stat-label">Entradas Registradas</div>
            <div className="stat-val" style={{ color: '#8B5CF6' }}>{entradasMesCount}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Movimentações de entrada</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#EDE9FE', color: '#8B5CF6' }}>
            <ArrowDownLeft size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #EF4444' }}>
          <div>
            <div className="stat-label" style={{ color: '#EF4444' }}>Alertas de Estoque</div>
            <div className="stat-val" style={{ color: '#EF4444' }}>{produtosAbaixoMinimo.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Abaixo do estoque mínimo</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        borderBottom: '2px solid #00C896',
        marginBottom: '1.5rem',
        overflowX: 'auto'
      }}>
        <button
          className={`btn btn-sm ${activeTab === 'entradas' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('entradas')}
        >
          <ArrowDownLeft size={14} /> Entradas Realizadas ({entradas.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'historico' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('historico')}
        >
          <Layers size={14} /> Rastreabilidade & Histórico ({movimentacoes.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'alertas' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('alertas')}
        >
          <AlertTriangle size={14} /> Alertas Inteligentes ({produtosAbaixoMinimo.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'xml' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('xml')}
        >
          <Upload size={14} /> Leitor de XML NF-e
        </button>
      </div>

      {/* ABA 1: LISTA DE ENTRADAS */}
      {activeTab === 'entradas' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className={`btn btn-sm ${filterTipo === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterTipo('ALL')}
              >
                Todas
              </button>
              <button
                className={`btn btn-sm ${filterTipo === 'Compra de fornecedor' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterTipo('Compra de fornecedor')}
              >
                Compra Fornecedor
              </button>
              <button
                className={`btn btn-sm ${filterTipo === 'Devolução de cliente' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterTipo('Devolução de cliente')}
              >
                Devoluções
              </button>
              <button
                className={`btn btn-sm ${filterTipo === 'Ajuste de estoque' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterTipo('Ajuste de estoque')}
              >
                Ajustes
              </button>
            </div>

            <div style={{ position: 'relative', minWidth: '260px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Buscar por N. Movimentação, Fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Nº Movimentação</th>
                  <th>Data e Hora</th>
                  <th>Tipo da Entrada</th>
                  <th>Fornecedor / Origem</th>
                  <th>Nota Fiscal</th>
                  <th>Valor Total</th>
                  <th>Responsável</th>
                  <th>Status</th>
                  <th className="text-right">Ação / Auditoria</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntradas.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', color: '#64748B', padding: '3rem 1rem' }}>
                      Nenhuma entrada de estoque cadastrada.
                    </td>
                  </tr>
                ) : (
                  filteredEntradas.map(e => (
                    <tr key={e.id}>
                      <td className="font-mono" style={{ fontWeight: 800, color: '#0A2540' }}>{e.numeroMovimentacao}</td>
                      <td style={{ color: '#64748B' }}>{new Date(e.dataHora).toLocaleString('pt-BR')}</td>
                      <td>
                        <span className="badge badge-accent">
                          {e.tipoEntrada}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#0A2540' }}>{e.fornecedorNome || 'N/A'}</td>
                      <td className="font-mono">{e.numeroNotaFiscal ? `#${e.numeroNotaFiscal}` : 'Sem NF'}</td>
                      <td style={{ fontWeight: 800, color: '#10B981' }}>
                        R$ {(e.valorTotalNota || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ color: '#64748B' }}>{e.usuarioResponsavel}</td>
                      <td>
                        <span className={`badge ${e.status === 'Estornada' ? 'badge-danger' : 'badge-success'}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="text-right">
                        {e.status !== 'Estornada' ? (
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ color: '#EF4444', borderColor: '#FCA5A5' }}
                            onClick={() => handleOpenEstorno(e)}
                            title="Estornar Entrada (Preserva Rastro de Auditoria)"
                          >
                            <RotateCcw size={14} /> Estornar
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 700 }}>Estornado</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: RASTREABILIDADE & HISTÓRICO DE MOVIMENTAÇÕES */}
      {activeTab === 'historico' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Layers size={20} style={{ color: '#00C896' }} /> Trilha de Auditoria & Histórico de Movimentações
            </div>
            <span className="badge badge-accent">Rastreabilidade Total</span>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Nº Movimentação</th>
                  <th>Tipo</th>
                  <th>Produto</th>
                  <th>Qtd Movimentada</th>
                  <th>Origem ➔ Destino</th>
                  <th>Lote / Validade</th>
                  <th>Responsável</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.map(m => (
                  <tr key={m.id}>
                    <td style={{ color: '#64748B', fontSize: '0.8rem' }}>{new Date(m.dataHora).toLocaleString('pt-BR')}</td>
                    <td className="font-mono" style={{ fontWeight: 700 }}>{m.numeroMovimentacao}</td>
                    <td>
                      <span className={`badge ${m.quantidade < 0 ? 'badge-danger' : 'badge-success'}`}>
                        {m.tipoMovimentacao}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0A2540' }}>{m.produtoNome}</td>
                    <td className="font-mono" style={{ fontWeight: 800, color: m.quantidade < 0 ? '#EF4444' : '#10B981' }}>
                      {m.quantidade > 0 ? `+${m.quantidade}` : m.quantidade}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                      {m.origem} ➔ {m.destino}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748B' }}>
                      {m.lote ? `Lote: ${m.lote}` : 'S/ Lote'}
                    </td>
                    <td style={{ color: '#64748B' }}>{m.usuarioResponsavel}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748B' }}>{m.observacoes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: ALERTAS INTELIGENTES */}
      {activeTab === 'alertas' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <AlertTriangle size={20} style={{ color: '#EF4444' }} /> Central de Alertas Inteligentes de Estoque
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div style={{ padding: '1.25rem', border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', borderRadius: '12px' }}>
              <h3 style={{ color: '#991B1B', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={18} /> Produtos Abaixo do Estoque Mínimo ({produtosAbaixoMinimo.length})
              </h3>
              {produtosAbaixoMinimo.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed #FECACA', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 700, color: '#0A2540' }}>{p.nome}</span>
                  <span style={{ color: '#DC2626', fontWeight: 800 }}>Estoque: {p.estoque} (Mín: {p.estoqueMinimo || 5})</span>
                </div>
              ))}
            </div>

            <div style={{ padding: '1.25rem', border: '1px solid #FCD34D', backgroundColor: '#FEFCE8', borderRadius: '12px' }}>
              <h3 style={{ color: '#92400E', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={18} /> Produtos Sem Movimentação Recente
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#78350F' }}>
                Produtos com mais de 60 dias sem entradas ou saídas ativas no inventário.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: LEITOR DE XML DE NOTA FISCAL (IMPORTADOR AUTOMÁTICO) */}
      {activeTab === 'xml' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Upload size={20} style={{ color: '#00C896' }} /> Importador Inteligente de Nota Fiscal (XML NF-e)
            </div>
            <span className="badge badge-accent">Automação NF-e</span>
          </div>

          <div style={{
            border: '2px dashed #00C896',
            borderRadius: '12px',
            padding: '3rem 2rem',
            textAlign: 'center',
            backgroundColor: '#F8FAFC',
            marginBottom: '1.5rem'
          }}>
            <Upload size={48} style={{ color: '#00C896', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0A2540' }}>
              Arraste e solte o arquivo XML da NF-e aqui
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '4px' }}>
              O sistema lê automaticamente o CNPJ do fornecedor, itens, quantidades, lotes e custos unitários.
            </p>
            <button
              className="btn btn-accent"
              style={{ marginTop: '1.25rem' }}
              onClick={() => showToast('success', 'XML Simulado lido com sucesso! Produtos e custos preenchidos automaticamente.')}
            >
              Selecionar Arquivo .XML
            </button>
          </div>
        </div>
      )}

      {/* MODAL: NOVA ENTRADA DE ESTOQUE */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Entrada de Estoque"
        maxWidth="900px"
      >
        <form onSubmit={handleSaveEntrada}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tipo de Entrada *</label>
              <select
                className="form-select"
                required
                value={formData.tipoEntrada}
                onChange={(e) => setFormData({ ...formData, tipoEntrada: e.target.value })}
              >
                <option value="Compra de fornecedor">Compra de fornecedor</option>
                <option value="Devolução de cliente">Devolução de cliente</option>
                <option value="Ajuste de estoque">Ajuste de estoque</option>
                <option value="Produção">Produção interna</option>
                <option value="Transferência entre filiais">Transferência entre filiais</option>
                <option value="Bonificação">Bonificação</option>
                <option value="Brinde">Brinde</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Fornecedor / Origem *
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#00C896', marginLeft: '8px', cursor: 'pointer', fontWeight: 700 }}
                  onClick={() => setQuickFornModalOpen(true)}
                >
                  + Cadastrar na Hora
                </button>
              </label>
              <select
                className="form-select"
                required
                value={formData.fornecedorId}
                onChange={(e) => setFormData({ ...formData, fornecedorId: e.target.value })}
              >
                {fornecedores.map(f => (
                  <option key={f.id} value={f.id}>{f.nome} ({f.cnpj || f.cpfCnpj || 'S/ CNPJ'})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Número da Nota Fiscal (Opcional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: NF-99881"
                value={formData.numeroNotaFiscal}
                onChange={(e) => setFormData({ ...formData, numeroNotaFiscal: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Motivo da Movimentação *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="Ex: Abastecimento de estoque mensal"
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              />
            </div>
          </div>

          {/* Produtos da Entrada */}
          <div style={{ marginTop: '1.25rem', marginBottom: '1rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h4 style={{ fontWeight: 800, color: '#0A2540' }}>Produtos da Entrada</h4>
              <button type="button" className="btn btn-outline btn-sm" onClick={handleAddItem}>
                <Plus size={14} /> Adicionar Produto
              </button>
            </div>

            {formData.itens.map((it, idx) => (
              <div key={idx} style={{
                padding: '1rem',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                marginBottom: '0.75rem',
                border: '1px solid #E2E8F0'
              }}>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">Produto *</label>
                    <select
                      className="form-select"
                      required
                      value={it.produtoId}
                      onChange={(e) => handleItemChange(idx, 'produtoId', e.target.value)}
                    >
                      {produtos.map(p => (
                        <option key={p.id} value={p.id}>{p.nome} (Cod: {p.codigo})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quantidade *</label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      required
                      value={it.quantidade}
                      onChange={(e) => handleItemChange(idx, 'quantidade', parseFloat(e.target.value) || 1)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Valor Unit. Custo (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      required
                      value={it.valorUnitario}
                      onChange={(e) => handleItemChange(idx, 'valorUnitario', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="form-row" style={{ marginTop: '0.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Lote (Opcional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: LOT-2026-X"
                      value={it.lote}
                      onChange={(e) => handleItemChange(idx, 'lote', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Data Validade (Opcional)</label>
                    <input
                      type="date"
                      className="form-input"
                      value={it.dataValidade}
                      onChange={(e) => handleItemChange(idx, 'dataValidade', e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ color: '#EF4444', borderColor: '#FCA5A5' }}
                      onClick={() => handleRemoveItem(idx)}
                    >
                      Remover Item
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.1rem', color: '#10B981', marginTop: '0.75rem' }}>
              Valor Total da Entrada: R$ {totalFormValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', backgroundColor: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-accent">Concluir Entrada de Estoque</button>
          </div>
        </form>
      </Modal>

      {/* QUICK MODAL: CADASTRAR FORNECEDOR RÁPIDO NA HORA */}
      <Modal
        isOpen={quickFornModalOpen}
        onClose={() => setQuickFornModalOpen(false)}
        title="Cadastrar Fornecedor Rápido"
      >
        <form onSubmit={handleSaveQuickFornecedor}>
          <div className="form-group">
            <label className="form-label">Razão Social / Nome *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="Ex: Distribuidora Nacional LTDA"
              value={quickFornData.nome}
              onChange={(e) => setQuickFornData({ ...quickFornData, nome: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">CNPJ / CPF</label>
              <input
                type="text"
                className="form-input"
                placeholder="00.000.000/0001-00"
                value={quickFornData.cnpj}
                onChange={(e) => setQuickFornData({ ...quickFornData, cnpj: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input
                type="text"
                className="form-input"
                placeholder="(11) 99999-9999"
                value={quickFornData.telefone}
                onChange={(e) => setQuickFornData({ ...quickFornData, telefone: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', backgroundColor: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setQuickFornModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-accent">Salvar Fornecedor</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ESTORNO SEGURO DE ENTRADA (AUDITORIA) */}
      <Modal
        isOpen={isEstornoModalOpen}
        onClose={() => setIsEstornoModalOpen(false)}
        title={`Estornar Entrada #${selectedEntradaEstorno?.numeroMovimentacao}`}
      >
        <form onSubmit={handleConfirmEstorno}>
          <div style={{ backgroundColor: '#FEF2F2', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #EF4444', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 800, color: '#991B1B', fontSize: '0.9rem' }}>⚠️ AVISO DE AUDITORIA E SEGURANÇA</div>
            <p style={{ fontSize: '0.8rem', color: '#7F1D1D', marginTop: '4px' }}>
              Nenhuma movimentação é excluída permanentemente. O estorno irá reverter a quantidade de estoque dos produtos envolvidos e gravar uma movimentação de estorno vinculada ao seu usuário.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Motivo do Estorno (Obrigatório) *</label>
            <textarea
              className="form-textarea"
              rows={3}
              required
              placeholder="Descreva a justificativa para o estorno..."
              value={motivoEstornoText}
              onChange={(e) => setMotivoEstornoText(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', backgroundColor: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsEstornoModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-accent" style={{ backgroundColor: '#EF4444', borderColor: '#EF4444' }}>
              Confirmar Estorno
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
