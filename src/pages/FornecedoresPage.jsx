import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Tag, 
  FileText,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Modal } from '../components/Modal';

export const FornecedoresPage = ({ showToast }) => {
  const { empresa, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState(null);

  const initialFormState = {
    nome: '',
    fantasia: '',
    cnpj: '',
    email: '',
    telefone: '',
    cidade: '',
    categoria: '',
    observacoes: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  if (!empresa) return null;

  const fornecedores = storage.getFornecedores(empresa.id);

  const filteredFornecedores = fornecedores.filter(f => 
    (f.nome && f.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (f.cnpj && f.cnpj.includes(searchTerm)) ||
    (f.email && f.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (f.categoria && f.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (forn = null) => {
    if (forn) {
      setEditingFornecedor(forn);
      setFormData({
        ...initialFormState,
        ...forn,
        cnpj: forn.cnpj || forn.cpfCnpj || ''
      });
    } else {
      setEditingFornecedor(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFornecedor(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome) {
      showToast('error', 'Preencha o Nome/Razão Social do fornecedor.');
      return;
    }

    try {
      const saveObj = editingFornecedor
        ? { ...formData, id: editingFornecedor.id, tipo: 'Fornecedores' }
        : { ...formData, tipo: 'Fornecedores' };

      storage.saveParceiroComercial(saveObj, empresa.id, user.nome);
      showToast('success', editingFornecedor ? 'Fornecedor atualizado!' : 'Fornecedor cadastrado com sucesso!');
      handleCloseModal();
    } catch (err) {
      showToast('error', err.message || 'Erro ao salvar fornecedor.');
    }
  };

  const handleDelete = (forn) => {
    if (window.confirm(`Excluir fornecedor "${forn.nome}"?`)) {
      try {
        storage.deleteFornecedor(forn.id, empresa.id, user.nome);
        showToast('warning', `Fornecedor "${forn.nome}" removido.`);
      } catch (err) {
        showToast('error', 'Erro ao excluir fornecedor.');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Gestão de Fornecedores</h1>
          <p>Cadastro e gestão de fornecedores de {empresa.nome}</p>
        </div>
        <button className="btn btn-accent" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Novo Fornecedor
        </button>
      </div>

      <div className="card">
        {/* Search */}
        <div style={{ marginBottom: '1.25rem', position: 'relative', maxWidth: '400px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por razão social, CNPJ, e-mail ou categoria..."
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
                <th>Código / ID</th>
                <th>Razão Social / Nome</th>
                <th>CNPJ</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Categoria</th>
                <th>Cidade</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredFornecedores.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#64748B', padding: '3rem 1rem' }}>
                    {searchTerm ? 'Nenhum fornecedor localizado com estes critérios.' : 'Nenhum fornecedor cadastrado nesta empresa.'}
                  </td>
                </tr>
              ) : (
                filteredFornecedores.map(forn => (
                  <tr key={forn.id}>
                    <td className="font-mono" style={{ fontWeight: 700, color: '#0A2540' }}>{forn.codigo || forn.id}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0A2540' }}>{forn.nome}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{forn.fantasia}</div>
                    </td>
                    <td className="font-mono">{forn.cnpj || forn.cpfCnpj}</td>
                    <td style={{ color: '#64748B' }}>{forn.email}</td>
                    <td style={{ color: '#64748B' }}>{forn.telefone}</td>
                    <td>
                      <span className="badge badge-info">{forn.categoria || 'Geral'}</span>
                    </td>
                    <td style={{ color: '#64748B' }}>{forn.cidade || '-'}</td>
                    <td className="text-right">
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button className="btn-icon" onClick={() => handleOpenModal(forn)} title="Editar Fornecedor">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon" onClick={() => handleDelete(forn)} title="Excluir" style={{ color: '#EF4444' }}>
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

      {/* Modal Cadastro de Fornecedor */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingFornecedor ? `Editar Fornecedor: ${editingFornecedor.nome}` : 'Novo Fornecedor'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Razão Social / Nome *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="Ex: Dell Computadores do Brasil LTDA"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nome Fantasia</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Dell Brasil"
                value={formData.fantasia}
                onChange={(e) => setFormData({ ...formData, fantasia: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">CNPJ / CPF</label>
              <input
                type="text"
                className="form-input font-mono"
                placeholder="00.000.000/0001-00"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">E-mail Comercial</label>
              <input
                type="email"
                className="form-input"
                placeholder="vendas@fornecedor.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Telefone / WhatsApp</label>
              <input
                type="text"
                className="form-input"
                placeholder="(00) 0000-0000"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Categoria de Insumo / Produto</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Hardware, Embalagens, Matéria Prima"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cidade / UF</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: São Paulo - SP"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observações Internas</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Condições de pagamento, prazos de entrega..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', backgroundColor: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn btn-accent">Salvar Fornecedor</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
