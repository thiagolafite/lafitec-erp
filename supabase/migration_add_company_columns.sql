-- ==============================================================================
-- MIGRAÇÃO: ADIÇÃO DE CAMPOS DE ENDEREÇO E CONTATO NA TABELA EMPRESAS
-- ==============================================================================

ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS cep VARCHAR(20),
  ADD COLUMN IF NOT EXISTS endereco VARCHAR(255),
  ADD COLUMN IF NOT EXISTS numero VARCHAR(30),
  ADD COLUMN IF NOT EXISTS complemento VARCHAR(100),
  ADD COLUMN IF NOT EXISTS bairro VARCHAR(100);
