// Lafitec ERP Data Storage & Multi-tenant Data Engine
// Single Unified Commercial Partner Architecture & Field Sales Visitas Engine + Stock Receiving (Entradas de Estoque & Rastreabilidade)
import { supabaseService } from './supabaseService';

const STORAGE_KEYS = {
  EMPRESAS: 'lafitec_empresas',
  USUARIOS: 'lafitec_usuarios',
  PARCEIROS: 'lafitec_parceiros_unificados',
  CLIENTES: 'lafitec_clientes', 
  TRANSPORTADORAS: 'lafitec_transportadoras',
  FORNECEDORES: 'lafitec_fornecedores',
  PRODUTOS: 'lafitec_produtos',
  ORCAMENTOS: 'lafitec_orcamentos',
  ITENS_ORCAMENTO: 'lafitec_itens_orcamento',
  CONDICOES_PAGAMENTO: 'lafitec_condicoes_pagamento',
  VENDAS: 'lafitec_vendas',
  ITENS_VENDA: 'lafitec_itens_venda',
  FINANCEIRO: 'lafitec_financeiro',
  VISITAS: 'lafitec_visitas',
  ENTRADAS_ESTOQUE: 'lafitec_entradas_estoque', // Módulo de Entrada de Estoque
  MOVIMENTACOES_ESTOQUE: 'lafitec_movimentacoes_estoque', // Histórico de Movimentações
  AUDIT_LOGS: 'lafitec_audit_logs',
  CURRENT_USER: 'lafitec_current_user'
};

export const seedInitialData = () => {
  // Se o Supabase estiver configurado com chaves reais, não insere dados fictícios
  if (supabaseService.isConfigured()) {
    return;
  }

  if (!localStorage.getItem(STORAGE_KEYS.EMPRESAS)) {
    const defaultEmpresas = [
      {
        id: 'emp-1',
        nome: 'Lafite Tech Soluções LTDA',
        cnpj: '12.345.678/0001-90',
        plano: 'Premium',
        createdAt: '2026-01-15T09:00:00.000Z'
      },
      {
        id: 'emp-2',
        nome: 'Mercado Lima Comércio LTDA',
        cnpj: '98.765.432/0001-10',
        plano: 'Pro',
        createdAt: '2026-02-10T14:30:00.000Z'
      }
    ];

    const defaultUsuarios = [
      {
        id: 'usr-1',
        nome: 'Lafite Admin',
        email: 'admin@lafite.com',
        senha: '123',
        tipo: 'Admin',
        empresaId: 'emp-1'
      },
      {
        id: 'usr-2',
        nome: 'Carlos Vendedor',
        email: 'carlos@lafite.com',
        senha: '123',
        tipo: 'Funcionario',
        empresaId: 'emp-1'
      },
      {
        id: 'usr-3',
        nome: 'Mariana Lima (Gestora)',
        email: 'mariana@mercadolima.com',
        senha: '123',
        tipo: 'Admin',
        empresaId: 'emp-2'
      }
    ];

    localStorage.setItem(STORAGE_KEYS.EMPRESAS, JSON.stringify(defaultEmpresas));
    localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(defaultUsuarios));
  }

  // Seed or Migrate Parceiros into Unified Table
  if (!localStorage.getItem(STORAGE_KEYS.PARCEIROS)) {
    const defaultParceiros = [
      {
        id: 'cli-101',
        codigo: 'CLI-001',
        tipo: 'Clientes',
        nome: 'TechCorp Brasil S.A.',
        fantasia: 'TechCorp',
        cpfCnpj: '45.112.334/0001-88',
        ieRg: '110.456.789.111',
        suframa: '2001928',
        telefone: '(11) 98765-4321',
        email: 'contato@techcorp.com.br',
        sitePage: 'www.techcorp.com.br',
        emailXmlNfe: 'nfe@techcorp.com.br',
        transportadoraId: 'trans-101',
        ramoAtividade: 'Tecnologia da Informação',
        cep: '01310-100',
        endereco: 'Av. Paulista, 1000',
        numero: '1000',
        complemento: 'Conjunto 501',
        bairro: 'Bela Vista',
        cidade: 'São Paulo - SP',
        regiao: 'Sudeste',
        setor: 'Corporativo',
        frequenciaVisitaDias: 30,
        ultimaVisitaData: '2026-08-01',
        prioridadeEstrelas: 5,
        contatos: [
          { id: 'ct-1', nome: 'Ricardo Mendes', email: 'ricardo@techcorp.com', telefone: '(11) 9988-7766', dataNasc: '1985-04-12', setor: 'Compras', obs: 'Contato principal', enviaEmail: 'Sim' }
        ],
        obsPedido: 'Entregar em horário comercial.',
        obsAviso: 'Cliente VIP.',
        statusAtivacao: 'Ativo',
        limiteCredito: 50000.00,
        vendedorResponsavel: 'Carlos Vendedor',
        empresaId: 'emp-1'
      },
      {
        id: 'cli-102',
        codigo: 'CLI-002',
        tipo: 'Clientes',
        nome: 'Supermercado ABC LTDA',
        fantasia: 'Supermercado ABC',
        cpfCnpj: '12.345.678/0001-00',
        telefone: '(11) 3344-5566',
        email: 'compras@superabc.com.br',
        cep: '04571-010',
        endereco: 'Av. Engenheiro Luís Carlos Berrini, 500',
        cidade: 'São Paulo - SP',
        frequenciaVisitaDias: 15,
        ultimaVisitaData: '2026-07-20',
        prioridadeEstrelas: 4,
        statusAtivacao: 'Ativo',
        limiteCredito: 25000.00,
        vendedorResponsavel: 'Carlos Vendedor',
        empresaId: 'emp-1'
      },
      {
        id: 'cli-103',
        codigo: 'CLI-003',
        tipo: 'Clientes',
        nome: 'Ana Beatriz Souza',
        fantasia: 'Ana Souza',
        cpfCnpj: '123.456.789-00',
        telefone: '(21) 99887-1122',
        email: 'ana.souza@gmail.com',
        cep: '22041-001',
        endereco: 'Rua Barata Ribeiro, 250',
        cidade: 'Rio de Janeiro - RJ',
        frequenciaVisitaDias: 60,
        ultimaVisitaData: '2026-05-10',
        prioridadeEstrelas: 2,
        statusAtivacao: 'Ativo',
        vendedorResponsavel: 'Carlos Vendedor',
        empresaId: 'emp-1'
      },
      {
        id: 'forn-101',
        codigo: 'FORN-101',
        tipo: 'Fornecedores',
        nome: 'Dell Computadores do Brasil',
        fantasia: 'Dell Brasil',
        cpfCnpj: '72.381.189/0001-10',
        email: 'vendas.corp@dell.com',
        telefone: '(11) 4004-0100',
        categoria: 'Hardware & TI',
        cidade: 'São Paulo - SP',
        statusAtivacao: 'Ativo',
        empresaId: 'emp-1'
      },
      {
        id: 'forn-102',
        codigo: 'FORN-102',
        tipo: 'Fornecedores',
        nome: 'Bienz Indústria E Comércio Em Borrachas Ltda',
        fantasia: 'Bienz Borrachas',
        cpfCnpj: '12.987.654/0001-33',
        email: 'contato@bienzborrachas.com.br',
        telefone: '(11) 4588-9000',
        categoria: 'Industrial & Borrachas',
        cidade: 'São Paulo - SP',
        statusAtivacao: 'Ativo',
        empresaId: 'emp-1'
      },
      {
        id: 'trans-101',
        codigo: 'TR-101',
        tipo: 'Transportadoras',
        nome: 'Express Logística & Cargas',
        fantasia: 'Express Log',
        cpfCnpj: '11.222.333/0001-44',
        email: 'atendimento@expresslog.com',
        telefone: '(11) 3344-9900',
        cidade: 'São Paulo - SP',
        statusAtivacao: 'Ativo',
        empresaId: 'emp-1'
      }
    ];

    localStorage.setItem(STORAGE_KEYS.PARCEIROS, JSON.stringify(defaultParceiros));
  }

  // Seed Default Visitas
  if (!localStorage.getItem(STORAGE_KEYS.VISITAS)) {
    const defaultVisitas = [
      {
        id: 'vis-101',
        codigo: 'VIS-001',
        clienteId: 'cli-101',
        clienteNome: 'TechCorp Brasil S.A.',
        cidade: 'São Paulo - SP',
        endereco: 'Av. Paulista, 1000',
        representanteNome: 'Carlos Vendedor',
        dataHoraProgramada: '2026-08-04T10:00',
        dataHoraInicio: '2026-08-04T10:05',
        dataHoraTermino: '',
        status: 'Em andamento',
        objetivo: 'Apresentação da nova linha de servidores ERP Cloud e negociação anual.',
        observacoes: 'Cliente interessado no módulo de rotas.',
        distanciaKm: 4.2,
        prioridadeEstrelas: 5,
        gpsCheckIn: '-23.561414, -46.655881',
        empresaId: 'emp-1'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.VISITAS, JSON.stringify(defaultVisitas));
  }

  if (!localStorage.getItem(STORAGE_KEYS.PRODUTOS)) {
    const defaultProdutos = [
      {
        id: 'prod-101',
        codigo: 'PROD-001',
        nome: 'Licença ERP Cloud Anual',
        ncm: '8523.49.90',
        cest: '28.038.00',
        referencia: 'REF-ERP-01',
        codBarra: '7891234567890',
        comissao: 5.0,
        vendedorComissao: 3.0,
        ipi: 0.0,
        st: 0.0,
        fornecedorId: 'forn-101',
        unidade: 'Unidade',
        grupo: 'Software',
        subGrupo: 'SaaS',
        cores: 'Azul, Verde',
        tamanhos: 'Único',
        alertaMessage: 'Licença anual renovável.',
        preco: 1490.00,
        precoAtacado: 1290.00,
        pesoLiquido: 0.100,
        pesoBruto: 0.150,
        qtdMinima: 1,
        qtdMultipla: 1,
        comp: 10.0,
        larg: 10.0,
        altu: 5.0,
        qtdVolumes: 1,
        cubagem: 0.0005,
        fichaTecnica: '',
        estoque: 45,
        controlaLote: true,
        estoqueMinimo: 5,
        estoqueMaximo: 100,
        precoCompra: 800.00,
        pctImpostos: 10.0,
        pctDespesas: 5.0,
        pctFrete: 0.0,
        rsFrete: 0.0,
        precoCusto: 920.00,
        pctMargem: 61.95,
        aplicacao: 'Sistemas corporativos de gestão ERP.',
        kitItens: [],
        materiaPrima: [],
        ultimaDataEntrada: '2026-08-01T10:00:00.000Z',
        empresaId: 'emp-1'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(defaultProdutos));
  }

  // Seed Default Entradas de Estoque
  if (!localStorage.getItem(STORAGE_KEYS.ENTRADAS_ESTOQUE)) {
    const defaultEntradas = [
      {
        id: 'ent-101',
        numeroMovimentacao: 'ENT-001',
        dataHora: '2026-08-01T10:00:00.000Z',
        usuarioResponsavel: 'Lafite Admin',
        tipoEntrada: 'Compra de fornecedor',
        motivo: 'Abastecimento inicial de estoque',
        fornecedorId: 'forn-101',
        fornecedorNome: 'Dell Computadores do Brasil',
        numeroNotaFiscal: 'NF-99881',
        serieNotaFiscal: '1',
        observacoes: 'Recebimento conferido com sucesso.',
        status: 'Concluida', // Concluida, Estornada
        valorTotalNota: 40000.00,
        itens: [
          {
            produtoId: 'prod-101',
            produtoNome: 'Licença ERP Cloud Anual',
            codigoInterno: 'PROD-001',
            quantidade: 50,
            unidade: 'Unidade',
            valorUnitario: 800.00,
            valorTotal: 40000.00,
            lote: 'LOT-2026-A',
            dataFabricacao: '2026-07-01',
            dataValidade: '2027-07-01'
          }
        ],
        empresaId: 'emp-1'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.ENTRADAS_ESTOQUE, JSON.stringify(defaultEntradas));
  }

  // Seed Default Movimentações de Estoque
  if (!localStorage.getItem(STORAGE_KEYS.MOVIMENTACOES_ESTOQUE)) {
    const defaultMovs = [
      {
        id: 'mov-101',
        entradaId: 'ent-101',
        numeroMovimentacao: 'ENT-001',
        dataHora: '2026-08-01T10:00:00.000Z',
        tipoMovimentacao: 'Entrada (Compra de fornecedor)',
        produtoId: 'prod-101',
        produtoNome: 'Licença ERP Cloud Anual',
        quantidade: 50,
        origem: 'Dell Computadores do Brasil',
        destino: 'Estoque Central',
        usuarioResponsavel: 'Lafite Admin',
        observacoes: 'Entrada Nota Fiscal #NF-99881',
        empresaId: 'emp-1'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.MOVIMENTACOES_ESTOQUE, JSON.stringify(defaultMovs));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ORCAMENTOS)) {
    const defaultOrcamentos = [
      {
        id: 'orc-101',
        empresaId: 'emp-1',
        numero: 'ORC-001',
        clienteId: 'cli-101',
        fornecedorId: 'forn-101',
        status: 'Aprovado',
        total: 2980.00,
        dataCriacao: '2026-08-10T09:00:00.000Z',
        dataEnvio: '2026-08-10T09:15:00.000Z',
        formaEnvio: 'WhatsApp',
        dataValidade: '2026-09-10',
        dataAprovacao: '2026-08-12T14:30:00.000Z',
        observacoes: 'Orçamento para aquisição de 2 licenças ERP adicionais com suporte anual.',
        vendedorResponsavel: 'Lafite Admin',
        vendaId: null
      },
      {
        id: 'orc-102',
        empresaId: 'emp-1',
        numero: 'ORC-002',
        clienteId: 'cli-101',
        fornecedorId: 'forn-101',
        status: 'Rascunho',
        total: 1490.00,
        dataCriacao: '2026-08-16T15:00:00.000Z',
        dataEnvio: '',
        formaEnvio: '',
        dataValidade: '2026-09-15',
        dataAprovacao: '',
        observacoes: 'Aguardando validação do departamento técnico para envio.',
        vendedorResponsavel: 'Lafite Admin',
        vendaId: null
      }
    ];
    localStorage.setItem(STORAGE_KEYS.ORCAMENTOS, JSON.stringify(defaultOrcamentos));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ITENS_ORCAMENTO)) {
    const defaultItensOrcamento = [
      { id: 'it-orc-1', orcamentoId: 'orc-101', produtoId: 'prod-101', quantidade: 2, precoUnitario: 1490.00 },
      { id: 'it-orc-2', orcamentoId: 'orc-102', produtoId: 'prod-101', quantidade: 1, precoUnitario: 1490.00 }
    ];
    localStorage.setItem(STORAGE_KEYS.ITENS_ORCAMENTO, JSON.stringify(defaultItensOrcamento));
  }

  if (!localStorage.getItem(STORAGE_KEYS.CONDICOES_PAGAMENTO)) {
    const defaultCondicoes = [
      {
        id: 'cpg-101',
        empresaId: 'emp-1',
        descricao: 'À Vista (PIX / Dinheiro)',
        intervaloDias: '0',
        parcelasCount: 1,
        percentualCustoFinanceiro: 0.0,
        custoFinanceiroFixo: 0.0,
        ordem: 1,
        imprimeNoPedido: true,
        ativo: true
      },
      {
        id: 'cpg-102',
        empresaId: 'emp-1',
        descricao: 'Boleto Bancário 28 Dias',
        intervaloDias: '28',
        parcelasCount: 1,
        percentualCustoFinanceiro: 0.0,
        custoFinanceiroFixo: 3.50,
        ordem: 2,
        imprimeNoPedido: true,
        ativo: true
      },
      {
        id: 'cpg-103',
        empresaId: 'emp-1',
        descricao: 'Boleto Bancário 30 Dias',
        intervaloDias: '30',
        parcelasCount: 1,
        percentualCustoFinanceiro: 0.0,
        custoFinanceiroFixo: 3.50,
        ordem: 3,
        imprimeNoPedido: true,
        ativo: true
      },
      {
        id: 'cpg-104',
        empresaId: 'emp-1',
        descricao: '30 / 60 Dias (2x)',
        intervaloDias: '30, 60',
        parcelasCount: 2,
        percentualCustoFinanceiro: 1.5,
        custoFinanceiroFixo: 0.0,
        ordem: 4,
        imprimeNoPedido: true,
        ativo: true
      },
      {
        id: 'cpg-105',
        empresaId: 'emp-1',
        descricao: '30 / 60 / 90 Dias (3x)',
        intervaloDias: '30, 60, 90',
        parcelasCount: 3,
        percentualCustoFinanceiro: 2.5,
        custoFinanceiroFixo: 0.0,
        ordem: 5,
        imprimeNoPedido: true,
        ativo: true
      },
      {
        id: 'cpg-106',
        empresaId: 'emp-1',
        descricao: 'Cartão de Crédito 1x',
        intervaloDias: '30',
        parcelasCount: 1,
        percentualCustoFinanceiro: 2.99,
        custoFinanceiroFixo: 0.0,
        ordem: 6,
        imprimeNoPedido: true,
        ativo: true
      }
    ];
    localStorage.setItem(STORAGE_KEYS.CONDICOES_PAGAMENTO, JSON.stringify(defaultCondicoes));
  }

  if (!localStorage.getItem(STORAGE_KEYS.VENDAS)) {
    const defaultVendas = [
      { id: 'ven-101', clienteId: 'cli-101', total: 5290.00, dataVenda: '2026-08-01T10:30:00.000Z', empresaId: 'emp-1', itensCount: 2 }
    ];
    localStorage.setItem(STORAGE_KEYS.VENDAS, JSON.stringify(defaultVendas));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ITENS_VENDA)) {
    const defaultItensVenda = [
      { id: 'it-1', vendaId: 'ven-101', produtoId: 'prod-101', quantidade: 5, precoUnitario: 1490.00 }
    ];
    localStorage.setItem(STORAGE_KEYS.ITENS_VENDA, JSON.stringify(defaultItensVenda));
  }

  if (!localStorage.getItem(STORAGE_KEYS.FINANCEIRO)) {
    const defaultFinanceiro = [
      { id: 'fin-101', descricao: 'Venda de Licença TechCorp (ven-101)', tipo: 'Receber', valor: 5290.00, status: 'Pago', dataVencimento: '2026-08-01', empresaId: 'emp-1' }
    ];
    localStorage.setItem(STORAGE_KEYS.FINANCEIRO, JSON.stringify(defaultFinanceiro));
  }

  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    const defaultAuditLogs = [
      { id: 'log-1', empresaId: 'emp-1', usuarioNome: 'Lafite Admin', acao: 'Login realizado com sucesso', data: '2026-08-04T14:10:00.000Z' }
    ];
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(defaultAuditLogs));
  }
};

const getTable = (key) => {
  seedInitialData();
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
};

const setTable = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- CÁLCULO INTELIGENTE DO ÍNDICE DE RELACIONAMENTO DO CLIENTE (0 a 100) ---
export const calculateIndiceRelacionamento = (cliente, vendas = [], visitas = []) => {
  let score = 50;

  const vendasCliente = vendas.filter(v => v.clienteId === cliente.id);
  const totalGasto = vendasCliente.reduce((acc, v) => acc + (v.total || 0), 0);
  const qtdPedidos = vendasCliente.length;

  if (qtdPedidos > 0) score += Math.min(qtdPedidos * 4, 15);
  if (totalGasto > 10000) score += 15;
  else if (totalGasto > 3000) score += 10;
  else if (totalGasto > 0) score += 5;

  const estrelas = cliente.prioridadeEstrelas || 3;
  score += (estrelas - 3) * 4;

  const freqConfig = parseInt(cliente.frequenciaVisitaDias) || 30;
  if (cliente.ultimaVisitaData) {
    const uData = new Date(cliente.ultimaVisitaData);
    const hoje = new Date();
    const diffDias = Math.ceil((hoje - uData) / (1000 * 60 * 60 * 24));

    if (diffDias <= freqConfig) {
      score += 15;
    } else {
      const atrasoDias = diffDias - freqConfig;
      if (atrasoDias > 60) score -= 30;
      else if (atrasoDias > 30) score -= 20;
      else score -= 10;
    }
  } else {
    score -= 15;
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  let statusText = 'Atenção';
  let badgeClass = 'badge-warning';
  let color = '#F59E0B';
  let emoji = '🟡';

  if (finalScore >= 85) {
    statusText = 'Cliente Muito Ativo';
    badgeClass = 'badge-success';
    color = '#10B981';
    emoji = '🟢';
  } else if (finalScore >= 70) {
    statusText = 'Cliente Ativo';
    badgeClass = 'badge-accent';
    color = '#00C896';
    emoji = '🟢';
  } else if (finalScore >= 50) {
    statusText = 'Atenção';
    badgeClass = 'badge-warning';
    color = '#F59E0B';
    emoji = '🟡';
  } else {
    statusText = 'Alto Risco de Perda';
    badgeClass = 'badge-danger';
    color = '#EF4444';
    emoji = '🔴';
  }

  return {
    score: finalScore,
    statusText,
    badgeClass,
    color,
    emoji
  };
};

export const logAuditAction = (empresaId, usuarioNome, acao) => {
  const logs = getTable(STORAGE_KEYS.AUDIT_LOGS);
  const newLog = {
    id: 'log-' + Date.now(),
    empresaId,
    usuarioNome,
    acao,
    data: new Date().toISOString()
  };
  setTable(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs]);
};

export const storage = {
  login: (email, senha) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanSenha = (senha || '').toString().trim();

    // Suporte direto e garantido ao Master Thiago Lafite
    if (cleanEmail === 'thiago_lafite@hotmail.com' && cleanSenha === '123') {
      const session = {
        user: {
          id: 'b9e8e3b8-72e6-4841-9a30-dd2a6ed6ba64',
          nome: 'Thiago Lafite',
          email: 'thiago_lafite@hotmail.com',
          tipo: 'Master',
          empresaId: '80285958-6d61-4784-b0af-89fb3c99b401'
        },
        empresa: {
          id: '80285958-6d61-4784-b0af-89fb3c99b401',
          nome: 'lafitelimateste',
          cnpj: '00000000',
          plano: 'Premium'
        }
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session));
      return session;
    }

    const usuarios = getTable(STORAGE_KEYS.USUARIOS);
    const user = usuarios.find(u => u.email.toLowerCase() === cleanEmail && (!u.senha || u.senha.toString().trim() === cleanSenha));
    if (!user) return null;

    const empresas = getTable(STORAGE_KEYS.EMPRESAS);
    const empresa = empresas.find(e => e.id === user.empresaId) || {
      id: user.empresaId || 'emp-1',
      nome: 'Minha Empresa',
      cnpj: '00000000',
      plano: 'Premium'
    };

    const session = { user, empresa };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session));
    logAuditAction(user.empresaId, user.nome, 'Login efetuado no sistema');
    return session;
  },

  getCurrentSession: () => {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  },

  saveCurrentSession: (session) => {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session));
    }
  },

  logout: () => {
    const session = storage.getCurrentSession();
    if (session) {
      logAuditAction(session.user.empresaId, session.user.nome, 'Logout efetuado');
    }
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  registerEmpresa: ({ nomeEmpresa, cnpj, nomeAdmin, email, senha, plano }) => {
    const empresas = getTable(STORAGE_KEYS.EMPRESAS);
    const usuarios = getTable(STORAGE_KEYS.USUARIOS);

    if (usuarios.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Este e-mail já está cadastrado no sistema.');
    }

    const novaEmpresaId = 'emp-' + Date.now();
    const novaEmpresa = {
      id: novaEmpresaId,
      nome: nomeEmpresa,
      cnpj,
      plano: plano || 'Free',
      createdAt: new Date().toISOString()
    };

    const novoUsuario = {
      id: 'usr-' + Date.now(),
      nome: nomeAdmin,
      email,
      senha,
      tipo: 'Admin',
      empresaId: novaEmpresaId
    };

    setTable(STORAGE_KEYS.EMPRESAS, [...empresas, novaEmpresa]);
    setTable(STORAGE_KEYS.USUARIOS, [...usuarios, novoUsuario]);

    logAuditAction(novaEmpresaId, nomeAdmin, `Nova empresa ${nomeEmpresa} criada no plano ${plano}`);

    return { user: novoUsuario, empresa: novaEmpresa };
  },

  getAllEmpresas: () => getTable(STORAGE_KEYS.EMPRESAS),

  // --- UNIFIED PARCEIROS COMMERCIAL ENGINE ---
  getAllParceiros: (empresaId) => {
    const parceiros = getTable(STORAGE_KEYS.PARCEIROS);
    return parceiros.filter(p => p.empresaId === empresaId);
  },

  saveParceiroComercial: (parceiroData, empresaId, usuarioNome) => {
    const parceiros = getTable(STORAGE_KEYS.PARCEIROS);
    const targetTipo = parceiroData.tipo || 'Clientes';

    let savedItem;
    if (parceiroData.id) {
      const exists = parceiros.some(p => p.id === parceiroData.id);
      if (exists) {
        const updatedList = parceiros.map(p => {
          if (p.id === parceiroData.id && p.empresaId === empresaId) {
            return {
              ...p,
              ...parceiroData,
              tipo: targetTipo,
              cpfCnpj: parceiroData.cpfCnpj || parceiroData.cnpj || p.cpfCnpj
            };
          }
          return p;
        });
        setTable(STORAGE_KEYS.PARCEIROS, updatedList);
        savedItem = { ...parceiroData, tipo: targetTipo };
      } else {
        const newItem = {
          ...parceiroData,
          id: parceiroData.id,
          tipo: targetTipo,
          cpfCnpj: parceiroData.cpfCnpj || parceiroData.cnpj,
          empresaId
        };
        setTable(STORAGE_KEYS.PARCEIROS, [...parceiros, newItem]);
        savedItem = newItem;
      }
    } else {
      const prefix = targetTipo === 'Fornecedores' ? 'forn-' : targetTipo === 'Transportadoras' ? 'trans-' : 'cli-';
      const newItem = {
        ...parceiroData,
        id: prefix + Date.now(),
        codigo: parceiroData.codigo || (targetTipo.substring(0, 3).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900)),
        tipo: targetTipo,
        cpfCnpj: parceiroData.cpfCnpj || parceiroData.cnpj,
        statusAtivacao: parceiroData.statusAtivacao || 'Ativo',
        empresaId
      };
      setTable(STORAGE_KEYS.PARCEIROS, [...parceiros, newItem]);
      savedItem = newItem;
    }

    logAuditAction(empresaId, usuarioNome, `Salvou parceiro comercial "${parceiroData.nome}" do tipo ${targetTipo}`);

    if (supabaseService.isConfigured() && savedItem) {
      supabaseService.saveParceiro(savedItem, empresaId, usuarioNome).catch(e => console.warn('Supabase sync parceiro error:', e));
    }

    return targetTipo;
  },

  getClientes: (empresaId) => {
    const parceiros = storage.getAllParceiros(empresaId);
    return parceiros.filter(p => p.tipo === 'Clientes' || p.tipo === 'Prospect' || p.tipo === 'Parceiro');
  },

  saveCliente: (cliente, empresaId, usuarioNome) => {
    return storage.saveParceiroComercial({ ...cliente, tipo: cliente.tipo || 'Clientes' }, empresaId, usuarioNome);
  },

  deleteCliente: (id, empresaId, usuarioNome) => {
    const parceiros = getTable(STORAGE_KEYS.PARCEIROS);
    const item = parceiros.find(p => p.id === id && p.empresaId === empresaId);
    if (item) {
      setTable(STORAGE_KEYS.PARCEIROS, parceiros.filter(p => p.id !== id));
      logAuditAction(empresaId, usuarioNome, `Excluiu parceiro comercial: ${item.nome}`);

      if (supabaseService.isConfigured()) {
        supabaseService.deleteParceiro(id, empresaId, usuarioNome).catch(e => console.warn('Supabase delete parceiro error:', e));
      }
    }
  },

  getFornecedores: (empresaId) => {
    const parceiros = storage.getAllParceiros(empresaId);
    return parceiros.filter(p => p.tipo === 'Fornecedores');
  },

  saveFornecedor: (forn, empresaId, usuarioNome) => {
    return storage.saveParceiroComercial({ ...forn, tipo: 'Fornecedores' }, empresaId, usuarioNome);
  },

  deleteFornecedor: (id, empresaId, usuarioNome) => {
    storage.deleteCliente(id, empresaId, usuarioNome);
  },

  getTransportadoras: (empresaId) => {
    const parceiros = storage.getAllParceiros(empresaId);
    return parceiros.filter(p => p.tipo === 'Transportadoras');
  },

  saveTransportadora: (trans, empresaId, usuarioNome) => {
    return storage.saveParceiroComercial({ ...trans, tipo: 'Transportadoras' }, empresaId, usuarioNome);
  },

  deleteTransportadora: (id, empresaId, usuarioNome) => {
    storage.deleteCliente(id, empresaId, usuarioNome);
  },

  // --- MÓDULO DE ENTRADAS DE ESTOQUE & RASTREABILIDADE ---
  getEntradasEstoque: (empresaId) => {
    return getTable(STORAGE_KEYS.ENTRADAS_ESTOQUE)
      .filter(e => e.empresaId === empresaId)
      .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
  },

  getMovimentacoesEstoque: (empresaId) => {
    return getTable(STORAGE_KEYS.MOVIMENTACOES_ESTOQUE)
      .filter(m => m.empresaId === empresaId)
      .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
  },

  saveEntradaEstoque: (entradaData, empresaId, usuarioNome) => {
    const entradas = getTable(STORAGE_KEYS.ENTRADAS_ESTOQUE);
    const movimentacoes = getTable(STORAGE_KEYS.MOVIMENTACOES_ESTOQUE);
    const produtos = getTable(STORAGE_KEYS.PRODUTOS);
    const fornecedores = storage.getFornecedores(empresaId);

    const fornObj = fornecedores.find(f => f.id === entradaData.fornecedorId);
    const fornecedorNome = fornObj ? fornObj.nome : (entradaData.fornecedorNome || 'N/A');

    const entradaId = 'ent-' + Date.now();
    const numeroMov = 'ENT-' + Math.floor(100 + Math.random() * 900);
    const dataHoraNow = new Date().toISOString();

    let valorTotalNota = 0;
    const novasMovimentacoes = [];

    // Update Product Stock and Cost Prices
    const produtosAtualizados = produtos.map(prod => {
      const itemEntrada = entradaData.itens.find(i => i.produtoId === prod.id && prod.empresaId === empresaId);
      if (itemEntrada) {
        const qtdAdicionada = parseFloat(itemEntrada.quantidade) || 0;
        const valorUnit = parseFloat(itemEntrada.valorUnitario) || prod.precoCompra;
        const novoEstoque = (parseFloat(prod.estoque) || 0) + qtdAdicionada;
        valorTotalNota += (qtdAdicionada * valorUnit);

        // Record stock movement trace
        novasMovimentacoes.push({
          id: 'mov-' + Math.random().toString(36).substring(2, 9),
          entradaId,
          numeroMovimentacao: numeroMov,
          dataHora: dataHoraNow,
          tipoMovimentacao: `Entrada (${entradaData.tipoEntrada})`,
          produtoId: prod.id,
          produtoNome: prod.nome,
          quantidade: qtdAdicionada,
          origem: fornecedorNome,
          destino: 'Estoque Central',
          usuarioResponsavel: usuarioNome,
          lote: itemEntrada.lote || 'N/A',
          dataValidade: itemEntrada.dataValidade || '',
          observacoes: entradaData.observacoes || `Entrada Nota Fiscal #${entradaData.numeroNotaFiscal || 'S/N'}`
        });

        return {
          ...prod,
          estoque: novoEstoque,
          ultimaDataEntrada: dataHoraNow,
          precoCompra: valorUnit,
          precoCusto: valorUnit * 1.10 // Custo médio estimado com impostos
        };
      }
      return prod;
    });

    const novaEntrada = {
      ...entradaData,
      id: entradaId,
      numeroMovimentacao: numeroMov,
      dataHora: dataHoraNow,
      usuarioResponsavel: usuarioNome,
      fornecedorNome,
      status: 'Concluida',
      valorTotalNota,
      empresaId
    };

    setTable(STORAGE_KEYS.PRODUTOS, produtosAtualizados);
    setTable(STORAGE_KEYS.ENTRADAS_ESTOQUE, [novaEntrada, ...entradas]);
    setTable(STORAGE_KEYS.MOVIMENTACOES_ESTOQUE, [...novasMovimentacoes, ...movimentacoes]);

    logAuditAction(empresaId, usuarioNome, `Registrou entrada de estoque #${numeroMov} (${entradaData.tipoEntrada}) no valor de R$ ${valorTotalNota.toFixed(2)}`);

    return novaEntrada;
  },

  // ESTORNO SEGURO DE ENTRADA (Preserva histórico para Auditoria)
  estornarEntradaEstoque: (entradaId, motivoEstorno, empresaId, usuarioNome) => {
    const entradas = getTable(STORAGE_KEYS.ENTRADAS_ESTOQUE);
    const entradaTarget = entradas.find(e => e.id === entradaId && e.empresaId === empresaId);

    if (!entradaTarget) throw new Error('Entrada de estoque não localizada.');
    if (entradaTarget.status === 'Estornada') throw new Error('Esta entrada já foi estornada anteriormente.');

    const produtos = getTable(STORAGE_KEYS.PRODUTOS);
    const movimentacoes = getTable(STORAGE_KEYS.MOVIMENTACOES_ESTOQUE);
    const dataHoraNow = new Date().toISOString();

    const novasMovimentacoes = [];

    // Revert Stock quantities
    const produtosAtualizados = produtos.map(prod => {
      const itemEstornado = entradaTarget.itens.find(i => i.produtoId === prod.id && prod.empresaId === empresaId);
      if (itemEstornado) {
        const qtdRemovida = parseFloat(itemEstornado.quantidade) || 0;
        const novoEstoque = Math.max(0, (parseFloat(prod.estoque) || 0) - qtdRemovida);

        novasMovimentacoes.push({
          id: 'mov-' + Math.random().toString(36).substring(2, 9),
          entradaId: entradaTarget.id,
          numeroMovimentacao: `EST-${entradaTarget.numeroMovimentacao}`,
          dataHora: dataHoraNow,
          tipoMovimentacao: 'ESTORNO DE ENTRADA',
          produtoId: prod.id,
          produtoNome: prod.nome,
          quantidade: -qtdRemovida,
          origem: 'Estoque Central',
          destino: `Estorno (${entradaTarget.fornecedorNome})`,
          usuarioResponsavel: usuarioNome,
          observacoes: `Estorno realizado. Motivo: ${motivoEstorno}`
        });

        return { ...prod, estoque: novoEstoque };
      }
      return prod;
    });

    const entradasAtualizadas = entradas.map(e => {
      if (e.id === entradaId && e.empresaId === empresaId) {
        return {
          ...e,
          status: 'Estornada',
          motivoEstorno,
          dataHoraEstorno: dataHoraNow,
          usuarioEstorno: usuarioNome
        };
      }
      return e;
    });

    setTable(STORAGE_KEYS.PRODUTOS, produtosAtualizados);
    setTable(STORAGE_KEYS.ENTRADAS_ESTOQUE, entradasAtualizadas);
    setTable(STORAGE_KEYS.MOVIMENTACOES_ESTOQUE, [...novasMovimentacoes, ...movimentacoes]);

    logAuditAction(empresaId, usuarioNome, `Realizou ESTORNO da Entrada #${entradaTarget.numeroMovimentacao}. Motivo: ${motivoEstorno}`);
  },

  // --- MÓDULO DE VISITAS & ROTAS ---
  getVisitas: (empresaId) => {
    const visitas = getTable(STORAGE_KEYS.VISITAS).filter(v => v.empresaId === empresaId);
    const parceiros = storage.getAllParceiros(empresaId);

    return visitas.map(v => {
      const cli = parceiros.find(p => p.id === v.clienteId);
      return {
        ...v,
        clienteNome: cli ? cli.nome : v.clienteNome || 'Cliente não identificado',
        cidade: cli ? cli.cidade : v.cidade || 'Cidade N/D',
        endereco: cli ? `${cli.endereco || ''}, ${cli.numero || ''} ${cli.bairro ? '- ' + cli.bairro : ''}` : v.endereco || '',
        prioridadeEstrelas: cli?.prioridadeEstrelas || v.prioridadeEstrelas || 3
      };
    }).sort((a, b) => new Date(a.dataHoraProgramada) - new Date(b.dataHoraProgramada));
  },

  saveVisita: (visitaData, empresaId, usuarioNome) => {
    const visitas = getTable(STORAGE_KEYS.VISITAS);
    const parceiros = storage.getAllParceiros(empresaId);
    const cli = parceiros.find(p => p.id === visitaData.clienteId);

    if (visitaData.id) {
      const updated = visitas.map(v => (v.id === visitaData.id && v.empresaId === empresaId) ? { ...v, ...visitaData } : v);
      setTable(STORAGE_KEYS.VISITAS, updated);
      logAuditAction(empresaId, usuarioNome, `Atualizou visita para "${cli ? cli.nome : 'Cliente'}"`);
    } else {
      const newVisita = {
        ...visitaData,
        id: 'vis-' + Date.now(),
        codigo: 'VIS-' + Math.floor(100 + Math.random() * 900),
        status: visitaData.status || 'Agendada',
        clienteNome: cli ? cli.nome : 'Cliente',
        cidade: cli ? cli.cidade : '',
        representanteNome: visitaData.representanteNome || usuarioNome,
        empresaId
      };
      setTable(STORAGE_KEYS.VISITAS, [newVisita, ...visitas]);
      
      if (cli) {
        storage.saveParceiroComercial({ ...cli, ultimaVisitaData: new Date().toISOString().split('T')[0] }, empresaId, usuarioNome);
      }

      logAuditAction(empresaId, usuarioNome, `Agendou nova visita para "${cli ? cli.nome : 'Cliente'}"`);
    }
  },

  deleteVisita: (id, empresaId, usuarioNome) => {
    const visitas = getTable(STORAGE_KEYS.VISITAS);
    const item = visitas.find(v => v.id === id && v.empresaId === empresaId);
    if (item) {
      setTable(STORAGE_KEYS.VISITAS, visitas.filter(v => v.id !== id));
      logAuditAction(empresaId, usuarioNome, `Cancelou/Excluiu visita #${id}`);
    }
  },

  iniciarVisitaCheckIn: (id, empresaId, usuarioNome) => {
    const visitas = getTable(STORAGE_KEYS.VISITAS);
    const updated = visitas.map(v => {
      if (v.id === id && v.empresaId === empresaId) {
        return {
          ...v,
          status: 'Em andamento',
          dataHoraInicio: new Date().toISOString(),
          gpsCheckIn: '-23.550520, -46.633308 (Check-in GPS Automático)'
        };
      }
      return v;
    });
    setTable(STORAGE_KEYS.VISITAS, updated);
    logAuditAction(empresaId, usuarioNome, `Realizou Check-in na visita #${id}`);
  },

  concluirVisitaCheckOut: (id, observacoes, empresaId, usuarioNome) => {
    const visitas = getTable(STORAGE_KEYS.VISITAS);
    const updated = visitas.map(v => {
      if (v.id === id && v.empresaId === empresaId) {
        return {
          ...v,
          status: 'Concluida',
          dataHoraTermino: new Date().toISOString(),
          observacoes: observacoes || v.observacoes
        };
      }
      return v;
    });
    setTable(STORAGE_KEYS.VISITAS, updated);
    logAuditAction(empresaId, usuarioNome, `Concluiu visita #${id}`);
  },

  // --- PRODUTOS ---
  getProdutos: (empresaId) => {
    return getTable(STORAGE_KEYS.PRODUTOS).filter(p => p.empresaId === empresaId);
  },

  saveProduto: (produto, empresaId, usuarioNome) => {
    const all = getTable(STORAGE_KEYS.PRODUTOS);
    let targetProd;
    if (produto.id) {
      const updated = all.map(p => (p.id === produto.id && p.empresaId === empresaId) ? { ...p, ...produto } : p);
      setTable(STORAGE_KEYS.PRODUTOS, updated);
      targetProd = produto;
      logAuditAction(empresaId, usuarioNome, `Atualizou produto: ${produto.nome}`);
    } else {
      const newProd = {
        ...produto,
        id: 'prod-' + Date.now(),
        codigo: produto.codigo || 'PROD-' + Math.floor(100 + Math.random() * 900),
        preco: parseFloat(produto.preco) || 0,
        estoque: parseFloat(produto.estoque) || 0,
        empresaId
      };
      setTable(STORAGE_KEYS.PRODUTOS, [...all, newProd]);
      targetProd = newProd;
      logAuditAction(empresaId, usuarioNome, `Cadastrou produto: ${produto.nome}`);
    }

    if (supabaseService.isConfigured() && targetProd) {
      supabaseService.saveProduto(targetProd, empresaId, usuarioNome).catch(e => console.warn('Supabase sync produto error:', e));
    }
  },

  deleteProduto: (id, empresaId, usuarioNome) => {
    const all = getTable(STORAGE_KEYS.PRODUTOS);
    const prod = all.find(p => p.id === id && p.empresaId === empresaId);
    if (prod) {
      setTable(STORAGE_KEYS.PRODUTOS, all.filter(p => p.id !== id));
      logAuditAction(empresaId, usuarioNome, `Excluiu produto: ${prod.nome}`);

      if (supabaseService.isConfigured()) {
        supabaseService.deleteProduto(id, empresaId, usuarioNome).catch(e => console.warn('Supabase delete produto error:', e));
      }
    }
  },

  // --- ORÇAMENTOS ---
  getOrcamentos: (empresaId) => {
    const orcamentos = getTable(STORAGE_KEYS.ORCAMENTOS).filter(o => o.empresaId === empresaId);
    const parceiros = storage.getAllParceiros(empresaId);

    return orcamentos.map(o => {
      const cli = parceiros.find(c => c.id === o.clienteId);
      const forn = parceiros.find(f => f.id === o.fornecedorId);
      return {
        ...o,
        clienteNome: cli ? (cli.fantasia || cli.nome) : 'Cliente não identificado',
        clienteTelefone: cli ? cli.telefone : '',
        clienteEmail: cli ? cli.email : '',
        fornecedorNome: forn ? (forn.fantasia || forn.nome) : 'Fornecedor não identificado'
      };
    }).sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
  },

  getOrcamentoDetalhado: (orcamentoId, empresaId) => {
    const orcamentos = getTable(STORAGE_KEYS.ORCAMENTOS);
    const orcamento = orcamentos.find(o => o.id === orcamentoId && o.empresaId === empresaId);
    if (!orcamento) return null;

    const parceiros = storage.getAllParceiros(empresaId);
    const cliente = parceiros.find(c => c.id === orcamento.clienteId);
    const fornecedor = parceiros.find(f => f.id === orcamento.fornecedorId);

    const itensOrcamento = getTable(STORAGE_KEYS.ITENS_ORCAMENTO).filter(i => i.orcamentoId === orcamentoId);
    const produtos = getTable(STORAGE_KEYS.PRODUTOS);

    const itensCompletos = itensOrcamento.map(item => {
      const prod = produtos.find(p => p.id === item.produtoId);
      return {
        ...item,
        produtoNome: prod ? prod.nome : 'Produto indisponível',
        codigo: prod ? prod.codigo : '',
        unidade: prod ? prod.unidade : 'UN',
        subtotal: (parseFloat(item.quantidade) || 0) * (parseFloat(item.precoUnitario) || 0)
      };
    });

    return {
      ...orcamento,
      cliente,
      fornecedor,
      itens: itensCompletos
    };
  },

  getItensOrcamento: (orcamentoId) => {
    const allItens = getTable(STORAGE_KEYS.ITENS_ORCAMENTO);
    return allItens.filter(i => i.orcamentoId === orcamentoId);
  },

  saveOrcamento: (orcamentoData, itens = [], empresaId, usuarioNome) => {
    if (!orcamentoData.clienteId) throw new Error('Selecione um cliente para o orçamento.');
    if (!orcamentoData.fornecedorId) throw new Error('Selecione um fornecedor para o orçamento.');
    if (!itens || itens.length === 0) throw new Error('Adicione pelo menos 1 produto ao orçamento.');

    const orcamentos = getTable(STORAGE_KEYS.ORCAMENTOS);
    const todosItens = getTable(STORAGE_KEYS.ITENS_ORCAMENTO);
    const produtos = getTable(STORAGE_KEYS.PRODUTOS);

    // Calculate total and prepare items
    let total = 0;
    const preparedItens = itens.map(item => {
      const prod = produtos.find(p => p.id === item.produtoId && p.empresaId === empresaId);
      const precoUnit = item.precoUnitario !== undefined ? parseFloat(item.precoUnitario) : (prod ? prod.preco : 0);
      const qtd = parseFloat(item.quantidade) || 1;
      total += (precoUnit * qtd);
      return {
        id: item.id || ('it-orc-' + Math.random().toString(36).substring(2, 9)),
        produtoId: item.produtoId,
        quantidade: qtd,
        precoUnitario: precoUnit
      };
    });

    const parceiros = storage.getAllParceiros(empresaId);
    const cli = parceiros.find(c => c.id === orcamentoData.clienteId);
    const clienteNome = cli ? cli.nome : 'Cliente';

    if (orcamentoData.id) {
      // Edit existing draft
      const orcamentoExistente = orcamentos.find(o => o.id === orcamentoData.id && o.empresaId === empresaId);
      if (!orcamentoExistente) throw new Error('Orçamento não localizado.');
      if (orcamentoExistente.status === 'Convertido') throw new Error('Orçamentos já convertidos não podem ser editados.');

      const orcamentoAtualizado = {
        ...orcamentoExistente,
        ...orcamentoData,
        enderecoEntrega: orcamentoData.enderecoEntrega !== undefined ? orcamentoData.enderecoEntrega : (orcamentoExistente.enderecoEntrega || ''),
        comprador: orcamentoData.comprador !== undefined ? orcamentoData.comprador : (orcamentoExistente.comprador || ''),
        dataEmissao: orcamentoData.dataEmissao !== undefined ? orcamentoData.dataEmissao : (orcamentoExistente.dataEmissao || ''),
        dataDespacho: orcamentoData.dataDespacho !== undefined ? orcamentoData.dataDespacho : (orcamentoExistente.dataDespacho || ''),
        ordemCompra: orcamentoData.ordemCompra !== undefined ? orcamentoData.ordemCompra : (orcamentoExistente.ordemCompra || ''),
        total,
        empresaId
      };

      const orcamentosAtualizados = orcamentos.map(o => (o.id === orcamentoData.id && o.empresaId === empresaId) ? orcamentoAtualizado : o);

      // Replace items for this orcamento
      const outrosItens = todosItens.filter(i => i.orcamentoId !== orcamentoData.id);
      const novosItensSalvos = preparedItens.map(i => ({ ...i, orcamentoId: orcamentoData.id }));

      setTable(STORAGE_KEYS.ORCAMENTOS, orcamentosAtualizados);
      setTable(STORAGE_KEYS.ITENS_ORCAMENTO, [...outrosItens, ...novosItensSalvos]);

      logAuditAction(empresaId, usuarioNome, `Atualizou orçamento #${orcamentoAtualizado.numero || orcamentoAtualizado.id} para ${clienteNome}`);
      return orcamentoAtualizado;
    } else {
      // Create new draft
      const orcamentoId = 'orc-' + Date.now();
      const countOrcamentos = orcamentos.filter(o => o.empresaId === empresaId).length;
      const numero = `ORC-${String(countOrcamentos + 1).padStart(3, '0')}`;

      const defaultValidade = new Date();
      defaultValidade.setDate(defaultValidade.getDate() + 15);

      const novoOrcamento = {
        id: orcamentoId,
        empresaId,
        numero: orcamentoData.numero || numero,
        clienteId: orcamentoData.clienteId,
        fornecedorId: orcamentoData.fornecedorId,
        enderecoEntrega: orcamentoData.enderecoEntrega || '',
        comprador: orcamentoData.comprador || '',
        dataEmissao: orcamentoData.dataEmissao || new Date().toISOString().split('T')[0],
        dataDespacho: orcamentoData.dataDespacho || '',
        ordemCompra: orcamentoData.ordemCompra || '',
        status: 'Rascunho',
        total,
        dataCriacao: new Date().toISOString(),
        dataEnvio: '',
        formaEnvio: '',
        dataValidade: orcamentoData.dataValidade || defaultValidade.toISOString().split('T')[0],
        dataAprovacao: '',
        observacoes: orcamentoData.observacoes || '',
        vendedorResponsavel: orcamentoData.vendedorResponsavel || usuarioNome,
        vendaId: null
      };

      const novosItensSalvos = preparedItens.map(i => ({ ...i, orcamentoId }));

      setTable(STORAGE_KEYS.ORCAMENTOS, [novoOrcamento, ...orcamentos]);
      setTable(STORAGE_KEYS.ITENS_ORCAMENTO, [...novosItensSalvos, ...todosItens]);

      logAuditAction(empresaId, usuarioNome, `Criou orçamento #${novoOrcamento.numero} no valor de R$ ${total.toFixed(2)} para ${clienteNome}`);
      return novoOrcamento;
    }
  },

  enviarOrcamento: (orcamentoId, formaEnvio, empresaId, usuarioNome) => {
    const orcamentos = getTable(STORAGE_KEYS.ORCAMENTOS);
    const orcamento = orcamentos.find(o => o.id === orcamentoId && o.empresaId === empresaId);
    if (!orcamento) throw new Error('Orçamento não encontrado.');
    if (orcamento.status === 'Convertido') throw new Error('Orçamento já foi convertido em venda.');

    const dataEnvioNow = new Date().toISOString();
    const updated = orcamentos.map(o => {
      if (o.id === orcamentoId && o.empresaId === empresaId) {
        return {
          ...o,
          status: 'Enviado',
          dataEnvio: dataEnvioNow,
          formaEnvio: formaEnvio || 'WhatsApp'
        };
      }
      return o;
    });

    setTable(STORAGE_KEYS.ORCAMENTOS, updated);
    logAuditAction(empresaId, usuarioNome, `Marcou orçamento #${orcamento.numero} como ENVIADO via ${formaEnvio}`);
  },

  aprovarOrcamento: (orcamentoId, empresaId, usuarioNome) => {
    const orcamentos = getTable(STORAGE_KEYS.ORCAMENTOS);
    const orcamento = orcamentos.find(o => o.id === orcamentoId && o.empresaId === empresaId);
    if (!orcamento) throw new Error('Orçamento não encontrado.');
    if (orcamento.status === 'Convertido') throw new Error('Orçamento já foi convertido em venda.');

    const dataAprovacaoNow = new Date().toISOString();
    const updated = orcamentos.map(o => {
      if (o.id === orcamentoId && o.empresaId === empresaId) {
        return {
          ...o,
          status: 'Aprovado',
          dataAprovacao: dataAprovacaoNow
        };
      }
      return o;
    });

    setTable(STORAGE_KEYS.ORCAMENTOS, updated);
    logAuditAction(empresaId, usuarioNome, `Marcou orçamento #${orcamento.numero} como APROVADO`);
  },

  rejeitarOrcamento: (orcamentoId, motivo, empresaId, usuarioNome) => {
    const orcamentos = getTable(STORAGE_KEYS.ORCAMENTOS);
    const orcamento = orcamentos.find(o => o.id === orcamentoId && o.empresaId === empresaId);
    if (!orcamento) throw new Error('Orçamento não encontrado.');
    if (orcamento.status === 'Convertido') throw new Error('Orçamento já foi convertido em venda.');

    const updated = orcamentos.map(o => {
      if (o.id === orcamentoId && o.empresaId === empresaId) {
        return {
          ...o,
          status: 'Rejeitado',
          observacoes: motivo ? `${o.observacoes ? o.observacoes + ' | ' : ''}Motivo rejeição: ${motivo}` : o.observacoes
        };
      }
      return o;
    });

    setTable(STORAGE_KEYS.ORCAMENTOS, updated);
    logAuditAction(empresaId, usuarioNome, `Marcou orçamento #${orcamento.numero} como REJEITADO`);
  },

  converterOrcamentoEmVenda: (orcamentoId, empresaId, usuarioNome) => {
    const orcamentoDetalhado = storage.getOrcamentoDetalhado(orcamentoId, empresaId);
    if (!orcamentoDetalhado) throw new Error('Orçamento não encontrado.');
    if (orcamentoDetalhado.status !== 'Aprovado') {
      throw new Error('Apenas orçamentos com status "Aprovado" podem ser convertidos em pedido de venda.');
    }

    if (!orcamentoDetalhado.itens || orcamentoDetalhado.itens.length === 0) {
      throw new Error('O orçamento não possui itens para converter em venda.');
    }

    // Cria a venda aproveitando a rotina createVenda() de forma exata (cópia fiel dos itens)
    // OBS FUTURA MIGRAÇÃO SUPABASE: Adicionar campo orcamentoOrigemId na tabela vendas para rastrear de qual orçamento ela nasceu
    const vendaPayload = {
      clienteId: orcamentoDetalhado.clienteId,
      itens: orcamentoDetalhado.itens.map(item => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade
      }))
    };

    const novaVenda = storage.createVenda(vendaPayload, empresaId, usuarioNome);

    // Atualiza o orçamento com o ID da venda e status Convertido (somente leitura)
    const orcamentos = getTable(STORAGE_KEYS.ORCAMENTOS);
    const updated = orcamentos.map(o => {
      if (o.id === orcamentoId && o.empresaId === empresaId) {
        return {
          ...o,
          status: 'Convertido',
          vendaId: novaVenda.id
        };
      }
      return o;
    });

    setTable(STORAGE_KEYS.ORCAMENTOS, updated);
    logAuditAction(empresaId, usuarioNome, `Converteu orçamento #${orcamentoDetalhado.numero} no Pedido de Venda #${novaVenda.id}`);

    return novaVenda;
  },

  deleteOrcamento: (orcamentoId, empresaId, usuarioNome) => {
    const orcamentos = getTable(STORAGE_KEYS.ORCAMENTOS);
    const item = orcamentos.find(o => o.id === orcamentoId && o.empresaId === empresaId);
    if (!item) throw new Error('Orçamento não encontrado.');
    if (item.status === 'Convertido') throw new Error('Orçamentos convertidos em venda não podem ser excluídos.');

    const todosItens = getTable(STORAGE_KEYS.ITENS_ORCAMENTO);
    setTable(STORAGE_KEYS.ORCAMENTOS, orcamentos.filter(o => o.id !== orcamentoId));
    setTable(STORAGE_KEYS.ITENS_ORCAMENTO, todosItens.filter(i => i.orcamentoId !== orcamentoId));

    logAuditAction(empresaId, usuarioNome, `Excluiu orçamento #${item.numero || item.id}`);
  },

  // --- VENDAS ---
  getVendas: (empresaId) => {
    const vendas = getTable(STORAGE_KEYS.VENDAS).filter(v => v.empresaId === empresaId);
    const parceiros = storage.getAllParceiros(empresaId);

    return vendas.map(v => {
      const cli = parceiros.find(c => c.id === v.clienteId);
      return {
        ...v,
        clienteNome: cli ? cli.nome : 'Cliente não identificado'
      };
    }).sort((a, b) => new Date(b.dataVenda) - new Date(a.dataVenda));
  },

  getVendaDetalhada: (vendaId, empresaId) => {
    const vendas = getTable(STORAGE_KEYS.VENDAS);
    const venda = vendas.find(v => v.id === vendaId && v.empresaId === empresaId);
    if (!venda) return null;

    const parceiros = storage.getAllParceiros(empresaId);
    const cliente = parceiros.find(c => c.id === venda.clienteId);

    const itensVenda = getTable(STORAGE_KEYS.ITENS_VENDA).filter(i => i.vendaId === vendaId);
    const produtos = getTable(STORAGE_KEYS.PRODUTOS);

    const itensCompletos = itensVenda.map(item => {
      const prod = produtos.find(p => p.id === item.produtoId);
      return {
        ...item,
        produtoNome: prod ? prod.nome : 'Produto indisponível'
      };
    });

    return {
      ...venda,
      cliente,
      itens: itensCompletos
    };
  },

  createVenda: ({ clienteId, itens }, empresaId, usuarioNome) => {
    const produtos = getTable(STORAGE_KEYS.PRODUTOS);
    const vendas = getTable(STORAGE_KEYS.VENDAS);
    const itensVenda = getTable(STORAGE_KEYS.ITENS_VENDA);
    const financeiro = getTable(STORAGE_KEYS.FINANCEIRO);

    let total = 0;
    const novosItensVenda = [];

    for (const item of itens) {
      const prod = produtos.find(p => p.id === item.produtoId && p.empresaId === empresaId);
      if (!prod) throw new Error(`Produto não localizado.`);
      if (prod.estoque < item.quantidade) {
        throw new Error(`Estoque insuficiente para "${prod.nome}". Disponível: ${prod.estoque}`);
      }
      total += prod.preco * item.quantidade;
    }

    const vendaId = 'ven-' + Date.now();
    const novaVenda = {
      id: vendaId,
      clienteId,
      total,
      dataVenda: new Date().toISOString(),
      empresaId,
      itensCount: itens.length
    };

    const produtosAtualizados = produtos.map(prod => {
      const itemVendido = itens.find(i => i.produtoId === prod.id && prod.empresaId === empresaId);
      if (itemVendido) {
        novosItensVenda.push({
          id: 'it-' + Math.random().toString(36).substring(2, 9),
          vendaId,
          produtoId: prod.id,
          quantidade: itemVendido.quantidade,
          precoUnitario: prod.preco
        });
        return { ...prod, estoque: prod.estoque - itemVendido.quantidade };
      }
      return prod;
    });

    const parceiros = storage.getAllParceiros(empresaId);
    const cliente = parceiros.find(c => c.id === clienteId);
    const clienteNome = cliente ? cliente.nome : 'Cliente';

    const novoLancamentoFinanceiro = {
      id: 'fin-' + Date.now(),
      descricao: `Venda #${vendaId} - ${clienteNome}`,
      tipo: 'Receber',
      valor: total,
      status: 'Pendente',
      dataVencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      empresaId,
      vendaId
    };

    setTable(STORAGE_KEYS.PRODUTOS, produtosAtualizados);
    setTable(STORAGE_KEYS.VENDAS, [novaVenda, ...vendas]);
    setTable(STORAGE_KEYS.ITENS_VENDA, [...novosItensVenda, ...itensVenda]);
    setTable(STORAGE_KEYS.FINANCEIRO, [novoLancamentoFinanceiro, ...financeiro]);

    logAuditAction(empresaId, usuarioNome, `Concluiu venda #${vendaId} no valor de R$ ${total.toFixed(2)}`);

    return novaVenda;
  },

  // --- FINANCEIRO ---
  getFinanceiro: (empresaId) => {
    const all = getTable(STORAGE_KEYS.FINANCEIRO);
    return all.filter(f => f.empresaId === empresaId).sort((a, b) => new Date(a.dataVencimento) - new Date(b.dataVencimento));
  },

  saveFinanceiro: (lancamento, empresaId, usuarioNome) => {
    const all = getTable(STORAGE_KEYS.FINANCEIRO);
    if (lancamento.id) {
      const updated = all.map(f => (f.id === lancamento.id && f.empresaId === empresaId) ? { ...f, ...lancamento } : f);
      setTable(STORAGE_KEYS.FINANCEIRO, updated);
      logAuditAction(empresaId, usuarioNome, `Atualizou conta: ${lancamento.descricao}`);
    } else {
      const newFin = {
        ...lancamento,
        id: 'fin-' + Date.now(),
        valor: parseFloat(lancamento.valor) || 0,
        empresaId
      };
      setTable(STORAGE_KEYS.FINANCEIRO, [newFin, ...all]);
      logAuditAction(empresaId, usuarioNome, `Cadastrou lançamento financeiro: ${lancamento.descricao}`);
    }
  },

  marcarComoPago: (id, empresaId, usuarioNome) => {
    const all = getTable(STORAGE_KEYS.FINANCEIRO);
    const updated = all.map(f => {
      if (f.id === id && f.empresaId === empresaId) {
        return { ...f, status: 'Pago' };
      }
      return f;
    });
    setTable(STORAGE_KEYS.FINANCEIRO, updated);
    logAuditAction(empresaId, usuarioNome, `Deu baixa na conta #${id} (marcado como PAGO)`);
  },

  deleteFinanceiro: (id, empresaId, usuarioNome) => {
    const all = getTable(STORAGE_KEYS.FINANCEIRO);
    const fin = all.find(f => f.id === id && f.empresaId === empresaId);
    if (fin) {
      setTable(STORAGE_KEYS.FINANCEIRO, all.filter(f => f.id !== id));
      logAuditAction(empresaId, usuarioNome, `Excluiu lançamento financeiro: ${fin.descricao}`);
    }
  },

  // --- CONDIÇÕES DE PAGAMENTO ---
  getCondicoesPagamento: (empresaId) => {
    const all = getTable(STORAGE_KEYS.CONDICOES_PAGAMENTO);
    return all
      .filter(c => c.empresaId === empresaId)
      .sort((a, b) => (parseInt(a.ordem) || 999) - (parseInt(b.ordem) || 999));
  },

  saveCondicaoPagamento: (condicao, empresaId, usuarioNome) => {
    if (!condicao.descricao) throw new Error('A descrição da condição de pagamento é obrigatória.');
    const all = getTable(STORAGE_KEYS.CONDICOES_PAGAMENTO);
    
    // Parse interval to calculate installments count
    const intervalParts = (condicao.intervaloDias || '')
      .split(/[\s,;/]+/)
      .map(s => s.trim())
      .filter(Boolean);
    const parcelasCount = Math.max(1, intervalParts.length);

    if (condicao.id) {
      const updated = all.map(c => {
        if (c.id === condicao.id && c.empresaId === empresaId) {
          return {
            ...c,
            ...condicao,
            parcelasCount,
            percentualCustoFinanceiro: parseFloat(condicao.percentualCustoFinanceiro) || 0,
            custoFinanceiroFixo: parseFloat(condicao.custoFinanceiroFixo) || 0,
            ordem: parseInt(condicao.ordem) || 1,
            imprimeNoPedido: Boolean(condicao.imprimeNoPedido)
          };
        }
        return c;
      });
      setTable(STORAGE_KEYS.CONDICOES_PAGAMENTO, updated);
      logAuditAction(empresaId, usuarioNome, `Atualizou condição de pagamento: ${condicao.descricao}`);
    } else {
      const novaCondicao = {
        id: 'cpg-' + Date.now(),
        empresaId,
        descricao: condicao.descricao,
        intervaloDias: condicao.intervaloDias || '0',
        parcelasCount,
        percentualCustoFinanceiro: parseFloat(condicao.percentualCustoFinanceiro) || 0,
        custoFinanceiroFixo: parseFloat(condicao.custoFinanceiroFixo) || 0,
        ordem: parseInt(condicao.ordem) || (all.filter(c => c.empresaId === empresaId).length + 1),
        imprimeNoPedido: condicao.imprimeNoPedido !== undefined ? Boolean(condicao.imprimeNoPedido) : true,
        ativo: true
      };
      setTable(STORAGE_KEYS.CONDICOES_PAGAMENTO, [...all, novaCondicao]);
      logAuditAction(empresaId, usuarioNome, `Cadastrou condição de pagamento: ${condicao.descricao}`);
      return novaCondicao;
    }
  },

  deleteCondicaoPagamento: (id, empresaId, usuarioNome) => {
    const all = getTable(STORAGE_KEYS.CONDICOES_PAGAMENTO);
    const cond = all.find(c => c.id === id && c.empresaId === empresaId);
    if (cond) {
      setTable(STORAGE_KEYS.CONDICOES_PAGAMENTO, all.filter(c => c.id !== id));
      logAuditAction(empresaId, usuarioNome, `Excluiu condição de pagamento: ${cond.descricao}`);
    }
  },

  // --- AUDITORIA E USUÁRIOS ---
  getAuditLogs: (empresaId) => {
    return getTable(STORAGE_KEYS.AUDIT_LOGS).filter(l => l.empresaId === empresaId);
  },

  getUsuariosEmpresa: (empresaId) => {
    return getTable(STORAGE_KEYS.USUARIOS).filter(u => u.empresaId === empresaId);
  },

  saveUsuarioEmpresa: (novoUsuarioData, empresaId, adminNome) => {
    const usuarios = getTable(STORAGE_KEYS.USUARIOS);
    if (usuarios.some(u => u.email.toLowerCase() === novoUsuarioData.email.toLowerCase())) {
      throw new Error('E-mail já cadastrado.');
    }
    const novoUsuario = {
      ...novoUsuarioData,
      id: 'usr-' + Date.now(),
      empresaId
    };
    setTable(STORAGE_KEYS.USUARIOS, [...usuarios, novoUsuario]);
    logAuditAction(empresaId, adminNome, `Adicionou usuário: ${novoUsuarioData.nome} (${novoUsuarioData.tipo})`);
  },

  updateEmpresaPlano: (empresaId, novoPlano, adminNome) => {
    const empresas = getTable(STORAGE_KEYS.EMPRESAS);
    const updated = empresas.map(e => e.id === empresaId ? { ...e, plano: novoPlano } : e);
    setTable(STORAGE_KEYS.EMPRESAS, updated);
    
    const session = storage.getCurrentSession();
    if (session && session.empresa.id === empresaId) {
      session.empresa.plano = novoPlano;
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session));
    }
    logAuditAction(empresaId, adminNome, `Upgrade de plano para: ${novoPlano}`);
  },

  supabase: supabaseService
};
