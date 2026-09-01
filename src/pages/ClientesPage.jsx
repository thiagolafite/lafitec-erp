import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  PlusCircle, 
  Settings, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  FileText, 
  Building, 
  DollarSign, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Filter,
  Truck,
  Building2,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage, calculateIndiceRelacionamento } from '../services/storage';
import { Modal } from '../components/Modal';

export const ClientesPage = ({ showToast }) => {
  const { empresa, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipoList, setFilterTipoList] = useState('ALL'); // ALL, Clientes, Fornecedores, Transportadoras
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [activeTab, setActiveTab] = useState('principal');

  // React State for Reactive Partner Table Updates
  const [todosParceiros, setTodosParceiros] = useState(() => storage.getAllParceiros(empresa?.id || ''));

  const refreshParceiros = () => {
    if (empresa) {
      setTodosParceiros(storage.getAllParceiros(empresa.id));
    }
  };

  useEffect(() => {
    refreshParceiros();
  }, [empresa?.id]);

  // Loading state for CEP API lookup
  const [cepLoading, setCepLoading] = useState(false);

  // Quick Inline Creation Modals
  const [quickTransModal, setQuickTransModal] = useState(false);
  const [quickFornModal, setQuickFornModal] = useState(false);

  const [quickTransData, setQuickTransData] = useState({ nome: '', cnpj: '', email: '', telefone: '', cidade: '' });
  const [quickFornData, setQuickFornData] = useState({ nome: '', cnpj: '', email: '', telefone: '', categoria: '' });

  // Auxiliary Lists
  const [transportadoras, setTransportadoras] = useState(() => storage.getTransportadoras(empresa?.id || ''));
  const [fornecedores, setFornecedores] = useState(() => storage.getFornecedores(empresa?.id || ''));

  const refreshListasAuxiliares = () => {
    if (empresa) {
      setTransportadoras(storage.getTransportadoras(empresa.id));
      setFornecedores(storage.getFornecedores(empresa.id));
    }
  };

  const initialFormState = {
    codigo: '',
    tipo: 'Clientes', // Clientes, Parceiro, Fornecedores, Transportadoras
    nome: '',
    fantasia: '',
    cpfCnpj: '',
    ieRg: '',
    suframa: '',
    telefone: '',
    email: '',
    sitePage: '',
    emailXmlNfe: '',
    transportadoraId: '',
    ramoAtividade: '',
    // Localização
    cep: '',
    cidade: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    regiao: '',
    setor: '',
    logomarca: '',
    logomarcaNome: '',
    anexoNome: '',
    // Contatos
    contatos: [],
    // Endereços
    enderecoCobranca: '',
    cidadeCobranca: '',
    cepCobranca: '',
    enderecoEntrega: '',
    cidadeEntrega: '',
    cepEntrega: '',
    // Observações
    obsPedido: '',
    obsAviso: '',
    // Ativação
    statusAtivacao: 'Ativo',
    limiteCredito: '0.00',
    // Banco & Referências
    banco: '',
    agencia: '',
    contaCorrente: '',
    chavePix: '',
    referencias: '',
    // Vendedores & Revenda/Fornecedor
    vendedorResponsavel: '',
    fornecedoresVinculados: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const [novoContato, setNovoContato] = useState({
    nome: '',
    email: '',
    telefone: '',
    dataNasc: '',
    setor: '',
    obs: '',
    enviaEmail: 'Sim'
  });

  if (!empresa) return null;

  const filteredParceiros = todosParceiros.filter(p => {
    // Filter by type tab
    if (filterTipoList !== 'ALL') {
      if (filterTipoList === 'Clientes' && p.tipo !== 'Clientes' && p.tipo !== 'Parceiro' && p.tipo !== 'Prospect') return false;
      if (filterTipoList === 'Fornecedores' && p.tipo !== 'Fornecedores') return false;
      if (filterTipoList === 'Transportadoras' && p.tipo !== 'Transportadoras') return false;
    }

    // Filter by search term
    const term = searchTerm.toLowerCase();
    return (
      (p.nome && p.nome.toLowerCase().includes(term)) ||
      (p.email && p.email.toLowerCase().includes(term)) ||
      (p.cpfCnpj && p.cpfCnpj.includes(term)) ||
      (p.cnpj && p.cnpj.includes(term)) ||
      (p.codigo && p.codigo.toLowerCase().includes(term))
    );
  });

  // VIA CEP CONSULTA AUTOMÁTICA
  const handleFetchViaCep = async (cepValue) => {
    const cleanCep = cepValue.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setCepLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: data.logradouro || prev.endereco,
            bairro: data.bairro || prev.bairro,
            cidade: data.localidade && data.uf ? `${data.localidade} - ${data.uf}` : prev.cidade,
            regiao: data.uf || prev.regiao
          }));
          showToast('success', `Endereço localizado via CEP: ${data.logradouro}, ${data.bairro}`);
        } else {
          showToast('warning', 'CEP não localizado na base dos Correios.');
        }
      } catch (err) {
        showToast('error', 'Erro ao consultar CEP online.');
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleCepChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, cep: value }));
    const clean = value.replace(/\D/g, '');
    if (clean.length === 8) {
      handleFetchViaCep(clean);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logomarca: reader.result, logomarcaNome: file.name }));
        showToast('success', `Logomarca "${file.name}" importada com sucesso!`);
      };
      reader.readAsDataURL(file);
    }
  };

  // QUICK CREATION: TRANSPORTADORA
  const handleSaveQuickTransportadora = (e) => {
    e.preventDefault();
    if (!quickTransData.nome) return;
    try {
      const newTrans = {
        ...quickTransData,
        tipo: 'Transportadoras',
        empresaId: empresa.id
      };
      storage.saveTransportadora(newTrans, empresa.id, user.nome);
      refreshListasAuxiliares();
      refreshParceiros();
      setFormData(prev => ({ ...prev, transportadoraId: newTrans.nome }));
      setQuickTransModal(false);
      setQuickTransData({ nome: '', cnpj: '', email: '', telefone: '', cidade: '' });
      showToast('success', `Transportadora "${newTrans.nome}" cadastrada e selecionada!`);
    } catch (err) {
      showToast('error', 'Erro ao cadastrar transportadora.');
    }
  };

  // QUICK CREATION: FORNECEDOR / REVENDA
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
      refreshListasAuxiliares();
      refreshParceiros();
      setFormData(prev => ({ ...prev, fornecedoresVinculados: newForn.nome }));
      setQuickFornModal(false);
      setQuickFornData({ nome: '', cnpj: '', email: '', telefone: '', categoria: '' });
      showToast('success', `Revenda/Fornecedor "${newForn.nome}" cadastrado e selecionado!`);
    } catch (err) {
      showToast('error', 'Erro ao cadastrar fornecedor.');
    }
  };

  const handleOpenModal = (cli = null, defaultTipo = 'Clientes') => {
    refreshListasAuxiliares();
    setActiveTab('principal');
    if (cli) {
      setEditingCliente(cli);
      setFormData({
        ...initialFormState,
        ...cli,
        limiteCredito: cli.limiteCredito ? cli.limiteCredito.toString() : '0.00',
        contatos: cli.contatos || []
      });
    } else {
      setEditingCliente(null);
      setFormData({
        ...initialFormState,
        tipo: defaultTipo,
        codigo: (defaultTipo === 'Fornecedores' ? 'FORN-' : defaultTipo === 'Transportadoras' ? 'TR-' : 'CLI-') + Math.floor(100 + Math.random() * 900)
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCliente(null);
  };

  const handleAddContato = () => {
    if (!novoContato.nome) {
      showToast('warning', 'Digite ao menos o nome do contato.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      contatos: [...prev.contatos, { ...novoContato, id: 'ct-' + Date.now() }]
    }));
    setNovoContato({
      nome: '',
      email: '',
      telefone: '',
      dataNasc: '',
      setor: '',
      obs: '',
      enviaEmail: 'Sim'
    });
    showToast('success', 'Contato adicionado.');
  };

  const handleRemoveContato = (index) => {
    setFormData(prev => ({
      ...prev,
      contatos: prev.contatos.filter((_, idx) => idx !== index)
    }));
  };

  // SMART UNIFIED SAVE: Aloca o cadastro dinamicamente baseado no Tipo selecionado
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome) {
      showToast('error', 'Preencha a Razão/Nome.');
      return;
    }

    try {
      const parceiroSaveData = editingCliente 
        ? { ...formData, id: editingCliente.id } 
        : formData;

      const tipoAlocado = storage.saveParceiroComercial(parceiroSaveData, empresa.id, user.nome);
      refreshParceiros();
      showToast('success', `Cadastro de "${formData.nome}" salvo com sucesso como ${tipoAlocado.toUpperCase()}!`);
      handleCloseModal();
    } catch (err) {
      showToast('error', err.message || 'Erro ao salvar cadastro.');
    }
  };

  const handleDelete = (cli) => {
    if (window.confirm(`Remover cadastro "${cli.nome}"?`)) {
      try {
        storage.deleteCliente(cli.id, empresa.id, user.nome);
        refreshParceiros();
        showToast('warning', `Cadastro "${cli.nome}" removido.`);
      } catch (err) {
        showToast('error', 'Erro ao excluir cadastro.');
      }
    }
  };

  const getTipoBadgeClass = (tipo) => {
    switch (tipo) {
      case 'Fornecedores': return 'badge-info';
      case 'Transportadoras': return 'badge-warning';
      default: return 'badge-accent';
    }
  };

  const tabsList = [
    { id: 'principal', label: 'Principal' },
    { id: 'contatos', label: 'Contatos' },
    { id: 'enderecos', label: 'Endereços' },
    { id: 'obsPedido', label: 'Observação Pedido' },
    { id: 'obsAviso', label: 'Observação/Aviso' },
    { id: 'ativacao', label: 'Ativação' },
    { id: 'banco', label: 'Conta Bancária' },
    { id: 'referencias', label: 'Referências' },
    { id: 'vendedores', label: 'Vendedores' },
    { id: 'fornecedores', label: 'Fornecedores / Revenda' }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Gestão de Parceiros Comerciais</h1>
          <p>Cadastro único e inteligente de Clientes, Fornecedores e Transportadoras de {empresa.nome}</p>
        </div>
        <button className="btn btn-accent" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Novo Cadastro
        </button>
      </div>

      <div className="card">
        {/* Filters Bar: TODOS | CLIENTES | FORNECEDORES | TRANSPORTADORAS */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${filterTipoList === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterTipoList('ALL')}
            >
              <Filter size={14} /> Todos ({todosParceiros.length})
            </button>
            <button
              className={`btn btn-sm ${filterTipoList === 'Clientes' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterTipoList('Clientes')}
            >
              <Users size={14} /> Clientes ({todosParceiros.filter(p => p.tipo === 'Clientes' || p.tipo === 'Parceiro' || p.tipo === 'Prospect').length})
            </button>
            <button
              className={`btn btn-sm ${filterTipoList === 'Fornecedores' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterTipoList('Fornecedores')}
            >
              <Building2 size={14} /> Fornecedores ({todosParceiros.filter(p => p.tipo === 'Fornecedores').length})
            </button>
            <button
              className={`btn btn-sm ${filterTipoList === 'Transportadoras' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterTipoList('Transportadoras')}
            >
              <Truck size={14} /> Transportadoras ({todosParceiros.filter(p => p.tipo === 'Transportadoras').length})
            </button>
          </div>

          <div style={{ position: 'relative', minWidth: '280px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Buscar por nome, e-mail, CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          </div>
        </div>

        {/* Master Consolidated Table */}
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Razão / Nome</th>
                <th>Tipo do Cadastro</th>
                <th>Índice Relacionamento</th>
                <th>CPF / CNPJ</th>
                <th>Telefone</th>
                <th>Cidade / UF</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredParceiros.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: '#64748B', padding: '3rem 1rem' }}>
                    Nenhum parceiro comercial localizado na categoria selecionada.
                  </td>
                </tr>
              ) : (
                filteredParceiros.map(p => {
                  const vendas = storage.getVendas(empresa?.id || '');
                  const visitas = storage.getVisitas(empresa?.id || '');
                  const scoreInfo = calculateIndiceRelacionamento(p, vendas, visitas);

                  return (
                    <tr key={p.id}>
                      <td className="font-mono" style={{ fontWeight: 700, color: '#0A2540' }}>{p.codigo || p.id}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0A2540' }}>{p.nome}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{p.email}</div>
                      </td>
                      <td>
                        <span className={`badge ${getTipoBadgeClass(p.tipo)}`}>
                          {p.tipo === 'Prospect' ? 'Clientes' : (p.tipo || 'Clientes')}
                        </span>
                      </td>
                      <td>
                        {p.tipo === 'Clientes' || p.tipo === 'Parceiro' || p.tipo === 'Prospect' ? (
                          <span className={`badge ${scoreInfo.badgeClass}`}>
                            {scoreInfo.emoji} {scoreInfo.score}/100 — {scoreInfo.statusText}
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>N/A</span>
                        )}
                      </td>
                      <td className="font-mono" style={{ fontSize: '0.8125rem' }}>{p.cpfCnpj || p.cnpj}</td>
                      <td style={{ color: '#64748B' }}>{p.telefone}</td>
                      <td style={{ color: '#64748B' }}>{p.cidade || '-'}</td>
                      <td>
                        <span className={`badge ${p.statusAtivacao === 'Inativo' ? 'badge-danger' : 'badge-success'}`}>
                          {p.statusAtivacao || 'Ativo'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button className="btn-icon" onClick={() => handleOpenModal(p)} title="Editar Cadastro">
                            <Edit2 size={16} />
                          </button>
                          <button className="btn-icon" onClick={() => handleDelete(p)} title="Excluir" style={{ color: '#EF4444' }}>
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

      {/* Modal Principal Inteligente de Cadastro com Alocação Dinâmica */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCliente ? `Editar Cadastro: ${editingCliente.nome}` : 'Novo Cadastro de Parceiro Comercial'}
        maxWidth="1020px"
      >
        <form onSubmit={handleSubmit}>
          {/* Navegação por Abas */}
          <div style={{
            display: 'flex',
            gap: '2px',
            borderBottom: '2px solid #00C896',
            overflowX: 'auto',
            marginBottom: '1.25rem',
            paddingBottom: '0px'
          }}>
            {tabsList.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '0.625rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: activeTab === t.id ? 800 : 600,
                  color: activeTab === t.id ? '#0A2540' : '#64748B',
                  backgroundColor: activeTab === t.id ? '#FFFFFF' : '#F1F5F9',
                  borderTop: activeTab === t.id ? '3px solid #00C896' : '1px solid #E2E8F0',
                  borderLeft: '1px solid #E2E8F0',
                  borderRight: '1px solid #E2E8F0',
                  borderBottom: activeTab === t.id ? '1px solid #FFFFFF' : 'none',
                  borderTopLeftRadius: '6px',
                  borderTopRightRadius: '6px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB 1: PRINCIPAL */}
          {activeTab === 'principal' && (
            <div>
              <div className="form-row" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
                <div className="form-group">
                  <label className="form-label">Código Interno</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    disabled
                    value={formData.codigo || '(autonumeração)'}
                    style={{ backgroundColor: '#F8FAFC', color: '#64748B' }}
                  />
                </div>

                {/* TIPO DE CADASTRO (OPÇÃO PROSPECTS REMOVIDA) */}
                <div className="form-group">
                  <label className="form-label" style={{ color: '#00C896', fontWeight: 800 }}>
                    Tipo de Cadastro (Alocação Automática) *
                  </label>
                  <select
                    className="form-select"
                    value={formData.tipo === 'Prospect' ? 'Clientes' : formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    style={{ fontWeight: 700, borderColor: '#00C896', backgroundColor: '#F0FDF4' }}
                  >
                    <option value="Clientes">Clientes (Lista de Clientes)</option>
                    <option value="Parceiro">Parceiro Comercial</option>
                    <option value="Fornecedores">Fornecedores (Lista de Fornecedores)</option>
                    <option value="Transportadoras">Transportadoras (Lista de Transportadoras)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Razão / Nome *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Razão social ou nome completo"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fantasia / Apelido</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nome fantasia"
                    value={formData.fantasia}
                    onChange={(e) => setFormData({ ...formData, fantasia: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">CNPJ / CPF *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input font-mono"
                      required
                      placeholder="CNPJ ou CPF"
                      value={formData.cpfCnpj}
                      onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                    />
                    <button
                      type="button"
                      className="btn btn-accent btn-sm"
                      title="Consultar CNPJ na Receita"
                      onClick={() => showToast('info', 'Validação de CNPJ ativa.')}
                    >
                      <Globe size={16} />
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">IE / RG</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="Inscrição Estadual ou RG"
                    value={formData.ieRg}
                    onChange={(e) => setFormData({ ...formData, ieRg: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">N° Suframa</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Inscrição Suframa"
                    value={formData.suframa}
                    onChange={(e) => setFormData({ ...formData, suframa: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="(00) 0000-0000"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Principal</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="email@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Transportadora Padrão</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select
                      className="form-select"
                      value={formData.transportadoraId}
                      onChange={(e) => setFormData({ ...formData, transportadoraId: e.target.value })}
                    >
                      <option value="">Selecione a transportadora...</option>
                      {transportadoras.map(t => (
                        <option key={t.id} value={t.id}>{t.nome}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn-accent btn-sm"
                      title="Cadastrar Nova Transportadora na Hora"
                      onClick={() => setQuickTransModal(true)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Site / Page</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="www.empresa.com.br"
                    value={formData.sitePage}
                    onChange={(e) => setFormData({ ...formData, sitePage: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Ramo Atividade</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Buscar ou digitar ramo..."
                    value={formData.ramoAtividade}
                    onChange={(e) => setFormData({ ...formData, ramoAtividade: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email XML NFE</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="nfe@empresa.com"
                    value={formData.emailXmlNfe}
                    onChange={(e) => setFormData({ ...formData, emailXmlNfe: e.target.value })}
                  />
                </div>
              </div>

              {/* SEÇÃO LOCALIZAÇÃO */}
              <div style={{
                marginTop: '1.5rem',
                padding: '1.25rem',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                position: 'relative',
                backgroundColor: '#FFFFFF'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '16px',
                  backgroundColor: '#0A2540',
                  color: '#FFFFFF',
                  padding: '2px 10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}>
                  Localização
                </div>

                <div className="form-row" style={{ marginTop: '0.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">CEP (Auto-completar)</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        className="form-input font-mono"
                        placeholder="00000-000"
                        value={formData.cep}
                        onChange={handleCepChange}
                      />
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleFetchViaCep(formData.cep)}
                        disabled={cepLoading}
                        title="Buscar endereço pelo CEP"
                      >
                        {cepLoading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Cidade / UF</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Selecione ou digite a cidade..."
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Endereço</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Rua, Avenida, Logradouro..."
                      value={formData.endereco}
                      onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Número</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="123"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Complemento</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Sala, Apto, Bloco..."
                      value={formData.complemento}
                      onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bairro</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Nome do bairro"
                        value={formData.bairro}
                        onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                      />
                      <button
                        type="button"
                        className="btn btn-accent btn-sm"
                        style={{ whiteSpace: 'nowrap' }}
                        onClick={() => showToast('info', 'Mapa ativo.')}
                      >
                        <MapPin size={14} /> Ver no Mapa
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Região</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Selecione a região"
                      value={formData.regiao}
                      onChange={(e) => setFormData({ ...formData, regiao: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Setor</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Buscar setor..."
                      value={formData.setor}
                      onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.875rem' }}>
                  <label className="form-label">Logomarca / Foto do Cliente:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label 
                      className="btn btn-outline btn-sm" 
                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                    >
                      <Upload size={14} /> Escolher Arquivo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <span style={{ fontSize: '0.8rem', color: '#64748B', fontFamily: 'monospace' }}>
                      {formData.logomarcaNome || (formData.logomarca ? 'Logo carregada' : 'Nenhum arquivo escolhido')}
                    </span>
                    {formData.logomarca && (
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => setFormData({ ...formData, logomarca: '', logomarcaNome: '' })}
                        title="Remover Logomarca"
                        style={{ color: '#DC2626' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  {formData.logomarca && (
                    <div style={{ marginTop: '8px', padding: '6px', backgroundColor: '#FFFFFF', borderRadius: '4px', border: '1px solid #E2E8F0', display: 'inline-block' }}>
                      <img src={formData.logomarca} alt="Preview Logo" style={{ maxHeight: '44px', objectFit: 'contain' }} />
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 0, marginTop: '0.875rem' }}>
                  <label className="form-label">Anexo (PDF / JPEG)</label>
                  <input
                    type="file"
                    className="form-input"
                    onChange={(e) => setFormData({ ...formData, anexoNome: e.target.files[0]?.name || '' })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTATOS */}
          {activeTab === 'contatos' && (
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0A2540', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                Outros Contatos
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginBottom: '1rem', backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.725rem' }}>Nome</label>
                  <input
                    type="text"
                    className="form-input btn-sm"
                    value={novoContato.nome}
                    onChange={(e) => setNovoContato({ ...novoContato, nome: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.725rem' }}>Email</label>
                  <input
                    type="email"
                    className="form-input btn-sm"
                    value={novoContato.email}
                    onChange={(e) => setNovoContato({ ...novoContato, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.725rem' }}>Telefone</label>
                  <input
                    type="text"
                    className="form-input btn-sm"
                    value={novoContato.telefone}
                    onChange={(e) => setNovoContato({ ...novoContato, telefone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.725rem' }}>Data Nasc.</label>
                  <input
                    type="date"
                    className="form-input btn-sm"
                    value={novoContato.dataNasc}
                    onChange={(e) => setNovoContato({ ...novoContato, dataNasc: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.725rem' }}>Setor</label>
                  <input
                    type="text"
                    className="form-input btn-sm"
                    value={novoContato.setor}
                    onChange={(e) => setNovoContato({ ...novoContato, setor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.725rem' }}>Observação</label>
                  <input
                    type="text"
                    className="form-input btn-sm"
                    value={novoContato.obs}
                    onChange={(e) => setNovoContato({ ...novoContato, obs: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.725rem' }}>Envia Email</label>
                  <select
                    className="form-select btn-sm"
                    value={novoContato.enviaEmail}
                    onChange={(e) => setNovoContato({ ...novoContato, enviaEmail: e.target.value })}
                  >
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="button" className="btn btn-accent btn-sm" style={{ width: '100%' }} onClick={handleAddContato}>
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Telefone</th>
                      <th>Data Nasc.</th>
                      <th>Setor</th>
                      <th>Observação</th>
                      <th>Envia Email</th>
                      <th className="text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.contatos.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', color: '#64748B', padding: '2rem' }}>
                          Nenhum contato secundário cadastrado.
                        </td>
                      </tr>
                    ) : (
                      formData.contatos.map((ct, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700 }}>{ct.nome}</td>
                          <td>{ct.email}</td>
                          <td>{ct.telefone}</td>
                          <td>{ct.dataNasc}</td>
                          <td>{ct.setor}</td>
                          <td>{ct.obs}</td>
                          <td>{ct.enviaEmail}</td>
                          <td className="text-right">
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => handleRemoveContato(idx)}
                              style={{ color: '#EF4444' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ENDEREÇOS */}
          {activeTab === 'enderecos' && (
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0A2540', marginBottom: '1rem' }}>
                Endereço de Cobrança
              </h4>
              <div className="form-row">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Endereço de Cobrança</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Logradouro de cobrança..."
                    value={formData.enderecoCobranca}
                    onChange={(e) => setFormData({ ...formData, enderecoCobranca: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CEP Cobrança</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={formData.cepCobranca}
                    onChange={(e) => setFormData({ ...formData, cepCobranca: e.target.value })}
                  />
                </div>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0A2540', margin: '1.5rem 0 1rem 0' }}>
                Endereço de Entrega
              </h4>
              <div className="form-row">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Endereço de Entrega</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Logradouro de entrega..."
                    value={formData.enderecoEntrega}
                    onChange={(e) => setFormData({ ...formData, enderecoEntrega: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CEP Entrega</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={formData.cepEntrega}
                    onChange={(e) => setFormData({ ...formData, cepEntrega: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OBSERVAÇÃO PEDIDO */}
          {activeTab === 'obsPedido' && (
            <div>
              <div className="form-group">
                <label className="form-label">Observações Automáticas para Pedidos de Venda</label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  placeholder="Digitar instruções padrão de frete, horário de entrega ou observações de faturamento..."
                  value={formData.obsPedido}
                  onChange={(e) => setFormData({ ...formData, obsPedido: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* TAB 5: OBSERVAÇÃO/AVISO */}
          {activeTab === 'obsAviso' && (
            <div>
              <div className="form-group">
                <label className="form-label">Alertas e Notas de Aviso Interno</label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  placeholder="Digitar avisos de crédito, pendências de documentos ou restrições..."
                  value={formData.obsAviso}
                  onChange={(e) => setFormData({ ...formData, obsAviso: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* TAB 6: ATIVAÇÃO */}
          {activeTab === 'ativacao' && (
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Status do Cadastro</label>
                  <select
                    className="form-select"
                    value={formData.statusAtivacao}
                    onChange={(e) => setFormData({ ...formData, statusAtivacao: e.target.value })}
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Bloqueado">Bloqueado</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Limite de Crédito (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input font-mono"
                    value={formData.limiteCredito}
                    onChange={(e) => setFormData({ ...formData, limiteCredito: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CONTA BANCÁRIA */}
          {activeTab === 'banco' && (
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Banco</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Banco do Brasil / Itaú / Bradesco"
                    value={formData.banco}
                    onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Agência</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="0000-0"
                    value={formData.agencia}
                    onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Conta Corrente</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="00000-0"
                    value={formData.contaCorrente}
                    onChange={(e) => setFormData({ ...formData, contaCorrente: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Chave PIX</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="CNPJ, E-mail ou Chave Aleatória"
                  value={formData.chavePix}
                  onChange={(e) => setFormData({ ...formData, chavePix: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* TAB 8: REFERÊNCIAS */}
          {activeTab === 'referencias' && (
            <div>
              <div className="form-group">
                <label className="form-label">Referências Comerciais e Bancárias</label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  placeholder="Registrar dados de parceiros de referência ou contatos de crédito..."
                  value={formData.referencias}
                  onChange={(e) => setFormData({ ...formData, referencias: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* TAB 9: VENDEDORES */}
          {activeTab === 'vendedores' && (
            <div>
              <div className="form-group">
                <label className="form-label">Vendedor Responsável Vinculado</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nome do vendedor/representante..."
                  value={formData.vendedorResponsavel}
                  onChange={(e) => setFormData({ ...formData, vendedorResponsavel: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* TAB 10: FORNECEDORES / REVENDA */}
          {activeTab === 'fornecedores' && (
            <div>
              <div className="form-group">
                <label className="form-label">Revenda / Fornecedor Vinculado</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select
                    className="form-select"
                    value={formData.fornecedoresVinculados}
                    onChange={(e) => setFormData({ ...formData, fornecedoresVinculados: e.target.value })}
                  >
                    <option value="">Selecione o fornecedor/revenda parceiro...</option>
                    {fornecedores.map(f => (
                      <option key={f.id} value={f.nome}>{f.nome} ({f.cnpj})</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-accent btn-sm"
                    title="Cadastrar Novo Fornecedor/Revenda na Hora"
                    onClick={() => setQuickFornModal(true)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rodapé de Ações do Form */}
          <div className="modal-footer" style={{ padding: '1.25rem 0 0 0', borderTop: '1px solid #E2E8F0', marginTop: '1.5rem', backgroundColor: 'transparent' }}>
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-accent">
                  <Save size={16} /> Salvar & Alocar Cadastro
                </button>
                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                  <ArrowLeft size={16} /> Voltar
                </button>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => showToast('info', 'Opções avançadas ativas.')}
              >
                <Settings size={14} /> Opções
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* QUICK MODAL 1: CADASTRAR TRANSPORTADORA NA HORA */}
      <Modal
        isOpen={quickTransModal}
        onClose={() => setQuickTransModal(false)}
        title="Cadastro Rápido de Transportadora"
      >
        <form onSubmit={handleSaveQuickTransportadora}>
          <div className="form-group">
            <label className="form-label">Razão Social / Transportadora *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="Ex: Express Logística LTDA"
              value={quickTransData.nome}
              onChange={(e) => setQuickTransData({ ...quickTransData, nome: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">CNPJ</label>
              <input
                type="text"
                className="form-input font-mono"
                placeholder="00.000.000/0001-00"
                value={quickTransData.cnpj}
                onChange={(e) => setQuickTransData({ ...quickTransData, cnpj: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input
                type="text"
                className="form-input"
                placeholder="(00) 0000-0000"
                value={quickTransData.telefone}
                onChange={(e) => setQuickTransData({ ...quickTransData, telefone: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-footer" style={{ padding: '1rem 0 0 0', backgroundColor: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setQuickTransModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn-accent">Cadastrar & Selecionar</button>
          </div>
        </form>
      </Modal>

      {/* QUICK MODAL 2: CADASTRAR FORNECEDOR / REVENDA NA HORA */}
      <Modal
        isOpen={quickFornModal}
        onClose={() => setQuickFornModal(false)}
        title="Cadastro Rápido de Fornecedor / Revenda"
      >
        <form onSubmit={handleSaveQuickFornecedor}>
          <div className="form-group">
            <label className="form-label">Razão Social / Revenda *</label>
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
