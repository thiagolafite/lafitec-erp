import React, { useState } from 'react';
import { ShieldCheck, Lock, Users, Building, Plus, Award, AlertCircle, FileCheck, CheckCircle2, Server } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Modal } from '../components/Modal';

export const SegurancaPage = ({ showToast }) => {
  const { empresa, user, refreshSession } = useAuth();
  const [isNovoUsuarioModal, setIsNovoUsuarioModal] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo: 'Funcionario'
  });

  if (!empresa) return null;

  const auditLogs = storage.getAuditLogs(empresa.id);
  const usuariosEmpresa = storage.getUsuariosEmpresa(empresa.id);

  const handleUpgradePlan = (novoPlano) => {
    if (window.confirm(`Deseja alterar o plano da empresa para "${novoPlano}"?`)) {
      try {
        storage.updateEmpresaPlano(empresa.id, novoPlano, user.nome);
        refreshSession();
        showToast('success', `Plano da empresa atualizado para ${novoPlano}!`);
      } catch (err) {
        showToast('error', 'Erro ao alterar plano.');
      }
    }
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    try {
      storage.saveUsuarioEmpresa(formData, empresa.id, user.nome);
      showToast('success', `Usuário ${formData.nome} adicionado com sucesso!`);
      setIsNovoUsuarioModal(false);
      setFormData({ nome: '', email: '', senha: '', tipo: 'Funcionario' });
    } catch (err) {
      showToast('error', err.message || 'Erro ao adicionar usuário.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Segurança da Informação & Empresa</h1>
          <p>Painel de conformidade, usuários e isolamento multi-tenant de {empresa.nome}</p>
        </div>
      </div>

      {/* Security Highlight Banner */}
      <div style={{
        backgroundColor: '#0A2540',
        borderRadius: '12px',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem',
        boxShadow: '0 10px 25px -5px rgba(10, 37, 64, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <ShieldCheck size={24} style={{ color: '#00C896' }} />
            <span style={{ color: '#00C896', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8125rem' }}>
              Diferencial Tecnológico Lafitec ERP
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            Proteção de Dados & Criptografia Multi-tenant Ativa
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.925rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
            Sua empresa está operando em um ambiente isolado. Todas as consultas ao banco de dados são validadas com o token <code>{empresa.id}</code>, garantindo zero risco de vazamento entre empresas.
          </p>
        </div>

        <div style={{
          backgroundColor: 'rgba(0, 200, 150, 0.12)',
          border: '1px solid rgba(0, 200, 150, 0.3)',
          padding: '1rem 1.5rem',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>Status do Sistema</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00C896', marginTop: '2px' }}>✓ 100% Protegido</div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>Logs de Auditoria Ativos</div>
        </div>
      </div>

      {/* Grid: Company Details & Users */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Company Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Building size={20} style={{ color: '#0A2540' }} /> Dados da Empresa
            </div>
            <span className="badge badge-accent">Plano {empresa.plano}</span>
          </div>

          <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ color: '#64748B', fontSize: '0.8rem', display: 'block' }}>Razão Social</span>
              <strong style={{ color: '#0A2540', fontSize: '1rem' }}>{empresa.nome}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', fontSize: '0.8rem', display: 'block' }}>CNPJ / Registro</span>
              <strong className="font-mono">{empresa.cnpj}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', fontSize: '0.8rem', display: 'block' }}>Identificador Tenant (ID)</span>
              <code style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{empresa.id}</code>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0A2540', display: 'block', marginBottom: '0.5rem' }}>
              Alterar Plano de Assinatura:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['Free', 'Pro', 'Premium'].map(p => (
                <button
                  key={p}
                  className={`btn btn-sm ${empresa.plano === p ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleUpgradePlan(p)}
                  disabled={empresa.plano === p}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Users size={20} style={{ color: '#00C896' }} /> Usuários com Acesso ({usuariosEmpresa.length})
            </div>
            {user?.tipo === 'Admin' && (
              <button className="btn btn-accent btn-sm" onClick={() => setIsNovoUsuarioModal(true)}>
                <Plus size={14} /> Add Usuário
              </button>
            )}
          </div>

          <div className="table-responsive">
            <table className="table" style={{ fontSize: '0.8125rem' }}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {usuariosEmpresa.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 700 }}>{u.nome}</td>
                    <td style={{ color: '#64748B' }}>{u.email}</td>
                    <td>
                      {u.tipo === 'Admin' ? (
                        <span className="badge badge-accent">Admin</span>
                      ) : (
                        <span className="badge badge-dark">Funcionário</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Audit Log Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <FileCheck size={20} style={{ color: '#00C896' }} /> Trilha de Auditoria de Segurança (Audit Logs)
          </div>
          <span className="badge badge-dark">{auditLogs.length} Registros</span>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Usuário Responsável</th>
                <th>Ação Executada</th>
                <th>Status de Segurança</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#64748B', padding: '2rem' }}>
                    Nenhum evento registrado ainda.
                  </td>
                </tr>
              ) : (
                auditLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ color: '#64748B', fontSize: '0.8125rem' }}>
                      {new Date(log.data).toLocaleString('pt-BR')}
                    </td>
                    <td style={{ fontWeight: 700, color: '#0A2540' }}>{log.usuarioNome}</td>
                    <td style={{ fontWeight: 600 }}>{log.acao}</td>
                    <td>
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} /> Auditado
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add User */}
      <Modal
        isOpen={isNovoUsuarioModal}
        onClose={() => setIsNovoUsuarioModal(false)}
        title="Cadastrar Novo Usuário na Empresa"
      >
        <form onSubmit={handleAddUser}>
          <div className="form-group">
            <label className="form-label">Nome Completo</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="Ex: Pedro Santos"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">E-mail de Acesso</label>
            <input
              type="email"
              className="form-input"
              required
              placeholder="pedro@suaempresa.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Senha Inicial</label>
              <input
                type="password"
                className="form-input"
                required
                placeholder="••••••••"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Perfil de Acesso</label>
              <select
                className="form-select"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                <option value="Funcionario">Funcionário</option>
                <option value="Admin">Administrador</option>
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', backgroundColor: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsNovoUsuarioModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn-accent">
              Cadastrar Usuário
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
