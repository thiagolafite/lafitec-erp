-- ==============================================================================
-- LAFITEC ERP - SEED DATA INICIAL PARA O SUPABASE
-- Carga de dados de demonstração e testes multi-tenant
-- ==============================================================================

-- 1. EMPRESAS DE DEMONSTRAÇÃO
INSERT INTO public.empresas (id, nome, cnpj, plano, email_contato, telefone, cidade, estado)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Lafite Tech Soluções LTDA', '12.345.678/0001-90', 'Premium', 'contato@lafite.com', '(11) 4004-9000', 'São Paulo', 'SP'),
  ('22222222-2222-2222-2222-222222222222', 'Mercado Lima Comércio LTDA', '98.765.432/0001-10', 'Pro', 'contato@mercadolima.com', '(21) 3322-1100', 'Rio de Janeiro', 'RJ')
ON CONFLICT (id) DO NOTHING;

-- 2. USUÁRIOS DE DEMONSTRAÇÃO (Senha: 123)
INSERT INTO public.usuarios (id, empresa_id, nome, email, senha, tipo)
VALUES
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'Lafite Admin', 'admin@lafite.com', '123', 'Admin'),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'Carlos Vendedor', 'carlos@lafite.com', '123', 'Funcionario'),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Mariana Lima (Gestora)', 'mariana@mercadolima.com', '123', 'Admin')
ON CONFLICT (id) DO NOTHING;

-- 3. PARCEIROS (Clientes, Fornecedores e Transportadoras)
INSERT INTO public.parceiros (
  id, empresa_id, codigo, tipo, nome, fantasia, cpf_cnpj, ie_rg, suframa, telefone, email, site_page,
  email_xml_nfe, ramo_atividade, cep, endereco, numero, complemento, bairro, cidade, regiao, setor,
  frequencia_visita_dias, ultima_visita_data, prioridade_estrelas, obs_pedido, obs_aviso, status_ativacao,
  limite_credito, vendedor_responsavel, contatos
)
VALUES
  -- Cliente 1
  (
    '44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111111', 'CLI-001', 'Clientes',
    'TechCorp Brasil S.A.', 'TechCorp', '45.112.334/0001-88', '110.456.789.111', '2001928',
    '(11) 98765-4321', 'contato@techcorp.com.br', 'www.techcorp.com.br', 'nfe@techcorp.com.br',
    'Tecnologia da Informação', '01310-100', 'Av. Paulista', '1000', 'Conjunto 501', 'Bela Vista',
    'São Paulo - SP', 'Sudeste', 'Corporativo', 30, '2026-08-01', 5,
    'Entregar em horário comercial.', 'Cliente VIP Especial.', 'Ativo', 50000.00, 'Carlos Vendedor',
    '[{"id":"ct-1","nome":"Ricardo Mendes","email":"ricardo@techcorp.com","telefone":"(11) 9988-7766","setor":"Compras","obs":"Comprador Chefe","enviaEmail":"Sim"}]'::jsonb
  ),
  -- Cliente 2
  (
    '44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111111', 'CLI-002', 'Clientes',
    'Supermercado ABC LTDA', 'Supermercado ABC', '12.345.678/0001-00', '119.876.543.210', '',
    '(11) 3344-5566', 'compras@superabc.com.br', 'www.superabc.com.br', 'nfe@superabc.com.br',
    'Varejo & Supermercados', '04571-010', 'Av. Engenheiro Luís Carlos Berrini', '500', '', 'Brooklin',
    'São Paulo - SP', 'Sudeste', 'Varejo', 15, '2026-07-20', 4,
    'Recebimento de carga das 08h às 12h.', 'Verificar validade mínima.', 'Ativo', 25000.00, 'Carlos Vendedor',
    '[{"id":"ct-2","nome":"Carla Souza","email":"carla@superabc.com.br","telefone":"(11) 3344-5570","setor":"Financeiro","enviaEmail":"Sim"}]'::jsonb
  ),
  -- Cliente 3
  (
    '44444444-4444-4444-4444-444444444403', '11111111-1111-1111-1111-111111111111', 'CLI-003', 'Clientes',
    'Ana Beatriz Souza', 'Ana Souza Consultoria', '123.456.789-00', '', '',
    '(21) 99887-1122', 'ana.souza@gmail.com', '', 'ana.souza@gmail.com',
    'Serviços Profissionais', '22041-001', 'Rua Barata Ribeiro', '250', 'Apto 302', 'Copacabana',
    'Rio de Janeiro - RJ', 'Sudeste', 'Serviços', 60, '2026-05-10', 2,
    '', '', 'Ativo', 5000.00, 'Carlos Vendedor', '[]'::jsonb
  ),
  -- Fornecedor 1
  (
    '44444444-4444-4444-4444-444444444404', '11111111-1111-1111-1111-111111111111', 'FORN-101', 'Fornecedores',
    'Dell Computadores do Brasil', 'Dell Brasil', '72.381.189/0001-10', '987.654.321.000', '',
    '(11) 4004-0100', 'vendas.corp@dell.com', 'www.dell.com.br', 'nfe@dell.com',
    'Hardware & TI', '01310-200', 'Av. Paulista', '2000', '', 'Bela Vista',
    'São Paulo - SP', 'Sudeste', 'Tecnologia', 30, NULL, 5,
    '', '', 'Ativo', 100000.00, 'Lafite Admin', '[]'::jsonb
  ),
  -- Fornecedor 2
  (
    '44444444-4444-4444-4444-444444444405', '11111111-1111-1111-1111-111111111111', 'FORN-102', 'Fornecedores',
    'Bienz Indústria E Comércio Em Borrachas Ltda', 'Bienz Borrachas', '12.987.654/0001-33', '456.123.789.000', '',
    '(11) 4588-9000', 'contato@bienzborrachas.com.br', 'www.bienzborrachas.com.br', 'nfe@bienz.com.br',
    'Industrial & Borrachas', '13200-000', 'Rua das Indústrias', '450', '', 'Distrito Industrial',
    'Jundiaí - SP', 'Sudeste', 'Industrial', 30, NULL, 4,
    '', '', 'Ativo', 30000.00, 'Lafite Admin', '[]'::jsonb
  ),
  -- Transportadora 1
  (
    '44444444-4444-4444-4444-444444444406', '11111111-1111-1111-1111-111111111111', 'TR-101', 'Transportadoras',
    'Express Logística & Cargas', 'Express Log', '11.222.333/0001-44', '321.654.987.111', '',
    '(11) 3344-9900', 'atendimento@expresslog.com', 'www.expresslog.com.br', 'cte@expresslog.com',
    'Logística & Transportes', '02000-000', 'Rodovia Anhanguera', 'Km 18', '', 'Parque São Domingos',
    'São Paulo - SP', 'Sudeste', 'Logística', 30, NULL, 4,
    '', '', 'Ativo', 20000.00, 'Lafite Admin', '[]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- 4. CONDIÇÕES DE PAGAMENTO
INSERT INTO public.condicoes_pagamento (id, empresa_id, descricao, intervalo_dias, parcelas_count, percentual_custo_financeiro, custo_financeiro_fixo, ordem, imprime_no_pedido, ativo)
VALUES
  ('55555555-5555-5555-5555-555555555501', '11111111-1111-1111-1111-111111111111', 'À Vista (PIX / Dinheiro)', '0', 1, 0.00, 0.00, 1, true, true),
  ('55555555-5555-5555-5555-555555555502', '11111111-1111-1111-1111-111111111111', 'Boleto Bancário 28 Dias', '28', 1, 0.00, 3.50, 2, true, true),
  ('55555555-5555-5555-5555-555555555503', '11111111-1111-1111-1111-111111111111', 'Boleto Bancário 30 Dias', '30', 1, 0.00, 3.50, 3, true, true),
  ('55555555-5555-5555-5555-555555555504', '11111111-1111-1111-1111-111111111111', '30 / 60 Dias (2x)', '30, 60', 2, 1.50, 0.00, 4, true, true),
  ('55555555-5555-5555-5555-555555555505', '11111111-1111-1111-1111-111111111111', '30 / 60 / 90 Dias (3x)', '30, 60, 90', 3, 2.50, 0.00, 5, true, true),
  ('55555555-5555-5555-5555-555555555506', '11111111-1111-1111-1111-111111111111', 'Cartão de Crédito 1x', '30', 1, 2.99, 0.00, 6, true, true)
ON CONFLICT (id) DO NOTHING;

-- 5. PRODUTOS DO CATÁLOGO
INSERT INTO public.produtos (
  id, empresa_id, codigo, nome, ncm, cest, referencia, cod_barra, comissao, vendedor_comissao, ipi, st,
  fornecedor_id, unidade, grupo, sub_grupo, cores, tamanhos, alerta_message, preco, preco_atacado,
  peso_liquido, peso_bruto, estoque, controla_lote, estoque_minimo, estoque_maximo, preco_compra,
  pct_impostos, pct_despesas, preco_custo, pct_margem, aplicacao
)
VALUES
  (
    '66666666-6666-6666-6666-666666666601', '11111111-1111-1111-1111-111111111111', 'PROD-001',
    'Licença ERP Cloud Anual', '8523.49.90', '28.038.00', 'REF-ERP-01', '7891234567890',
    5.00, 3.00, 0.00, 0.00, '44444444-4444-4444-4444-444444444404', 'Unidade', 'Software', 'SaaS',
    'Azul', 'Único', 'Licença anual renovável.', 1490.00, 1290.00, 0.100, 0.150, 45.00, true,
    5.00, 100.00, 800.00, 10.00, 5.00, 920.00, 61.95, 'Sistemas corporativos de gestão ERP.'
  ),
  (
    '66666666-6666-6666-6666-666666666602', '11111111-1111-1111-1111-111111111111', 'PROD-002',
    'Servidor Rack Enterprise PowerEdge R650', '8471.50.10', '28.040.00', 'SRV-R650', '7899887766554',
    3.00, 2.00, 3.25, 0.00, '44444444-4444-4444-4444-444444444404', 'Unidade', 'Hardware', 'Servidores',
    'Preto', '1U', 'Garantia de 3 anos no local.', 18500.00, 16900.00, 15.500, 18.000, 8.00, true,
    2.00, 20.00, 11500.00, 12.00, 4.00, 13340.00, 38.68, 'Infraestrutura corporativa de dados e data centers.'
  ),
  (
    '66666666-6666-6666-6666-666666666603', '11111111-1111-1111-1111-111111111111', 'PROD-003',
    'Guarnição de Borracha EPDM Industrial 50m', '4016.93.00', '10.050.00', 'GB-EPDM-50', '7891122334455',
    4.00, 2.50, 5.00, 0.00, '44444444-4444-4444-4444-444444444405', 'Rolo', 'Borrachas', 'Vedações',
    'Preto', '50m', 'Armazenar em local seco e arejado.', 420.00, 380.00, 4.200, 4.500, 25.00, true,
    5.00, 50.00, 210.00, 8.00, 3.00, 233.10, 80.18, 'Vedação de painéis elétricos e equipamentos industriais.'
  )
ON CONFLICT (id) DO NOTHING;

-- 6. ENTRADA DE ESTOQUE DE DEMONSTRAÇÃO
INSERT INTO public.entradas_estoque (
  id, empresa_id, numero_movimentacao, data_hora, usuario_responsavel, tipo_entrada, motivo,
  fornecedor_id, fornecedor_nome, numero_nota_fiscal, serie_nota_fiscal, observacoes, status,
  valor_total_nota, itens
)
VALUES
  (
    '77777777-7777-7777-7777-777777777701', '11111111-1111-1111-1111-111111111111', 'ENT-001',
    '2026-08-01T10:00:00.000Z', 'Lafite Admin', 'Compra de fornecedor', 'Abastecimento inicial de estoque',
    '44444444-4444-4444-4444-444444444404', 'Dell Computadores do Brasil', 'NF-99881', '1',
    'Recebimento conferido com sucesso no almoxarifado central.', 'Concluida', 40000.00,
    '[{"produtoId":"66666666-6666-6666-6666-666666666601","produtoNome":"Licença ERP Cloud Anual","codigoInterno":"PROD-001","quantidade":50,"unidade":"Unidade","valorUnitario":800.00,"valorTotal":40000.00,"lote":"LOT-2026-A","dataFabricacao":"2026-07-01","dataValidade":"2027-07-01"}]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- 7. MOVIMENTAÇÃO DE ESTOQUE
INSERT INTO public.movimentacoes_estoque (
  id, empresa_id, entrada_id, numero_movimentacao, data_hora, tipo_movimentacao,
  produto_id, produto_nome, quantidade, origem, destino, usuario_responsavel, observacoes
)
VALUES
  (
    '88888888-8888-8888-8888-888888888801', '11111111-1111-1111-1111-111111111111',
    '77777777-7777-7777-7777-777777777701', 'ENT-001', '2026-08-01T10:00:00.000Z',
    'Entrada (Compra de fornecedor)', '66666666-6666-6666-6666-666666666601',
    'Licença ERP Cloud Anual', 50.00, 'Dell Computadores do Brasil', 'Estoque Central',
    'Lafite Admin', 'Entrada Nota Fiscal #NF-99881'
  )
ON CONFLICT (id) DO NOTHING;

-- 8. ORÇAMENTO DE DEMONSTRAÇÃO
INSERT INTO public.orcamentos (
  id, empresa_id, numero, cliente_id, fornecedor_id, endereco_entrega, comprador, vendedor_responsavel,
  data_emissao, data_validade, condicao_pagamento, tipo_frete, status, subtotal, total_desconto,
  total_ipi, total_st, valor_frete, custo_financeiro, total, observacoes, data_envio, forma_envio,
  data_aprovacao, itens
)
VALUES
  (
    '99999999-9999-9999-9999-999999999901', '11111111-1111-1111-1111-111111111111', 'ORC-001',
    '44444444-4444-4444-4444-444444444401', '44444444-4444-4444-4444-444444444404',
    'Av. Paulista, 1000 - Bela Vista - São Paulo / SP', 'Ricardo Mendes', 'Carlos Vendedor',
    '2026-08-10T09:00:00.000Z', '2026-09-10T23:59:59.000Z', 'Boleto Bancário 30 Dias', 'CIF', 'Aprovado',
    2980.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2980.00,
    'Proposta comercial aprovada para expansão de licenças.', '2026-08-10T09:15:00.000Z', 'WhatsApp',
    '2026-08-12T14:30:00.000Z',
    '[{"id":"it-orc-1","produtoId":"66666666-6666-6666-6666-666666666601","quantidade":2,"precoUnitario":1490.00}]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- 9. VENDAS FATURADAS
INSERT INTO public.vendas (
  id, empresa_id, cliente_id, orcamento_id, total, itens_count, data_venda,
  vendedor_responsavel, condicao_pagamento, status, itens
)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444401', '99999999-9999-9999-9999-999999999901',
    5290.00, 2, '2026-08-01T10:30:00.000Z', 'Carlos Vendedor', 'Boleto Bancário 30 Dias', 'Concluida',
    '[{"produtoId":"66666666-6666-6666-6666-666666666601","quantidade":5,"precoUnitario":1490.00}]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- 10. FINANCEIRO (Lançamentos de Contas)
INSERT INTO public.financeiro (
  id, empresa_id, descricao, tipo, valor, status, data_vencimento, data_pagamento,
  origem_tipo, origem_id, cliente_fornecedor_id
)
VALUES
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', '11111111-1111-1111-1111-111111111111',
    'Recebimento Venda #VEN-101 - TechCorp Brasil S.A.', 'Receber', 5290.00, 'Pago',
    '2026-08-01', '2026-08-01T10:30:00.000Z', 'Venda',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444401'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', '11111111-1111-1111-1111-111111111111',
    'Faturamento NF-99881 Dell Computadores (Servidores)', 'Pagar', 40000.00, 'Pendente',
    '2026-09-15', NULL, 'Compra',
    '77777777-7777-7777-7777-777777777701', '44444444-4444-4444-4444-444444444404'
  )
ON CONFLICT (id) DO NOTHING;

-- 11. VISITAS COMERCIAIS
INSERT INTO public.visitas (
  id, empresa_id, codigo, cliente_id, cliente_nome, cidade, endereco, representante_nome,
  data_hora_programada, data_hora_inicio, status, objetivo, observacoes, distancia_km,
  prioridade_estrelas, gps_check_in
)
VALUES
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'VIS-001',
    '44444444-4444-4444-4444-444444444401', 'TechCorp Brasil S.A.', 'São Paulo - SP',
    'Av. Paulista, 1000', 'Carlos Vendedor', '2026-08-04T10:00:00.000Z', '2026-08-04T10:05:00.000Z',
    'Em andamento', 'Apresentação da nova linha de servidores ERP Cloud e negociação anual.',
    'Cliente muito receptivo à renovação e interessado no módulo de rotas.', 4.20, 5,
    '-23.561414, -46.655881'
  )
ON CONFLICT (id) DO NOTHING;

-- 12. AUDIT LOGS
INSERT INTO public.audit_logs (id, empresa_id, usuario_nome, acao, data)
VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddd01', '11111111-1111-1111-1111-111111111111', 'Lafite Admin', 'Sistema inicializado e banco PostgreSQL provisionado no Supabase.', NOW())
ON CONFLICT (id) DO NOTHING;
