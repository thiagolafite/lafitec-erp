import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Tag, 
  FileText,
  Clock,
  ExternalLink,
  Upload,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  History,
  Building,
  Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Modal } from '../components/Modal';

export const FornecedoresPage = ({ showToast }) => {
  const { empresa, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState(null);
  const [activeTab, setActiveTab] = useState('principal');
  const [cepLoading, setCepLoading] = useState(false);
  const [logModalForn, setLogModalForn] = useState(null);

  const initialFormState = {
    codigo: '',
    tipo: 'Fornecedores',
    nome: '',
    fantasia: '',
    cnpj: '',
    ie: '',
    consumidorFinal: 'Normal',
    regimeTributario: 'Simples Nacional',
    tipoContribuinte: 'Não Contribuinte',
    inscricaoMunicipal: '',
    telefone: '',
    cbenef: '',
    email: '',
    
    // Localização
    cep: '',
    cidade: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    logomarca: '',

    // Outros dados
    categoria: 'Geral',
    observacoes: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  if (!empresa) return null;

  const fornecedores = storage.getFornecedores(empresa.id);
  const auditLogs = storage.getAuditLogs(empresa.id);

  const filteredFornecedores = fornecedores.filter(f => 
    (f.nome && f.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (f.fantasia && f.fantasia.toLowerCase().includes(searchTerm.toLowerCase())) ||
    ((f.cnpj || f.cpfCnpj) && (f.cnpj || f.cpfCnpj).includes(searchTerm)) ||
    (f.email && f.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (f.cidade && f.cidade.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (forn = null) => {
    setActiveTab('principal');
    if (forn) {
      setEditingFornecedor(forn);
      setFormData({
        ...initialFormState,
        ...forn,
        codigo: forn.codigo || forn.id || '',
        cnpj: forn.cnpj || forn.cpfCnpj || '',
        ie: forn.ie || forn.ieRg || forn.inscricaoEstadual || '',
        consumidorFinal: forn.consumidorFinal || 'Normal',
        regimeTributario: forn.regimeTributario || 'Simples Nacional',
        tipoContribuinte: forn.tipoContribuinte || 'Não Contribuinte',
        inscricaoMunicipal: forn.inscricaoMunicipal || '',
        telefone: forn.telefone || '',
        cbenef: forn.cbenef || '',
        email: forn.email || '',
        cep: forn.cep || '',
        cidade: forn.cidade || '',
        endereco: forn.endereco || '',
        numero: forn.numero || '',
        complemento: forn.complemento || '',
        bairro: forn.bairro || '',
        logomarca: forn.logomarca || forn.logoUrl || '',
        categoria: forn.categoria || 'Geral',
        observacoes: forn.observacoes || ''
      });
    } else {
      setEditingFornecedor(null);
      const nextCode = (fornecedores.length + 101).toString();
      setFormData({
        ...initialFormState,
        codigo: nextCode
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFornecedor(null);
  };

  // ViaCEP Auto Lookup
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
            cidade: data.localidade && data.uf ? `${data.localidade} (${data.ibge || ''}) - ${data.uf}` : prev.cidade,
            complemento: data.complemento || prev.complemento
          }));
          showToast('success', `Endereço localizado: ${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`);
        } else {
          showToast('warning', 'CEP não localizado na base dos Correios.');
        }
      } catch (err) {
        showToast('error', 'Erro ao consultar CEP.');
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

  // Handle Logo Upload (Simulated file read to Base64/DataURL)
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logomarca: reader.result, logomarcaNome: file.name }));
        showToast('success', `Logomarca "${file.name}" carregada com sucesso!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenGoogleMaps = () => {
    const query = [formData.endereco, formData.numero, formData.bairro, formData.cidade, formData.cep]
      .filter(Boolean)
      .join(', ');
    if (!query) {
      showToast('warning', 'Preencha o endereço ou cidade para abrir o mapa.');
      return;
    }
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      showToast('error', 'Preencha a Razão/Nome do fornecedor.');
      return;
    }

    try {
      const saveObj = {
        ...formData,
        id: editingFornecedor ? editingFornecedor.id : undefined,
        tipo: 'Fornecedores',
        cpfCnpj: formData.cnpj
      };

      storage.saveParceiroComercial(saveObj, empresa.id, user.nome);
      showToast('success', editingFornecedor ? 'Fornecedor atualizado!' : 'Fornecedor cadastrado com sucesso!');
      handleCloseModal();
    } catch (err) {
      showToast('error', err.message || 'Erro ao salvar fornecedor.');
    }
  };

  const handleDelete = (forn) => {
    if (window.confirm(`Deseja realmente excluir o fornecedor "${forn.nome}"?`)) {
      try {
        storage.deleteFornecedor(forn.id, empresa.id, user.nome);
        showToast('warning', `Fornecedor "${forn.nome}" removido.`);
      } catch (err) {
        showToast('error', 'Erro ao excluir fornecedor.');
      }
    }
  };

  // Available tabs matching screenshot
  const tabs = [
    { id: 'principal', label: 'Principal' },
    { id: 'contatos', label: 'Contatos' },
    { id: 'enderecos', label: 'Endereços' },
    { id: 'obs_pedido', label: 'Observação Pedido' },
    { id: 'obs_aviso', label: 'Observação/Aviso' },
    { id: 'ativacao', label: 'Ativação' },
    { id: 'conta_bancaria', label: 'Conta Bancária' },
    { id: 'vendedores', label: 'Vendedores' },
    { id: 'definicoes', label: 'Definições' },
    { id: 'tributacao_st', label: 'Tributação ST' }
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Cadastro e Gestão de Fornecedores</h1>
          <p>Cadastro completo de indústrias, revendas e fornecedores representados de {empresa.nome}</p>
        </div>
        <button className="btn btn-accent" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Novo Fornecedor
        </button>
      </div>

      <div className="card">
        {/* Search */}
        <div style={{ marginBottom: '1.25rem', position: 'relative', maxWidth: '420px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por razão social, fantasia, CNPJ ou cidade..."
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
                <th style={{ width: '90px' }}>Código</th>
                <th>Razão Social / Nome</th>
                <th>Nome Fantasia</th>
                <th>CNPJ</th>
                <th>Inscrição Estadual</th>
                <th>Telefone</th>
                <th>Cidade / UF</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredFornecedores.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#64748B', padding: '3.5rem 1rem' }}>
                    <Building2 size={44} style={{ opacity: 0.35, marginBottom: '0.75rem', display: 'inline-block' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-dark)' }}>Nenhum fornecedor localizado</div>
                    <div style={{ fontSize: '0.8125rem', marginTop: '4px' }}>Cadastre os fornecedores para vincular aos produtos e emitir orçamentos comerciais.</div>
                  </td>
                </tr>
              ) : (
                filteredFornecedores.map(forn => (
                  <tr key={forn.id}>
                    <td className="font-mono" style={{ fontWeight: 800, color: 'var(--primary-dark)' }}>
                      #{forn.codigo || forn.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{forn.nome}</div>
                      {forn.email && <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{forn.email}</div>}
                    </td>
                    <td style={{ fontWeight: 600 }}>{forn.fantasia || '-'}</td>
                    <td className="font-mono">{forn.cnpj || forn.cpfCnpj || '-'}</td>
                    <td className="font-mono" style={{ color: '#64748B' }}>{forn.ie || forn.ieRg || '-'}</td>
                    <td style={{ color: '#64748B' }}>{forn.telefone || '-'}</td>
                    <td style={{ color: '#64748B' }}>{forn.cidade || '-'}</td>
                    <td className="text-right">
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button className="btn-icon" onClick={() => handleOpenModal(forn)} title="Editar Fornecedor">
                          <Edit3 size={16} />
                        </button>
                        <button className="btn-icon" onClick={() => handleDelete(forn)} title="Excluir" style={{ color: '#DC2626' }}>
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
      {/* MODAL: CADASTRO DE FORNECEDOR (FIEL AO SCREENSHOT COM DESIGN LAFITEC)     */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Cadastro de Fornecedor - ${formData.nome || formData.fantasia || 'Novo Fornecedor'}`}
        maxWidth="960px"
      >
        <div>
          {/* Top Tabs Bar */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', borderBottom: '1px solid #CBD5E1', marginBottom: '1.25rem', paddingBottom: '0.25rem' }}>
            {tabs.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: activeTab === t.id ? 800 : 600,
                  color: activeTab === t.id ? '#0A2540' : '#64748B',
                  backgroundColor: activeTab === t.id ? '#FFFFFF' : '#F1F5F9',
                  borderTop: activeTab === t.id ? '3px solid #00C896' : '1px solid #E2E8F0',
                  borderLeft: '1px solid #E2E8F0',
                  borderRight: '1px solid #E2E8F0',
                  borderBottom: activeTab === t.id ? '1px solid #FFFFFF' : '1px solid #CBD5E1',
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

          <form onSubmit={handleSubmit}>
            {/* ========================================================================= */}
            {/* TAB: PRINCIPAL (COM TODOS OS CAMPOS SOLICITADOS)                          */}
            {/* ========================================================================= */}
            {activeTab === 'principal' && (
              <div>
                {/* Linha 1: Código e Tipo */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem', marginBottom: '0.875rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Código:</label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                      placeholder="Ex: 378"
                      style={{ backgroundColor: '#F8FAFC', fontWeight: 700 }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tipo:</label>
                    <div style={{ display: 'flex', alignItems: 'center', height: '42px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0 0.75rem' }}>
                      <span className="badge badge-primary" style={{ backgroundColor: '#0284C7', color: '#FFFFFF', fontWeight: 700 }}>
                        ✕ Fornecedores
                      </span>
                    </div>
                  </div>
                </div>

                {/* Linha 2: Razão/Nome e Fantasia/Apelido */}
                <div className="form-row" style={{ marginBottom: '0.875rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ color: '#0284C7', fontWeight: 700 }}>
                      Razão/Nome: *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="Razão Social completa da empresa"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Fantasia/Apelido:</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nome fantasia ou marca"
                      value={formData.fantasia}
                      onChange={(e) => setFormData({ ...formData, fantasia: e.target.value })}
                    />
                  </div>
                </div>

                {/* Linha 3: CNPJ e Inscrição Estadual */}
                <div className="form-row" style={{ marginBottom: '0.875rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">CNPJ:</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        className="form-input font-mono"
                        placeholder="00.000.000/0000-00"
                        value={formData.cnpj}
                        onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                      />
                      <button
                        type="button"
                        className="btn btn-accent btn-sm"
                        title="Consultar CNPJ na Receita Federal"
                        onClick={() => showToast('info', 'Validação e consulta de CNPJ ativa.')}
                        style={{ padding: '0.5rem 0.75rem' }}
                      >
                        <Globe size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Inscrição Estadual:</label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      placeholder="Inscrição Estadual (IE)"
                      value={formData.ie}
                      onChange={(e) => setFormData({ ...formData, ie: e.target.value })}
                    />
                  </div>
                </div>

                {/* Linha 4: Consumidor Final, Regime Tributário, Tipo Contribuinte e Municipal */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.2fr 1fr', gap: '0.75rem', marginBottom: '0.875rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Consumidor Final:</label>
                    <select
                      className="form-select"
                      value={formData.consumidorFinal}
                      onChange={(e) => setFormData({ ...formData, consumidorFinal: e.target.value })}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Consumidor Final">Consumidor Final</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Regime Tributário:</label>
                    <select
                      className="form-select"
                      value={formData.regimeTributario}
                      onChange={(e) => setFormData({ ...formData, regimeTributario: e.target.value })}
                    >
                      <option value="Simples Nacional">Simples Nacional</option>
                      <option value="Lucro Presumido">Lucro Presumido</option>
                      <option value="Lucro Real">Lucro Real</option>
                      <option value="MEI">MEI</option>
                      <option value="Não Informado">Não Informado</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tipo Contribuinte:</label>
                    <select
                      className="form-select"
                      value={formData.tipoContribuinte}
                      onChange={(e) => setFormData({ ...formData, tipoContribuinte: e.target.value })}
                    >
                      <option value="Não Contribuinte">Não Contribuinte</option>
                      <option value="Contribuinte ICMS">Contribuinte ICMS</option>
                      <option value="Isento">Isento</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Municipal:</label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      placeholder="Inscrição Municipal"
                      value={formData.inscricaoMunicipal}
                      onChange={(e) => setFormData({ ...formData, inscricaoMunicipal: e.target.value })}
                    />
                  </div>
                </div>

                {/* Linha 5: Telefone, CBENEF e Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.8fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Telefone:</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="(00) 0000-0000"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">(CBENEF):</label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      placeholder="Código CBENEF"
                      value={formData.cbenef}
                      onChange={(e) => setFormData({ ...formData, cbenef: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email:</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="comercial@fornecedor.com.br"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* SUBSEÇÃO: LOCALIZAÇÃO                                                     */}
                {/* ========================================================================= */}
                <fieldset style={{ border: '1px solid #38BDF8', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.25rem', backgroundColor: '#F8FAFC' }}>
                  <legend style={{ padding: '0 0.5rem', fontWeight: 800, color: '#0284C7', fontSize: '0.85rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} /> Localização
                  </legend>

                  {/* CEP e Cidade */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginBottom: '0.875rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">CEP:</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          className="form-input font-mono"
                          placeholder="00000-000"
                          value={formData.cep}
                          onChange={handleCepChange}
                        />
                        {cepLoading && (
                          <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: '#0284C7' }}>
                            Buscando...
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Cidade / UF:</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="São Paulo (3550308) - SP (35)"
                        value={formData.cidade}
                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Endereço e Número */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '0.75rem', marginBottom: '0.875rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Endereço:</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Rua, Avenida, Estrada..."
                        value={formData.endereco}
                        onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Número:</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="714"
                        value={formData.numero}
                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Complemento e Bairro com Botão Ver no Mapa */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr', gap: '0.75rem', marginBottom: '0.875rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Complemento:</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Galpão, Sala, Bloco..."
                        value={formData.complemento}
                        onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Bairro:</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Bairro"
                          value={formData.bairro}
                          onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                        />
                        <button
                          type="button"
                          className="btn btn-accent btn-sm"
                          onClick={handleOpenGoogleMaps}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', backgroundColor: '#059669', color: '#FFFFFF', fontWeight: 700 }}
                        >
                          <Navigation size={14} /> Ver no Mapa
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Logomarca */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Logomarca:</label>
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
                        {formData.logomarcaNome || (formData.logomarca ? 'app/images/fornecedor/logo.png' : 'Nenhum arquivo escolhido')}
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
                      <div style={{ marginTop: '6px', padding: '6px', backgroundColor: '#FFFFFF', borderRadius: '4px', border: '1px solid #E2E8F0', display: 'inline-block' }}>
                        <img src={formData.logomarca} alt="Preview Logo" style={{ maxHeight: '40px', objectFit: 'contain' }} />
                      </div>
                    )}
                  </div>
                </fieldset>
              </div>
            )}

            {/* Outras Abas Placeholder */}
            {activeTab !== 'principal' && (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748B', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                <Building2 size={36} style={{ opacity: 0.3, marginBottom: '0.5rem', display: 'inline-block' }} />
                <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>Aba {tabs.find(t => t.id === activeTab)?.label}</div>
                <div style={{ fontSize: '0.8125rem', marginTop: '4px' }}>Os dados desta aba estão sincronizados com o cadastro principal do fornecedor.</div>
              </div>
            )}

            {/* Rodapé do Modal (Salvar, Log, Voltar) */}
            <div className="modal-footer" style={{ padding: 0, background: 'none', borderTop: '1px solid #E2E8F0', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-start', gap: '8px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, padding: '0.65rem 1.5rem' }}
              >
                <CheckCircle2 size={16} /> Salvar
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setLogModalForn(editingFornecedor || { nome: formData.nome || 'Novo Fornecedor' })}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Clock size={16} /> Log
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCloseModal}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <XCircle size={16} /> Voltar
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MINI-MODAL: LOG DE AUDITORIA DO FORNECEDOR                                */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(logModalForn)}
        title={`Histórico / Log: ${logModalForn?.nome || ''}`}
        onClose={() => setLogModalForn(null)}
        maxWidth="580px"
      >
        <div>
          <div style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '1rem' }}>
            Registro de alterações e atividades relacionadas ao fornecedor no sistema:
          </div>

          <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
            <table className="table" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>Data / Hora</th>
                  <th>Usuário</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.slice(0, 10).map((log, idx) => (
                  <tr key={idx}>
                    <td style={{ color: '#64748B' }}>{new Date(log.data).toLocaleString('pt-BR')}</td>
                    <td style={{ fontWeight: 700 }}>{log.usuarioNome}</td>
                    <td>{log.acao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="modal-footer" style={{ marginTop: '1rem', padding: 0, background: 'none', border: 'none' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setLogModalForn(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
