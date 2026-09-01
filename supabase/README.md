# 🚀 Guia de Implantação do Backend no Supabase - Lafitec ERP

Este guia orienta o provisionamento completo do banco de dados relacional e da camada de backend no **Supabase** para o **Lafitec ERP**.

---

## 📋 Passo a Passo de Configuração

### 1. Criar um Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com) e faça login na sua conta.
2. Clique em **"New Project"**.
3. Defina um **Nome** (ex: `Lafitec-ERP`), senha do banco e selecione a região mais próxima (ex: `sa-east-1` São Paulo).
4. Aguarde 1 a 2 minutos até o provisionamento do projeto.

---

### 2. Executar o Esquema do Banco de Dados (`schema.sql`)
1. No menu lateral esquerdo do painel do Supabase, clique em **SQL Editor** (ícone `>_`).
2. Clique em **"New query"**.
3. Copie todo o conteúdo do arquivo [`supabase/schema.sql`](./schema.sql) e cole no editor.
4. Clique no botão **"Run"** (ou pressione `Ctrl + Enter`).
5. ✅ Mensagem de sucesso: `Success. No rows returned.`

> Isso criará todas as **14 tabelas**, índices, gatilhos de timestamp e regras de segurança (Row Level Security).

---

### 3. Executar a Carga Inicial de Dados (`seed.sql`) *(Opcional)*
1. No **SQL Editor**, abra uma nova aba de consulta.
2. Copie o conteúdo do arquivo [`supabase/seed.sql`](./seed.sql) e cole no editor.
3. Clique em **"Run"**.

> Isso carregará as empresas de teste (*Lafite Tech Soluções LTDA* e *Mercado Lima*), usuários de teste, clientes VIP, fornecedores, produtos e lançamentos de exemplo.

---

### 4. Obter as Chaves de Conexão (API Keys)
1. No menu lateral esquerdo, vá em **Project Settings** (ícone de engrenagem ⚙️) > **API**.
2. Copie os seguintes valores:
   - **Project URL:** `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`
   - **anon / public key:** `eyJh......`

---

### 5. Configurar as Variáveis de Ambiente no Projeto
No diretório raiz do projeto (`d:/LafiteLimaTec`), crie ou edite o arquivo `.env`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbg...sua-chave-anon-aqui...
```

---

### 6. Iniciar a Aplicação
```bash
npm run dev
```

Pronto! O Lafitec ERP agora está conectado diretamente ao seu backend PostgreSQL em tempo real no Supabase.

---

## 🗄️ Estrutura das Tabelas Criadas

| Tabela | Descrição |
| :--- | :--- |
| `empresas` | Tenants multi-empresa com planos SaaS (*Básico, Pro, Premium*) |
| `usuarios` | Perfis e usuários vinculados à empresa (`Admin`, `Funcionario`, etc.) |
| `parceiros` | Clientes, Fornecedores e Transportadoras unificados com contatos JSONB |
| `produtos` | Catálogo completo com formação de custo/venda, NCM, CEST, IPI e estoque |
| `condicoes_pagamento` | Prazos, parcelas e custos financeiros fixos/percentuais |
| `entradas_estoque` | Compras e recebimentos com controle de lote e validade |
| `movimentacoes_estoque` | Histórico imutável de todas as entradas, saídas e ajustes |
| `orcamentos` | Propostas comerciais completas com cálculo de IPI/ST e frete CIF/FOB |
| `itens_orcamento` | Itens e valores unitários de cada proposta |
| `vendas` | Vendas faturadas no Ponto de Venda (PDV) e baixas de estoque |
| `itens_venda` | Itens comercializados em cada venda |
| `financeiro` | Contas a Pagar e Contas a Receber com baixa imediata |
| `visitas` | Roteirização comercial com GPS check-in/out e índice de relacionamento |
| `audit_logs` | Trilha de auditoria e governança das operações dos usuários |
