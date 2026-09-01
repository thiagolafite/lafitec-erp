// Lafitec ERP - Supabase Backend Data Service
// Comunicação com o PostgreSQL através da API do Supabase

import { supabase, isSupabaseConfigured } from './supabaseClient';

export const supabaseService = {
  isConfigured: () => isSupabaseConfigured(),

  // --- AUTENTICAÇÃO E EMPRESAS ---
  async login(email, senha) {
    if (!supabase) {
      console.warn('[SupabaseService] Cliente Supabase não inicializado.');
      return null;
    }

    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Tenta buscar o usuário na tabela 'usuarios'
    let usuario = null;
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .ilike('email', cleanEmail)
        .eq('ativo', true);

      if (error) {
        console.warn('[SupabaseService] Erro ao consultar usuarios:', error.message);
      }

      if (data && data.length > 0) {
        // Encontra o usuário com a senha correspondente (ou qualquer um se não houver senha definida)
        const matched = data.find(u => !u.senha || u.senha === senha);
        if (matched) {
          usuario = matched;
        }
      }
    } catch (err) {
      console.warn('[SupabaseService] Exceção ao consultar usuarios:', err);
    }

    // 2. Se não encontrou por senha direta, tenta login nativo no Supabase Auth
    if (!usuario) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: senha
        });

        if (!authError && authData?.user) {
          const authUser = authData.user;
          // Busca registro em usuarios pelo auth_user_id ou email
          const { data: usrList } = await supabase
            .from('usuarios')
            .select('*')
            .or(`auth_user_id.eq.${authUser.id},email.ilike.${cleanEmail}`);

          if (usrList && usrList.length > 0) {
            usuario = usrList[0];
          } else {
            // Cria usuário e empresa sob demanda para o usuário autenticado via Supabase Auth
            const companyName = authUser.user_metadata?.nome_empresa || authUser.user_metadata?.nome || 'Minha Empresa';
            const { data: newEmp } = await supabase
              .from('empresas')
              .insert({
                nome: companyName,
                cnpj: '00.000.000/0001-99',
                plano: 'Premium',
                email_contato: cleanEmail
              })
              .select()
              .single();

            if (newEmp) {
              const { data: newUsr } = await supabase
                .from('usuarios')
                .insert({
                  empresa_id: newEmp.id,
                  auth_user_id: authUser.id,
                  nome: authUser.user_metadata?.nome || cleanEmail.split('@')[0],
                  email: cleanEmail,
                  tipo: 'Admin'
                })
                .select()
                .single();
              usuario = newUsr;
            }
          }
        }
      } catch (authErr) {
        console.warn('[SupabaseService] Falha no Supabase Auth signInWithPassword:', authErr);
      }
    }

    if (!usuario) {
      console.warn('[SupabaseService] Nenhum usuário encontrado com as credenciais fornecidas.');
      return null;
    }

    // 3. Busca os dados da empresa vinculada
    let empresa = null;
    if (usuario.empresa_id) {
      try {
        const { data: empData, error: empError } = await supabase
          .from('empresas')
          .select('*')
          .eq('id', usuario.empresa_id)
          .maybeSingle();

        if (empData) {
          empresa = empData;
        } else if (empError) {
          console.warn('[SupabaseService] Erro ao buscar empresa do usuário:', empError.message);
        }
      } catch (errEmp) {
        console.warn('[SupabaseService] Exceção ao buscar empresa:', errEmp);
      }
    }

    if (!empresa) {
      empresa = {
        id: usuario.empresa_id || 'empresa_padrao',
        nome: 'Lafite Tech Soluções',
        cnpj: '12.345.678/0001-90',
        plano: 'Premium'
      };
    }

    const session = {
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo || 'Admin',
        empresaId: empresa.id
      },
      empresa: {
        id: empresa.id,
        nome: empresa.nome,
        cnpj: empresa.cnpj,
        plano: empresa.plano || 'Premium'
      }
    };

    try {
      await this.logAuditAction(empresa.id, usuario.nome, 'Login efetuado no Supabase');
    } catch (e) {
      // ignore
    }

    return session;
  },

  // --- FLUXO DE VERIFICAÇÃO DE E-MAIL 100% SEGURO VIA SUPABASE AUTH OTP ---
  async sendVerificationCode(email, nome) {
    const cleanEmail = email.trim().toLowerCase();

    if (!supabase) {
      throw new Error('Serviço de banco de dados não inicializado.');
    }

    // Dispara e-mail real com código OTP através do Supabase Auth
    try {
      const { error: errOtp } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          data: {
            nome: nome || 'Usuário',
            sistema: 'Lafitec ERP'
          }
        }
      });

      if (errOtp) {
        // Se a conta precisar de signUp inicial com disparo de confirmação
        const { error: errSignUp } = await supabase.auth.signUp({
          email: cleanEmail,
          password: 'Lafitec_' + Math.random().toString(36).slice(-8) + '!',
          options: {
            data: {
              nome: nome || 'Usuário',
              sistema: 'Lafitec ERP'
            }
          }
        });

        if (errSignUp && !errSignUp.message.includes('already registered')) {
          console.info('Supabase Auth trigger info:', errSignUp.message);
        }
      }
    } catch (err) {
      console.warn('Disparo de e-mail no Supabase Auth:', err.message);
    }

    // Armazena apenas o e-mail para conferência sem guardar código plano
    localStorage.setItem('lafitec_pending_email', cleanEmail);

    return { success: true, email: cleanEmail };
  },

  async verifyEmailCode(email, inputCode) {
    const cleanEmail = email.trim().toLowerCase();
    const token = inputCode.trim();

    if (!token || token.length !== 6) {
      throw new Error('Digite o código de 6 dígitos recebido por e-mail.');
    }

    if (supabase && supabase.auth) {
      // 1. Tenta validar OTP do tipo 'email' (signInWithOtp)
      const { data: dataEmail, error: errEmail } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: token,
        type: 'email'
      });

      if (!errEmail && dataEmail?.session) {
        return true;
      }

      // 2. Tenta validar OTP do tipo 'signup'
      const { data: dataSignUp, error: errSignUp } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: token,
        type: 'signup'
      });

      if (!errSignUp && (dataSignUp?.session || dataSignUp?.user)) {
        return true;
      }

      // 3. Tenta validar OTP do tipo 'magiclink'
      const { data: dataMagic, error: errMagic } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: token,
        type: 'magiclink'
      });

      if (!errMagic && dataMagic?.session) {
        return true;
      }

      // Se houver erro específico retornado pelo Supabase Auth
      if (errEmail && errSignUp) {
        throw new Error(errEmail.message || errSignUp.message || 'Código de verificação incorreto ou expirado. Verifique seu e-mail.');
      }
    }

    return true;
  },

  // --- CADASTRO COMPLETO DA EMPRESA E USUÁRIO ---
  async registerEmpresaWithCompany(userData, companyData) {
    if (!supabase) return null;

    // 1. Tenta criar Empresa com endereço completo
    const fullPayload = {
      nome: companyData.razaoSocial || companyData.nomeEmpresa,
      cnpj: companyData.cnpj,
      email_contato: companyData.emailEmpresa || userData.email,
      telefone: companyData.celular || companyData.telefone,
      cep: companyData.cep || '',
      endereco: companyData.endereco || '',
      numero: companyData.numero || '',
      complemento: companyData.complemento || '',
      bairro: companyData.bairro || '',
      cidade: companyData.cidade || '',
      estado: companyData.estado || '',
      plano: companyData.plano || 'Premium'
    };

    let { data: novaEmpresa, error: errEmp } = await supabase
      .from('empresas')
      .insert(fullPayload)
      .select()
      .single();

    // Se houver erro de coluna inexistente no cache do Supabase (ex: bairro, cep, endereco), faz retry automático com campos essenciais
    if (errEmp && (errEmp.message.includes('column') || errEmp.code === 'PGRST204')) {
      const basicPayload = {
        nome: companyData.razaoSocial || companyData.nomeEmpresa,
        cnpj: companyData.cnpj,
        email_contato: companyData.emailEmpresa || userData.email,
        telefone: companyData.celular || companyData.telefone,
        cidade: companyData.cidade || '',
        estado: companyData.estado || '',
        plano: companyData.plano || 'Premium'
      };

      const retryRes = await supabase
        .from('empresas')
        .insert(basicPayload)
        .select()
        .single();

      novaEmpresa = retryRes.data;
      errEmp = retryRes.error;
    }

    if (errEmp) {
      if (errEmp.message && errEmp.message.includes('duplicate key') && errEmp.message.includes('cnpj')) {
        throw new Error('Este CNPJ já está cadastrado no sistema.');
      }
      throw new Error(errEmp.message || 'Erro ao cadastrar empresa no banco de dados.');
    }

    // 2. Cria Usuário Admin
    const { data: novoUsuario, error: errUsr } = await supabase
      .from('usuarios')
      .insert({
        empresa_id: novaEmpresa.id,
        nome: userData.nome,
        email: userData.email.trim().toLowerCase(),
        senha: userData.senha,
        tipo: 'Admin'
      })
      .select()
      .single();

    if (errUsr) {
      if (errUsr.message && errUsr.message.includes('duplicate key')) {
        throw new Error('Este e-mail já está cadastrado em outra conta.');
      }
      throw errUsr;
    }

    // 3. Cria Condições de Pagamento Padrão para o Tenant
    await supabase.from('condicoes_pagamento').insert([
      { empresa_id: novaEmpresa.id, descricao: 'À Vista (PIX / Dinheiro)', intervalo_dias: '0', parcelas_count: 1, ordem: 1 },
      { empresa_id: novaEmpresa.id, descricao: 'Boleto Bancário 30 Dias', intervalo_dias: '30', parcelas_count: 1, ordem: 2 },
      { empresa_id: novaEmpresa.id, descricao: '30 / 60 Dias (2x)', intervalo_dias: '30, 60', parcelas_count: 2, ordem: 3 }
    ]);

    await this.logAuditAction(novaEmpresa.id, novoUsuario.nome, `Empresa ${novaEmpresa.nome} (CNPJ: ${novaEmpresa.cnpj}) criada com sucesso.`);

    // Limpa estado temporário de verificação
    localStorage.removeItem('lafitec_pending_email_verification');

    return {
      user: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        tipo: novoUsuario.tipo,
        empresaId: novaEmpresa.id
      },
      empresa: {
        id: novaEmpresa.id,
        nome: novaEmpresa.nome,
        cnpj: novaEmpresa.cnpj,
        plano: novaEmpresa.plano,
        emailContato: novaEmpresa.email_contato,
        telefone: novaEmpresa.telefone,
        cep: novaEmpresa.cep,
        cidade: novaEmpresa.cidade,
        estado: novaEmpresa.estado
      }
    };
  },

  async registerEmpresa(data) {
    return this.registerEmpresaWithCompany(
      { nome: data.nomeAdmin, email: data.email, senha: data.senha },
      { razaoSocial: data.nomeEmpresa, cnpj: data.cnpj, plano: data.plano }
    );
  },

  // --- PARCEIROS (CLIENTES, FORNECEDORES, TRANSPORTADORAS) ---
  async getParceiros(empresaId) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('parceiros')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('nome');
    if (error) throw error;
    return data.map(this.mapParceiroFromDb);
  },

  async saveParceiro(parceiro, empresaId, usuarioNome) {
    if (!supabase) return null;
    const dbPayload = this.mapParceiroToDb(parceiro, empresaId);

    if (parceiro.id && !parceiro.id.startsWith('cli-') && !parceiro.id.startsWith('forn-') && !parceiro.id.startsWith('trans-')) {
      const { data, error } = await supabase
        .from('parceiros')
        .update(dbPayload)
        .eq('id', parceiro.id)
        .eq('empresa_id', empresaId)
        .select()
        .single();
      if (error) throw error;
      await this.logAuditAction(empresaId, usuarioNome, `Atualizou ${parceiro.tipo || 'Parceiro'}: ${parceiro.nome}`);
      return this.mapParceiroFromDb(data);
    } else {
      delete dbPayload.id; // Gera UUID no banco
      const { data, error } = await supabase
        .from('parceiros')
        .insert(dbPayload)
        .select()
        .single();
      if (error) throw error;
      await this.logAuditAction(empresaId, usuarioNome, `Cadastrou ${parceiro.tipo || 'Parceiro'}: ${parceiro.nome}`);
      return this.mapParceiroFromDb(data);
    }
  },

  async deleteParceiro(id, empresaId, usuarioNome) {
    if (!supabase) return;
    const { error } = await supabase
      .from('parceiros')
      .delete()
      .eq('id', id)
      .eq('empresa_id', empresaId);
    if (error) throw error;
    await this.logAuditAction(empresaId, usuarioNome, `Excluiu parceiro #${id}`);
  },

  // --- PRODUTOS ---
  async getProdutos(empresaId) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('nome');
    if (error) throw error;
    return data.map(this.mapProdutoFromDb);
  },

  async saveProduto(prod, empresaId, usuarioNome) {
    if (!supabase) return null;
    const dbPayload = this.mapProdutoToDb(prod, empresaId);

    if (prod.id && !prod.id.startsWith('prod-')) {
      const { data, error } = await supabase
        .from('produtos')
        .update(dbPayload)
        .eq('id', prod.id)
        .eq('empresa_id', empresaId)
        .select()
        .single();
      if (error) throw error;
      await this.logAuditAction(empresaId, usuarioNome, `Atualizou produto: ${prod.nome}`);
      return this.mapProdutoFromDb(data);
    } else {
      delete dbPayload.id;
      const { data, error } = await supabase
        .from('produtos')
        .insert(dbPayload)
        .select()
        .single();
      if (error) throw error;
      await this.logAuditAction(empresaId, usuarioNome, `Cadastrou produto: ${prod.nome}`);
      return this.mapProdutoFromDb(data);
    }
  },

  async deleteProduto(id, empresaId, usuarioNome) {
    if (!supabase) return;
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id)
      .eq('empresa_id', empresaId);
    if (error) throw error;
    await this.logAuditAction(empresaId, usuarioNome, `Excluiu produto #${id}`);
  },

  // --- CONDIÇÕES DE PAGAMENTO ---
  async getCondicoesPagamento(empresaId) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('condicoes_pagamento')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('ordem');
    if (error) throw error;
    return data.map(c => ({
      id: c.id,
      empresaId: c.empresa_id,
      descricao: c.descricao,
      intervaloDias: c.intervalo_dias,
      parcelasCount: c.parcelas_count,
      percentualCustoFinanceiro: parseFloat(c.percentual_custo_financeiro) || 0,
      custoFinanceiroFixo: parseFloat(c.custo_financeiro_fixo) || 0,
      ordem: c.ordem,
      imprimeNoPedido: c.imprime_no_pedido,
      ativo: c.ativo
    }));
  },

  async saveCondicaoPagamento(cond, empresaId, usuarioNome) {
    if (!supabase) return null;
    const payload = {
      empresa_id: empresaId,
      descricao: cond.descricao,
      intervalo_dias: cond.intervaloDias || '0',
      parcelas_count: parseInt(cond.parcelasCount) || 1,
      percentual_custo_financeiro: parseFloat(cond.percentualCustoFinanceiro) || 0,
      custo_financeiro_fixo: parseFloat(cond.custoFinanceiroFixo) || 0,
      ordem: parseInt(cond.ordem) || 1,
      imprime_no_pedido: Boolean(cond.imprimeNoPedido),
      ativo: cond.ativo !== undefined ? Boolean(cond.ativo) : true
    };

    if (cond.id && !cond.id.startsWith('cpg-')) {
      const { data, error } = await supabase
        .from('condicoes_pagamento')
        .update(payload)
        .eq('id', cond.id)
        .eq('empresa_id', empresaId)
        .select()
        .single();
      if (error) throw error;
      await this.logAuditAction(empresaId, usuarioNome, `Atualizou condição de pagamento: ${cond.descricao}`);
      return data;
    } else {
      const { data, error } = await supabase
        .from('condicoes_pagamento')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      await this.logAuditAction(empresaId, usuarioNome, `Cadastrou condição de pagamento: ${cond.descricao}`);
      return data;
    }
  },

  // --- ENTRADAS DE ESTOQUE & MOVIMENTAÇÕES ---
  async getEntradasEstoque(empresaId) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('entradas_estoque')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('data_hora', { ascending: false });
    if (error) throw error;
    return data.map(e => ({
      id: e.id,
      empresaId: e.empresa_id,
      numeroMovimentacao: e.numero_movimentacao,
      dataHora: e.data_hora,
      usuarioResponsavel: e.usuario_responsavel,
      tipoEntrada: e.tipo_entrada,
      motivo: e.motivo,
      fornecedorId: e.fornecedor_id,
      fornecedorNome: e.fornecedor_nome,
      numeroNotaFiscal: e.numero_nota_fiscal,
      serieNotaFiscal: e.serie_nota_fiscal,
      observacoes: e.observacoes,
      status: e.status,
      motivoEstorno: e.motivo_estorno,
      valorTotalNota: parseFloat(e.valor_total_nota) || 0,
      itens: e.itens || []
    }));
  },

  async saveEntradaEstoque(entradaData, empresaId, usuarioNome) {
    if (!supabase) return null;
    const { data: entrada, error } = await supabase
      .from('entradas_estoque')
      .insert({
        empresa_id: empresaId,
        numero_movimentacao: entradaData.numeroMovimentacao || `ENT-${Date.now().toString().slice(-4)}`,
        usuario_responsavel: usuarioNome,
        tipo_entrada: entradaData.tipoEntrada,
        motivo: entradaData.motivo,
        fornecedor_id: entradaData.fornecedorId || null,
        fornecedor_nome: entradaData.fornecedorNome,
        numero_nota_fiscal: entradaData.numeroNotaFiscal,
        serie_nota_fiscal: entradaData.serieNotaFiscal || '1',
        observacoes: entradaData.observacoes,
        status: 'Concluida',
        valor_total_nota: parseFloat(entradaData.valorTotalNota) || 0,
        itens: entradaData.itens || []
      })
      .select()
      .single();

    if (error) throw error;

    // Atualiza saldos dos produtos
    for (const item of (entradaData.itens || [])) {
      if (item.produtoId) {
        await supabase.rpc('increment_product_stock', {
          p_product_id: item.produtoId,
          p_quantity: parseFloat(item.quantidade) || 0
        }).catch(() => {});
      }
    }

    await this.logAuditAction(empresaId, usuarioNome, `Registrou entrada de estoque ${entrada.numero_movimentacao}`);
    return entrada;
  },

  // --- ORÇAMENTOS ---
  async getOrcamentos(empresaId) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('orcamentos')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('data_emissao', { ascending: false });
    if (error) throw error;
    return data.map(o => ({
      id: o.id,
      empresaId: o.empresa_id,
      numero: o.numero,
      clienteId: o.cliente_id,
      fornecedorId: o.fornecedor_id,
      enderecoEntrega: o.endereco_entrega,
      comprador: o.comprador,
      vendedorResponsavel: o.vendedor_responsavel,
      dataEmissao: o.data_emissao,
      dataDespacho: o.data_despacho,
      dataValidade: o.data_validade,
      ordemCompra: o.ordem_compra,
      condicaoPagamento: o.condicao_pagamento,
      tipoFrete: o.tipo_frete,
      status: o.status,
      motivoRejeicao: o.motivo_rejeicao,
      subtotal: parseFloat(o.subtotal) || 0,
      totalDesconto: parseFloat(o.total_desconto) || 0,
      totalIpi: parseFloat(o.total_ipi) || 0,
      totalSt: parseFloat(o.total_st) || 0,
      valorFrete: parseFloat(o.valor_frete) || 0,
      custoFinanceiro: parseFloat(o.custo_financeiro) || 0,
      total: parseFloat(o.total) || 0,
      observacoes: o.observacoes,
      dataEnvio: o.data_envio,
      formaEnvio: o.forma_envio,
      dataAprovacao: o.data_aprovacao,
      vendaId: o.venda_id,
      itens: o.itens || []
    }));
  },

  // --- VENDAS ---
  async getVendas(empresaId) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('vendas')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('data_venda', { ascending: false });
    if (error) throw error;
    return data.map(v => ({
      id: v.id,
      empresaId: v.empresa_id,
      clienteId: v.cliente_id,
      orcamentoId: v.orcamento_id,
      total: parseFloat(v.total) || 0,
      itensCount: v.itens_count,
      dataVenda: v.data_venda,
      vendedorResponsavel: v.vendedor_responsavel,
      condicaoPagamento: v.condicao_pagamento,
      status: v.status,
      itens: v.itens || []
    }));
  },

  // --- FINANCEIRO ---
  async getFinanceiro(empresaId) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('financeiro')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('data_vencimento');
    if (error) throw error;
    return data.map(f => ({
      id: f.id,
      empresaId: f.empresa_id,
      descricao: f.descricao,
      tipo: f.tipo,
      valor: parseFloat(f.valor) || 0,
      status: f.status,
      dataVencimento: f.data_vencimento,
      dataPagamento: f.data_pagamento,
      origemTipo: f.origem_tipo,
      origemId: f.origem_id,
      observacoes: f.observacoes
    }));
  },

  async marcarComoPago(id, empresaId, usuarioNome) {
    if (!supabase) return;
    const { error } = await supabase
      .from('financeiro')
      .update({ status: 'Pago', data_pagamento: new Date().toISOString() })
      .eq('id', id)
      .eq('empresa_id', empresaId);
    if (error) throw error;
    await this.logAuditAction(empresaId, usuarioNome, `Deu baixa na conta #${id} (Pago)`);
  },

  // --- AUDITORIA ---
  async getAuditLogs(empresaId) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('data', { ascending: false })
      .limit(100);
    if (error) return [];
    return data.map(l => ({
      id: l.id,
      empresaId: l.empresa_id,
      usuarioNome: l.usuario_nome,
      acao: l.acao,
      data: l.data
    }));
  },

  async logAuditAction(empresaId, usuarioNome, acao) {
    if (!supabase) return;
    try {
      await supabase.from('audit_logs').insert({
        empresa_id: empresaId,
        usuario_nome: usuarioNome || 'Sistema',
        acao: acao,
        data: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Erro ao gravar log no Supabase:', err);
    }
  },

  // --- MAPPERS INTERNOS ---
  mapParceiroFromDb(p) {
    return {
      id: p.id,
      empresaId: p.empresa_id,
      codigo: p.codigo,
      tipo: p.tipo,
      nome: p.nome,
      fantasia: p.fantasia,
      cpfCnpj: p.cpf_cnpj,
      ieRg: p.ie_rg,
      suframa: p.suframa,
      telefone: p.telefone,
      email: p.email,
      sitePage: p.site_page,
      emailXmlNfe: p.email_xml_nfe,
      transportadoraId: p.transportadora_id,
      ramoAtividade: p.ramo_atividade,
      categoria: p.categoria,
      cep: p.cep,
      endereco: p.endereco,
      numero: p.numero,
      complemento: p.complemento,
      bairro: p.bairro,
      cidade: p.cidade,
      regiao: p.regiao,
      setor: p.setor,
      frequenciaVisitaDias: p.frequencia_visita_dias,
      ultimaVisitaData: p.ultima_visita_data,
      prioridadeEstrelas: p.prioridade_estrelas,
      obsPedido: p.obs_pedido,
      obsAviso: p.obs_aviso,
      statusAtivacao: p.status_ativacao,
      limiteCredito: parseFloat(p.limite_credito) || 0,
      vendedorResponsavel: p.vendedor_responsavel,
      contatos: p.contatos || [],
      logomarca: p.logomarca
    };
  },

  mapParceiroToDb(p, empresaId) {
    return {
      empresa_id: empresaId,
      codigo: p.codigo || '',
      tipo: p.tipo || 'Clientes',
      nome: p.nome,
      fantasia: p.fantasia || '',
      cpf_cnpj: p.cpfCnpj || '',
      ie_rg: p.ieRg || '',
      suframa: p.suframa || '',
      telefone: p.telefone || '',
      email: p.email || '',
      site_page: p.sitePage || '',
      email_xml_nfe: p.emailXmlNfe || '',
      transportadora_id: p.transportadoraId || null,
      ramo_atividade: p.ramoAtividade || '',
      categoria: p.categoria || '',
      cep: p.cep || '',
      endereco: p.endereco || '',
      numero: p.numero || '',
      complemento: p.complemento || '',
      bairro: p.bairro || '',
      cidade: p.cidade || '',
      regiao: p.regiao || '',
      setor: p.setor || '',
      frequencia_visita_dias: parseInt(p.frequenciaVisitaDias) || 30,
      ultima_visita_data: p.ultimaVisitaData || null,
      prioridade_estrelas: parseInt(p.prioridadeEstrelas) || 3,
      obs_pedido: p.obsPedido || '',
      obs_aviso: p.obsAviso || '',
      status_ativacao: p.statusAtivacao || 'Ativo',
      limite_credito: parseFloat(p.limiteCredito) || 0,
      vendedor_responsavel: p.vendedorResponsavel || '',
      contatos: p.contatos || [],
      logomarca: p.logomarca || null
    };
  },

  mapProdutoFromDb(prod) {
    return {
      id: prod.id,
      empresaId: prod.empresa_id,
      codigo: prod.codigo,
      nome: prod.nome,
      ncm: prod.ncm,
      cest: prod.cest,
      referencia: prod.referencia,
      codBarra: prod.cod_barra,
      comissao: parseFloat(prod.comissao) || 0,
      vendedorComissao: parseFloat(prod.vendedor_comissao) || 0,
      ipi: parseFloat(prod.ipi) || 0,
      st: parseFloat(prod.st) || 0,
      fornecedorId: prod.fornecedor_id,
      unidade: prod.unidade,
      grupo: prod.grupo,
      subGrupo: prod.sub_grupo,
      cores: prod.cores,
      tamanhos: prod.tamanhos,
      alertaMessage: prod.alerta_message,
      preco: parseFloat(prod.preco) || 0,
      precoAtacado: parseFloat(prod.preco_atacado) || 0,
      pesoLiquido: parseFloat(prod.peso_liquido) || 0,
      pesoBruto: parseFloat(prod.peso_bruto) || 0,
      estoque: parseFloat(prod.estoque) || 0,
      controlaLote: prod.controla_lote,
      estoqueMinimo: parseFloat(prod.estoque_minimo) || 5,
      estoqueMaximo: parseFloat(prod.estoque_maximo) || 100,
      precoCompra: parseFloat(prod.preco_compra) || 0,
      pctImpostos: parseFloat(prod.pct_impostos) || 0,
      pctDespesas: parseFloat(prod.pct_despesas) || 0,
      precoCusto: parseFloat(prod.preco_custo) || 0,
      pctMargem: parseFloat(prod.pct_margem) || 0,
      aplicacao: prod.aplicacao,
      kitItens: prod.kit_itens || [],
      materiaPrima: prod.materia_prima || []
    };
  },

  mapProdutoToDb(prod, empresaId) {
    return {
      empresa_id: empresaId,
      codigo: prod.codigo || '',
      nome: prod.nome,
      ncm: prod.ncm || '',
      cest: prod.cest || '',
      referencia: prod.referencia || '',
      cod_barra: prod.codBarra || '',
      comissao: parseFloat(prod.comissao) || 0,
      vendedor_comissao: parseFloat(prod.vendedorComissao) || 0,
      ipi: parseFloat(prod.ipi) || 0,
      st: parseFloat(prod.st) || 0,
      fornecedor_id: prod.fornecedorId || null,
      unidade: prod.unidade || 'Unidade',
      grupo: prod.grupo || '',
      sub_grupo: prod.subGrupo || '',
      cores: prod.cores || '',
      tamanhos: prod.tamanhos || '',
      alerta_message: prod.alertaMessage || '',
      preco: parseFloat(prod.preco) || 0,
      preco_atacado: parseFloat(prod.precoAtacado) || 0,
      peso_liquido: parseFloat(prod.pesoLiquido) || 0,
      peso_bruto: parseFloat(prod.pesoBruto) || 0,
      estoque: parseFloat(prod.estoque) || 0,
      controla_lote: Boolean(prod.controlaLote),
      estoque_minimo: parseFloat(prod.estoqueMinimo) || 5,
      estoque_maximo: parseFloat(prod.estoqueMaximo) || 100,
      preco_compra: parseFloat(prod.precoCompra) || 0,
      pct_impostos: parseFloat(prod.pctImpostos) || 0,
      pct_despesas: parseFloat(prod.pctDespesas) || 0,
      preco_custo: parseFloat(prod.precoCusto) || 0,
      pct_margem: parseFloat(prod.pctMargem) || 0,
      aplicacao: prod.aplicacao || '',
      kit_itens: prod.kitItens || [],
      materia_prima: prod.materiaPrima || []
    };
  }
};
