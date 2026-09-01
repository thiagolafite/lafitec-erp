import React, { useState, useEffect } from 'react';
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
  KeyRound
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
    sendVerificationCode, 
    verifyEmailCode, 
    registerEmpresaWithCompany 
  } = useAuth();

  // Wizard Steps: 'login' | 'register_user' | 'verify_email' | 'company_setup'
  const [step, setStep] = useState('login');

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  // Step 1: User Registration
  const [userNome, setUserNome] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userSenha, setUserSenha] = useState('');

  // Step 2: Email Verification
  const [verificationCode, setVerificationCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 3: Company Setup (Mandatory CNPJ, Address, Phone, CEP)
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

  // Resend Cooldown Timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Detecta confirmação automática de e-mail / Magic Link via URL Hash ou Supabase Auth
  useEffect(() => {
    const hash = window.location.hash || '';
    const search = window.location.search || '';

    if (hash.includes('access_token') || hash.includes('type=magiclink') || hash.includes('type=signup') || search.includes('type=magiclink')) {
      if (hash.includes('error_description')) {
        const params = new URLSearchParams(hash.substring(1));
        const desc = params.get('error_description') || 'Link de confirmação expirado ou inválido.';
        setErrorMsg(desc.replace(/\+/g, ' '));
        return;
      }

      setLoading(true);
      if (supabase && supabase.auth) {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
          if (session?.user) {
            const confirmedEmail = session.user.email;
            const confirmedName = session.user.user_metadata?.nome || confirmedEmail.split('@')[0];

            setUserEmail(confirmedEmail);
            setUserNome(confirmedName);

            // Verifica se este usuário já tem uma empresa cadastrada no banco
            try {
              const { data: existingUser } = await supabase
                .from('usuarios')
                .select('*, empresas(*)')
                .or(`auth_user_id.eq.${session.user.id},email.ilike.${confirmedEmail}`)
                .maybeSingle();

              if (existingUser && existingUser.empresas) {
                setSuccessMsg(`Bem-vindo, ${confirmedName}! Entrando no sistema...`);
                // Salva a sessão no storage e loga
                const appSession = {
                  user: {
                    id: existingUser.id,
                    nome: existingUser.nome,
                    email: existingUser.email,
                    tipo: existingUser.tipo || 'Admin',
                    empresaId: existingUser.empresa_id
                  },
                  empresa: {
                    id: existingUser.empresas.id,
                    nome: existingUser.empresas.nome,
                    cnpj: existingUser.empresas.cnpj,
                    plano: existingUser.empresas.plano || 'Premium'
                  }
                };
                localStorage.setItem('lafitec_current_user', JSON.stringify(appSession));
                window.location.href = window.location.origin + window.location.pathname;
                return;
              }
            } catch (e) {
              console.warn('Erro ao checar empresa existente:', e);
            }

            // E-mail verificado -> avança para o cadastro dos dados da empresa
            setSuccessMsg('E-mail confirmado com sucesso! Agora informe os dados da sua empresa para concluir.');
            setStep('company_setup');
          }
          setLoading(false);
        }).catch(() => setLoading(false));
      } else {
        setStep('company_setup');
        setLoading(false);
      }
    }
  }, []);

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

  // 2. SUBMIT STEP 1: USER REGISTRATION (Sends real verification email)
  const handleRegisterUserSubmit = async (e) => {
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

    setLoading(true);
    try {
      await sendVerificationCode(userEmail, userNome);
      setResendCooldown(60);
      setSuccessMsg(`Código de confirmação enviado para ${userEmail}. Verifique sua caixa de entrada.`);
      setStep('verify_email');
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao enviar e-mail de confirmação.');
    } finally {
      setLoading(false);
    }
  };

  // 3. SUBMIT STEP 2: VERIFY EMAIL WITH CODE FROM INBOX
  const handleVerifyEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const token = verificationCode.trim();
    if (!token || token.length !== 6) {
      setErrorMsg('Digite o código de 6 dígitos recebido em seu e-mail.');
      return;
    }

    setLoading(true);
    try {
      await verifyEmailCode(userEmail, token);
      setSuccessMsg('E-mail confirmado com sucesso! Agora informe os dados da empresa.');
      setStep('company_setup');
    } catch (err) {
      setErrorMsg(err.message || 'Código de confirmação inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg('');
    setLoading(true);
    try {
      await sendVerificationCode(userEmail, userNome);
      setResendCooldown(60);
      setSuccessMsg('Novo código de verificação enviado para seu e-mail!');
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao reenviar código.');
    } finally {
      setLoading(false);
    }
  };

  // 4. CEP LOOKUP
  const handleCEPBlur = async () => {
    const clean = companyCEP.replace(/\D/g, '');
    if (clean.length === 8) {
      setCepLoading(true);
      setErrorMsg('');
      try {
        const addr = await fetchAddressByCEP(clean);
        setCompanyEndereco(addr.endereco);
        setCompanyBairro(addr.bairro);
        setCompanyCidade(addr.cidade);
        setCompanyEstado(addr.estado);
        if (addr.complemento && !companyComplemento) {
          setCompanyComplemento(addr.complemento);
        }
      } catch (err) {
        setErrorMsg('CEP não encontrado. Preencha o endereço manualmente.');
      } finally {
        setCepLoading(false);
      }
    }
  };

  // 5. SUBMIT STEP 3: COMPANY SETUP (Allows ANY CNPJ number)
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

      await registerEmpresaWithCompany(
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
      setSuccessMsg('Empresa e conta configuradas com sucesso! Redirecionando...');
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
      <div style={{
        width: '100%',
        maxWidth: step === 'company_setup' ? '640px' : step === 'register_user' ? '480px' : '440px',
        position: 'relative',
        zIndex: 1,
        transition: 'max-width 0.3s ease'
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem', color: '#FFFFFF' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #00F5A0 0%, #00C896 100%)',
            color: '#071527',
            marginBottom: '0.85rem',
            boxShadow: '0 8px 24px rgba(0, 245, 160, 0.35)'
          }}>
            <ShieldCheck size={36} strokeWidth={2.2} />
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
            Lafitec<span style={{ color: '#00F5A0' }}>ERP</span>
          </h1>
          <p style={{ color: '#8FA2B6', fontSize: '0.925rem', fontWeight: 500, marginTop: '0.25rem' }}>
            Gestão Inteligente & Segurança Corporativa Real
          </p>
        </div>

        {/* Main Card */}
        <div className="card" style={{
          padding: '2.25rem',
          borderRadius: '20px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}>
          {/* Top Tabs (Only on initial login / register) */}
          {(step === 'login' || step === 'register_user') && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              backgroundColor: '#F1F5F9',
              padding: '4px',
              borderRadius: '12px',
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
                  color: step === 'login' ? '#0A2540' : '#64748B',
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
                  color: step === 'register_user' ? '#0A2540' : '#64748B',
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
              padding: '0.85rem 1rem',
              backgroundColor: '#FEF2F2',
              borderLeft: '4px solid #EF4444',
              color: '#DC2626',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#ECFDF5',
              borderLeft: '4px solid #10B981',
              color: '#059669',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= 1. TAB LOGIN ================= */}
          {step === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0A2540' }}>Acesse sua Conta</h2>
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

              <div className="form-group" style={{ marginBottom: '1.75rem' }}>
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
                style={{ width: '100%', marginBottom: '1.25rem', height: '48px', fontSize: '1rem' }} 
                disabled={loading}
              >
                {loading ? 'Entrando no Sistema...' : 'Entrar no Sistema'} <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* ================= 2. STEP 1: USER REGISTRATION ONLY ================= */}
          {step === 'register_user' && (
            <form onSubmit={handleRegisterUserSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(0, 200, 150, 0.1)', color: '#008764', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <span>Passo 1 de 3</span> • <span>Identificação do Usuário</span>
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0A2540' }}>Criar Nova Conta</h2>
                <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Informe seus dados para receber o código de verificação por e-mail</p>
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
                <label className="form-label">E-mail *</label>
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
                <label className="form-label">Senha *</label>
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
                {loading ? 'Enviando E-mail...' : 'Continuar & Confirmar E-mail'} <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* ================= 3. STEP 2: VERIFY EMAIL (REAL CODE FROM INBOX) ================= */}
          {step === 'verify_email' && (
            <form onSubmit={handleVerifyEmailSubmit}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 200, 150, 0.12)',
                  color: '#008764',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <Mail size={30} />
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(2, 132, 199, 0.1)', color: '#0284C7', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <span>Passo 2 de 3</span> • <span>Verificação de Segurança</span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0A2540' }}>Verifique sua Caixa de Entrada</h2>
                <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.35rem', lineHeight: 1.5 }}>
                  Enviamos um código de segurança de 6 dígitos para o e-mail: <br />
                  <strong style={{ color: '#0A2540', fontSize: '0.95rem' }}>{userEmail}</strong>
                </p>
              </div>

              <div style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#F8FAFD',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                marginBottom: '1.5rem',
                fontSize: '0.825rem',
                color: '#576F86',
                lineHeight: 1.5,
                textAlign: 'center'
              }}>
                ℹ️ Abra seu aplicativo de e-mail (ou pasta de spam), copie o código de 6 dígitos recebido e digite abaixo para confirmar sua conta.
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ textAlign: 'center', display: 'block', fontWeight: 700 }}>
                  Código de Verificação de 6 Dígitos
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{
                    fontSize: '1.6rem',
                    letterSpacing: '8px',
                    textAlign: 'center',
                    fontWeight: 800,
                    height: '56px'
                  }}
                  autoFocus
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg" 
                style={{ width: '100%', marginBottom: '1rem', height: '48px', fontSize: '1rem', fontWeight: 800 }}
                disabled={loading}
              >
                {loading ? 'Validando Código...' : 'Validar E-mail & Continuar'} <ArrowRight size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setStep('register_user')}
                  style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <ArrowLeft size={14} /> Corrigir E-mail
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendCooldown > 0 ? '#94A3B8' : '#0284C7',
                    fontWeight: 700,
                    cursor: resendCooldown > 0 ? 'default' : 'pointer'
                  }}
                >
                  {resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : 'Reenviar Código'}
                </button>
              </div>
            </form>
          )}

          {/* ================= 4. STEP 3: COMPANY SETUP ================= */}
          {step === 'company_setup' && (
            <form onSubmit={handleCompanySetupSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(0, 200, 150, 0.1)', color: '#008764', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <Check size={14} /> <span>E-mail Confirmado</span> • <span>Passo 3 de 3: Dados da Empresa</span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0A2540' }}>Configure os Dados da sua Empresa</h2>
                <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                  Preencha as informações cadastrais para gerar seu ambiente multi-tenant
                </p>
              </div>

              {/* CNPJ & Razão Social */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>CNPJ da Empresa *</span>
                    <span style={{ color: '#EF4444', fontSize: '0.75rem', fontWeight: 700 }}>Obrigatório</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="Informe qualquer número de CNPJ"
                      value={companyCNPJ}
                      onChange={(e) => setCompanyCNPJ(e.target.value)}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <FileText size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Razão Social / Nome Fantasia *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="Ex: Minha Empresa LTDA"
                      value={companyRazaoSocial}
                      onChange={(e) => setCompanyRazaoSocial(e.target.value)}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <Building2 size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  </div>
                </div>
              </div>

              {/* Pergunta do E-mail da Empresa */}
              <div style={{
                padding: '1rem',
                backgroundColor: '#F8FAFD',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                marginBottom: '1.25rem'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', color: '#0A2540' }}>
                  <input
                    type="checkbox"
                    checked={sameEmailAsUser}
                    onChange={(e) => setSameEmailAsUser(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#00C896' }}
                  />
                  <span>O e-mail de contato da empresa é o mesmo do cadastro ({userEmail})?</span>
                </label>

                {!sameEmailAsUser && (
                  <div style={{ marginTop: '0.85rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>E-mail da Empresa (Faturamento/Contato)</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="contato@empresa.com.br"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Celular & CEP */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Celular / WhatsApp Comercial *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="(11) 99999-9999"
                      value={companyCelular}
                      onChange={(e) => setCompanyCelular(formatPhone(e.target.value))}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">CEP *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="00000-000"
                      value={companyCEP}
                      onChange={(e) => setCompanyCEP(formatCEP(e.target.value))}
                      onBlur={handleCEPBlur}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    {cepLoading && (
                      <RefreshCw size={16} className="animate-spin" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#00C896' }} />
                    )}
                  </div>
                </div>
              </div>

              {/* Endereço Completo */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Endereço / Logradouro</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Av. Paulista"
                    value={companyEndereco}
                    onChange={(e) => setCompanyEndereco(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Número</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="1000"
                    value={companyNumero}
                    onChange={(e) => setCompanyNumero(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.6fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Bairro</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Bela Vista"
                    value={companyBairro}
                    onChange={(e) => setCompanyBairro(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cidade</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="São Paulo"
                    value={companyCidade}
                    onChange={(e) => setCompanyCidade(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">UF</label>
                  <input
                    type="text"
                    className="form-input"
                    maxLength={2}
                    placeholder="SP"
                    value={companyEstado}
                    onChange={(e) => setCompanyEstado(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              {/* Plano Selector */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                  Plano Inicial do Sistema:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  {[
                    { id: 'Básico', nome: 'Básico', tag: 'Gratuito', color: '#64748B' },
                    { id: 'Pro', nome: 'Pro', tag: 'Recomendado', color: '#0284C7' },
                    { id: 'Premium', nome: 'Premium', tag: 'Completo', color: '#00C896' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setCompanyPlano(p.id)}
                      style={{
                        padding: '0.65rem 0.5rem',
                        borderRadius: '10px',
                        border: companyPlano === p.id ? `2px solid ${p.color}` : '1px solid #E2E8F0',
                        backgroundColor: companyPlano === p.id ? 'rgba(0, 200, 150, 0.06)' : '#FFFFFF',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#0A2540' }}>{p.nome}</div>
                      <div style={{ fontSize: '0.7rem', color: p.color, fontWeight: 700, marginTop: '2px' }}>{p.tag}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-accent btn-lg" 
                style={{ width: '100%', marginBottom: '1rem', height: '50px', fontSize: '1.05rem', fontWeight: 800 }} 
                disabled={loading}
              >
                {loading ? 'Gravando no Supabase...' : 'Finalizar Cadastro & Acessar ERP'} <Zap size={18} />
              </button>
            </form>
          )}

          {/* Footer Back Link */}
          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={onGoToLanding}
              style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              ← Voltar para a Página Institucional
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#8FA2B6', fontSize: '0.825rem' }}>
          Lafitec ERP • Segurança e Conexão Direta ao Supabase PostgreSQL
        </div>
      </div>
    </div>
  );
};
