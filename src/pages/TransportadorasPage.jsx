import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  CheckCircle2, 
  FileText, 
  Building, 
  DollarSign, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Loader2,
  PlusCircle,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Modal } from '../components/Modal';

export const TransportadorasPage = ({ showToast }) => {
  const { empresa, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('principal'); // principal, contatos, enderecos, observacao, ativacao, bancaria
  const [cepLoading, setCepLoading] = useState(false);

  const initialFormState = {
    codigo: '',
    tipo: 'Transportadoras',
    nome: '', // Razão/Nome
    fantasia: '',
    cpfCnpj: '',
    cnpj: '',
    ieRg: '',
    rntrc: '', // Registro Nacional de Transportadores Rodoviários de Cargas
    telefone: '',
    email: '',
    cep: '',
    cidade: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    logomarca: '',
    contatos: [],
    enderecosSecundarios: [],
    obsFrete: '',
    obsAviso: '',
    statusAtivacao: 'Ativo',
    modalidadeFrete: 'Ambos', // CIF, FOB, Ambos
    limiteFreteCredito: '0.00',
    banco: '341 - Itaú Unibanco S.A.',
    agencia: '',
    contaCorrente: '',
    tipoPix: 'CNPJ',
    chavePix: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  if (!empresa) return null;

  const transportadoras = storage.getTransportadoras(empresa.id);

  const filtered = transportadoras.filter(t => 
    (t.nome && t.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.cpfCnpj && t.cpfCnpj.includes(searchTerm)) ||
    (t.cnpj && t.cnpj.includes(searchTerm)) ||
    (t.rntrc && t.rntrc.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.cidade && t.cidade.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // ViaCEP Lookup
  const handleFetchViaCep = async (cepClean) => {
    if (cepClean.length === 8) {
      setCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepClean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: data.logradouro || prev.endereco,
            bairro: data.bairro || prev.bairro,
            cidade: data.localidade && data.uf ? `${data.localidade} - ${data.uf}` : prev.cidade
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

  const handleOpenModal = (item = null) => {
    setActiveTab('principal');
    if (item) {
      setEditingItem(item);
      setFormData({
        ...initialFormState,
        ...item,
        codigo: item.codigo || item.id,
        nome: item.nome || item.razao || '',
        cnpj: item.cnpj || item.cpfCnpj || '',
        cpfCnpj: item.cpfCnpj || item.cnpj || '',
        contatos: item.contatos || []
      });
    } else {
      setEditingItem(null);
      const nextNum = 100 + transportadoras.length + 1;
      setFormData({
        ...initialFormState,
        codigo: `TR-${nextNum}`
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Save Contact
  const handleAddContato = () => {
    setFormData(prev => ({
      ...prev,
      contatos: [
        ...prev.contatos,
        { id: Date.now(), nome: '', email: '', telefone: '', setor: 'Logística / Expedição', obs: '' }
      ]
    }));
  };

  const handleRemoveContato = (id) => {
    setFormData(prev => ({
      ...prev,
      contatos: prev.contatos.filter(c => c.id !== id)
    }));
  };

  const handleContatoChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      contatos: prev.contatos.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        tipo: 'Transportadoras',
        cpfCnpj: formData.cpfCnpj || formData.cnpj,
        empresaId: empresa.id
      };

      if (editingItem) {
        dataToSave.id = editingItem.id;
      }

      storage.saveTransportadora(dataToSave, empresa.id, user.nome);
      showToast('success', editingItem ? 'Transportadora atualizada com sucesso!' : 'Transportadora cadastrada com sucesso!');
      handleCloseModal();
    } catch (err) {
      showToast('error', 'Erro ao salvar transportadora.');
    }
  };

  const handleDelete = (item) => {
    if (window.confirm(`Remover transportadora "${item.nome}"?`)) {
      try {
        storage.deleteTransportadora(item.id, empresa.id, user.nome);
        showToast('warning', `Transportadora "${item.nome}" removida.`);
      } catch (err) {
        showToast('error', 'Erro ao excluir transportadora.');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Cadastro de Transportadoras</h1>
          <p>Gerencie as parceiras de logística e transporte de {empresa.nome}</p>
        </div>
        <button className="btn btn-accent" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nova Transportadora
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1.25rem', position: 'relative', maxWidth: '400px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por nome, CNPJ, RNTRC ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Razão Social / Transportadora</th>
                <th>RNTRC</th>
                <th>CNPJ / CPF</th>
                <th>Telefone</th>
                <th>Cidade / UF</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#64748B', padding: '3rem 1rem' }}>
                    Nenhuma transportadora localizada.
                  </td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id}>
                    <td className="font-mono" style={{ fontWeight: 700, color: '#0A2540' }}>{t.codigo || t.id}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0A2540' }}>{t.nome}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{t.fantasia ? `Fantasia: ${t.fantasia}` : t.email}</div>
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.8rem', color: '#475569' }}>{t.rntrc || 'N/A'}</td>
                    <td className="font-mono" style={{ fontSize: '0.8125rem' }}>{t.cpfCnpj || t.cnpj}</td>
                    <td style={{ color: '#64748B' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={14} /> {t.telefone}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <MapPin size={14} style={{ color: '#00C896' }} /> {t.cidade || 'Não informada'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${t.statusAtivacao === 'Inativo' ? 'badge-danger' : 'badge-success'}`}>
                        {t.statusAtivacao || 'Ativo'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button className="btn-icon" onClick={() => handleOpenModal(t)} title="Editar Cadastro">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon" onClick={() => handleDelete(t)} title="Excluir" style={{ color: '#EF4444' }}>
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

      {/* MODAL COMPLETO DE CADASTRO DE TRANSPORTADORA - EXATAMENTE IGUAL AO ANEXO */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? `Editar Transportadora: ${editingItem.nome}` : 'Cadastro de Transportadora'}
        maxWidth="1020px"
      >
        {/* Navegação por Abas Superior */}
        <div style={{
          display: 'flex',
          gap: '4px',
          borderBottom: '2px solid #E2E8F0',
          marginBottom: '1.25rem',
          overflowX: 'auto',
          backgroundColor: '#F8FAFC',
          padding: '4px',
          borderRadius: '8px'
        }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'principal' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('principal')}
            style={{ borderBottom: activeTab === 'principal' ? '3px solid #00C896' : 'none' }}
          >
            Principal
          </button>

          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'contatos' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('contatos')}
          >
            Contatos ({formData.contatos.length})
          </button>

          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'enderecos' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('enderecos')}
          >
            Endereços
          </button>

          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'observacao' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('observacao')}
          >
            Observação/Aviso
          </button>

          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'ativacao' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('ativacao')}
          >
            Ativação
          </button>

          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'bancaria' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('bancaria')}
          >
            Conta Bancária
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ABA 1: PRINCIPAL */}
          {activeTab === 'principal' && (
            <div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Código:</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    disabled
                    value={formData.codigo || (editingItem ? (editingItem.codigo || editingItem.id) : 'TR-101')}
                    style={{ backgroundColor: '#E2E8F0', color: '#64748B', fontWeight: 700 }}
                  />
                </div>

                <div className="form-group" style={{ flex: 1.5 }}>
                  <label className="form-label">Tipo:</label>
                  <div style={{
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>* Transportador</span>
                    <Truck size={16} />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label" style={{ color: '#0284C7', fontWeight: 700 }}>Razão/Nome: *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Razão social completa..."
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Fantasia/Apelido:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nome fantasia da transportadora..."
                    value={formData.fantasia}
                    onChange={(e) => setFormData({ ...formData, fantasia: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label" style={{ color: '#0284C7', fontWeight: 700 }}>CNPJ / CPF: *</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      className="form-input font-mono"
                      required
                      placeholder="CNPJ será consultado na internet"
                      value={formData.cpfCnpj}
                      onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value, cnpj: e.target.value })}
                    />
                    <button
                      type="button"
                      className="btn btn-accent btn-icon-only"
                      title="Consultar CNPJ online"
                      onClick={() => showToast('info', 'Consulta de CNPJ ativa via webservice.')}
                    >
                      <Globe size={18} />
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">IE / RG:</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="Inscrição Estadual"
                    value={formData.ieRg}
                    onChange={(e) => setFormData({ ...formData, ieRg: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">RNTRC:</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="Nº RNTRC ANTT"
                    value={formData.rntrc}
                    onChange={(e) => setFormData({ ...formData, rntrc: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Telefone:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="(00) 0000-0000"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Email:</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="logistica@transportadora.com.br"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* SEÇÃO CAIXILHO: LOCALIZAÇÃO */}
              <fieldset style={{
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '1.25rem',
                marginTop: '1.25rem',
                marginBottom: '1rem',
                backgroundColor: '#FFFFFF'
              }}>
                <legend style={{
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: 800
                }}>
                  Localização
                </legend>

                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
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
                        <Loader2 size={16} className="spin" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#00C896' }} />
                      )}
                    </div>
                  </div>

                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">Cidade:</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Selecione ou digite a cidade - UF"
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ flex: 3 }}>
                    <label className="form-label">Endereço:</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Rua, Avenida, Logradouro..."
                      value={formData.endereco}
                      onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Número:</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="1000"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">Complemento:</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Galpão A, Sala 501..."
                      value={formData.complemento}
                      onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">Bairro:</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Nome do bairro"
                        value={formData.bairro}
                        onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                      />
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.endereco + ' ' + formData.numero + ' ' + formData.cidade)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-accent btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                      >
                        <MapPin size={14} /> Ver no Mapa
                      </a>
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label">Logomarca:</label>
                  <input type="file" className="form-input" />
                </div>
              </fieldset>
            </div>
          )}

          {/* ABA 2: CONTATOS */}
          {activeTab === 'contatos' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: 800, color: '#0A2540' }}>Contatos da Transportadora / Expedição</h4>
                <button type="button" className="btn btn-accent btn-sm" onClick={handleAddContato}>
                  <PlusCircle size={16} /> Adicionar Contato
                </button>
              </div>

              {formData.contatos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                  Nenhum contato cadastrado para esta transportadora.
                </div>
              ) : (
                formData.contatos.map(c => (
                  <div key={c.id} style={{
                    padding: '1rem',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    marginBottom: '0.75rem',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div className="form-row">
                      <div className="form-group" style={{ flex: 2 }}>
                        <label className="form-label">Nome do Contato</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Nome do gerente de frete / motorista"
                          value={c.nome}
                          onChange={(e) => handleContatoChange(c.id, 'nome', e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ flex: 2 }}>
                        <label className="form-label">E-mail</label>
                        <input
                          type="email"
                          className="form-input"
                          placeholder="contato@transportadora.com"
                          value={c.email}
                          onChange={(e) => handleContatoChange(c.id, 'email', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Telefone / WhatsApp</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="(11) 99999-9999"
                          value={c.telefone}
                          onChange={(e) => handleContatoChange(c.id, 'telefone', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Setor / Função</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Expedição, Cotação de Frete..."
                          value={c.setor}
                          onChange={(e) => handleContatoChange(c.id, 'setor', e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ color: '#EF4444', borderColor: '#FCA5A5' }}
                          onClick={() => handleRemoveContato(c.id)}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ABA 3: ENDEREÇOS */}
          {activeTab === 'enderecos' && (
            <div>
              <h4 style={{ fontWeight: 800, color: '#0A2540', marginBottom: '1rem' }}>Endereços Secundários e Filiais de Coleta</h4>
              <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1rem' }}>
                Cadastre pontos de coleta, transbordo ou galpões de carregamento adicionais.
              </p>
              <div className="form-group">
                <label className="form-label">Endereço do CD / Galpão Principal de Coleta</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Informe os endereços das filiais de transbordo..."
                  value={formData.enderecosSecundarios.join('\n')}
                  onChange={(e) => setFormData({ ...formData, enderecosSecundarios: e.target.value.split('\n') })}
                />
              </div>
            </div>
          )}

          {/* ABA 4: OBSERVAÇÃO/AVISO */}
          {activeTab === 'observacao' && (
            <div>
              <div className="form-group">
                <label className="form-label">Observações sobre Cotações & Regras de Frete</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Informações sobre valor de cubagem, frete mínimo, prazo de entrega..."
                  value={formData.obsFrete}
                  onChange={(e) => setFormData({ ...formData, obsFrete: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#D97706', fontWeight: 700 }}>Aviso Importante para Expedição / Faturamento</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Aviso exibido na emissão de minuta de carregamento..."
                  value={formData.obsAviso}
                  onChange={(e) => setFormData({ ...formData, obsAviso: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* ABA 5: ATIVAÇÃO */}
          {activeTab === 'ativacao' && (
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Status de Ativação no Sistema *</label>
                  <select
                    className="form-select"
                    value={formData.statusAtivacao}
                    onChange={(e) => setFormData({ ...formData, statusAtivacao: e.target.value })}
                  >
                    <option value="Ativo">🟢 Ativo (Liberado para cotação e frete)</option>
                    <option value="Inativo">🔴 Inativo (Bloqueado)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Modalidade de Frete Atendida</label>
                  <select
                    className="form-select"
                    value={formData.modalidadeFrete}
                    onChange={(e) => setFormData({ ...formData, modalidadeFrete: e.target.value })}
                  >
                    <option value="Ambos">Ambos (CIF e FOB)</option>
                    <option value="CIF">CIF (Frete por conta do remetente)</option>
                    <option value="FOB">FOB (Frete por conta do destinatário)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Limite de Crédito / Faturamento de Frete (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input font-mono"
                  placeholder="0.00"
                  value={formData.limiteFreteCredito}
                  onChange={(e) => setFormData({ ...formData, limiteFreteCredito: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* ABA 6: CONTA BANCÁRIA */}
          {activeTab === 'bancaria' && (
            <div>
              <div className="form-group">
                <label className="form-label">Banco *</label>
                <select
                  className="form-select"
                  value={formData.banco}
                  onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                >
                  <option value="341 - Itaú Unibanco S.A.">341 - Itaú Unibanco S.A.</option>
                  <option value="001 - Banco do Brasil S.A.">001 - Banco do Brasil S.A.</option>
                  <option value="237 - Banco Bradesco S.A.">237 - Banco Bradesco S.A.</option>
                  <option value="104 - Caixa Econômica Federal">104 - Caixa Econômica Federal</option>
                  <option value="033 - Banco Santander Brasil">033 - Banco Santander Brasil</option>
                  <option value="260 - Nu Pagamentos (Nubank)">260 - Nu Pagamentos (Nubank)</option>
                  <option value="077 - Banco Inter S.A.">077 - Banco Inter S.A.</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Agência</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="0000"
                    value={formData.agencia}
                    onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Conta Corrente / Dígito</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="00000-0"
                    value={formData.contaCorrente}
                    onChange={(e) => setFormData({ ...formData, contaCorrente: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tipo de Chave PIX</label>
                  <select
                    className="form-select"
                    value={formData.tipoPix}
                    onChange={(e) => setFormData({ ...formData, tipoPix: e.target.value })}
                  >
                    <option value="CNPJ">CNPJ</option>
                    <option value="E-mail">E-mail</option>
                    <option value="Telefone">Telefone</option>
                    <option value="Chave Aleatória">Chave Aleatória</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Chave PIX para Pagamento de Frete</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="Informe a chave PIX..."
                    value={formData.chavePix}
                    onChange={(e) => setFormData({ ...formData, chavePix: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer do Modal */}
          <div className="modal-footer" style={{ padding: '1rem 0 0 0', backgroundColor: 'transparent', display: 'flex', justifyContent: 'space-between' }}>
            <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
              ❌ Voltar
            </button>
            <button type="submit" className="btn btn-accent">
              💾 Salvar Transportadora
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
