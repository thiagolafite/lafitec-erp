-- ==============================================================================
-- MIGRAÇÃO: SISTEMA DE APROVAÇÃO DE CADASTROS PELO USUÁRIO MASTER
-- ==============================================================================

-- 1. Adiciona coluna de status de aprovação na tabela empresas
ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS status_aprovacao VARCHAR(30) NOT NULL DEFAULT 'Aprovado';

-- 2. Adiciona coluna de status de aprovação na tabela usuarios
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS status_aprovacao VARCHAR(30) NOT NULL DEFAULT 'Aprovado';

-- 3. Garante que o usuário Master inicial seja Aprovado e tipo Admin/Master
UPDATE public.usuarios 
SET tipo = 'Master', status_aprovacao = 'Aprovado'
WHERE email ILIKE 'thiago_lafite@hotmail.com';

UPDATE public.empresas
SET status_aprovacao = 'Aprovado'
WHERE status_aprovacao IS NULL;

-- 4. Índice para busca rápida de solicitações pendentes
CREATE INDEX IF NOT EXISTS idx_empresas_status_aprovacao ON public.empresas(status_aprovacao);
CREATE INDEX IF NOT EXISTS idx_usuarios_status_aprovacao ON public.usuarios(status_aprovacao);
