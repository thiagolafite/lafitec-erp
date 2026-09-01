-- ==============================================================================
-- LAFITEC ERP - SCRIPT DE LIMPEZA TOTAL (TRUNCATE) DO BANCO DE DADOS
-- Use este script para apagar todos os dados e reiniciar do zero
-- ==============================================================================

TRUNCATE TABLE 
  public.audit_logs,
  public.visitas,
  public.financeiro,
  public.itens_venda,
  public.vendas,
  public.itens_orcamento,
  public.orcamentos,
  public.movimentacoes_estoque,
  public.entradas_estoque,
  public.condicoes_pagamento,
  public.produtos,
  public.parceiros,
  public.usuarios,
  public.empresas
CASCADE;
