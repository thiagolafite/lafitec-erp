import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Building2, 
  User, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  MapPin,
  RefreshCw,
  ArrowLeft,
  Zap,
  Check,
  Building,
  KeyRound,
  Clock,
  Send,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { 
  formatPhone, 
  formatCEP, 
  fetchAddressByCEP 
} from '../services/validationUtils';

export const LoginPage = ({ onGoToLanding }) => {
  const { 
    login, 
    registerEmpresaWithCompany 
  } = useAuth();

  // Wizard Steps: 'login' | 'register_user' | 'company_setup' | 'pending_approval_notice'
  const [step, setStep] = useState('login');

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  // Step 1: User Registration
  const [userNome, setUserNome] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userSenha, setUserSenha] = useState('');

  // Step 2: Company Setup (Mandatory CNPJ, Address, Phone, CEP)
  const [companyCNPJ, setCompanyCNPJ] = useState('');
  const [companyRazaoSocial, setCompanyRazaoSocial] = useState('');
  const [sameEmailAsUser, setSameEmailAsUser] = useState(true);
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyCelular, setCompanyCelular] = useState('');
  const [companyCEP, setCompanyCEP] = useState('');
  const [companyEndereco, setCompanyEndereco] = useState('');
  const [companyNumero, setCompanyNumero] = useState('');
  const [companyComplemento, setCompanyComplemento] = useState('');
  const [companyBairro, setCompanyBairro] = useState('');
  const [companyCidade, setCompanyCidade] = useState('');
  const [companyEstado, setCompanyEstado] = useState('');
  const [companyPlano, setCompanyPlano] = useState('Premium');

  // Loading & Feedback States
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const numeroInputRef = useRef(null);

  // 1. SUBMIT LOGIN
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login(loginEmail, loginSenha);
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao efetuar login.');
    } finally {
      setLoading(false);
    }
  };

  // 2. SUBMIT STEP 1: USER REGISTRATION (Advances straight to Company Setup)
  const handleRegisterUserSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!userNome.trim()) {
      setErrorMsg('Informe seu nome completo.');
      return;
    }
    if (!userEmail.trim() || !userEmail.includes('@')) {
      setErrorMsg('Informe um e-mail válido.');
      return;
    }
    if (!userSenha || userSenha.length < 3) {
      setErrorMsg('A senha deve ter pelo menos 3 caracteres.');
      return;
    }

    setStep('company_setup');
  };

  // 3. INSTANT AUTO-LOOKUP POR CEP (Dispara ao digitar 8 dígitos ou onBlur)
  const performCEPLookup = async (rawCEP) => {
    const clean = (rawCEP || '').replace(/\D/g, '');
    if (clean.length === 8) {
      setCepLoading(true);
      setErrorMsg('');
      try {
        const addr = await fetchAddressByCEP(clean);
        setCompanyEndereco(addr.endereco || '');
        setCompanyBairro(addr.bairro || '');
        setCompanyCidade(addr.cidade || '');
        setCompanyEstado(addr.estado || '');
        if (addr.complemento && !companyComplemento) {
          setCompanyComplemento(addr.complemento);
        }
        // Foca automaticamente no campo de número após encontrar o endereço
        setTimeout(() => {
          if (numeroInputRef.current) {
            numeroInputRef.current.focus();
          }
        }, 150);
      } catch (err) {
        setErrorMsg('CEP não encontrado. Preencha o endereço manualmente.');
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleCEPChange = (e) => {
    const raw = e.target.value;
    const formatted = formatCEP(raw);
    setCompanyCEP(formatted);
    const clean = raw.replace(/\D/g, '');
    if (clean.length === 8) {
      performCEPLookup(clean);
    }
  };

  const handleCEPBlur = () => {
    const clean = companyCEP.replace(/\D/g, '');
    if (clean.length === 8 && !companyEndereco) {
      performCEPLookup(clean);
    }
  };

  // 4. SUBMIT STEP 2: COMPANY SETUP & SEND FOR MASTER APPROVAL
  const handleCompanySetupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!companyCNPJ.trim()) {
      setErrorMsg('O CNPJ da empresa é obrigatório.');
      return;
    }

    if (!companyRazaoSocial.trim()) {
      setErrorMsg('A Razão Social / Nome da empresa é obrigatório.');
      return;
    }

    if (!companyCelular.trim()) {
      setErrorMsg('Informe o Celular / WhatsApp da empresa.');
      return;
    }

    if (!companyCEP.trim()) {
      setErrorMsg('Informe o CEP da empresa.');
      return;
    }

    setLoading(true);

    try {
      const emailFinalEmpresa = sameEmailAsUser ? userEmail : (companyEmail.trim() || userEmail);

      const res = await registerEmpresaWithCompany(
        {
          nome: userNome.trim(),
          email: userEmail.trim().toLowerCase(),
          senha: userSenha
        },
        {
          razaoSocial: companyRazaoSocial.trim(),
          cnpj: companyCNPJ.trim(),
          emailEmpresa: emailFinalEmpresa,
          celular: companyCelular.trim(),
          cep: companyCEP.trim(),
          endereco: companyEndereco.trim(),
          numero: companyNumero.trim(),
          complemento: companyComplemento.trim(),
          bairro: companyBairro.trim(),
          cidade: companyCidade.trim(),
          estado: companyEstado.trim(),
          plano: companyPlano
        }
      );

      if (res?.pendingApproval) {
        setStep('pending_approval_notice');
      } else {
        setSuccessMsg('Cadastro concluído com sucesso! Redirecionando...');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao registrar empresa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#071527',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      position: 'relative',
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 245, 160, 0.15), rgba(255, 255, 255, 0))'
    }}>
      {/* Background Decorator */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #00F5A0 0%, #38BDF8 50%, #6366F1 100%)'
      }}></div>

      <div style={{ width: '100%', maxWidth: step === 'company_setup' ? '680px' : '460px', transition: 'all 0.3s ease' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #00F5A0 0%, #00C896 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#032318',
            fontWeight: 900,
            marginBottom: '0.875rem',
            boxShadow: '0 0 24px rgba(0, 245, 160, 0.45)'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.85rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Lafitec<span style={{ color: '#00F5A0' }}>ERP</span>
          </h1>
          <p style={{ color: '#8FA2B6', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Gestão Inteligente & Segurança Corporativa Multi-tenant
          </p>
        </div>

        {/* Main Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          padding: '2rem 2.25rem',
          boxShadow: '0 25px 50px -12px rgba(4, 12, 24, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>

          {/* Tab Switcher (Only visible for Login / Register User) */}
          {(step === 'login' || step === 'register_user') && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              backgroundColor: '#F1F5F9',
              borderRadius: '10px',
              padding: '4px',
              marginBottom: '1.75rem'
            }}>
              <button
                type="button"
                onClick={() => { setStep('login'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: step === 'login' ? '#FFFFFF' : 'transparent',
                  color: step === 'login' ? '#071527' : '#64748B',
                  boxShadow: step === 'login' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none'
                }}
              >
                Acessar Conta
              </button>
              <button
                type="button"
                onClick={() => { setStep('register_user'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: step === 'register_user' ? '#FFFFFF' : 'transparent',
                  color: step === 'register_user' ? '#071527' : '#64748B',
                  boxShadow: step === 'register_user' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none'
                }}
              >
                Criar Nova Conta
              </button>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMsg && (
            <div style={{
              padding: '0.9rem 1.1rem',
              backgroundColor: '#FEF2F2',
              borderLeft: '4px solid #EF4444',
              color: '#DC2626',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              lineHeight: 1.4
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              padding: '0.9rem 1.1rem',
              backgroundColor: '#ECFDF5',
              borderLeft: '4px solid #10B981',
              color: '#059669',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              lineHeight: 1.4
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= 1. TAB LOGIN ================= */}
          {step === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 800, color: '#071527' }}>Acesse sua Conta</h2>
                <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Entre com seu e-mail e senha cadastrados</p>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">E-mail Corporativo</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    required
                    placeholder="seu.email@empresa.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    autoComplete="username"
                  />
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Senha de Acesso</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-input"
                    required
                    placeholder="••••••••"
                    value={loginSenha}
                    onChange={(e) => setLoginSenha(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    autoComplete="current-password"
                  />
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg" 
                style={{ width: '100%', marginBottom: '1rem', height: '48px', fontSize: '1rem', fontWeight: 800 }} 
                disabled={loading}
              >
                {loading ? 'Validando Acesso...' : 'Entrar no Sistema'} <ArrowRight size={18} />
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={onGoToLanding}
                  style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.85rem', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  ← Voltar para a Página Institucional
                </button>
              </div>
            </form>
          )}

          {/* ================= 2. STEP 1: USER REGISTRATION ================= */}
          {step === 'register_user' && (
            <form onSubmit={handleRegisterUserSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(0, 245, 160, 0.1)', color: '#008764', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <span>Passo 1 de 2</span> • <span>Dados do Administrador</span>
                </div>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 800, color: '#071527' }}>Criar Nova Conta</h2>
                <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Informe seus dados para iniciar o cadastro da sua empresa</p>
              </div>

              <div className="form-group" style={{ marginBottom: '1.15rem' }}>
                <label className="form-label">Nome Completo *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Ex: Thiago Lafite"
                    value={userNome}
                    onChange={(e) => setUserNome(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.15rem' }}>
                <label className="form-label">E-mail Corporativo *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    required
                    placeholder="seu.email@empresa.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    autoComplete="username"
                  />
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Senha de Acesso *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-input"
                    required
                    placeholder="••••••••"
                    value={userSenha}
                    onChange={(e) => setUserSenha(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    autoComplete="new-password"
                  />
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-accent btn-lg" 
                style={{ width: '100%', marginBottom: '1rem', height: '48px', fontSize: '1rem', fontWeight: 800 }} 
                disabled={loading}
              >
                Próximo: Dados da Empresa <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* ================= 3. STEP 2: COMPANY SETUP & INSTANT CEP ================= */}
          {step === 'company_setup' && (
            <form onSubmit={handleCompanySetupSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#0284C7', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <span>Passo 2 de 2</span> • <span>Dados da Empresa & Localização</span>
                </div>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 800, color: '#071527' }}>Dados Cadastrais da Empresa</h2>
                <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Ao digitar o CEP, os dados de endereço serão carregados automaticamente</p>
              </div>

              {/* Grid 1: CNPJ & Razão Social */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1rem', marginBottom: '1.15rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">CNPJ da Empresa *</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    required
                    placeholder="00.000.000/0001-00"
                    value={companyCNPJ}
                    onChange={(e) => setCompanyCNPJ(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Razão Social / Nome Fantasia *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Ex: Lafite Distribuidora LTDA"
                    value={companyRazaoSocial}
                    onChange={(e) => setCompanyRazaoSocial(e.target.value)}
                  />
                </div>
              </div>

              {/* Grid 2: Celular / WhatsApp & Plano */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr', gap: '1rem', marginBottom: '1.15rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Celular / WhatsApp *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input font-mono"
                      required
                      placeholder="(00) 00000-0000"
                      value={companyCelular}
                      onChange={(e) => setCompanyCelular(formatPhone(e.target.value))}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <Phone size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Plano Desejado</label>
                  <select 
                    className="form-select"
                    value={companyPlano}
                    onChange={(e) => setCompanyPlano(e.target.value)}
                    style={{ fontWeight: 700 }}
                  >
                    <option value="Básico">Plano Básico (Até 3 Usuários)</option>
                    <option value="Pro">Plano Pro (Até 10 Usuários)</option>
                    <option value="Premium">Plano Premium (Completo VIP)</option>
                    <option value="Enterprise">Plano Enterprise (Ilimitado)</option>
                  </select>
                </div>
              </div>

              {/* LOCALIZAÇÃO: CEP & Auto-preenchimento */}
              <div style={{
                padding: '1.25rem',
                backgroundColor: '#F8FAFD',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#071527', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Localização & Endereço
                  </span>
                  {cepLoading && (
                    <span style={{ fontSize: '0.75rem', color: '#0284C7', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                      <Loader2 size={13} className="animate-spin" /> Buscando dados do CEP...
                    </span>
                  )}
                </div>

                {/* Linha CEP & Endereço */}
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1rem', marginBottom: '0.85rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">CEP *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input font-mono"
                        required
                        placeholder="00000-000"
                        maxLength={9}
                        value={companyCEP}
                        onChange={handleCEPChange}
                        onBlur={handleCEPBlur}
                        style={{ fontWeight: 700 }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Logradouro / Endereço</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Av. Paulista ou Rua das Flores"
                      value={companyEndereco}
                      onChange={(e) => setCompanyEndereco(e.target.value)}
                    />
                  </div>
                </div>

                {/* Linha Número, Complemento e Bairro */}
                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1.3fr', gap: '1rem', marginBottom: '0.85rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Número</label>
                    <input
                      ref={numeroInputRef}
                      type="text"
                      className="form-input"
                      placeholder="123"
                      value={companyNumero}
                      onChange={(e) => setCompanyNumero(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Complemento</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Sala 101"
                      value={companyComplemento}
                      onChange={(e) => setCompanyComplemento(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Bairro</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Bairro"
                      value={companyBairro}
                      onChange={(e) => setCompanyBairro(e.target.value)}
                    />
                  </div>
                </div>

                {/* Linha Cidade e Estado */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Cidade</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Cidade"
                      value={companyCidade}
                      onChange={(e) => setCompanyCidade(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">UF</label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      placeholder="BA"
                      maxLength={2}
                      value={companyEstado}
                      onChange={(e) => setCompanyEstado(e.target.value.toUpperCase())}
                      style={{ textAlign: 'center', fontWeight: 700 }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setStep('register_user')}
                  className="btn btn-outline"
                  style={{ flex: 1, height: '48px', fontWeight: 700 }}
                >
                  <ArrowLeft size={16} /> Voltar
                </button>

                <button 
                  type="submit" 
                  className="btn btn-accent" 
                  style={{ flex: 2, height: '48px', fontSize: '1rem', fontWeight: 800 }} 
                  disabled={loading}
                >
                  {loading ? 'Gravando no Banco...' : 'Enviar Solicitação de Cadastro'} <Send size={18} />
                </button>
              </div>
            </form>
          )}

          {/* ================= 4. STEP 4: PENDING APPROVAL NOTICE ================= */}
          {step === 'pending_approval_notice' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 158, 11, 0.14)',
                color: '#D97706',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '2px solid rgba(245, 158, 11, 0.3)'
              }}>
                <Clock size={36} />
              </div>

              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.55rem', fontWeight: 800, color: '#071527', marginBottom: '0.5rem' }}>
                Solicitação Enviada com Sucesso!
              </h2>

              <p style={{ fontSize: '0.925rem', color: '#576F86', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Olá, <strong style={{ color: '#071527' }}>{userNome}</strong>! Os dados da empresa <strong style={{ color: '#071527' }}>{companyRazaoSocial}</strong> foram gravados com sucesso e encaminhados para a fila de análise do <strong>Administrador Master</strong>.
              </p>

              <div style={{
                padding: '1.15rem',
                backgroundColor: '#FFFBEB',
                borderRadius: '12px',
                border: '1px solid #FDE68A',
                marginBottom: '1.75rem',
                textAlign: 'left',
                fontSize: '0.85rem',
                color: '#92400E',
                lineHeight: 1.5
              }}>
                <div style={{ fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} /> Próximos Passos:
                </div>
                Assim que o Administrador Master aprovar a sua empresa no painel, você poderá acessar o sistema digitando seu e-mail (<strong>{userEmail}</strong>) e sua senha cadastrada.
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('login');
                  setLoginEmail(userEmail);
                  setErrorMsg('');
                  setSuccessMsg('Cadastro recebido! Você pode testar seu acesso assim que for aprovado.');
                }}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', height: '48px', fontWeight: 800 }}
              >
                Ir para Tela de Login <ArrowRight size={18} />
              </button>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: '#64748B' }}>
          Lafitec ERP • Segurança Corporativa & Conexão Direta ao Supabase PostgreSQL
        </div>

      </div>
    </div>
  );
};
