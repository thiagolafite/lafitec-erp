import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Calculator, 
  HelpCircle, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare, 
  RefreshCw,
  Lightbulb,
  DollarSign,
  Users,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AIAssistantWidget = ({ onNavigate, showToast }) => {
  const { empresa, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'calculos' | 'rotinas'
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Formula Simulator States
  const [simPrecoBruto, setSimPrecoBruto] = useState(100);
  const [simDesconto, setSimDesconto] = useState(10);
  const [simIpi, setSimIpi] = useState(3.25);
  const [simSt, setSimSt] = useState(0);
  const [simQuantidade, setSimQuantidade] = useState(10);

  // Relacionamento Simulator
  const [simScoreFreq, setSimScoreFreq] = useState(2); // compras
  const [simScoreTotal, setSimScoreTotal] = useState(5000); // R$
  const [simScoreEstrelas, setSimScoreEstrelas] = useState(4); // 1-5
  const [simScoreDiasVisita, setSimScoreDiasVisita] = useState(15); // dias

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Olá, ${user?.nome || 'Usuário'}! Sou o **Assistente Inteligente do Lafitec ERP**. 🤖✨\n\nEstou aqui para orientar qualquer **rotina do sistema** ou explicar detalhadamente como funcionam os **cálculos matemáticos, fiscais e regras de negócio** inclusos no sistema.\n\nComo posso te ajudar hoje?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'Como calcular o Preço com IPI e ST no Orçamento?',
        'Como funciona o Índice de Relacionamento do Cliente?',
        'Como converter um Orçamento em Venda?',
        'Como cadastrar Condições de Pagamento parceladas?'
      ]
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  // Comprehensive Knowledge Engine for ERP Calculations & Workflows
  const processAIQuery = (query) => {
    const q = query.toLowerCase().trim();

    // 1. CÁLCULO DE ORÇAMENTOS, IPI, ST, PREÇO LÍQUIDO E TOTAL
    if (q.includes('ipi') || q.includes('st') || q.includes('preço') || q.includes('preco') || q.includes('calculo do orcamento') || q.includes('cálculo do orçamento') || q.includes('desconto')) {
      return {
        text: `### 📐 Como funcionam os Cálculos nos Orçamentos:\n\n` +
          `O Lafitec ERP utiliza o padrão comercial industrial de formação de preços com impostos em cascata controlada:\n\n` +
          `1. **Preço Líquido (Base de Cálculo):**\n` +
          `   $$\\text{Preço Líquido} = \\text{Preço Bruto} - \\text{Desconto}$$\n\n` +
          `2. **Preço com Impostos (Unitário):**\n` +
          `   $$\\text{Preço com Impostos} = \\text{Preço Líquido} \\times \\left(1 + \\frac{\\%\\text{IPI}}{100} + \\frac{\\%\\text{ST}}{100}\\right)$$\n\n` +
          `3. **Subtotal do Item:**\n` +
          `   $$\\text{Subtotal Item} = \\text{Quantidade} \\times \\text{Preço com Impostos}$$\n\n` +
          `4. **Total Geral da Proposta:**\n` +
          `   $$\\text{Total} = \\sum (\\text{Subtotais}) + \\text{Frete} + \\text{Custo Financeiro}$$\n\n` +
          `💡 *Exemplo Prático:* Preço Bruto R$ 100,00 com 10% desconto = R$ 90,00 Líquido. Com IPI de 3,25%, o preço unitário final é **R$ 92,93**!`,
        actionTab: 'orcamentos',
        actionLabel: 'Ir para Orçamentos'
      };
    }

    // 2. ÍNDICE DE RELACIONAMENTO DO CLIENTE (0 a 100)
    if (q.includes('relacionamento') || q.includes('score') || q.includes('indice') || q.includes('índice') || q.includes('cliente ativo') || q.includes('risco')) {
      return {
        text: `### ⭐ Como funciona o Cálculo do Índice de Relacionamento (0 a 100):\n\n` +
          `O índice avalia a saúde comercial de cada cliente combinando 4 pilares ponderados:\n\n` +
          `- **Pontuação Base:** Inicia em **50 pontos** neutros.\n` +
          `- **Frequência de Compras:** +4 pontos por pedido realizado (até +15 pontos).\n` +
          `- **Volume Financeiro Total:**\n` +
          `  - Acima de R$ 10.000: **+15 pontos**\n` +
          `  - Acima de R$ 3.000: **+10 pontos**\n` +
          `  - Compras anteriores: **+5 pontos**\n` +
          `- **Prioridade Estratégica:** Avaliação de 1 a 5 estrelas ($(\\text{Estrelas} - 3) \\times 4$).\n` +
          `- **Pontualidade de Visitas:** Se a visita estiver no prazo (+15 pontos). Se atrasar mais de 30 dias (-10 a -30 pontos).\n\n` +
          `**Classificação dos Níveis:**\n` +
          `- 🟢 **85 a 100:** *Cliente Muito Ativo*\n` +
          `- 🟢 **70 a 84:** *Cliente Ativo*\n` +
          `- 🟡 **50 a 69:** *Atenção (Requer Contato)*\n` +
          `- 🔴 **Abaixo de 50:** *Alto Risco de Perda*`,
        actionTab: 'clientes',
        actionLabel: 'Ver Carteira de Clientes'
      };
    }

    // 3. CONDIÇÕES DE PAGAMENTO, INTERVALO DE DIAS E CUSTO FINANCEIRO
    if (q.includes('pagamento') || q.includes('condicao') || q.includes('condição') || q.includes('parcela') || q.includes('intervalo de dias') || q.includes('juros') || q.includes('custo financeiro')) {
      return {
        text: `### 💳 Como funcionam as Condições de Pagamento e Intervalos de Dias:\n\n` +
          `No módulo **Condições de Pagamento**, você define prazos de faturamento flexíveis:\n\n` +
          `1. **Intervalo de Dias:**\n` +
          `   - Digite os dias separados por vírgula (ex: \`0\` para à vista, \`30\` para 30DD, ou \`28, 42, 56\` para 3 parcelas).\n` +
          `   - O sistema calcula automaticamente o número de parcelas pelo total de prazos informados.\n\n` +
          `2. **% Custo Financeiro:**\n` +
          `   - Percentual de taxa de operadora ou juros embutidos (ex: \`2.50%\`).\n\n` +
          `3. **Custo Financeiro R$:**\n` +
          `   - Tarifa fixa em reais (ex: taxa de emissão de boleto R$ 3,50).\n\n` +
          `4. **Imprime no Pedido:**\n` +
          `   - Define se a condição deve constar na folha do PDF da proposta comercial.`,
        actionTab: 'condicoes_pagamento',
        actionLabel: 'Gerenciar Condições de Pagamento'
      };
    }

    // 4. CONVERSÃO DE ORÇAMENTO EM VENDA (PDV)
    if (q.includes('converter') || q.includes('aprovado') || q.includes('venda') || q.includes('pdv') || q.includes('fluxo')) {
      return {
        text: `### 🔄 Fluxo de Conversão de Orçamento em Venda:\n\n` +
          `O ciclo de vendas do ERP foi desenhado para máxima agilidade:\n\n` +
          `1. **Criação do Orçamento:** Elabore a proposta no menu **Orçamentos** (Etapa 1 Cabeçalho, Etapa 2 Itens, Etapa 3 Fechamento).\n` +
          `2. **Envio ao Cliente:** Clique no ícone de envio (avião de papel) para registrar envio por WhatsApp ou E-mail (Status muda para *Enviado*).\n` +
          `3. **Aprovação:** Clique no ícone verde de check para marcar como *Aprovado*.\n` +
          `4. **Conversão Instantânea:** Clique no botão **"Converter"**. O sistema cria o pedido de venda automaticamente com todos os itens, cliente, valores e prazos, atualizando o status para *Convertido*!`,
        actionTab: 'orcamentos',
        actionLabel: 'Acessar Orçamentos Comerciais'
      };
    }

    // 5. ATALHOS DO TECLADO NO SISTEMA
    if (q.includes('atalho') || q.includes('teclado') || q.includes('f8') || q.includes('f9') || q.includes('rapido')) {
      return {
        text: `### ⌨️ Atalhos de Teclado no Lafitec ERP:\n\n` +
          `Para acelerar a digitação de pedidos e orçamentos:\n\n` +
          `- **[F8]:** Voltar para a etapa anterior no formulário passo a passo.\n` +
          `- **[F9]:** Avançar para a próxima etapa no formulário de orçamento.\n` +
          `- **[Enter]:** No campo de CEP, busca automaticamente o endereço online via ViaCEP.\n` +
          `- **[Ctrl + P]:** Imprime o documento ou proposta oficial em PDF formatado.`,
        actionTab: 'orcamentos',
        actionLabel: 'Testar Atalhos em Orçamentos'
      };
    }

    // 6. CADASTRO DE FORNECEDORES E LOGOMARCAS
    if (q.includes('fornecedor') || q.includes('representad') || q.includes('logo') || q.includes('logomarca') || q.includes('cbenef')) {
      return {
        text: `### 🏭 Cadastro de Fornecedores & Logomarcas:\n\n` +
          `- **Consulta de CNPJ:** Botão 🌐 para checagem online dos dados cadastrais.\n` +
          `- **Auto-preenchimento por CEP:** Digite os 8 números do CEP e o logradouro, bairro e cidade são carregados sozinhos.\n` +
          `- **Importação de Logomarca:** Faça upload da imagem do fornecedor/representada. Ela aparecerá automaticamente no cabeçalho do PDF da proposta!\n` +
          `- **CBENEF:** Código de benefício fiscal para emissão de NFe e tributação.\n` +
          `- **Botão "Ver no Mapa":** Abre o endereço da fábrica ou matriz diretamente no Google Maps.`,
        actionTab: 'fornecedores',
        actionLabel: 'Abrir Cadastro de Fornecedores'
      };
    }

    // 7. ENTRADA DE ESTOQUE & RASTREABILIDADE
    if (q.includes('estoque') || q.includes('entrada') || q.includes('lote') || q.includes('validade') || q.includes('nfe') || q.includes('xml')) {
      return {
        text: `### 📦 Entrada de Estoque & Rastreabilidade de Lotes:\n\n` +
          `No módulo **Entrada de Estoque**, você pode registrar o recebimento de mercadorias:\n\n` +
          `1. **Importação por XML ou Manual:** Registre número da NF-e, chave de acesso e fornecedor.\n` +
          `2. **Rastreabilidade por Lote:** Informe o número do lote, data de fabricação e validade para garantia de qualidade.\n` +
          `3. **Atualização Automática:** O saldo em estoque do produto é somado instantaneamente e o histórico fica registrado na auditoria.`,
        actionTab: 'entradas_estoque',
        actionLabel: 'Ir para Entrada de Estoque'
      };
    }

    // 8. RELATÓRIOS & BI
    if (q.includes('relatorio') || q.includes('relatório') || q.includes('grafico') || q.includes('gráfico') || q.includes('faturamento') || q.includes('comissao') || q.includes('comissão')) {
      return {
        text: `### 📊 Relatórios Gerenciais & Gráficos de Desempenho:\n\n` +
          `No **Dashboard Inicial** e no módulo **Relatórios**, você acompanha:\n\n` +
          `- **Comparativo por Fornecedor (Mês e Ano):** Volume de vendas faturadas por cada fábrica representada.\n` +
          `- **Top 20 Clientes:** Ranking de clientes com maior volume de compras.\n` +
          `- **Evolução de Faturamento:** Gráfico de linha/barras comparando mês a mês.\n` +
          `- **Comissões de Vendedores:** Cálculo do valor líquido a repassar aos representantes comerciais.`,
        actionTab: 'dashboard',
        actionLabel: 'Ver Gráficos no Dashboard'
      };
    }

    // DEFAULT FALLBACK RESPONSE
    return {
      text: `Entendi sua dúvida sobre **"${query}"**! 🤖\n\n` +
        `O Lafitec ERP conta com módulos integrados de **Cadastros (Clientes, Fornecedores, Transportadoras, Condições de Pagamento)**, **Orçamentos Comerciais**, **Vendas (PDV)**, **Entrada de Estoque com Lote**, **Financeiro** e **Relatórios BI**.\n\n` +
        `Gostaria que eu detalhasse:\n` +
        `1. A fórmula matemática de algum cálculo específico?\n` +
        `2. O passo a passo de alguma rotina (como emitir propostas ou gerar PDF)?\n` +
        `3. Como importar logomarcas ou pesquisar endereços por CEP?`
    };
  };

  const handleSendMessage = (textToSend = inputQuery) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const response = processAIQuery(textToSend);
      const aiMsg = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: response.text,
        actionTab: response.actionTab,
        actionLabel: response.actionLabel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 450);
  };

  // Calculations for Simulator Tab
  const precoLiquidoSim = Math.max(0, simPrecoBruto - simDesconto);
  const valorIpiUnit = precoLiquidoSim * (simIpi / 100);
  const valorStUnit = precoLiquidoSim * (simSt / 100);
  const precoFinalUnit = precoLiquidoSim + valorIpiUnit + valorStUnit;
  const subtotalGeralSim = precoFinalUnit * simQuantidade;

  // Simulator Relacionamento
  let scoreSimCalculado = 50;
  scoreSimCalculado += Math.min(simScoreFreq * 4, 15);
  if (simScoreTotal > 10000) scoreSimCalculado += 15;
  else if (simScoreTotal > 3000) scoreSimCalculado += 10;
  else if (simScoreTotal > 0) scoreSimCalculado += 5;
  scoreSimCalculado += (simScoreEstrelas - 3) * 4;
  if (simScoreDiasVisita <= 30) scoreSimCalculado += 15;
  else if (simScoreDiasVisita > 60) scoreSimCalculado -= 20;
  else scoreSimCalculado -= 10;
  scoreSimCalculado = Math.max(0, Math.min(100, scoreSimCalculado));

  return (
    <>
      {/* 1. FLOATING LAUNCHER BUTTON (ALWAYS ACCESSIBLE AT BOTTOM RIGHT) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#0A2540',
            color: '#FFFFFF',
            border: '2px solid #00C896',
            borderRadius: '30px',
            padding: '10px 20px',
            boxShadow: '0 8px 24px rgba(10, 37, 64, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '0.9rem',
            transition: 'all 0.25s ease',
            animation: 'pulseGlow 2.5s infinite'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 200, 150, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(10, 37, 64, 0.35)';
          }}
          title="Assistente IA: Tire dúvidas sobre cálculos e rotinas do sistema"
        >
          <div style={{
            backgroundColor: '#00C896',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0A2540'
          }}>
            <Sparkles size={14} />
          </div>
          <span>Assistente IA Lafitec</span>
          <span style={{
            fontSize: '0.65rem',
            backgroundColor: 'rgba(0, 200, 150, 0.2)',
            color: '#00C896',
            padding: '2px 6px',
            borderRadius: '10px',
            textTransform: 'uppercase',
            fontWeight: 800
          }}>
            Online
          </span>
        </button>
      )}

      {/* 2. EXPANDED AI ASSISTANT DRAWER / PANEL */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '420px',
          maxWidth: 'calc(100vw - 32px)',
          height: isMinimized ? '58px' : '620px',
          maxHeight: 'calc(100vh - 40px)',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 16px 40px rgba(10, 37, 64, 0.35)',
          border: '1px solid #CBD5E1',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#0A2540',
            color: '#FFFFFF',
            padding: '0.875rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #00C896'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                backgroundColor: 'rgba(0, 200, 150, 0.2)',
                color: '#00C896',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex'
              }}>
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: '1.2' }}>
                  Assistente IA Lafitec
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                  Orientação de rotinas & fórmulas
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Maximizar' : 'Minimizar'}
                style={{ color: '#94A3B8', padding: '4px' }}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setIsOpen(false)}
                title="Fechar"
                style={{ color: '#94A3B8', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Tab Navigation */}
              <div style={{
                display: 'flex',
                borderBottom: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC'
              }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    fontSize: '0.8rem',
                    fontWeight: activeTab === 'chat' ? 800 : 600,
                    color: activeTab === 'chat' ? '#0A2540' : '#64748B',
                    borderBottom: activeTab === 'chat' ? '2px solid #00C896' : 'none',
                    backgroundColor: activeTab === 'chat' ? '#FFFFFF' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <MessageSquare size={14} /> Chat & Dúvidas
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('calculos')}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    fontSize: '0.8rem',
                    fontWeight: activeTab === 'calculos' ? 800 : 600,
                    color: activeTab === 'calculos' ? '#0A2540' : '#64748B',
                    borderBottom: activeTab === 'calculos' ? '2px solid #00C896' : 'none',
                    backgroundColor: activeTab === 'calculos' ? '#FFFFFF' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Calculator size={14} /> Fórmulas & Simulador
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('rotinas')}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    fontSize: '0.8rem',
                    fontWeight: activeTab === 'rotinas' ? 800 : 600,
                    color: activeTab === 'rotinas' ? '#0A2540' : '#64748B',
                    borderBottom: activeTab === 'rotinas' ? '2px solid #00C896' : 'none',
                    backgroundColor: activeTab === 'rotinas' ? '#FFFFFF' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <BookOpen size={14} /> Guia Rápido
                </button>
              </div>

              {/* TAB 1: CHAT INTERATIVO */}
              {activeTab === 'chat' && (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                  {/* Messages Scroll Area */}
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.875rem'
                  }}>
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                          maxWidth: '100%'
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: m.sender === 'user' ? '#0A2540' : '#F8FAFC',
                            color: m.sender === 'user' ? '#FFFFFF' : '#0A2540',
                            padding: '0.75rem 1rem',
                            borderRadius: m.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                            border: m.sender === 'user' ? 'none' : '1px solid #E2E8F0',
                            fontSize: '0.825rem',
                            lineHeight: '1.45',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                            whiteSpace: 'pre-line'
                          }}
                        >
                          {m.text}
                        </div>

                        {/* Navigation CTA Button if AI suggested a module */}
                        {m.actionTab && (
                          <button
                            type="button"
                            onClick={() => {
                              onNavigate(m.actionTab);
                              showToast('info', `Navegando para o módulo de ${m.actionTab.toUpperCase()}`);
                            }}
                            className="btn btn-accent btn-sm"
                            style={{
                              marginTop: '6px',
                              fontSize: '0.75rem',
                              padding: '4px 10px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 700
                            }}
                          >
                            <span>{m.actionLabel || 'Acessar Módulo'}</span>
                            <ArrowRight size={12} />
                          </button>
                        )}

                        {/* Suggestions Chips */}
                        {m.suggestions && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px', width: '100%' }}>
                            {m.suggestions.map((s, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSendMessage(s)}
                                style={{
                                  textAlign: 'left',
                                  padding: '6px 10px',
                                  fontSize: '0.75rem',
                                  backgroundColor: '#F0FDF4',
                                  color: '#008764',
                                  border: '1px solid rgba(0, 200, 150, 0.3)',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between'
                                }}
                              >
                                <span>{s}</span>
                                <ChevronRight size={12} />
                              </button>
                            ))}
                          </div>
                        )}

                        <span style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '2px' }}>
                          {m.timestamp}
                        </span>
                      </div>
                    ))}

                    {isTyping && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.75rem', padding: '6px' }}>
                        <RefreshCw size={14} className="spin" />
                        <span>Assistente IA calculando resposta...</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    style={{
                      padding: '0.75rem',
                      borderTop: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      gap: '6px'
                    }}
                  >
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Como calcular o preço com IPI e ST?"
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }}
                    />
                    <button
                      type="submit"
                      className="btn btn-accent"
                      style={{ padding: '0.5rem 0.85rem' }}
                      title="Enviar pergunta"
                    >
                      <Send size={15} />
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: SIMULADOR INTERATIVO DE FÓRMULAS & CÁLCULOS */}
              {activeTab === 'calculos' && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', fontSize: '0.8rem' }}>
                  {/* Simulador 1: Orçamento com Impostos */}
                  <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #CBD5E1', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.75rem' }}>
                      <Calculator size={16} style={{ color: '#00C896' }} />
                      <span>Simulador: Preço de Venda com IPI & ST</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>Preço Bruto (R$):</label>
                        <input
                          type="number"
                          className="form-input"
                          value={simPrecoBruto}
                          onChange={(e) => setSimPrecoBruto(parseFloat(e.target.value) || 0)}
                          style={{ padding: '4px 6px', fontSize: '0.8rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>Desconto (R$):</label>
                        <input
                          type="number"
                          className="form-input"
                          value={simDesconto}
                          onChange={(e) => setSimDesconto(parseFloat(e.target.value) || 0)}
                          style={{ padding: '4px 6px', fontSize: '0.8rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>% IPI:</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input"
                          value={simIpi}
                          onChange={(e) => setSimIpi(parseFloat(e.target.value) || 0)}
                          style={{ padding: '4px 6px', fontSize: '0.8rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>% ST:</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input"
                          value={simSt}
                          onChange={(e) => setSimSt(parseFloat(e.target.value) || 0)}
                          style={{ padding: '4px 6px', fontSize: '0.8rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>Quantidade:</label>
                        <input
                          type="number"
                          className="form-input"
                          value={simQuantidade}
                          onChange={(e) => setSimQuantidade(parseFloat(e.target.value) || 0)}
                          style={{ padding: '4px 6px', fontSize: '0.8rem' }}
                        />
                      </div>
                    </div>

                    {/* Calculation Results Card */}
                    <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '6px', border: '1px solid #00C896', lineHeight: '1.4' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                        <span>Preço Líquido (Base):</span>
                        <strong className="font-mono">R$ {precoLiquidoSim.toFixed(2)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                        <span>(+) IPI ({simIpi}%):</span>
                        <span className="font-mono">R$ {valorIpiUnit.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                        <span>(+) ST ({simSt}%):</span>
                        <span className="font-mono">R$ {valorStUnit.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #CBD5E1', paddingTop: '4px', marginTop: '4px' }}>
                        <span style={{ fontWeight: 700 }}>Preço Unit. com Impostos:</span>
                        <strong className="font-mono" style={{ color: '#008764' }}>R$ {precoFinalUnit.toFixed(2)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '4px', marginTop: '4px', fontSize: '0.875rem' }}>
                        <strong style={{ color: '#0A2540' }}>Total ({simQuantidade} un):</strong>
                        <strong className="font-mono" style={{ color: '#DC2626', fontSize: '0.95rem' }}>
                          R$ {subtotalGeralSim.toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Simulador 2: Índice de Relacionamento de Clientes */}
                  <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.75rem' }}>
                      <Users size={16} style={{ color: '#0284C7' }} />
                      <span>Simulador: Índice de Relacionamento (0 a 100)</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>Qtd. Pedidos Feitos:</label>
                        <input
                          type="number"
                          className="form-input"
                          value={simScoreFreq}
                          onChange={(e) => setSimScoreFreq(parseInt(e.target.value) || 0)}
                          style={{ padding: '4px 6px', fontSize: '0.8rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>Total Gasto (R$):</label>
                        <input
                          type="number"
                          className="form-input"
                          value={simScoreTotal}
                          onChange={(e) => setSimScoreTotal(parseFloat(e.target.value) || 0)}
                          style={{ padding: '4px 6px', fontSize: '0.8rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>Estrelas (1 a 5):</label>
                        <select
                          className="form-select"
                          value={simScoreEstrelas}
                          onChange={(e) => setSimScoreEstrelas(parseInt(e.target.value) || 3)}
                          style={{ padding: '4px 6px', fontSize: '0.8rem' }}
                        >
                          <option value="1">⭐ 1 Estrela</option>
                          <option value="2">⭐⭐ 2 Estrelas</option>
                          <option value="3">⭐⭐⭐ 3 Estrelas</option>
                          <option value="4">⭐⭐⭐⭐ 4 Estrelas</option>
                          <option value="5">⭐⭐⭐⭐⭐ 5 Estrelas</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>Dias desde Última Visita:</label>
                        <input
                          type="number"
                          className="form-input"
                          value={simScoreDiasVisita}
                          onChange={(e) => setSimScoreDiasVisita(parseInt(e.target.value) || 0)}
                          style={{ padding: '4px 6px', fontSize: '0.8rem' }}
                        />
                      </div>
                    </div>

                    {/* Result */}
                    <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '6px', border: '1px solid #0284C7', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Score Calculado do Cliente:</div>
                      <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: scoreSimCalculado >= 70 ? '#008764' : scoreSimCalculado >= 50 ? '#D97706' : '#DC2626' }}>
                        {scoreSimCalculado}/100
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '2px' }}>
                        {scoreSimCalculado >= 85 ? '🟢 Cliente Muito Ativo' : scoreSimCalculado >= 70 ? '🟢 Cliente Ativo' : scoreSimCalculado >= 50 ? '🟡 Atenção / Contato' : '🔴 Alto Risco de Perda'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: GUIA RÁPIDO DE ROTINAS */}
              {activeTab === 'rotinas' && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Routine 1 */}
                    <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '4px' }}>
                        1. Como Elaborar um Orçamento Comercial
                      </div>
                      <div style={{ color: '#64748B', fontSize: '0.75rem', lineHeight: '1.4' }}>
                        1. Clique em <strong>+ Novo Orçamento</strong> no topo ou Dashboard.<br />
                        2. Selecione o <strong>Fornecedor Representado</strong> e o <strong>Cliente</strong>.<br />
                        3. Adicione os itens com quantidade e preço.<br />
                        4. Escolha a <strong>Condição de Pagamento</strong> e clique em Salvar.
                      </div>
                    </div>

                    {/* Routine 2 */}
                    <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '4px' }}>
                        2. Como Gerar o PDF Oficial da Proposta
                      </div>
                      <div style={{ color: '#64748B', fontSize: '0.75rem', lineHeight: '1.4' }}>
                        Vá em <strong>Orçamentos</strong> e clique no ícone vermelho de documento PDF na coluna <strong>Ações</strong>. O sistema abre a folha timbrada completa com logotipo e botão de impressão direta.
                      </div>
                    </div>

                    {/* Routine 3 */}
                    <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '4px' }}>
                        3. Como Cadastrar Condições com Prazos (ex: 28/42/56dd)
                      </div>
                      <div style={{ color: '#64748B', fontSize: '0.75rem', lineHeight: '1.4' }}>
                        No menu <strong>Cadastros &gt; Condições de Pagamento</strong>, cadastre o nome e no campo <em>Intervalo de Dias</em> digite os prazos separados por vírgula (ex: \`28, 42, 56\`).
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};
