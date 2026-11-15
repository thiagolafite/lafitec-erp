import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Save,
  Boxes
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Modal } from '../components/Modal';

export const LotesPage = ({ showToast }) => {
  const { empresa, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos'); // todos, saldo, vencendo, vencido, zerado
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLocaisModalOpen, setIsLocaisModalOpen] = useState(false);
  const [editingLote, setEditingLote] = useState(null);
  const [lotes, setLotes] = useState(() => storage.getLotes(empresa?.id || ''));
  const [locaisEstoque, setLocaisEstoque] = useState(() => storage.getLocaisEstoque(empresa?.id || ''));
  const [novoLocalForm, setNovoLocalForm] = useState({ nome: '', codigo: '', descricao: '' });

  const produtos = storage.getProdutos(empresa?.id || '');

  const initialForm = {
    produtoId: '',
    numeroLote: '',
    dataFabricacao: '',
    dataValidade: '',
    semValidade: false,
    quantidade: '0',
    localizacao: '',
    observacoes: ''
  };

  const [formData, setFormData] = useState(initialForm);

  if (!empresa) return null;

  const refreshLotes = () => {
    setLotes(storage.getLotes(empresa.id));
  };

  const getValidadeStatus = (dataValidade) => {
    if (!dataValidade) return { label: 'Sem Validade', badge: 'badge-dark', key: 'ok' };
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const val = new Date(dataValidade + 'T00:00:00');
    if (isNaN(val.getTime())) return { label: dataValidade, badge: 'badge-dark', key: 'ok' };

    const diffDias = Math.ceil((val - hoje) / (1000 * 60 * 60 * 24));
    if (diffDias < 0) return { label: `Vencido (${Math.abs(diffDias)}d)`, badge: 'badge-danger', key: 'vencido' };
    if (diffDias <= 30) return { label: `Vence em ${diffDias}d`, badge: 'badge-warning', key: 'vencendo' };
    return { label: val.toLocaleDateString('pt-BR'), badge: 'badge-success', key: 'ok' };
  };

  const handleOpenModal = (lote = null) => {
    setLocaisEstoque(storage.getLocaisEstoque(empresa.id));
    if (lote) {
      setEditingLote(lote);
      setFormData({
        produtoId: lote.produtoId || '',
        numeroLote: lote.numeroLote || '',
        dataFabricacao: lote.dataFabricacao || '',
        dataValidade: lote.semValidade ? '' : (lote.dataValidade || ''),
        semValidade: Boolean(lote.semValidade || !lote.dataValidade),
        quantidade: lote.quantidade !== undefined ? String(lote.quantidade) : '0',
        localizacao: lote.localizacao || '',
        observacoes: lote.observacoes || ''
      });
    } else {
      setEditingLote(null);
      setFormData({
        ...initialForm,
        numeroLote: `LT-${new Date().getFullYear().toString().slice(-2)}${String(Math.floor(1000 + Math.random() * 9000))}`
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.numeroLote.trim()) {
      showToast('error', 'Informe o Número do Lote.');
      return;
    }
    if (!formData.produtoId) {
      showToast('error', 'Selecione o Produto vinculado ao lote.');
      return;
    }
    try {
      const prod = produtos.find(p => p.id === formData.produtoId);
      // Garante que o produto passe a controlar lote automaticamente
      if (prod && !prod.controlaLote) {
        storage.saveProduto({ ...prod, controlaLote: true }, empresa.id, user.nome);
      }

      storage.saveLote(
        {
          ...(editingLote ? { id: editingLote.id } : {}),
          ...formData,
          dataValidade: formData.semValidade ? '' : formData.dataValidade,
          semValidade: Boolean(formData.semValidade),
          produtoNome: prod ? prod.nome : '',
          quantidade: parseFloat(formData.quantidade) || 0
        },
        empresa.id,
        user.nome
      );

      refreshLotes();
      setLocaisEstoque(storage.getLocaisEstoque(empresa.id));
      showToast('success', `Lote "${formData.numeroLote}" salvo com estoque de ${parseFloat(formData.quantidade) || 0}!`);
      setIsModalOpen(false);
    } catch (err) {
      showToast('error', err.message || 'Erro ao salvar lote.');
    }
  };

  const handleQuickStockChange = (lote, novoEstoque) => {
    const qtd = Math.max(0, parseFloat(novoEstoque) || 0);
    storage.saveLote({ ...lote, quantidade: qtd }, empresa.id, user.nome);
    refreshLotes();
    showToast('success', `Estoque do lote ${lote.numeroLote} atualizado para ${qtd}.`);
  };

  const handleDelete = (lote) => {
    if (window.confirm(`Deseja excluir o lote "${lote.numeroLote}"?`)) {
      storage.deleteLote(lote.id, empresa.id, user.nome);
      refreshLotes();
      showToast('warning', `Lote "${lote.numeroLote}" removido.`);
    }
  };

  const filteredLotes = lotes.filter(l => {
    const valInfo = getValidadeStatus(l.dataValidade);
    const qtd = parseFloat(l.quantidade) || 0;

    if (filterStatus === 'saldo' && qtd <= 0) return false;
    if (filterStatus === 'zerado' && qtd > 0) return false;
    if (filterStatus === 'vencendo' && valInfo.key !== 'vencendo') return false;
    if (filterStatus === 'vencido' && valInfo.key !== 'vencido') return false;

    const term = searchTerm.toLowerCase();
    return (
      (l.numeroLote && l.numeroLote.toLowerCase().includes(term)) ||
      (l.produtoNome && l.produtoNome.toLowerCase().includes(term)) ||
      (l.localizacao && l.localizacao.toLowerCase().includes(term))
    );
  });

  const totalQuantidade = lotes.reduce((acc, l) => acc + (parseFloat(l.quantidade) || 0), 0);
  const lotesAlerta = lotes.filter(l => {
    const k = getValidadeStatus(l.dataValidade).key;
    return k === 'vencido' || k === 'vencendo';
  }).length;

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Lotes & Estoque por Lote</h1>
          <p>Cadastro de lotes, validade e controle de saldo por lote dos produtos de {empresa.nome}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setLocaisEstoque(storage.getLocaisEstoque(empresa.id));
              setIsLocaisModalOpen(true);
            }}
          >
            <MapPin size={18} /> Locais de Estoque
          </button>
          <button className="btn btn-accent" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Novo Lote
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #C9A962' }}>
          <div>
            <div className="stat-label">Lotes Cadastrados</div>
            <div className="stat-val" style={{ color: '#C9A962' }}>{lotes.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Registros ativos no sistema</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(201, 169, 98, 0.12)', color: '#C9A962' }}>
            <Layers size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10B981' }}>
          <div>
            <div className="stat-label">Saldo Total nos Lotes</div>
            <div className="stat-val" style={{ color: '#10B981' }}>{totalQuantidade} un.</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Quantidade somada em estoque</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
            <Boxes size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #EF4444' }}>
          <div>
            <div className="stat-label" style={{ color: lotesAlerta > 0 ? '#EF4444' : undefined }}>Vencidos / Vencendo (30d)</div>
            <div className="stat-val" style={{ color: lotesAlerta > 0 ? '#EF4444' : '#1E293B' }}>{lotesAlerta}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Lotes que requerem atenção</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' }}>
            <AlertTriangle size={22} />
          </div>
        </div>

        <div
          className="stat-card"
          style={{ borderLeft: '4px solid #3B82F6', cursor: 'pointer' }}
          onClick={() => {
            setLocaisEstoque(storage.getLocaisEstoque(empresa.id));
            setIsLocaisModalOpen(true);
          }}
          title="Clique para gerenciar locais de estoque"
        >
          <div>
            <div className="stat-label">Locais de Estoque</div>
            <div className="stat-val" style={{ color: '#3B82F6' }}>{locaisEstoque.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Clique para gerenciar locais</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' }}>
            <MapPin size={22} />
          </div>
        </div>
      </div>

      <div className="card">
        {/* Filtros & Busca */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'todos', label: `Todos (${lotes.length})` },
              { id: 'saldo', label: 'Com Saldo' },
              { id: 'vencendo', label: 'Vencendo (30d)' },
              { id: 'vencido', label: 'Vencidos' },
              { id: 'zerado', label: 'Zerados' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                className={`btn btn-sm ${filterStatus === f.id ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterStatus(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', minWidth: '280px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Buscar por lote, produto, local..."
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
                <th>Nº do Lote</th>
                <th>Produto Vinculado</th>
                <th>Fabricação</th>
                <th>Validade</th>
                <th>Localização</th>
                <th style={{ width: '170px' }}>Estoque do Lote</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredLotes.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                    Nenhum lote encontrado. Clique em <strong>+ Novo Lote</strong> para cadastrar.
                  </td>
                </tr>
              ) : (
                filteredLotes.map(lote => {
                  const valInfo = getValidadeStatus(lote.dataValidade);
                  return (
                    <tr key={lote.id}>
                      <td>
                        <span className="font-mono" style={{ fontWeight: 800, color: '#1A1A1A' }}>{lote.numeroLote}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Package size={14} style={{ color: '#C9A962' }} />
                          <span>{lote.produtoNome}</span>
                        </div>
                        {lote.produtoCodigo && (
                          <div className="font-mono" style={{ fontSize: '0.72rem', color: '#64748B' }}>{lote.produtoCodigo}</div>
                        )}
                      </td>
                      <td style={{ color: '#64748B' }}>
                        {lote.dataFabricacao ? new Date(lote.dataFabricacao + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td>
                        <span className={`badge ${valInfo.badge}`}>
                          <Calendar size={12} /> {valInfo.label}
                        </span>
                      </td>
                      <td style={{ color: '#64748B' }}>
                        {lote.localizacao ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} style={{ color: '#C9A962' }} /> {lote.localizacao}
                          </span>
                        ) : '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-input font-mono"
                            defaultValue={lote.quantidade || 0}
                            onBlur={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              if (val !== (parseFloat(lote.quantidade) || 0)) {
                                handleQuickStockChange(lote, val);
                              }
                            }}
                            style={{ padding: '0.35rem 0.5rem', fontWeight: 800, width: '88px', textAlign: 'center' }}
                            title="Altere o saldo e saia do campo para salvar"
                          />
                          {parseFloat(lote.quantidade) > 0 ? (
                            <CheckCircle2 size={15} style={{ color: '#10B981' }} />
                          ) : (
                            <AlertTriangle size={15} style={{ color: '#F59E0B' }} />
                          )}
                        </div>
                      </td>
                      <td className="text-right">
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button className="btn-icon" onClick={() => handleOpenModal(lote)} title="Editar Lote">
                            <Edit2 size={16} />
                          </button>
                          <button className="btn-icon" onClick={() => handleDelete(lote)} title="Excluir Lote" style={{ color: '#EF4444' }}>
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

      {/* Modal Cadastro/Edição de Lote */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLote ? `Editar Lote: ${editingLote.numeroLote}` : 'Novo Cadastro de Lote'}
        maxWidth="640px"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Produto Vinculado *</label>
            <select
              className="form-select"
              required
              value={formData.produtoId}
              onChange={(e) => setFormData({ ...formData, produtoId: e.target.value })}
            >
              <option value="">Selecione o produto...</option>
              {produtos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.codigo ? `[${p.codigo}] ` : ''}{p.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Número / Código do Lote *</label>
              <input
                type="text"
                className="form-input font-mono"
                required
                placeholder="Ex: LT-2601A"
                value={formData.numeroLote}
                onChange={(e) => setFormData({ ...formData, numeroLote: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estoque do Lote *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input font-mono"
                required
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                style={{ fontWeight: 800 }}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Data de Fabricação</label>
              <input
                type="date"
                className="form-input"
                value={formData.dataFabricacao}
                onChange={(e) => setFormData({ ...formData, dataFabricacao: e.target.value })}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Data de Validade</label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.semValidade)}
                    onChange={(e) => setFormData({
                      ...formData,
                      semValidade: e.target.checked,
                      dataValidade: e.target.checked ? '' : formData.dataValidade
                    })}
                  />
                  Sem validade
                </label>
              </div>
              <input
                type="date"
                className="form-input"
                disabled={Boolean(formData.semValidade)}
                value={formData.semValidade ? '' : formData.dataValidade}
                onChange={(e) => setFormData({ ...formData, dataValidade: e.target.value, semValidade: false })}
                style={formData.semValidade ? { backgroundColor: '#F1F5F9', cursor: 'not-allowed', color: '#94A3B8' } : {}}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Local de Estoque / Prateleira</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                className="form-select"
                value={formData.localizacao}
                onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                style={{ flex: 1 }}
              >
                <option value="">Selecione um local de estoque...</option>
                {locaisEstoque.map(loc => (
                  <option key={loc.id} value={loc.nome}>
                    {loc.codigo ? `${loc.codigo} — ${loc.nome}` : loc.nome}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-accent"
                title="Cadastrar novo local de estoque"
                onClick={() => {
                  setLocaisEstoque(storage.getLocaisEstoque(empresa.id));
                  setIsLocaisModalOpen(true);
                }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observações</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Informações adicionais sobre o lote..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', backgroundColor: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-accent">
              <Save size={16} /> Salvar Lote
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Locais de Estoque */}
      <Modal
        isOpen={isLocaisModalOpen}
        onClose={() => setIsLocaisModalOpen(false)}
        title="Locais de Estoque"
        maxWidth="620px"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!novoLocalForm.nome.trim()) {
              showToast('error', 'Informe o nome do local de estoque.');
              return;
            }
            const saved = storage.saveLocalEstoque(novoLocalForm, empresa.id, user.nome);
            const listaAtualizada = storage.getLocaisEstoque(empresa.id);
            setLocaisEstoque(listaAtualizada);
            if (saved && isModalOpen) {
              setFormData(prev => ({ ...prev, localizacao: saved.nome }));
            }
            setNovoLocalForm({ nome: '', codigo: '', descricao: '' });
            showToast('success', `Local "${saved?.nome}" cadastrado!`);
          }}
          style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={15} color="#C9A962" /> Cadastrar Novo Local de Estoque
          </div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Nome do Local *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Galpão A • Prateleira 03"
                value={novoLocalForm.nome}
                onChange={(e) => setNovoLocalForm({ ...novoLocalForm, nome: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Código</label>
              <input
                type="text"
                className="form-input font-mono"
                placeholder="Ex: GAL-A03"
                value={novoLocalForm.codigo}
                onChange={(e) => setNovoLocalForm({ ...novoLocalForm, codigo: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Descrição / Observação</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Área climatizada, corredor central"
              value={novoLocalForm.descricao}
              onChange={(e) => setNovoLocalForm({ ...novoLocalForm, descricao: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-accent btn-sm">
              <Plus size={15} /> Adicionar Local
            </button>
          </div>
        </form>

        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Locais Cadastrados ({locaisEstoque.length})
          </div>
          {locaisEstoque.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8', border: '1px dashed #CBD5E1', borderRadius: '8px' }}>
              Nenhum local de estoque cadastrado ainda.
            </div>
          ) : (
            <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {locaisEstoque.map(loc => (
                <div
                  key={loc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} color="#C9A962" />
                      {loc.codigo && <span className="font-mono" style={{ fontSize: '0.75rem', backgroundColor: '#F1F5F9', padding: '1px 6px', borderRadius: '4px' }}>{loc.codigo}</span>}
                      <span>{loc.nome}</span>
                    </div>
                    {loc.descricao && <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>{loc.descricao}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {isModalOpen && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, localizacao: loc.nome }));
                          setIsLocaisModalOpen(false);
                        }}
                      >
                        Selecionar
                      </button>
                    )}
                    {!loc.autoImported && (
                      <button
                        type="button"
                        className="btn-icon delete"
                        title="Excluir local"
                        onClick={() => {
                          if (window.confirm(`Excluir o local "${loc.nome}"?`)) {
                            storage.deleteLocalEstoque(loc.id, empresa.id, user.nome);
                            setLocaisEstoque(storage.getLocaisEstoque(empresa.id));
                            showToast('warning', `Local "${loc.nome}" removido.`);
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
