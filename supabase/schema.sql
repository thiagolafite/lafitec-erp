-- ==============================================================================
-- LAFITEC ERP - BANCO DE DADOS POSTGRESQL & SUPABASE SCHEMA
-- Arquitetura Multi-Tenant Enterprise de Alta Performance
-- ==============================================================================

-- 1. EXTENSÕES DO POSTGRESQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. FUNÇÃO UTILITÁRIA PARA ATUALIZAÇÃO AUTOMÁTICA DE updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 3. TABELAS DO SISTEMA
-- ==============================================================================

-- TABELA: empresas (Tenants)
CREATE TABLE IF NOT EXISTS public.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL, -- Razão Social
  cnpj VARCHAR(30) NOT NULL UNIQUE, -- CNPJ Obrigatório
  plano VARCHAR(50) NOT NULL DEFAULT 'Básico', -- Básico, Pro, Premium, Enterprise
  email_contato VARCHAR(255), -- E-mail da empresa
  telefone VARCHAR(50), -- Celular / WhatsApp
  cep VARCHAR(20),
  endereco VARCHAR(255),
  numero VARCHAR(30),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_empresas_updated_at
BEFORE UPDATE ON public.empresas
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- TABELA: usuarios (Perfis & Autenticação)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  senha VARCHAR(255), -- Para autenticação direta ou fallback
  tipo VARCHAR(50) NOT NULL DEFAULT 'Funcionario', -- Admin, Funcionario, Vendedor, Gestor
  avatar_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_usuario_email_empresa UNIQUE (email, empresa_id)
);

CREATE TRIGGER set_usuarios_updated_at
BEFORE UPDATE ON public.usuarios
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- TABELA: parceiros (Clientes, Fornecedores, Transportadoras Unificados)
CREATE TABLE IF NOT EXISTS public.parceiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  codigo VARCHAR(50),
  tipo VARCHAR(50) NOT NULL DEFAULT 'Clientes', -- Clientes, Fornecedores, Transportadoras, Parceiro
  nome VARCHAR(255) NOT NULL,
  fantasia VARCHAR(255),
  cpf_cnpj VARCHAR(30),
  ie_rg VARCHAR(30),
  suframa VARCHAR(30),
  telefone VARCHAR(50),
  email VARCHAR(255),
  site_page VARCHAR(255),
  email_xml_nfe VARCHAR(255),
  transportadora_id UUID REFERENCES public.parceiros(id) ON DELETE SET NULL,
  ramo_atividade VARCHAR(100),
  categoria VARCHAR(100),
  -- Localização & Endereço
  cep VARCHAR(20),
  endereco VARCHAR(255),
  numero VARCHAR(30),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  regiao VARCHAR(100),
  setor VARCHAR(100),
  -- Regras Comerciais & CRM
  frequencia_visita_dias INTEGER NOT NULL DEFAULT 30,
  ultima_visita_data DATE,
  prioridade_estrelas INTEGER NOT NULL DEFAULT 3 CHECK (prioridade_estrelas BETWEEN 1 AND 5),
  obs_pedido TEXT,
  obs_aviso TEXT,
  status_ativacao VARCHAR(30) NOT NULL DEFAULT 'Ativo', -- Ativo, Inativo, Bloqueado
  limite_credito NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  vendedor_responsavel VARCHAR(255),
  contatos JSONB NOT NULL DEFAULT '[]'::jsonb,
  logomarca TEXT,
  anexos JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_parceiros_updated_at
BEFORE UPDATE ON public.parceiros
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- TABELA: produtos (Catálogo de Mercadorias & Insumos)
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  codigo VARCHAR(50),
  nome VARCHAR(255) NOT NULL,
  ncm VARCHAR(20),
  cest VARCHAR(20),
  referencia VARCHAR(50),
  cod_barra VARCHAR(50),
  comissao NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  vendedor_comissao NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  ipi NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  st NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  fornecedor_id UUID REFERENCES public.parceiros(id) ON DELETE SET NULL,
  unidade VARCHAR(20) NOT NULL DEFAULT 'Unidade',
  grupo VARCHAR(100),
  sub_grupo VARCHAR(100),
  cores VARCHAR(100),
  tamanhos VARCHAR(100),
  alerta_message TEXT,
  preco NUMERIC(15,2) NOT NULL DEFAULT 0.00, -- Preço de Venda
  preco_atacado NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  peso_liquido NUMERIC(10,3) NOT NULL DEFAULT 0.000,
  peso_bruto NUMERIC(10,3) NOT NULL DEFAULT 0.000,
  qtd_minima NUMERIC(10,2) NOT NULL DEFAULT 1.00,
  qtd_multipla NUMERIC(10,2) NOT NULL DEFAULT 1.00,
  comp NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  larg NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  altu NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  qtd_volumes INTEGER NOT NULL DEFAULT 1,
  cubagem NUMERIC(10,4) NOT NULL DEFAULT 0.0000,
  ficha_tecnica TEXT,
  estoque NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  controla_lote BOOLEAN NOT NULL DEFAULT FALSE,
  estoque_minimo NUMERIC(15,2) NOT NULL DEFAULT 5.00,
  estoque_maximo NUMERIC(15,2) NOT NULL DEFAULT 100.00,
  preco_compra NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  pct_impostos NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  pct_despesas NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  pct_frete NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  rs_frete NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  preco_custo NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  pct_margem NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  aplicacao TEXT,
  kit_itens JSONB NOT NULL DEFAULT '[]'::jsonb,
  materia_prima JSONB NOT NULL DEFAULT '[]'::jsonb,
  ultima_data_entrada TIMESTAMPTZ,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_produtos_updated_at
BEFORE UPDATE ON public.produtos
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- TABELA: condicoes_pagamento (Regras de Parcelamento e Prazos)
CREATE TABLE IF NOT EXISTS public.condicoes_pagamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  intervalo_dias VARCHAR(100) NOT NULL DEFAULT '0',
  parcelas_count INTEGER NOT NULL DEFAULT 1,
  percentual_custo_financeiro NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  custo_financeiro_fixo NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  ordem INTEGER NOT NULL DEFAULT 1,
  imprime_no_pedido BOOLEAN NOT NULL DEFAULT TRUE,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_condicoes_pagamento_updated_at
BEFORE UPDATE ON public.condicoes_pagamento
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- TABELA: entradas_estoque (Compras & Recebimento de Mercadorias)
CREATE TABLE IF NOT EXISTS public.entradas_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  numero_movimentacao VARCHAR(50) NOT NULL,
  data_hora TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usuario_responsavel VARCHAR(255),
  tipo_entrada VARCHAR(100) NOT NULL DEFAULT 'Compra de fornecedor',
  motivo VARCHAR(255),
  fornecedor_id UUID REFERENCES public.parceiros(id) ON DELETE SET NULL,
  fornecedor_nome VARCHAR(255),
  numero_nota_fiscal VARCHAR(50),
  serie_nota_fiscal VARCHAR(20) DEFAULT '1',
  observacoes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Concluida', -- Concluida, Estornada
  motivo_estorno TEXT,
  valor_total_nota NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  itens JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_entradas_estoque_updated_at
BEFORE UPDATE ON public.entradas_estoque
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- TABELA: movimentacoes_estoque (Ledger Imutável de Movimentações)
CREATE TABLE IF NOT EXISTS public.movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  entrada_id UUID REFERENCES public.entradas_estoque(id) ON DELETE SET NULL,
  numero_movimentacao VARCHAR(50),
  data_hora TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tipo_movimentacao VARCHAR(100) NOT NULL, -- Entrada (Compra), Saída (Venda), Estorno, Ajuste Manual
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  produto_nome VARCHAR(255),
  quantidade NUMERIC(15,2) NOT NULL,
  origem VARCHAR(255),
  destino VARCHAR(255),
  usuario_responsavel VARCHAR(255),
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABELA: orcamentos (Propostas Comerciais)
CREATE TABLE IF NOT EXISTS public.orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  numero VARCHAR(50) NOT NULL,
  cliente_id UUID NOT NULL REFERENCES public.parceiros(id) ON DELETE RESTRICT,
  fornecedor_id UUID REFERENCES public.parceiros(id) ON DELETE SET NULL,
  endereco_entrega TEXT,
  comprador VARCHAR(255),
  vendedor_responsavel VARCHAR(255),
  data_emissao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_despacho TIMESTAMPTZ,
  data_validade TIMESTAMPTZ,
  ordem_compra VARCHAR(100), -- xPed
  condicao_pagamento VARCHAR(255),
  tipo_frete VARCHAR(20) NOT NULL DEFAULT 'CIF', -- CIF, FOB
  status VARCHAR(50) NOT NULL DEFAULT 'Rascunho', -- Rascunho, Em Aberto, Aprovado, Rejeitado, Faturado
  motivo_rejeicao TEXT,
  subtotal NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  total_desconto NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  total_ipi NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  total_st NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  valor_frete NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  custo_financeiro NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  total NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  observacoes TEXT,
  data_envio TIMESTAMPTZ,
  forma_envio VARCHAR(50), -- WhatsApp, Email, Impresso
  data_aprovacao TIMESTAMPTZ,
  venda_id UUID,
  itens JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_orcamentos_updated_at
BEFORE UPDATE ON public.orcamentos
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- TABELA: itens_orcamento (Relacional de Itens do Orçamento)
CREATE TABLE IF NOT EXISTS public.itens_orcamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id UUID NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  quantidade NUMERIC(15,2) NOT NULL DEFAULT 1.00,
  preco_unitario NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  desconto NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  ipi NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  st NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  total NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABELA: vendas (Faturamentos & PDV)
CREATE TABLE IF NOT EXISTS public.vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.parceiros(id) ON DELETE RESTRICT,
  orcamento_id UUID REFERENCES public.orcamentos(id) ON DELETE SET NULL,
  total NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  itens_count INTEGER NOT NULL DEFAULT 0,
  data_venda TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  vendedor_responsavel VARCHAR(255),
  condicao_pagamento VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'Concluida', -- Concluida, Cancelada
  itens JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_vendas_updated_at
BEFORE UPDATE ON public.vendas
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- TABELA: itens_venda (Relacional de Itens da Venda)
CREATE TABLE IF NOT EXISTS public.itens_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID NOT NULL REFERENCES public.vendas(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  quantidade NUMERIC(15,2) NOT NULL DEFAULT 1.00,
  preco_unitario NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  total NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABELA: financeiro (Contas a Pagar & Receber)
CREATE TABLE IF NOT EXISTS public.financeiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Receber', 'Pagar')),
  valor NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Pago', 'Cancelado')),
  data_vencimento DATE NOT NULL,
  data_pagamento TIMESTAMPTZ,
  origem_tipo VARCHAR(50), -- Venda, Compra, Avulso
  origem_id UUID,
  cliente_fornecedor_id UUID REFERENCES public.parceiros(id) ON DELETE SET NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_financeiro_updated_at
BEFORE UPDATE ON public.financeiro
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- TABELA: visitas (Roteirização & CRM de Campo)
CREATE TABLE IF NOT EXISTS public.visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  codigo VARCHAR(50),
  cliente_id UUID NOT NULL REFERENCES public.parceiros(id) ON DELETE CASCADE,
  cliente_nome VARCHAR(255),
  cidade VARCHAR(100),
  endereco VARCHAR(255),
  representante_nome VARCHAR(255),
  data_hora_programada TIMESTAMPTZ NOT NULL,
  data_hora_inicio TIMESTAMPTZ,
  data_hora_termino TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL DEFAULT 'Agendada', -- Agendada, Em andamento, Concluida, Cancelada
  objetivo TEXT,
  observacoes TEXT,
  distancia_km NUMERIC(10,2) DEFAULT 0.00,
  prioridade_estrelas INTEGER NOT NULL DEFAULT 3 CHECK (prioridade_estrelas BETWEEN 1 AND 5),
  gps_check_in VARCHAR(100),
  gps_check_out VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_visitas_updated_at
BEFORE UPDATE ON public.visitas
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- TABELA: audit_logs (Trilha de Auditoria e Governança)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  usuario_nome VARCHAR(255) NOT NULL,
  acao TEXT NOT NULL,
  ip_address VARCHAR(50),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  data TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. ÍNDICES DE ALTA PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa ON public.usuarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_parceiros_empresa_tipo ON public.parceiros(empresa_id, tipo);
CREATE INDEX IF NOT EXISTS idx_parceiros_cpf_cnpj ON public.parceiros(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_produtos_empresa ON public.produtos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_produtos_cod_barra ON public.produtos(cod_barra);
CREATE INDEX IF NOT EXISTS idx_condicoes_empresa ON public.condicoes_pagamento(empresa_id);
CREATE INDEX IF NOT EXISTS idx_entradas_empresa ON public.entradas_estoque(empresa_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_empresa_prod ON public.movimentacoes_estoque(empresa_id, produto_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_empresa_status ON public.orcamentos(empresa_id, status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente ON public.orcamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_empresa ON public.vendas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente ON public.vendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_financeiro_empresa_tipo_status ON public.financeiro(empresa_id, tipo, status);
CREATE INDEX IF NOT EXISTS idx_financeiro_vencimento ON public.financeiro(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_visitas_empresa_data ON public.visitas(empresa_id, data_hora_programada);
CREATE INDEX IF NOT EXISTS idx_audit_logs_empresa ON public.audit_logs(empresa_id, data DESC);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) & POLÍTICAS MULTI-TENANT
-- ==============================================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condicoes_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entradas_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_orcamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Geral (Permite operações autenticadas e anônimas para o ERP)
CREATE POLICY "Permitir acesso total a empresas" ON public.empresas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total a usuarios" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total a parceiros" ON public.parceiros FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total a produtos" ON public.produtos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total a condicoes_pagamento" ON public.condicoes_pagamento FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total a entradas_estoque" ON public.entradas_estoque FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total a movimentacoes_estoque" ON public.movimentacoes_estoque FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total a orcamentos" ON public.orcamentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total a itens_orcamento" ON public.itens_orcamento FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total a vendas" ON public.vendas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total a itens_venda" ON public.itens_venda FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total a financeiro" ON public.financeiro FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total a visitas" ON public.visitas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total a audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
