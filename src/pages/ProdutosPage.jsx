import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  History, 
  ArrowLeft, 
  Save, 
  Layers, 
  Scale, 
  DollarSign, 
  Settings, 
  Tag, 
  FileText,
  Boxes,
  Calculator,
  Percent,
  Truck,
  Building2,
  Info,
  Ruler
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Modal } from '../components/Modal';

export const ProdutosPage = ({ showToast }) => {
  const { empresa, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [activeTab, setActiveTab] = useState('basico');

  // Quick Fornecedor Modal
  const [quickFornModal, setQuickFornModal] = useState(false);
  const [quickFornData, setQuickFornData] = useState({ nome: '', cnpj: '', email: '', telefone: '', categoria: '' });

  const [fornecedores, setFornecedores] = useState(() => storage.getFornecedores(empresa?.id || ''));

  const refreshListasAuxiliares = () => {
    if (empresa) {
      setFornecedores(storage.getFornecedores(empresa.id));
    }
  };

  const initialFormState = {
    codigo: '',
    nome: '',
    ncm: '',
    cest: '',
    referencia: '',
    codBarra: '',
    comissao: '0.00',
    vendedorComissao: '0.00',
    ipi: '0.00',
    st: '0.00',
    imagemNome: '',
    fornecedorId: '',
    unidade: 'Unidade',
    grupo: '',
    subGrupo: '',
    cores: '',
    tamanhos: '',
    alertaMessage: '',
    preco: '0.00',
    precoAtacado: '0.00',
    // Estoque / Pesos
    pesoLiquido: '0.000',
    pesoBruto: '0.000',
    qtdMinima: '1',
    qtdMultipla: '1',
    comp: '0.00',
    larg: '0.00',
    altu: '0.00',
    qtdVolumes: '1',
    cubagem: '0.000000',
    fichaTecnica: '',
    estoque: '0.00',
    controlaLote: false,
    estoqueMinimo: '5.00',
    estoqueMaximo: '100.00',
    // Custos & Margem
    precoCompra: '0.00',
    pctImpostos: '0.00',
    pctDespesas: '0.00',
    pctFrete: '0.00',
    rsFrete: '0.00',
    precoCusto: '0.00',
    pctMargem: '0.00',
    // Outras abas
    aplicacao: '',
    kitItens: [],
    materiaPrima: []
  };

  const [formData, setFormData] = useState(initialFormState);

  if (!empresa) return null;

  const produtos = storage.getProdutos(empresa.id);

  const filteredProdutos = produtos.filter(p => 
    (p.nome && p.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.codigo && p.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.referencia && p.referencia.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  // Cálculo Didático do Preço de Custo e Margem de Lucro
  const calculateCustoEMargem = (prev) => {
    const compra = parseFloat(prev.precoCompra) || 0;
    const impostos = (parseFloat(prev.pctImpostos) || 0) / 100;
    const despesas = (parseFloat(prev.pctDespesas) || 0) / 100;
    const fretePct = (parseFloat(prev.pctFrete) || 0) / 100;
    const freteRs = parseFloat(prev.rsFrete) || 0;

    const custoCalculado = compra + (compra * impostos) + (compra * despesas) + (compra * fretePct) + freteRs;
    const precoVenda = parseFloat(prev.preco) || 0;

    let margemCalculada = 0;
    if (custoCalculado > 0 && precoVenda > 0) {
      margemCalculada = ((precoVenda - custoCalculado) / custoCalculado) * 100;
    }

    return {
      precoCusto: custoCalculado.toFixed(2),
      pctMargem: margemCalculada.toFixed(2)
    };
  };

  const handleCustoFieldChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      const calc = calculateCustoEMargem(updated);
      return { ...updated, ...calc };
    });
  };

  const handleOpenModal = (prod = null) => {
    refreshListasAuxiliares();
    setActiveTab('basico');
    if (prod) {
      setEditingProduto(prod);
      setFormData({
        ...initialFormState,
        ...prod,
        preco: prod.preco ? prod.preco.toString() : '0.00',
        estoque: prod.estoque ? prod.estoque.toString() : '0.00'
      });
    } else {
      setEditingProduto(null);
      setFormData({
        ...initialFormState,
        codigo: 'PROD-' + Math.floor(100 + Math.random() * 900)
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduto(null);
  };

  const handleSaveQuickFornecedor = (e) => {
    e.preventDefault();
    if (!quickFornData.nome) return;
    try {
      const newForn = {
        ...quickFornData,
        id: 'forn-' + Date.now(),
        empresaId: empresa.id
      };
      storage.saveFornecedor(newForn, empresa.id, user.nome);
      refreshListasAuxiliares();
      setFormData(prev => ({ ...prev, fornecedorId: newForn.id }));
      setQuickFornModal(false);
      setQuickFornData({ nome: '', cnpj: '', email: '', telefone: '', categoria: '' });
      showToast('success', `Fornecedor "${newForn.nome}" cadastrado e selecionado!`);
    } catch (err) {
      showToast('error', 'Erro ao cadastrar fornecedor.');
    }
  };

  const handleSubmit = (e, duplicar = false) => {
    if (e) e.preventDefault();
    if (!formData.nome) {
      showToast('error', 'Preencha o Nome do produto.');
      return;
    }

    try {
      const prodSaveData = (editingProduto && !duplicar)
        ? { ...formData, id: editingProduto.id } 
        : { ...formData, id: undefined, codigo: 'PROD-' + Math.floor(100 + Math.random() * 900) };

      storage.saveProduto(prodSaveData, empresa.id, user.nome);
      showToast('success', duplicar ? 'Produto duplicado com sucesso!' : (editingProduto ? 'Produto atualizado!' : 'Produto cadastrado com sucesso!'));
      
      if (!duplicar) {
        handleCloseModal();
      } else {
        setFormData(prev => ({ ...prev, codigo: 'PROD-' + Math.floor(100 + Math.random() * 900), nome: prev.nome + ' (Cópia)' }));
      }
    } catch (err) {
      showToast('error', err.message || 'Erro ao salvar produto.');
    }
  };

  const handleDelete = (prod) => {
    if (window.confirm(`Excluir o produto "${prod.nome}"?`)) {
      try {
        storage.deleteProduto(prod.id, empresa.id, user.nome);
        showToast('warning', `Produto "${prod.nome}" removido.`);
      } catch (err) {
        showToast('error', 'Erro ao excluir produto.');
      }
    }
  };

  const tabsList = [
    { id: 'basico', label: '1. Dados Básicos & Preços' },
    { id: 'estoquePesos', label: '2. Estoque, Dimensões & Custos' },
    { id: 'aplicacao', label: '3. Ficha Técnica & Aplicação' },
    { id: 'kit', label: '4. Composição de KIT' },
    { id: 'materiaPrima', label: '5. Matéria-Prima & Insumos' }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Gestão de Produtos & Estoque</h1>
          <p>Catálogo de produtos da empresa {empresa.nome}</p>
        </div>
        <button className="btn btn-accent" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      <div className="card">
        {/* Search Bar */}
        <div style={{ marginBottom: '1.25rem', position: 'relative', maxWidth: '400px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por nome, código ou referência..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome do Produto</th>
                <th>Grupo / Categoria</th>
                <th>Preço Venda</th>
                <th>Preço Custo</th>
                <th>Margem (%)</th>
                <th>Estoque</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProdutos.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: '#64748B', padding: '3rem 1rem' }}>
                    {searchTerm ? 'Nenhum produto localizado com estes critérios.' : 'Nenhum produto cadastrado nesta empresa.'}
                  </td>
                </tr>
              ) : (
                filteredProdutos.map(prod => {
                  const isBaixo = (parseFloat(prod.estoque) || 0) <= (parseFloat(prod.estoqueMinimo) || 5);
                  const isEsgotado = (parseFloat(prod.estoque) || 0) === 0;
                  return (
                    <tr key={prod.id}>
                      <td className="font-mono" style={{ fontWeight: 700, color: '#0A2540' }}>{prod.codigo || prod.id}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0A2540' }}>{prod.nome}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Ref: {prod.referencia || 'N/A'}</div>
                      </td>
                      <td style={{ color: '#64748B' }}>{prod.grupo ? `${prod.grupo} (${prod.subGrupo || 'Geral'})` : 'Geral'}</td>
                      <td className="font-mono" style={{ fontWeight: 800, color: '#00C896' }}>
                        {formatCurrency(prod.preco)}
                      </td>
                      <td className="font-mono" style={{ color: '#64748B' }}>
                        {formatCurrency(prod.precoCusto || prod.precoCompra)}
                      </td>
                      <td className="font-mono">
                        <span className="badge badge-accent">
                          {prod.pctMargem || 0}%
                        </span>
                      </td>
                      <td className="font-mono" style={{ fontWeight: 700 }}>
                        {prod.estoque} {prod.unidade || 'un.'}
                      </td>
                      <td>
                        {isEsgotado ? (
                          <span className="badge badge-danger">Esgotado</span>
                        ) : isBaixo ? (
                          <span className="badge badge-warning">
                            <AlertTriangle size={12} /> Baixo
                          </span>
                        ) : (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} /> Normal
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button className="btn-icon" onClick={() => handleOpenModal(prod)} title="Editar Produto">
                            <Edit2 size={16} />
                          </button>
                          <button className="btn-icon" onClick={() => handleDelete(prod)} title="Excluir Produto" style={{ color: '#EF4444' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Didático e Organizado de Cadastro de Produto */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduto ? `Editar Produto: ${editingProduto.nome}` : 'Novo Cadastro de Produto'}
        maxWidth="1050px"
      >
        <form onSubmit={(e) => handleSubmit(e, false)}>
          {/* Navegação por Abas Limpas */}
          <div style={{
            display: 'flex',
            gap: '4px',
            borderBottom: '2px solid #00C896',
            overflowX: 'auto',
            marginBottom: '1.5rem',
            paddingBottom: '0px'
          }}>
            {tabsList.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '0.75rem 1.15rem',
                  fontSize: '0.85rem',
                  fontWeight: activeTab === t.id ? 800 : 600,
                  color: activeTab === t.id ? '#0A2540' : '#64748B',
                  backgroundColor: activeTab === t.id ? '#FFFFFF' : '#F8FAFC',
                  borderTop: activeTab === t.id ? '3px solid #00C896' : '1px solid #E2E8F0',
                  borderLeft: '1px solid #E2E8F0',
                  borderRight: '1px solid #E2E8F0',
                  borderBottom: activeTab === t.id ? '1px solid #FFFFFF' : 'none',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB 1: DADOS BÁSICOS & PREÇOS */}
          {activeTab === 'basico' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* PAINEL 1: IDENTIFICAÇÃO DO PRODUTO */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0A2540', fontWeight: 800, fontSize: '0.95rem', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                  <Package size={18} style={{ color: '#00C896' }} /> Identificação do Produto
                </div>

                <div className="form-row" style={{ gridTemplateColumns: '1.2fr 2.5fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Código Interno</label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      disabled
                      value={formData.codigo || '(AUTOMÁTICO)'}
                      style={{ backgroundColor: '#F8FAFC', color: '#64748B' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nome do Produto *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="Ex: Servidor Firewall Pro / Licença ERP"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Referência</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: REF-102"
                      value={formData.referencia}
                      onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Código de Barras (EAN/GTIN)</label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      placeholder="789000000000"
                      value={formData.codBarra}
                      onChange={(e) => setFormData({ ...formData, codBarra: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fornecedor Principal</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <select
                        className="form-select"
                        value={formData.fornecedorId}
                        onChange={(e) => setFormData({ ...formData, fornecedorId: e.target.value })}
                      >
                        <option value="">Selecione o fornecedor...</option>
                        {fornecedores.map(f => (
                          <option key={f.id} value={f.id}>{f.nome}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-accent btn-sm"
                        title="Cadastrar Novo Fornecedor na Hora"
                        onClick={() => setQuickFornModal(true)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Unidade de Medida</label>
                    <select
                      className="form-select"
                      value={formData.unidade}
                      onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                    >
                      <option value="Unidade">Unidade (un)</option>
                      <option value="Caixa">Caixa (cx)</option>
                      <option value="Peça">Peça (pc)</option>
                      <option value="Kg">Quilograma (kg)</option>
                      <option value="Metro">Metro (m)</option>
                      <option value="Kit">Kit (kt)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Grupo / Categoria</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Hardware, Software..."
                      value={formData.grupo}
                      onChange={(e) => setFormData({ ...formData, grupo: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">SubGrupo</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Redes, SaaS, Servidores..."
                      value={formData.subGrupo}
                      onChange={(e) => setFormData({ ...formData, subGrupo: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Cores Disponíveis (separar por vírgula)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Preto, Prata, Azul"
                      value={formData.cores}
                      onChange={(e) => setFormData({ ...formData, cores: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tamanhos / Variantes (separar por vírgula)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: P, M, G ou 1U Rack"
                      value={formData.tamanhos}
                      onChange={(e) => setFormData({ ...formData, tamanhos: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Alerta Interno (Exibido automaticamente nas vendas)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Produto frágil / Exige configuração técnica"
                      value={formData.alertaMessage}
                      onChange={(e) => setFormData({ ...formData, alertaMessage: e.target.value })}
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <AlertTriangle size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#EF4444' }} />
                  </div>
                </div>
              </div>

              {/* PAINEL 2: FISCAL & TRIBUTAÇÃO */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0A2540', fontWeight: 800, fontSize: '0.95rem', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                  <FileText size={18} style={{ color: '#00C896' }} /> Dados Fiscais & Alíquotas
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">NCM (Nomenclatura Comum)</label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      placeholder="0000.00.00"
                      value={formData.ncm}
                      onChange={(e) => setFormData({ ...formData, ncm: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">CEST</label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      placeholder="00.000.00"
                      value={formData.cest}
                      onChange={(e) => setFormData({ ...formData, cest: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">% IPI</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input font-mono"
                      value={formData.ipi}
                      onChange={(e) => setFormData({ ...formData, ipi: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">% ST (Substituição Tax)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input font-mono"
                      value={formData.st}
                      onChange={(e) => setFormData({ ...formData, st: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">% Comissão Venda</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input font-mono"
                      value={formData.comissao}
                      onChange={(e) => setFormData({ ...formData, comissao: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* PAINEL 3: SIMULADOR DIDÁTICO DE PREÇOS E MARGEM DE LUCRO */}
              <div style={{
                backgroundColor: '#0A2540',
                color: '#FFFFFF',
                borderRadius: '14px',
                padding: '1.5rem',
                boxShadow: '0 10px 25px -5px rgba(10, 37, 64, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1rem' }}>
                    <Calculator size={20} style={{ color: '#00C896' }} /> Simulador Didático de Formação de Preço
                  </div>
                  <span className="badge badge-accent">Calculadora em Tempo Real</span>
                </div>

                <div className="form-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#94A3B8' }}>Preço Venda Consumidor (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input font-mono"
                      required
                      value={formData.preco}
                      onChange={(e) => handleCustoFieldChange('preco', e.target.value)}
                      style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00C896', backgroundColor: '#07192C', borderColor: '#00C896' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: '#94A3B8' }}>Preço Atacado / Especial (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input font-mono"
                      value={formData.precoAtacado}
                      onChange={(e) => setFormData({ ...formData, precoAtacado: e.target.value })}
                      style={{ backgroundColor: '#07192C', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: '#94A3B8' }}>Preço de Custo (Calculado)</label>
                    <div style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: '#FFFFFF'
                    }}>
                      {formatCurrency(formData.precoCusto)}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: '#94A3B8' }}>% Margem de Lucro Estimada</label>
                    <div style={{
                      backgroundColor: 'rgba(0, 200, 150, 0.15)',
                      border: '1px solid #00C896',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: '#00C896'
                    }}>
                      {formData.pctMargem}% Lucro
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ESTOQUE, DIMENSÕES & CUSTOS */}
          {activeTab === 'estoquePesos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* PAINEL 1: CONTROLE DE ESTOQUE */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0A2540', fontWeight: 800, fontSize: '0.95rem', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                  <Boxes size={18} style={{ color: '#00C896' }} /> Controle de Estoque & Lote
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Estoque Atual *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input font-mono"
                      required
                      value={formData.estoque}
                      onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                      style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0A2540' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Estoque Mínimo (Alerta)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input font-mono"
                      value={formData.estoqueMinimo}
                      onChange={(e) => setFormData({ ...formData, estoqueMinimo: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Estoque Máximo</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input font-mono"
                      value={formData.estoqueMaximo}
                      onChange={(e) => setFormData({ ...formData, estoqueMaximo: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label className="form-label">Rastreabilidade de Lote</label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '4px' }}>
                      <input
                        type="checkbox"
                        checked={formData.controlaLote}
                        onChange={(e) => setFormData({ ...formData, controlaLote: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: '#00C896' }}
                      />
                      <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Controlar Lote & Validade</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* PAINEL 2: COMPOSIÇÃO DE CUSTOS DE COMPRA */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0A2540', fontWeight: 800, fontSize: '0.95rem', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                  <DollarSign size={18} style={{ color: '#00C896' }} /> Composição dos Custos de Aquisição
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Preço Compra / Fatura (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input font-mono"
                      value={formData.precoCompra}
                      onChange={(e) => handleCustoFieldChange('precoCompra', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">+ % Impostos Entradas</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input font-mono"
                      value={formData.pctImpostos}
                      onChange={(e) => handleCustoFieldChange('pctImpostos', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">+ % Despesas Operacionais</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input font-mono"
                      value={formData.pctDespesas}
                      onChange={(e) => handleCustoFieldChange('pctDespesas', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">+ % Frete de Compra</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input font-mono"
                      value={formData.pctFrete}
                      onChange={(e) => handleCustoFieldChange('pctFrete', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">ou + R$ Frete Fixo</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input font-mono"
                      value={formData.rsFrete}
                      onChange={(e) => handleCustoFieldChange('rsFrete', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* PAINEL 3: PESOS E DIMENSÕES */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0A2540', fontWeight: 800, fontSize: '0.95rem', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                  <Ruler size={18} style={{ color: '#00C896' }} /> Pesos, Cubagem & Embalagem
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Peso Líquido (Kg)</label>
                    <input
                      type="number"
                      step="0.001"
                      className="form-input font-mono"
                      value={formData.pesoLiquido}
                      onChange={(e) => setFormData({ ...formData, pesoLiquido: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Peso Bruto (Kg)</label>
                    <input
                      type="number"
                      step="0.001"
                      className="form-input font-mono"
                      value={formData.pesoBruto}
                      onChange={(e) => setFormData({ ...formData, pesoBruto: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Comprimento (cm)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input font-mono"
                      value={formData.comp}
                      onChange={(e) => setFormData({ ...formData, comp: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Largura (cm)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input font-mono"
                      value={formData.larg}
                      onChange={(e) => setFormData({ ...formData, larg: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Altura (cm)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input font-mono"
                      value={formData.altu}
                      onChange={(e) => setFormData({ ...formData, altu: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cubagem (M³)</label>
                    <input
                      type="number"
                      step="0.000001"
                      className="form-input font-mono"
                      value={formData.cubagem}
                      onChange={(e) => setFormData({ ...formData, cubagem: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FICHA TÉCNICA & APLICAÇÃO */}
          {activeTab === 'aplicacao' && (
            <div>
              <div className="form-group">
                <label className="form-label">Descrição Técnica Completa / Aplicação e Compatibilidade</label>
                <textarea
                  className="form-textarea"
                  rows={8}
                  placeholder="Descrever a aplicação detalhada do produto, veículos ou equipamentos compatíveis, manual ou especificações..."
                  value={formData.aplicacao}
                  onChange={(e) => setFormData({ ...formData, aplicacao: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* TAB 4: KIT */}
          {activeTab === 'kit' && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
              <Layers size={36} style={{ color: '#00C896', margin: '0 auto 0.75rem auto' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A2540' }}>Composição de KIT Comercial</h4>
              <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Este recurso permite transformar este item em um combo formado por outros produtos cadastrados.
              </p>
            </div>
          )}

          {/* TAB 5: MATÉRIA PRIMA */}
          {activeTab === 'materiaPrima' && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
              <Boxes size={36} style={{ color: '#3B82F6', margin: '0 auto 0.75rem auto' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A2540' }}>Matérias-Primas & Insumos de Fabricação</h4>
              <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Associe os componentes de estoque que são consumidos na produção deste item.
              </p>
            </div>
          )}

          {/* Rodapé de Ações Fiel ao Anexo */}
          <div className="modal-footer" style={{ padding: '1.25rem 0 0 0', borderTop: '1px solid #E2E8F0', marginTop: '1.5rem', backgroundColor: 'transparent' }}>
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-accent">
                  <Save size={16} /> Salvar Produto
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => handleSubmit(e, true)}
                >
                  <Copy size={16} /> Salvar e Duplicar
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => showToast('info', `Histórico registrado para ${formData.codigo}`)}
                >
                  <History size={16} /> Log
                </button>
              </div>

              <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                <ArrowLeft size={16} /> Voltar
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* QUICK MODAL: FORNECEDOR NA HORA */}
      <Modal
        isOpen={quickFornModal}
        onClose={() => setQuickFornModal(false)}
        title="Cadastro Rápido de Fornecedor"
      >
        <form onSubmit={handleSaveQuickFornecedor}>
          <div className="form-group">
            <label className="form-label">Razão Social / Fornecedor *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="Ex: Dell Computadores LTDA"
              value={quickFornData.nome}
              onChange={(e) => setQuickFornData({ ...quickFornData, nome: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">CNPJ</label>
              <input
                type="text"
                className="form-input font-mono"
                placeholder="00.000.000/0001-00"
                value={quickFornData.cnpj}
                onChange={(e) => setQuickFornData({ ...quickFornData, cnpj: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Hardware & TI"
                value={quickFornData.categoria}
                onChange={(e) => setQuickFornData({ ...quickFornData, categoria: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-footer" style={{ padding: '1rem 0 0 0', backgroundColor: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setQuickFornModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn-accent">Cadastrar & Selecionar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
