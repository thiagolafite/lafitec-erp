import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Lock, 
  Server, 
  Database, 
  ArrowRight,
  Sparkles,
  Building2,
  AlertOctagon,
  FileCheck
} from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';

export const LandingPage = ({ onGoToLogin, onSelectPlanRegister }) => {
  const { registerEmpresa } = useAuth();
  const [registroModal, setRegistroModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('Premium');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nomeEmpresa: '',
    cnpj: '',
    nomeAdmin: '',
    email: '',
    senha: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenRegister = (plan = 'Premium') => {
    setSelectedPlan(plan);
    setRegistroModal(true);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await registerEmpresa({ ...formData, plano: selectedPlan });
      setRegistroModal(false);
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao registrar empresa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#1E293B' }}>
      {/* Top Navbar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(10, 37, 64, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1rem 2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#00C896',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0A2540'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                Lafitec<span style={{ color: '#00C896' }}>ERP</span>
              </span>
            </div>
          </div>

          {/* Nav Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={onGoToLogin} 
              className="btn btn-outline"
              style={{ color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.3)' }}
            >
              Acessar Sistema
            </button>
            <button 
              onClick={() => handleOpenRegister('Free')} 
              className="btn btn-accent"
            >
              Começar Gratuitamente
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        backgroundColor: '#0A2540',
        color: '#FFFFFF',
        padding: '5rem 2rem 6rem 2rem',
        backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(0, 200, 150, 0.15) 0%, transparent 40%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '30px',
            backgroundColor: 'rgba(0, 200, 150, 0.12)',
            border: '1px solid rgba(0, 200, 150, 0.3)',
            color: '#00C896',
            fontSize: '0.875rem',
            fontWeight: 700,
            marginBottom: '1.5rem'
          }}>
            <Sparkles size={16} /> Gestão Inteligente com Segurança Real
          </div>

          <h1 style={{
            fontSize: '3rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem'
          }}>
            Simplifique a gestão da sua empresa com <span style={{ color: '#00C896' }}>segurança e controle total</span>
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: '#94A3B8',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            maxWidth: '750px',
            margin: '0 auto 2.5rem auto'
          }}>
            Controle vendas, clientes e finanças em um único sistema, de forma simples e segura.
            Multiempresa de alta performance projetado para pequenas e médias empresas.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => handleOpenRegister('Free')} 
              className="btn btn-accent btn-lg"
            >
              Começar Gratuitamente <ArrowRight size={20} />
            </button>
            <button 
              onClick={onGoToLogin} 
              className="btn btn-outline btn-lg"
              style={{ color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.3)' }}
            >
              Ver Demonstração ao Vivo
            </button>
          </div>

          {/* Hero Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginTop: '4rem',
            paddingTop: '2.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#00C896' }}>100%</div>
              <div style={{ fontSize: '0.875rem', color: '#94A3B8' }}>Isolamento de Dados Multi-tenant</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF' }}>03 Módulos</div>
              <div style={{ fontSize: '0.875rem', color: '#94A3B8' }}>Clientes, Vendas e Financeiro</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#00C896' }}>24/7</div>
              <div style={{ fontSize: '0.875rem', color: '#94A3B8' }}>Disponibilidade & Auditoria em Nuvem</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section style={{ padding: '5rem 2rem', backgroundColor: '#F8FAFC' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0A2540', marginBottom: '0.75rem' }}>
              Sua empresa sofre com estes desafios?
            </h2>
            <p style={{ color: '#64748B', fontSize: '1.1rem' }}>
              A falta de processos automatizados custa tempo, dinheiro e segurança para o seu negócio.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{
              background: '#FFFFFF',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EF4444',
                marginBottom: '1.25rem'
              }}>
                <AlertOctagon size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540', marginBottom: '0.5rem' }}>
                Falta de Organização
              </h3>
              <p style={{ color: '#64748B', lineHeight: 1.6 }}>
                Controle em planilhas soltas, dados duplicados e atraso no acompanhamento do fluxo de caixa e de clientes.
              </p>
            </div>

            <div style={{
              background: '#FFFFFF',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F59E0B',
                marginBottom: '1.25rem'
              }}>
                <Lock size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540', marginBottom: '0.5rem' }}>
                Perda de Dados
              </h3>
              <p style={{ color: '#64748B', lineHeight: 1.6 }}>
                Vazamentos de dados sensíveis ou perdas de arquivos sem cópias de segurança em nuvem adequadas.
              </p>
            </div>

            <div style={{
              background: '#FFFFFF',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3B82F6',
                marginBottom: '1.25rem'
              }}>
                <DollarSign size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540', marginBottom: '0.5rem' }}>
                Dificuldade no Controle Financeiro
              </h3>
              <p style={{ color: '#64748B', lineHeight: 1.6 }}>
                Contas a pagar e receber fora de controle, gerando prejuízos com juros e descumprimento de prazos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Overview Section */}
      <section style={{ padding: '5rem 2rem', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}>
            <div>
              <span className="badge badge-accent" style={{ marginBottom: '1rem' }}>
                A Solução Definitiva
              </span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0A2540', lineHeight: 1.2, marginBottom: '1.25rem' }}>
                O Lafitec ERP é tudo o que sua empresa precisa em um único lugar
              </h2>
              <p style={{ color: '#64748B', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Desenvolvido com foco total em usabilidade e segurança de dados, o Lafitec ERP integra todas as áreas essenciais do seu negócio em uma interface limpa e intuitiva.
              </p>
              
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', listStyle: 'none' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, color: '#0A2540' }}>
                  <CheckCircle2 size={20} style={{ color: '#00C896' }} />
                  Painel de Indicadores (Dashboard) em tempo real
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, color: '#0A2540' }}>
                  <CheckCircle2 size={20} style={{ color: '#00C896' }} />
                  Gestão completa de Clientes, Produtos e Estoque
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, color: '#0A2540' }}>
                  <CheckCircle2 size={20} style={{ color: '#00C896' }} />
                  Faturamento de Vendas (PDV) com baixa automática
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, color: '#0A2540' }}>
                  <CheckCircle2 size={20} style={{ color: '#00C896' }} />
                  Controle de Contas a Pagar e Receber
                </li>
              </ul>
            </div>

            {/* Visual Card Mockup */}
            <div style={{
              background: '#0A2540',
              padding: '2rem',
              borderRadius: '16px',
              boxShadow: '0 20px 40px -15px rgba(10, 37, 64, 0.4)',
              color: 'white',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  <ShieldCheck size={20} style={{ color: '#00C896' }} />
                  <span>Painel Lafitec ERP</span>
                </div>
                <span className="badge badge-success">Online</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Vendas do Mês</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00C896' }}>R$ 15.780,00</div>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Contas a Receber</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>R$ 4.250,00</div>
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#94A3B8' }}>
                  Últimas Atividades Auditadas
                </div>
                <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>✓ Venda #VEN-102 finalizada com sucesso</div>
                <div style={{ fontSize: '0.75rem', color: '#CBD5E1', marginTop: '4px' }}>✓ Baixa efetuada na conta #FIN-104</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Differential Section */}
      <section style={{
        padding: '5rem 2rem',
        backgroundColor: '#0A2540',
        color: '#FFFFFF'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ color: '#00C896', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.875rem' }}>
              Diferencial de Segurança
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.5rem' }}>
              Desenvolvido por especialista em Segurança da Informação
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '1.1rem', maxWidth: '700px', margin: '0.5rem auto 0 auto' }}>
              Seus dados protegidos contra acessos indevidos com arquitetura multi-tenant robusta.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '2rem',
              borderRadius: '12px'
            }}>
              <Lock size={32} style={{ color: '#00C896', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Controle de Acesso Rigoroso</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Separação estrita entre Administradores e Funcionários. Cada usuário acessa estritamente o necessário.
              </p>
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '2rem',
              borderRadius: '12px'
            }}>
              <Server size={32} style={{ color: '#00C896', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Isolamento Multi-Tenant</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Garantia matemática de que nenhuma empresa visualizará ou alterará dados de outras organizações.
              </p>
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '2rem',
              borderRadius: '12px'
            }}>
              <Database size={32} style={{ color: '#00C896', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Backup & Auditoria</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Registro contínuo de logs de segurança para rastreabilidade completa de ações e dados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '5rem 2rem', backgroundColor: '#F8FAFC' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0A2540', marginBottom: '0.5rem' }}>
              Planos transparentes para todas as etapas
            </h2>
            <p style={{ color: '#64748B', fontSize: '1.1rem' }}>
              Escolha o plano ideal para alavancar a gestão da sua empresa.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            alignItems: 'stretch'
          }}>
            {/* Free */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '2.5rem 2rem',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540' }}>Free</h3>
              <p style={{ color: '#64748B', fontSize: '0.875rem', margin: '0.25rem 0 1.5rem 0' }}>Para iniciantes e MEIs</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0A2540', marginBottom: '1.5rem' }}>
                R$ 0<span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 500 }}>/mês</span>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', flex: 1, listStyle: 'none' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>✓ Até 50 Clientes</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>✓ Até 20 Produtos</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>✓ Controle de Vendas</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>✓ Suporte por Comunidade</li>
              </ul>
              <button onClick={() => handleOpenRegister('Free')} className="btn btn-outline" style={{ width: '100%' }}>
                Começar Grátis
              </button>
            </div>

            {/* Pro */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '2.5rem 2rem',
              border: '2px solid #00C896',
              boxShadow: '0 10px 25px -5px rgba(0, 200, 150, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}>
              <span className="badge badge-accent" style={{ position: 'absolute', top: '-12px', right: '24px' }}>
                Mais Popular
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540' }}>Pro</h3>
              <p style={{ color: '#64748B', fontSize: '0.875rem', margin: '0.25rem 0 1.5rem 0' }}>Para pequenas empresas em crescimento</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0A2540', marginBottom: '1.5rem' }}>
                R$ 89<span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 500 }}>/mês</span>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', flex: 1, listStyle: 'none' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 600 }}>✓ Clientes Ilimitados</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 600 }}>✓ Produtos Ilimitados</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 600 }}>✓ Modulo Financeiro Avançado</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 600 }}>✓ Dashboards e Gráficos</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 600 }}>✓ Até 5 Usuários</li>
              </ul>
              <button onClick={() => handleOpenRegister('Pro')} className="btn btn-accent" style={{ width: '100%' }}>
                Testar Plano Pro
              </button>
            </div>

            {/* Premium */}
            <div style={{
              background: '#0A2540',
              color: '#FFFFFF',
              borderRadius: '16px',
              padding: '2.5rem 2rem',
              border: '1px solid #0A2540',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Premium</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: '0.25rem 0 1.5rem 0' }}>Para empresas que exigem máxima segurança</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.5rem' }}>
                R$ 179<span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: 500 }}>/mês</span>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', flex: 1, listStyle: 'none' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>✓ Tudo do Plano Pro</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>✓ Usuários Ilimitados</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>✓ Trilha de Auditoria Avançada</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>✓ Suporte Prioritário VIP 24/7</li>
              </ul>
              <button onClick={() => handleOpenRegister('Premium')} className="btn btn-accent" style={{ width: '100%' }}>
                Assinar Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section style={{
        backgroundColor: '#00C896',
        padding: '4rem 2rem',
        textAlign: 'center',
        color: '#0A2540'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem' }}>
            Pronto para transformar a gestão da sua empresa?
          </h2>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '2rem', opacity: 0.9 }}>
            Crie sua conta em menos de 1 minuto e comece a utilizar o sistema imediatamente.
          </p>
          <button 
            onClick={() => handleOpenRegister('Free')} 
            className="btn btn-primary btn-lg"
          >
            Criar minha conta grátis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#0A2540',
        color: '#94A3B8',
        padding: '3rem 2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '0.875rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>Lafitec<span style={{ color: '#00C896' }}>ERP</span></span>
            <p style={{ marginTop: '0.25rem' }}>Gestão inteligente com segurança real. © 2026 LafiteLimaTec.</p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#login" onClick={onGoToLogin} style={{ color: '#94A3B8', textDecoration: 'none' }}>Login</a>
            <a href="#registro" onClick={() => handleOpenRegister('Free')} style={{ color: '#00C896', textDecoration: 'none', fontWeight: 700 }}>Cadastrar Empresa</a>
          </div>
        </div>
      </footer>

      {/* Registration Modal */}
      {registroModal && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Criar Conta no Lafitec ERP ({selectedPlan})</h3>
              <button className="modal-close" onClick={() => setRegistroModal(false)} title="Fechar">✕</button>
            </div>
            <form onSubmit={handleRegisterSubmit}>
              <div className="modal-body">
                {errorMsg && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    {errorMsg}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Nome da Empresa</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    placeholder="Ex: Minha Empresa LTDA"
                    value={formData.nomeEmpresa}
                    onChange={e => setFormData({ ...formData, nomeEmpresa: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CNPJ ou CPF</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    placeholder="00.000.000/0001-00"
                    value={formData.cnpj}
                    onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Seu Nome (Administrador)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    placeholder="Nome completo"
                    value={formData.nomeAdmin}
                    onChange={e => setFormData({ ...formData, nomeAdmin: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">E-mail Corporativo</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    required 
                    placeholder="admin@suaempresa.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Senha de Acesso</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    required 
                    placeholder="Sua senha secreta"
                    value={formData.senha}
                    onChange={e => setFormData({ ...formData, senha: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setRegistroModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-accent" disabled={loading}>
                  {loading ? 'Criando Conta no Supabase...' : 'Criar Conta & Acessar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
