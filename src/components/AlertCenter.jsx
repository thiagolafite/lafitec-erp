import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Bell,
  Package,
  Users,
  DollarSign,
  FileText,
  MapPin,
  AlertTriangle,
  XCircle,
  Info,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  CheckCheck,
  X
} from 'lucide-react';
import { storage, calculateIndiceRelacionamento } from '../services/storage';

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(val) || 0);

export const AlertCenter = ({ empresaId, currentTabTitle, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterCat, setFilterCat] = useState('todos'); // todos, estoque, clientes, financeiro, comercial
  const [refreshTick, setRefreshTick] = useState(0);
  const [dismissedIds, setDismissedIds] = useState(() => {
    if (!empresaId) return [];
    try {
      return JSON.parse(localStorage.getItem(`lafitec_alertas_lidos_${empresaId}`) || '[]');
    } catch {
      return [];
    }
  });
  const containerRef = useRef(null);

  useEffect(() => {
    if (!empresaId) {
      setDismissedIds([]);
      return;
    }
    try {
      setDismissedIds(JSON.parse(localStorage.getItem(`lafitec_alertas_lidos_${empresaId}`) || '[]'));
    } catch {
      setDismissedIds([]);
    }
  }, [empresaId]);

  const persistDismissed = (ids) => {
    setDismissedIds(ids);
    if (empresaId) {
      localStorage.setItem(`lafitec_alertas_lidos_${empresaId}`, JSON.stringify(ids));
    }
  };

  const markAsRead = (alertId) => {
    if (dismissedIds.includes(alertId)) return;
    persistDismissed([...dismissedIds, alertId]);
  };

  const markAllAsRead = (currentAlerts) => {
    const merged = Array.from(new Set([...dismissedIds, ...currentAlerts.map(a => a.id)]));
    persistDismissed(merged);
  };

  const restoreDismissed = () => {
    persistDismissed([]);
  };

  // Atualiza alertas ao trocar de aba ou abrir o sino
  useEffect(() => {
    setRefreshTick(t => t + 1);
  }, [currentTabTitle, isOpen]);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const alerts = useMemo(() => {
    if (!empresaId) return [];

    const list = [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const daqui3Dias = new Date(hoje);
    daqui3Dias.setDate(daqui3Dias.getDate() + 3);
    const ha5Dias = new Date(hoje);
    ha5Dias.setDate(ha5Dias.getDate() - 5);

    const produtos = storage.getProdutos(empresaId) || [];
    const clientes = storage.getClientes(empresaId) || [];
    const vendas = storage.getVendas(empresaId) || [];
    const visitas = storage.getVisitas(empresaId) || [];
    const financeiro = storage.getFinanceiro(empresaId) || [];
    const orcamentos = storage.getOrcamentos(empresaId) || [];

    // 1. ALERTAS DE ESTOQUE MÍNIMO / ZERADO
    produtos.forEach(prod => {
      const est = parseFloat(prod.estoque) || 0;
      const min = parseFloat(prod.estoqueMinimo) || 0;
      if (est <= 0) {
        list.push({
          id: `est-zero-${prod.id}`,
          categoria: 'estoque',
          severidade: 'critico',
          titulo: `Estoque zerado: ${prod.nome}`,
          descricao: `Código ${prod.codigo || '-'} • Saldo atual: 0 (Mínimo: ${min})`,
          tab: 'produtos',
          icon: Package
        });
      } else if (min > 0 && est <= min) {
        list.push({
          id: `est-min-${prod.id}`,
          categoria: 'estoque',
          severidade: 'atencao',
          titulo: `Estoque mínimo atingido: ${prod.nome}`,
          descricao: `Saldo atual: ${est} • Mínimo configurado: ${min}`,
          tab: 'produtos',
          icon: Package
        });
      }
    });

    // 2. ALERTAS DE CLIENTES QUE PRECISAM DE ATENÇÃO
    clientes.forEach(cli => {
      const indice = calculateIndiceRelacionamento(cli, vendas, visitas);
      if (indice.score < 50) {
        list.push({
          id: `cli-risco-${cli.id}`,
          categoria: 'clientes',
          severidade: 'critico',
          titulo: `Cliente em alto risco de perda: ${cli.nome}`,
          descricao: `Índice de Relacionamento: ${indice.score}/100 • Requer contato/visita urgente`,
          tab: 'clientes',
          icon: Users
        });
      } else if (indice.score < 70) {
        list.push({
          id: `cli-atencao-${cli.id}`,
          categoria: 'clientes',
          severidade: 'atencao',
          titulo: `Cliente precisa de atenção: ${cli.nome}`,
          descricao: `Índice de Relacionamento: ${indice.score}/100 • Agende um acompanhamento`,
          tab: 'clientes',
          icon: Users
        });
      }
    });

    // 3. ALERTAS FINANCEIROS (CONTAS VENCIDAS / VENCENDO)
    financeiro.forEach(fin => {
      if ((fin.status || '').toLowerCase() !== 'pendente' || !fin.dataVencimento) return;
      const venc = new Date(fin.dataVencimento + 'T00:00:00');
      if (isNaN(venc.getTime())) return;

      if (venc < hoje) {
        list.push({
          id: `fin-venc-${fin.id}`,
          categoria: 'financeiro',
          severidade: 'critico',
          titulo: `Conta ${fin.tipo === 'Pagar' ? 'a pagar' : 'a receber'} vencida`,
          descricao: `${fin.descricao} • ${formatCurrency(fin.valor)} (Venceu em ${venc.toLocaleDateString('pt-BR')})`,
          tab: 'financeiro',
          icon: DollarSign
        });
      } else if (venc <= daqui3Dias) {
        list.push({
          id: `fin-prox-${fin.id}`,
          categoria: 'financeiro',
          severidade: 'atencao',
          titulo: `Conta vence em breve (${venc.toLocaleDateString('pt-BR')})`,
          descricao: `${fin.descricao} • ${formatCurrency(fin.valor)}`,
          tab: 'financeiro',
          icon: DollarSign
        });
      }
    });

    // 4. ALERTAS DE ORÇAMENTOS (VENCIDOS OU PARADOS)
    orcamentos.forEach(orc => {
      const st = (orc.status || '').toLowerCase();
      if (st === 'aprovado' || st === 'rejeitado' || st === 'faturado' || st === 'cancelado') return;

      if (orc.dataValidade) {
        const val = new Date(orc.dataValidade + 'T00:00:00');
        if (!isNaN(val.getTime()) && val < hoje) {
          list.push({
            id: `orc-venc-${orc.id}`,
            categoria: 'comercial',
            severidade: 'atencao',
            titulo: `Orçamento vencido: ${orc.numero || '-'}`,
            descricao: `Cliente: ${orc.clienteNome || '-'} • Validade expirou em ${val.toLocaleDateString('pt-BR')}`,
            tab: 'orcamentos',
            icon: FileText
          });
          return;
        }
      }

      if (st === 'enviado' && orc.dataEmissao) {
        const em = new Date(orc.dataEmissao + 'T00:00:00');
        if (!isNaN(em.getTime()) && em <= ha5Dias) {
          list.push({
            id: `orc-ret-${orc.id}`,
            categoria: 'comercial',
            severidade: 'info',
            titulo: `Orçamento aguardando retorno: ${orc.numero || '-'}`,
            descricao: `Cliente: ${orc.clienteNome || '-'} • ${formatCurrency(orc.total)}`,
            tab: 'orcamentos',
            icon: FileText
          });
        }
      }
    });

    // 5. ALERTAS DE VISITAS (HOJE OU ATRASADAS)
    visitas.forEach(vis => {
      if ((vis.status || '').toLowerCase() !== 'agendada' || !vis.dataHoraProgramada) return;
      const dt = new Date(vis.dataHoraProgramada);
      if (isNaN(dt.getTime())) return;
      const dtDia = new Date(dt);
      dtDia.setHours(0, 0, 0, 0);

      if (dtDia.getTime() === hoje.getTime()) {
        list.push({
          id: `vis-hoje-${vis.id}`,
          categoria: 'comercial',
          severidade: 'info',
          titulo: `Visita agendada para hoje: ${vis.clienteNome || 'Cliente'}`,
          descricao: `Horário: ${dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • ${vis.motivoVisita || 'Comercial'}`,
          tab: 'visitas',
          icon: MapPin
        });
      } else if (dtDia < hoje) {
        list.push({
          id: `vis-atr-${vis.id}`,
          categoria: 'comercial',
          severidade: 'atencao',
          titulo: `Visita atrasada sem check-in: ${vis.clienteNome || 'Cliente'}`,
          descricao: `Programada para ${dt.toLocaleDateString('pt-BR')}`,
          tab: 'visitas',
          icon: MapPin
        });
      }
    });

    const ordemSev = { critico: 0, atencao: 1, info: 2 };
    return list.sort((a, b) => ordemSev[a.severidade] - ordemSev[b.severidade]);
  }, [empresaId, refreshTick]);

  const activeAlerts = useMemo(
    () => alerts.filter(a => !dismissedIds.includes(a.id)),
    [alerts, dismissedIds]
  );
  const dismissedActiveCount = alerts.length - activeAlerts.length;
  const criticalCount = activeAlerts.filter(a => a.severidade === 'critico').length;
  const filteredAlerts = filterCat === 'todos' ? activeAlerts : activeAlerts.filter(a => a.categoria === filterCat);

  const getSeverityStyle = (sev) => {
    if (sev === 'critico') {
      return {
        bg: '#FEF2F2',
        border: '#EF4444',
        iconColor: '#DC2626',
        BadgeIcon: XCircle
      };
    }
    if (sev === 'atencao') {
      return {
        bg: '#FFFBEB',
        border: '#F59E0B',
        iconColor: '#D97706',
        BadgeIcon: AlertTriangle
      };
    }
    return {
      bg: '#EFF6FF',
      border: '#3B82F6',
      iconColor: '#2563EB',
      BadgeIcon: Info
    };
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Central de Avisos e Alertas do Sistema"
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '38px',
          height: '38px',
          borderRadius: '6px',
          border: '1px solid #E0E0E0',
          backgroundColor: isOpen ? '#1A1A1A' : '#FFFFFF',
          color: isOpen ? '#C9A962' : '#1A1A1A',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <Bell size={18} />
        {activeAlerts.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              minWidth: '19px',
              height: '19px',
              padding: '0 5px',
              borderRadius: '999px',
              backgroundColor: criticalCount > 0 ? '#DC2626' : '#C9A962',
              color: criticalCount > 0 ? '#FFFFFF' : '#1A1A1A',
              fontSize: '0.68rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #FFFFFF',
              boxShadow: '0 2px 6px rgba(0,0,0,0.18)'
            }}
          >
            {activeAlerts.length > 99 ? '99+' : activeAlerts.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '48px',
            right: 0,
            width: '420px',
            maxWidth: '92vw',
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.22)',
            zIndex: 999,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: '#1A1A1A',
              color: '#FFFFFF',
              padding: '0.9rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid #C9A962'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={16} style={{ color: '#C9A962' }} />
              <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Central de Avisos</span>
              <span
                style={{
                  backgroundColor: 'rgba(201, 169, 98, 0.2)',
                  color: '#C9A962',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px'
                }}
              >
                {activeAlerts.length} {activeAlerts.length === 1 ? 'aviso' : 'avisos'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {activeAlerts.length > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead(activeAlerts)}
                  title="Marcar todas como lidas"
                  style={{
                    background: 'rgba(201, 169, 98, 0.14)',
                    border: '1px solid rgba(201, 169, 98, 0.35)',
                    borderRadius: '5px',
                    color: '#C9A962',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 7px',
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}
                >
                  <CheckCheck size={13} /> Limpar
                </button>
              )}
              <button
                type="button"
                onClick={() => setRefreshTick(t => t + 1)}
                title="Atualizar avisos"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#CBD5E1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Filtros de Categoria */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              padding: '0.6rem 0.75rem',
              backgroundColor: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              overflowX: 'auto'
            }}
          >
            {[
              { id: 'todos', label: `Todos (${activeAlerts.length})` },
              { id: 'estoque', label: `Estoque (${activeAlerts.filter(a => a.categoria === 'estoque').length})` },
              { id: 'clientes', label: `Clientes (${activeAlerts.filter(a => a.categoria === 'clientes').length})` },
              { id: 'financeiro', label: `Financeiro (${activeAlerts.filter(a => a.categoria === 'financeiro').length})` },
              { id: 'comercial', label: `Comercial (${activeAlerts.filter(a => a.categoria === 'comercial').length})` }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterCat(tab.id)}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: filterCat === tab.id ? '#1A1A1A' : '#E2E8F0',
                  backgroundColor: filterCat === tab.id ? '#1A1A1A' : '#FFFFFF',
                  color: filterCat === tab.id ? '#C9A962' : '#475569',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Lista de Avisos */}
          <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '0.6rem' }}>
            {filteredAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748B' }}>
                <CheckCircle2 size={32} style={{ color: '#10B981', margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem' }}>Tudo em dia!</div>
                <div style={{ fontSize: '0.8rem' }}>Nenhum alerta pendente nesta categoria.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredAlerts.map(alert => {
                  const sev = getSeverityStyle(alert.severidade);
                  const CatIcon = alert.icon;
                  return (
                    <div
                      key={alert.id}
                      onClick={() => {
                        markAsRead(alert.id);
                        if (onNavigate) onNavigate(alert.tab);
                        setIsOpen(false);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          markAsRead(alert.id);
                          if (onNavigate) onNavigate(alert.tab);
                          setIsOpen(false);
                        }
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '0.7rem 0.75rem',
                        backgroundColor: sev.bg,
                        border: '1px solid #E2E8F0',
                        borderLeft: `4px solid ${sev.border}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'transform 0.12s ease'
                      }}
                    >
                      <div style={{ marginTop: '2px', color: sev.iconColor, flexShrink: 0 }}>
                        <CatIcon size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1A1A1A', lineHeight: 1.3 }}>
                          {alert.titulo}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px', lineHeight: 1.35 }}>
                          {alert.descricao}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, alignSelf: 'center' }}>
                        <button
                          type="button"
                          title="Dispensar aviso"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(alert.id);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '4px'
                          }}
                        >
                          <X size={14} />
                        </button>
                        <ChevronRight size={15} style={{ color: '#94A3B8' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {dismissedActiveCount > 0 && (
            <div
              style={{
                padding: '0.55rem 0.85rem',
                backgroundColor: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.74rem',
                color: '#64748B'
              }}
            >
              <span>{dismissedActiveCount} {dismissedActiveCount === 1 ? 'aviso já lido' : 'avisos já lidos'}</span>
              <button
                type="button"
                onClick={restoreDismissed}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#B45309',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.74rem',
                  textDecoration: 'underline'
                }}
              >
                Reexibir todos
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
