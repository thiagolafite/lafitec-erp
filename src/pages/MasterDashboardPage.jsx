import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  Lock, 
  Crown,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Building,
  Sliders,
  Check
} from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';

export const MasterDashboardPage = ({ showToast }) => {
  const { user, switchDemoEmpresa } = useAuth();

  const [activeTab, setActiveTab] = useState('aprovacoes'); // 'aprovacoes' | 'empresas' | 'usuarios' | 'metricas'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [globalUsers, setGlobalUsers] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlano, setFilterPlano] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Load Master Data
  const loadMasterData = async () => {
    setLoading(true);
    try {
      const [pending, allTenants, allUsers] = await Promise.all([
        supabaseService.getPendingApprovals(),
        supabaseService.getAllTenantsWithMetrics(),
        supabaseService.getAllUsersGlobal()
      ]);

      setPendingApprovals(pending || []);
      setTenants(allTenants || []);
      setGlobalUsers(allUsers || []);
    } catch (err) {
      console.error('Erro ao carregar dados Master:', err);
      if (showToast) showToast('Erro ao carregar dados do painel Master.', 'danger');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadMasterData();
  };

  // 1. APROVAR CADASTRO
  const handleApprove = async (item) => {
    try {
      await supabaseService.approveCompanyAndUser(item.empresa.id, item.usuario?.id);
      if (showToast) showToast(`Empresa "${item.empresa.nome}" e usuário aprovados com sucesso!`, 'success');
      loadMasterData();
    } catch (err) {
      if (showToast) showToast('Erro ao aprovar cadastro.', 'danger');
    }
  };

  // 2. REJEITAR CADASTRO
  const handleReject = async (item) => {
    if (!window.confirm(`Tem certeza que deseja recusar a solicitação de cadastro da empresa "${item.empresa.nome}"?`)) {
      return;
    }
    try {
      await supabaseService.rejectCompanyAndUser(item.empresa.id, item.usuario?.id, 'Recusado pelo Master');
      if (showToast) showToast(`Solicitação de "${item.empresa.nome}" recusada.`, 'warning');
      loadMasterData();
    } catch (err) {
      if (showToast) showToast('Erro ao recusar cadastro.', 'danger');
    }
  };

  // 3. ALTERAR PLANO DA EMPRESA
  const handlePlanChange = async (empresaId, novoPlano) => {
    try {
      await supabaseService.updateCompanyPlan(empresaId, novoPlano);
      if (showToast) showToast(`Plano atualizado para ${novoPlano} com sucesso!`, 'success');
      loadMasterData();
    } catch (err) {
      if (showToast) showToast('Erro ao atualizar plano.', 'danger');
    }
  };

  // 4. ATIVAR / DESATIVAR EMPRESA
  const handleToggleStatus = async (empresaId, statusAtual) => {
    const novoStatus = !statusAtual;
    try {
      await supabaseService.toggleCompanyStatus(empresaId, novoStatus);
      if (showToast) showToast(`Status da empresa alterado para ${novoStatus ? 'Ativa' : 'Bloqueada'}.`, 'info');
      loadMasterData();
    } catch (err) {
      if (showToast) showToast('Erro ao alterar status.', 'danger');
    }
  };

  // Métricas Globais Consolidadas
  const totalEmpresas = tenants.length;
  const empresasAtivas = tenants.filter(t => t.ativo && t.statusAprovacao === 'Aprovado').length;
  const totalPendentes = pendingApprovals.length;
  const totalUsuariosGlobal = globalUsers.length;
  const totalVendasGlobal = tenants.reduce((acc, t) => acc + (t.faturamentoTotal || 0), 0);

  // Filtros de Empresas
  const filteredTenants = tenants.filter(t => {
    const matchSearch = (t.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (t.cnpj || '').includes(searchTerm) ||
                        (t.email_contato || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchPlano = filterPlano === 'ALL' || t.plano === filterPlano;
    const matchStatus = filterStatus === 'ALL' || 
                        (filterStatus === 'Ativo' && t.ativo && t.statusAprovacao === 'Aprovado') ||
                        (filterStatus === 'Pendente' && t.statusAprovacao === 'Pendente') ||
                        (filterStatus === 'Bloqueado' && (!t.ativo || t.statusAprovacao === 'Rejeitado'));
    return matchSearch && matchPlano && matchStatus;
  });

  // Filtros de Usuários
  const filteredUsers = globalUsers.filter(u => {
    return (u.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (u.empresaNome || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const formatDate = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* 1. Header do Painel Master */}
      <div style={{
        background: 'linear-gradient(135deg, #051120 0%, #0A1E35 50%, #102A48 100%)',
        borderRadius: '16px',
        padding: '2rem 2.25rem',
        color: '#FFFFFF',
        marginBottom: '2.25rem',
        boxShadow: '0 12px 32px -4px rgba(7, 21, 39, 0.35)',
        border: '1px solid rgba(255, 215, 0, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}></div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255, 215, 0, 0.15)', color: '#FCD34D', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
              <Crown size={14} /> <span>Acesso Exclusivo Super-Admin Master</span>
            </div>
            <h1 style={{ fontFamily: 'Outfit', fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
              Painel de Monitoramento & Aprovação SaaS
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '4px' }}>
              Supervisão geral de empresas, aprovação de novos cadastros, controle de planos e faturamento de todo o ecossistema.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={handleRefresh}
              className="btn btn-outline"
              disabled={refreshing}
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)', fontWeight: 700 }}
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Atualizando...' : 'Atualizar Dados'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards Globais */}
      <div className="stat-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div>
            <div className="stat-label">Aprovações Pendentes</div>
            <div className="stat-val" style={{ color: totalPendentes > 0 ? '#D97706' : '#071527' }}>
              {totalPendentes}
            </div>
            <div style={{ fontSize: '0.75rem', color: totalPendentes > 0 ? '#D97706' : '#576F86', marginTop: '6px', fontWeight: 700 }}>
              {totalPendentes > 0 ? '⚠️ Requer ação do Master' : 'Nenhuma pendência'}
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#D97706', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <Clock size={26} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #00F5A0' }}>
          <div>
            <div className="stat-label">Total de Empresas</div>
            <div className="stat-val">{totalEmpresas}</div>
            <div style={{ fontSize: '0.75rem', color: '#008764', marginTop: '6px', fontWeight: 700 }}>
              {empresasAtivas} empresas ativas
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(0, 245, 160, 0.14)', color: '#008764', border: '1px solid rgba(0, 245, 160, 0.3)' }}>
            <Building2 size={26} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #38BDF8' }}>
          <div>
            <div className="stat-label">Usuários no Sistema</div>
            <div className="stat-val">{totalUsuariosGlobal}</div>
            <div style={{ fontSize: '0.75rem', color: '#576F86', marginTop: '6px', fontWeight: 600 }}>
              Em todas as empresas
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(56, 189, 248, 0.14)', color: '#0284C7', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <Users size={26} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #6366F1' }}>
          <div>
            <div className="stat-label">Vendas no Ecossistema</div>
            <div className="stat-val" style={{ fontSize: '1.65rem' }}>{formatCurrency(totalVendasGlobal)}</div>
            <div style={{ fontSize: '0.75rem', color: '#6366F1', marginTop: '6px', fontWeight: 700 }}>
              Volume transacionado no ERP
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(99, 102, 241, 0.14)', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <TrendingUp size={26} />
          </div>
        </div>
      </div>

      {/* 3. Navegação por Abas do Painel Master */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderBottom: '1px solid #E2E8F0',
        marginBottom: '1.75rem',
        paddingBottom: '2px'
      }}>
        <button
          onClick={() => setActiveTab('aprovacoes')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            fontSize: '0.95rem',
            fontWeight: 800,
            cursor: 'pointer',
            borderBottom: activeTab === 'aprovacoes' ? '3px solid #F59E0B' : '3px solid transparent',
            color: activeTab === 'aprovacoes' ? '#D97706' : '#64748B',
            transition: 'all 0.2s ease'
          }}
        >
          <Clock size={18} />
          <span>Fila de Aprovação</span>
          {totalPendentes > 0 && (
            <span style={{
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              borderRadius: '20px',
              padding: '2px 8px',
              fontSize: '0.75rem',
              fontWeight: 900
            }}>
              {totalPendentes}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('empresas')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            fontSize: '0.95rem',
            fontWeight: 800,
            cursor: 'pointer',
            borderBottom: activeTab === 'empresas' ? '3px solid #00F5A0' : '3px solid transparent',
            color: activeTab === 'empresas' ? '#008764' : '#64748B',
            transition: 'all 0.2s ease'
          }}
        >
          <Building2 size={18} />
          <span>Todas as Empresas ({totalEmpresas})</span>
        </button>

        <button
          onClick={() => setActiveTab('usuarios')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            fontSize: '0.95rem',
            fontWeight: 800,
            cursor: 'pointer',
            borderBottom: activeTab === 'usuarios' ? '3px solid #38BDF8' : '3px solid transparent',
            color: activeTab === 'usuarios' ? '#0284C7' : '#64748B',
            transition: 'all 0.2s ease'
          }}
        >
          <Users size={18} />
          <span>Usuários Globais ({totalUsuariosGlobal})</span>
        </button>
      </div>

      {/* ================= ABA 1: FILA DE APROVAÇÃO ================= */}
      {activeTab === 'aprovacoes' && (
        <div>
          {pendingApprovals.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                color: '#10B981',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.35rem', fontWeight: 800, color: '#071527' }}>
                Fila de Aprovações Limpa!
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '480px', margin: '0.5rem auto 0 auto' }}>
                Não há nenhuma empresa ou usuário aguardando liberação no momento. Novos cadastros aparecerão automaticamente aqui.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {pendingApprovals.map((item) => (
                <div key={item.empresa.id} className="card" style={{ borderLeft: '4px solid #F59E0B', padding: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="badge badge-warning">Aguardando Liberação</span>
                        <span className="badge badge-accent">Plano {item.empresa.plano || 'Premium'}</span>
                        <span style={{ fontSize: '0.775rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} /> {formatDate(item.dataSolicitacao)}
                        </span>
                      </div>
                      <h3 style={{ fontFamily: 'Outfit', fontSize: '1.35rem', fontWeight: 800, color: '#071527' }}>
                        {item.empresa.nome}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: '#576F86', fontWeight: 600, marginTop: '2px' }}>
                        CNPJ: <span className="font-mono" style={{ color: '#071527', fontWeight: 800 }}>{item.empresa.cnpj}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => handleReject(item)}
                        className="btn btn-outline btn-sm"
                        style={{ color: '#EF4444', borderColor: '#FCA5A5', fontWeight: 700 }}
                      >
                        <XCircle size={16} /> Recusar
                      </button>

                      <button
                        onClick={() => handleApprove(item)}
                        className="btn btn-accent btn-sm"
                        style={{ fontWeight: 800 }}
                      >
                        <CheckCircle2 size={16} /> Aprovar Cadastro
                      </button>
                    </div>
                  </div>

                  {/* Informações detalhadas do Solicitante e Localização */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    backgroundColor: '#F8FAFD',
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.85rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Administrador Responsável</div>
                      <div style={{ fontWeight: 800, color: '#071527', marginTop: '2px' }}>{item.solicitanteNome}</div>
                      <div style={{ color: '#576F86', marginTop: '2px' }}>{item.solicitanteEmail}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Contato / WhatsApp</div>
                      <div style={{ fontWeight: 800, color: '#071527', marginTop: '2px' }}>
                        {item.empresa.telefone || 'Não informado'}
                      </div>
                      {item.empresa.telefone && (
                        <a
                          href={`https://wa.me/55${item.empresa.telefone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: '0.775rem', color: '#008764', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}
                        >
                          <Phone size={12} /> Conversar no WhatsApp →
                        </a>
                      )}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Localização & Endereço</div>
                      <div style={{ fontWeight: 700, color: '#071527', marginTop: '2px' }}>
                        {item.empresa.cidade ? `${item.empresa.cidade} - ${item.empresa.estado}` : 'Não informada'}
                      </div>
                      <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '2px' }}>
                        {item.empresa.endereco ? `${item.empresa.endereco}, ${item.empresa.numero || 'S/N'}` : ''} 
                        {item.empresa.bairro ? ` - ${item.empresa.bairro}` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= ABA 2: TODAS AS EMPRESAS (TENANTS) ================= */}
      {activeTab === 'empresas' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Gestão de Empresas Multi-tenant</h2>
              <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Visualize e controle todas as empresas cadastradas no banco de dados</p>
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '240px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Buscar empresa, CNPJ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '2rem', height: '38px', fontSize: '0.85rem' }}
                />
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              </div>

              <select
                className="form-select"
                value={filterPlano}
                onChange={(e) => setFilterPlano(e.target.value)}
                style={{ width: '150px', height: '38px', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <option value="ALL">Todos os Planos</option>
                <option value="Básico">Básico</option>
                <option value="Pro">Pro</option>
                <option value="Premium">Premium</option>
                <option value="Enterprise">Enterprise</option>
              </select>

              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ width: '150px', height: '38px', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <option value="ALL">Todos os Status</option>
                <option value="Ativo">Ativas</option>
                <option value="Pendente">Pendentes</option>
                <option value="Bloqueado">Bloqueadas</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Empresa / CNPJ</th>
                  <th>Plano</th>
                  <th>Status</th>
                  <th>Usuários</th>
                  <th>Clientes</th>
                  <th>Produtos</th>
                  <th>Vendas Transacionadas</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                      Nenhuma empresa encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: '#071527' }}>{emp.nome}</div>
                        <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                          CNPJ: <span className="font-mono">{emp.cnpj}</span> {emp.cidade ? `• ${emp.cidade}/${emp.estado}` : ''}
                        </div>
                      </td>

                      <td>
                        <select
                          className="form-select"
                          value={emp.plano || 'Premium'}
                          onChange={(e) => handlePlanChange(emp.id, e.target.value)}
                          style={{ padding: '3px 8px', fontSize: '0.775rem', fontWeight: 700, width: '115px' }}
                        >
                          <option value="Básico">Básico</option>
                          <option value="Pro">Pro</option>
                          <option value="Premium">Premium</option>
                          <option value="Enterprise">Enterprise</option>
                        </select>
                      </td>

                      <td>
                        {emp.statusAprovacao === 'Pendente' ? (
                          <span className="badge badge-warning">Pendente</span>
                        ) : emp.statusAprovacao === 'Rejeitado' ? (
                          <span className="badge badge-danger">Rejeitada</span>
                        ) : emp.ativo ? (
                          <span className="badge badge-success">Ativa</span>
                        ) : (
                          <span className="badge badge-danger">Bloqueada</span>
                        )}
                      </td>

                      <td style={{ fontWeight: 700 }}>{emp.totalUsuarios || 0}</td>
                      <td style={{ fontWeight: 700 }}>{emp.totalClientes || 0}</td>
                      <td style={{ fontWeight: 700 }}>{emp.totalProdutos || 0}</td>
                      <td style={{ fontWeight: 800, color: '#071527' }}>{formatCurrency(emp.faturamentoTotal)}</td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => switchDemoEmpresa(emp.id)}
                            className="btn btn-outline btn-sm"
                            title="Acessar painel desta empresa"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', fontWeight: 700 }}
                          >
                            Acessar →
                          </button>

                          <button
                            onClick={() => handleToggleStatus(emp.id, emp.ativo)}
                            className="btn btn-icon btn-sm"
                            title={emp.ativo ? 'Bloquear Empresa' : 'Ativar Empresa'}
                            style={{ color: emp.ativo ? '#EF4444' : '#10B981' }}
                          >
                            <Lock size={14} />
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
      )}

      {/* ================= ABA 3: TODOS OS USUÁRIOS GLOBAIS ================= */}
      {activeTab === 'usuarios' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Base Geral de Usuários do Sistema</h2>
              <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Lista de todos os operadores cadastrados em todas as empresas</p>
            </div>

            <div style={{ position: 'relative', width: '260px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Buscar usuário, e-mail, empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2rem', height: '38px', fontSize: '0.85rem' }}
              />
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome do Usuário</th>
                  <th>E-mail</th>
                  <th>Empresa Vinculada</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th>Data de Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                      Nenhum usuário localizado.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: '#071527' }}>{u.nome}</div>
                      </td>
                      <td style={{ color: '#576F86', fontWeight: 600 }}>{u.email}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#071527' }}>{u.empresaNome}</div>
                        <span className="badge badge-accent" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>{u.empresaPlano}</span>
                      </td>
                      <td>
                        <span className={`badge ${u.tipo === 'Master' ? 'badge-dark' : u.tipo === 'Admin' ? 'badge-info' : 'badge-accent'}`}>
                          {u.tipo || 'Operador'}
                        </span>
                      </td>
                      <td>
                        {u.ativo ? (
                          <span className="badge badge-success">Ativo</span>
                        ) : (
                          <span className="badge badge-danger">Inativo</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748B' }}>{formatDate(u.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
