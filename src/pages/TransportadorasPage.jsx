import React, { useState } from 'react';
import { Truck, Plus, Search, Edit2, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Modal } from '../components/Modal';

export const TransportadorasPage = ({ showToast }) => {
  const { empresa, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    cidade: ''
  });

  if (!empresa) return null;

  const transportadoras = storage.getTransportadoras(empresa.id);

  const filtered = transportadoras.filter(t => 
    t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.cnpj.includes(searchTerm) ||
    t.cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nome: item.nome,
        cnpj: item.cnpj,
        email: item.email,
        telefone: item.telefone,
        cidade: item.cidade || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ nome: '', cnpj: '', email: '', telefone: '', cidade: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const data = editingItem ? { ...formData, id: editingItem.id } : formData;
      storage.saveTransportadora(data, empresa.id, user.nome);
      showToast('success', editingItem ? 'Transportadora atualizada!' : 'Transportadora cadastrada com sucesso!');
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
          <p>Gerencie as parceiras de logística de {empresa.nome}</p>
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
            placeholder="Buscar por nome, CNPJ ou cidade..."
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
                <th>Razão Social / Transportadora</th>
                <th>CNPJ</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Cidade / UF</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#64748B', padding: '3rem 1rem' }}>
                    Nenhuma transportadora localizada.
                  </td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0A2540' }}>{t.nome}</div>
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.8125rem' }}>{t.cnpj}</td>
                    <td style={{ color: '#64748B' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={14} /> {t.email}
                      </span>
                    </td>
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
                    <td className="text-right">
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button className="btn-icon" onClick={() => handleOpenModal(t)} title="Editar">
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

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Editar Transportadora' : 'Nova Transportadora'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nome da Transportadora / Razão Social</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="Ex: Express Logística LTDA"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">CNPJ</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="00.000.000/0001-00"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">E-mail de Contato</label>
              <input
                type="email"
                className="form-input"
                required
                placeholder="logistica@empresa.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Telefone / SAC</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="(00) 0000-0000"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Cidade e Estado</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: São Paulo - SP"
              value={formData.cidade}
              onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', backgroundColor: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn btn-accent">
              {editingItem ? 'Atualizar Transportadora' : 'Cadastrar Transportadora'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
