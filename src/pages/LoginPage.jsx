import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, Building, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = ({ onGoToLanding }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      login(email, senha);
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao efetuar login.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoSenha) => {
    setEmail(demoEmail);
    setSenha(demoSenha);
    setErrorMsg('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F5F7FA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative'
    }}>
      {/* Decorative Background Accents */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '320px',
        backgroundColor: '#0A2540',
        zIndex: 0
      }} />

      <div style={{
        width: '100%',
        maxWidth: '440px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', color: '#FFFFFF' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            backgroundColor: '#00C896',
            color: '#0A2540',
            marginBottom: '0.75rem',
            boxShadow: '0 8px 20px rgba(0, 200, 150, 0.3)'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
            Lafitec<span style={{ color: '#00C896' }}>ERP</span>
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.925rem', fontWeight: 600, marginTop: '0.25rem' }}>
            "Gestão inteligente com segurança real"
          </p>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: '2.25rem', borderRadius: '16px', boxShadow: '0 20px 30px -10px rgba(10, 37, 64, 0.15)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0A2540' }}>Acesse sua Conta</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Digite suas credenciais corporativas abaixo</p>
          </div>

          {errorMsg && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#FEF2F2',
              borderLeft: '4px solid #EF4444',
              color: '#DC2626',
              borderRadius: '6px',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              fontWeight: 600
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">E-mail Corporativo</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  required
                  placeholder="exemplo@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  required
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar no Sistema'} <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick Demo Fill Buttons for Testing Multi-Tenant */}
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              <Sparkles size={14} style={{ color: '#00C896' }} /> Testar Demonstração (Clique para Preencher):
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fillDemo('admin@lafite.com', '123')}
                style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '0.8rem' }}
              >
                <Building size={14} style={{ color: '#00C896' }} />
                <span>Empresa 1: <strong>Lafite Tech</strong> (admin@lafite.com)</span>
              </button>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fillDemo('mariana@mercadolima.com', '123')}
                style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '0.8rem' }}
              >
                <Building size={14} style={{ color: '#3B82F6' }} />
                <span>Empresa 2: <strong>Mercado Lima</strong> (mariana@mercadolima.com)</span>
              </button>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              onClick={onGoToLanding}
              style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              ← Voltar para a Landing Page
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94A3B8', fontSize: '0.8rem' }}>
          Lafitec ERP © 2026 - Desenvolvido com foco em segurança da informação
        </div>
      </div>
    </div>
  );
};
