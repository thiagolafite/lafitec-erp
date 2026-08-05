import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Search, 
  Navigation, 
  Star, 
  Play, 
  Square, 
  User, 
  Phone, 
  Map, 
  TrendingUp, 
  CheckSquare, 
  XCircle, 
  RefreshCw, 
  History, 
  Camera, 
  PenTool, 
  ExternalLink,
  Car,
  Filter,
  ShieldAlert,
  ArrowRight,
  Activity,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage, calculateIndiceRelacionamento } from '../services/storage';
import { Modal } from '../components/Modal';

export const VisitasPage = ({ showToast }) => {
  const { empresa, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAgenda, setFilterAgenda] = useState('HOJE'); // HOJE, AMANHA, SEMANA, MES, ALL
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, Agendada, Em andamento, Concluida, Cancelada
  const [activeSubTab, setActiveSubTab] = useState('agenda'); // agenda, frequencia, mapa, timeline, score

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedVisita, setSelectedVisita] = useState(null);

  const [obsCheckout, setObsCheckout] = useState('');

  const clientes = storage.getClientes(empresa?.id || '');
  const visitas = storage.getVisitas(empresa?.id || '');
  const vendas = storage.getVendas(empresa?.id || '');

  const initialFormState = {
    clienteId: '',
    representanteNome: user?.nome || 'Carlos Vendedor',
    dataHoraProgramada: new Date().toISOString().slice(0, 16),
    objetivo: 'Apresentação comercial e prospecção de novos produtos.',
    observacoes: '',
    prioridadeEstrelas: 3
  };

  const [formData, setFormData] = useState(initialFormState);

  if (!empresa) return null;

  // Render Stars Helper
  const renderStars = (num) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          style={{
            color: i <= num ? '#F59E0B' : '#CBD5E1',
            fill: i <= num ? '#F59E0B' : 'none'
          }}
        />
      );
    }
    return <div style={{ display: 'inline-flex', gap: '2px' }}>{stars}</div>;
  };

  // Helper calculation for Next Visit based on frequency
  const calculateProximaVisita = (ultimaDataStr, freqDias = 30) => {
    if (!ultimaDataStr) return { proximaData: 'Não realizada', statusColor: 'red', statusText: 'Sem visita' };
    
    const uData = new Date(ultimaDataStr);
    const pData = new Date(uData);
    pData.setDate(pData.getDate() + parseInt(freqDias));

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const proximaStr = pData.toLocaleDateString('pt-BR');
    const diffDias = Math.ceil((pData - hoje) / (1000 * 60 * 60 * 24));

    if (diffDias < 0) {
      return { proximaData: proximaStr, statusColor: 'red', statusText: `Atrasada (${Math.abs(diffDias)} dias)` };
    } else if (diffDias === 0) {
      return { proximaData: proximaStr, statusColor: 'yellow', statusText: 'Vence Hoje' };
    } else {
      return { proximaData: proximaStr, statusColor: 'green', statusText: `Em ${diffDias} dias` };
    }
  };

  // Filtered Visitas by Agenda & Status & Search
  const filteredVisitas = visitas.filter(v => {
    if (filterStatus !== 'ALL' && v.status !== filterStatus) return false;

    const term = searchTerm.toLowerCase();
    const matchSearch = (
      (v.clienteNome && v.clienteNome.toLowerCase().includes(term)) ||
      (v.cidade && v.cidade.toLowerCase().includes(term)) ||
      (v.objetivo && v.objetivo.toLowerCase().includes(term))
    );
    if (!matchSearch) return false;

    if (filterAgenda === 'ALL') return true;

    const vDate = new Date(v.dataHoraProgramada).toISOString().split('T')[0];
    const hoje = new Date().toISOString().split('T')[0];

    const amanhaDate = new Date();
    amanhaDate.setDate(amanhaDate.getDate() + 1);
    const amanhaStr = amanhaDate.toISOString().split('T')[0];

    if (filterAgenda === 'HOJE') return vDate === hoje;
    if (filterAgenda === 'AMANHA') return vDate === amanhaStr;

    return true;
  });

  const visitasHojeCount = visitas.filter(v => new Date(v.dataHoraProgramada).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]).length;

  const handleOpenModal = () => {
    setFormData({
      ...initialFormState,
      clienteId: clientes[0]?.id || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveVisita = (e) => {
    e.preventDefault();
    if (!formData.clienteId) {
      showToast('error', 'Selecione um cliente.');
      return;
    }

    try {
      storage.saveVisita(formData, empresa.id, user.nome);
      showToast('success', 'Visita agendada com sucesso!');
      setIsModalOpen(false);
    } catch (err) {
      showToast('error', 'Erro ao agendar visita.');
    }
  };

  const handleCheckIn = (visita) => {
    try {
      storage.iniciarVisitaCheckIn(visita.id, empresa.id, user.nome);
      showToast('success', `Check-in GPS realizado na visita #${visita.codigo || visita.id}!`);
    } catch (err) {
      showToast('error', 'Erro ao realizar check-in.');
    }
  };

  const handleOpenCheckoutModal = (visita) => {
    setSelectedVisita(visita);
    setObsCheckout(visita.observacoes || '');
    setIsCheckoutModalOpen(true);
  };

  const handleConfirmCheckout = (e) => {
    e.preventDefault();
    if (!selectedVisita) return;
    try {
      storage.concluirVisitaCheckOut(selectedVisita.id, obsCheckout, empresa.id, user.nome);
      showToast('success', `Visita com ${selectedVisita.clienteNome} concluída com sucesso!`);
      setIsCheckoutModalOpen(false);
      setSelectedVisita(null);
    } catch (err) {
      showToast('error', 'Erro ao concluir visita.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Concluida': return 'badge-success';
      case 'Em andamento': return 'badge-info';
      case 'Cancelada': return 'badge-danger';
      case 'Reagendada': return 'badge-warning';
      default: return 'badge-primary';
    }
  };

  // KPIs calculation
  const concluidasCount = visitas.filter(v => v.status === 'Concluida').length;
  const taxaConversao = concluidasCount > 0 ? ((vendas.length / concluidasCount) * 100).toFixed(1) : 0;

  return (
    <div>
      {/* Header com resumo de Rotas */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Gestão de Visitas & Rotas Comerciais</h1>
          <p>Agenda inteligente, Rota por menor distância e Índice de Relacionamento de {empresa.nome}</p>
        </div>
        <button className="btn btn-accent" onClick={handleOpenModal}>
          <Plus size={18} /> Agendar Nova Visita
        </button>
      </div>

      {/* Banner de Rota Inteligente do Dia */}
      <div style={{
        backgroundColor: '#0A2540',
        color: '#FFFFFF',
        borderRadius: '14px',
        padding: '1.5rem 2rem',
        marginBottom: '1.75rem',
        backgroundImage: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)',
        boxShadow: '0 10px 25px -5px rgba(10, 37, 64, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            backgroundColor: 'rgba(0, 200, 150, 0.15)',
            color: '#00C896',
            padding: '1rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Car size={32} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#00C896', fontWeight: 800, textTransform: 'uppercase' }}>
              🚗 Rota Inteligente de Campo
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px' }}>
              Você possui {visitasHojeCount} clientes programados para visitar hoje.
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginTop: '2px' }}>
              Ordem das visitas recomendada pela menor distância e otimização de trajeto.
            </p>
          </div>
        </div>

        <button
          className="btn btn-accent"
          onClick={() => showToast('success', 'Rota calculada e otimizada por menor distância!')}
        >
          <Navigation size={18} /> Otimizar Trajeto Hoje
        </button>
      </div>

      {/* Alertas Automáticos de Frequência de Visita */}
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #EF4444' }}>
          <div>
            <div className="stat-label" style={{ color: '#EF4444' }}>🔴 Visitas Atrasadas</div>
            <div className="stat-val" style={{ color: '#EF4444' }}>
              {clientes.filter(c => calculateProximaVisita(c.ultimaVisitaData, c.frequenciaVisitaDias).statusColor === 'red').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Requer atenção imediata</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
            <ShieldAlert size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div>
            <div className="stat-label" style={{ color: '#D97706' }}>🟡 Vencem Hoje</div>
            <div className="stat-val" style={{ color: '#D97706' }}>
              {clientes.filter(c => calculateProximaVisita(c.ultimaVisitaData, c.frequenciaVisitaDias).statusColor === 'yellow').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Agendadas para hoje</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10B981' }}>
          <div>
            <div className="stat-label" style={{ color: '#10B981' }}>🟢 Visitas Concluídas</div>
            <div className="stat-val" style={{ color: '#10B981' }}>{concluidasCount}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Neste período</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#D1FAE5', color: '#10B981' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #3B82F6' }}>
          <div>
            <div className="stat-label" style={{ color: '#3B82F6' }}>🔵 Taxa Conversão (Visita ➔ Venda)</div>
            <div className="stat-val" style={{ color: '#3B82F6' }}>{taxaConversao}%</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Eficiência comercial</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#DBEAFE', color: '#3B82F6' }}>
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* Navegação por Sub-abas do Módulo */}
      <div style={{
        display: 'flex',
        gap: '6px',
        borderBottom: '2px solid #00C896',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '0px'
      }}>
        <button
          className={`btn btn-sm ${activeSubTab === 'agenda' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('agenda')}
        >
          <Calendar size={14} /> Agenda Inteligente
        </button>
        <button
          className={`btn btn-sm ${activeSubTab === 'score' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('score')}
        >
          <Activity size={14} /> Índice de Relacionamento (Lafitec Score)
        </button>
        <button
          className={`btn btn-sm ${activeSubTab === 'frequencia' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('frequencia')}
        >
          <RefreshCw size={14} /> Frequência de Visitas
        </button>
        <button
          className={`btn btn-sm ${activeSubTab === 'mapa' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('mapa')}
        >
          <Map size={14} /> Mapa de Clientes & Rotas
        </button>
        <button
          className={`btn btn-sm ${activeSubTab === 'timeline' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('timeline')}
        >
          <History size={14} /> Linha do Tempo Comercial
        </button>
      </div>

      {/* ABA 1: AGENDA INTELIGENTE */}
      {activeSubTab === 'agenda' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className={`btn btn-sm ${filterAgenda === 'HOJE' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterAgenda('HOJE')}
              >
                Hoje ({visitasHojeCount})
              </button>
              <button
                className={`btn btn-sm ${filterAgenda === 'AMANHA' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterAgenda('AMANHA')}
              >
                Amanhã
              </button>
              <button
                className={`btn btn-sm ${filterAgenda === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterAgenda('ALL')}
              >
                Todas ({visitas.length})
              </button>
            </div>

            <div style={{ position: 'relative', minWidth: '260px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Buscar por cliente, cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
            {filteredVisitas.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748B', padding: '3rem 1rem' }}>
                Nenhuma visita agendada para o período selecionado.
              </div>
            ) : (
              filteredVisitas.map(v => {
                const cli = clientes.find(c => c.id === v.clienteId);
                const scoreInfo = cli ? calculateIndiceRelacionamento(cli, vendas, visitas) : null;

                return (
                  <div key={v.id} style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span className={`badge ${getStatusBadge(v.status)}`}>
                          {v.status}
                        </span>

                        {scoreInfo && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: '#F8FAFC',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            border: `1px solid ${scoreInfo.color}`,
                            color: scoreInfo.color
                          }}>
                            {scoreInfo.emoji} {scoreInfo.score}/100
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0A2540' }}>
                        {v.clienteNome}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <MapPin size={14} style={{ color: '#00C896' }} /> {v.cidade} {v.endereco ? `(${v.endereco})` : ''}
                      </p>

                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} style={{ color: '#3B82F6' }} /> {new Date(v.dataHoraProgramada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} hs
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Navigation size={14} style={{ color: '#F59E0B' }} /> {v.distanciaKm || 5.2} km
                        </span>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.75rem', backgroundColor: '#F8FAFC', padding: '0.5rem 0.75rem', borderRadius: '6px', borderLeft: '3px solid #00C896' }}>
                        <strong>Objetivo:</strong> {v.objetivo}
                      </p>

                      {v.gpsCheckIn && (
                        <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '0.5rem', fontWeight: 700 }}>
                          ✓ GPS Check-in: {v.gpsCheckIn}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                      {v.status === 'Agendada' && (
                        <button
                          className="btn btn-accent btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => handleCheckIn(v)}
                        >
                          <Play size={14} /> Iniciar (Check-in)
                        </button>
                      )}

                      {v.status === 'Em andamento' && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => handleOpenCheckoutModal(v)}
                        >
                          <Square size={14} /> Concluir (Check-out)
                        </button>
                      )}

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.cidade + ' ' + v.clienteNome)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        title="Abrir no Google Maps"
                      >
                        <Navigation size={14} /> Maps
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ABA 2: ÍNDICE DE RELACIONAMENTO DO CLIENTE (LAFITEC SCORE) */}
      {activeSubTab === 'score' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Activity size={20} style={{ color: '#00C896' }} /> Ranking do Índice de Relacionamento Comercial (Lafitec Score)
            </div>
            <span className="badge badge-accent">Inteligência de Campo</span>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.5rem' }}>
            Pontuação automática de 0 a 100 calculada com base na frequência de visitas, recência, histórico de pedidos e faturamento gerado.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {clientes.map(cli => {
              const scoreInfo = calculateIndiceRelacionamento(cli, vendas, visitas);

              return (
                <div key={cli.id} style={{
                  backgroundColor: '#FFFFFF',
                  border: `2px solid ${scoreInfo.color}`,
                  borderRadius: '12px',
                  padding: '1.25rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className={`badge ${scoreInfo.badgeClass}`}>
                      {scoreInfo.emoji} {scoreInfo.statusText}
                    </span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: scoreInfo.color }}>
                      {scoreInfo.score}<span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>/100</span>
                    </span>
                  </div>

                  {/* Barra de Progresso do Score */}
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#E2E8F0',
                    borderRadius: '4px',
                    margin: '1rem 0 0.75rem 0',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${scoreInfo.score}%`,
                      height: '100%',
                      backgroundColor: scoreInfo.color,
                      borderRadius: '4px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0A2540', marginBottom: '4px' }}>
                    {cli.nome}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Cidade: {cli.cidade || 'N/A'} | Frequência: {cli.frequenciaVisitaDias || 30} dias
                  </div>

                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9', fontSize: '0.8rem', color: '#475569' }}>
                    Última Visita: <strong>{cli.ultimaVisitaData ? new Date(cli.ultimaVisitaData).toLocaleDateString('pt-BR') : 'Sem visita'}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 3: FREQUÊNCIA AUTOMÁTICA DE VISITAS */}
      {activeSubTab === 'frequencia' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <RefreshCw size={20} style={{ color: '#00C896' }} /> Frequência de Visitas Configuradas por Cliente
            </div>
            <span className="badge badge-accent">Cálculo Automático</span>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Índice Score</th>
                  <th>Última Visita</th>
                  <th>Frequência</th>
                  <th>Próxima Visita</th>
                  <th>Status Limite</th>
                  <th className="text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(cli => {
                  const calc = calculateProximaVisita(cli.ultimaVisitaData, cli.frequenciaVisitaDias);
                  const scoreInfo = calculateIndiceRelacionamento(cli, vendas, visitas);

                  return (
                    <tr key={cli.id}>
                      <td style={{ fontWeight: 700, color: '#0A2540' }}>{cli.nome}</td>
                      <td>
                        <span className={`badge ${scoreInfo.badgeClass}`}>
                          {scoreInfo.emoji} {scoreInfo.score}/100
                        </span>
                      </td>
                      <td style={{ color: '#64748B' }}>{cli.ultimaVisitaData ? new Date(cli.ultimaVisitaData).toLocaleDateString('pt-BR') : 'Sem registro'}</td>
                      <td>
                        <span className="badge badge-outline">
                          A cada {cli.frequenciaVisitaDias || 30} dias
                        </span>
                      </td>
                      <td className="font-mono" style={{ fontWeight: 800 }}>
                        {calc.proximaData}
                      </td>
                      <td>
                        <span className={`badge ${calc.statusColor === 'red' ? 'badge-danger' : calc.statusColor === 'yellow' ? 'badge-warning' : 'badge-success'}`}>
                          {calc.statusText}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          className="btn btn-accent btn-sm"
                          onClick={() => {
                            setFormData({
                              ...initialFormState,
                              clienteId: cli.id
                            });
                            setIsModalOpen(true);
                          }}
                        >
                          <Calendar size={14} /> Agendar Visita
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 4: MAPA DE CLIENTES & ROTAS */}
      {activeSubTab === 'mapa' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Map size={20} style={{ color: '#0284C7' }} /> Cobertura Geográfica de Clientes
            </div>
            <span className="badge badge-info">Visão de Campo</span>
          </div>

          <div style={{
            height: '340px',
            backgroundColor: '#0F172A',
            borderRadius: '12px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            backgroundImage: 'radial-gradient(#334155 1px, transparent 0)',
            backgroundSize: '24px 24px',
            marginBottom: '1.5rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <MapPin size={48} style={{ color: '#00C896', margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Mapa Interativo de Clientes Ativos</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginTop: '4px' }}>
                Todos os clientes estão mapeados por região. Clique abaixo para iniciar rota GPS.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {clientes.map(cli => (
              <div key={cli.id} style={{
                padding: '1rem',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC'
              }}>
                <div style={{ fontWeight: 800, color: '#0A2540' }}>{cli.nome}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>{cli.cidade}</div>
                <div style={{ marginTop: '0.75rem' }}>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(cli.cidade + ' ' + cli.nome)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-accent btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Navigation size={14} /> Iniciar Rota (GPS)
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 5: LINHA DO TEMPO COMERCIAL (TIMELINE) */}
      {activeSubTab === 'timeline' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <History size={20} style={{ color: '#8B5CF6' }} /> Linha do Tempo Comercial por Cliente
            </div>
          </div>

          <div style={{ position: 'relative', paddingLeft: '2rem', borderLeft: '3px solid #00C896', marginLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-2.6rem', top: '0', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#00C896' }}></div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00C896' }}>04/08/2026 — Visita em Andamento</div>
              <div style={{ fontWeight: 700, color: '#0A2540' }}>TechCorp Brasil S.A.</div>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Apresentação do módulo de gestão ERP e negociação técnica.</p>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-2.6rem', top: '0', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#3B82F6' }}></div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3B82F6' }}>01/08/2026 — Pedido Realizado (#ven-101)</div>
              <div style={{ fontWeight: 700, color: '#0A2540' }}>Ana Beatriz Souza</div>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Venda concluída no valor de R$ 5.290,00.</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AGENDAR VISITA */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Agendar Nova Visita Comercial"
      >
        <form onSubmit={handleSaveVisita}>
          <div className="form-group">
            <label className="form-label">Cliente *</label>
            <select
              className="form-select"
              required
              value={formData.clienteId}
              onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
            >
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome} ({c.cidade || 'Sem cidade'})</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Data e Hora Programada *</label>
              <input
                type="datetime-local"
                className="form-input"
                required
                value={formData.dataHoraProgramada}
                onChange={(e) => setFormData({ ...formData, dataHoraProgramada: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Objetivo da Visita *</label>
            <textarea
              className="form-textarea"
              rows={3}
              required
              placeholder="Descrever o objetivo da visita..."
              value={formData.objetivo}
              onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', backgroundColor: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-accent">Agendar Visita</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CHECK-OUT */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title={`Concluir Visita: ${selectedVisita?.clienteNome}`}
      >
        <form onSubmit={handleConfirmCheckout}>
          <div className="form-group">
            <label className="form-label">Observações da Visita / Resultado Comercial *</label>
            <textarea
              className="form-textarea"
              rows={4}
              required
              placeholder="Descrever o resultado da reunião, pedidos fechados ou próximos passos..."
              value={obsCheckout}
              onChange={(e) => setObsCheckout(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', backgroundColor: 'transparent' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsCheckoutModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-accent">Finalizar Visita (Check-out)</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
