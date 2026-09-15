# 🚀 TARIRA Portal Web — Guia de Integração com Serviços Gratuitos Externalizados

Este projeto utiliza uma arquitetura moderna e 100% compatível com as camadas gratuitas (Free Tier) dos seguintes serviços:

1. **Supabase**: Autenticação (Email/Password) e Base de Dados PostgreSQL com Row Level Security (RLS).
2. **Cloudinary**: Armazenamento e entrega otimizada de ficheiros PDF, fotos e imagens.
3. **Vercel / Netlify**: Hospedagem global de alta performance com CI/CD automático.

---

## 1. ⚡ Configuração do Supabase (Autenticação & Base de Dados)

### Passo 1: Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com/) e crie uma conta gratuita.
2. Crie um novo projeto (ex: `tarira-portal`).
3. Vá a **Project Settings** > **API** e copie:
   - **Project URL** (ex: `https://xyzcompany.supabase.co`)
   - **anon / public key**

### Passo 2: Criar a Tabela `profiles` com RLS
No painel do Supabase, aceda ao **SQL Editor** e execute o seguinte script:

```sql
-- 1. Criar a tabela de perfis associada ao utilizador autenticado
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  portfolio_pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Activar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Criar Políticas de RLS para isolar acessos por utilizador
CREATE POLICY "Utilizador pode ver o proprio perfil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Utilizador pode inserir o proprio perfil" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Utilizador pode actualizar o proprio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Passo 3: Criar as Tabelas de Estado da Aplicação (candidatos, contratações, pagamentos, etc.)

O servidor (`server.ts`) guardava estes dados em memória, o que fazia com que **tudo fosse perdido a cada reinício** (candidatos, contratações, pagamentos, subscrições, pedidos de consultoria, registo de auditoria). Isto já não acontece: o servidor agora lê e grava estes dados no Supabase.

No **SQL Editor**, execute o conteúdo completo do ficheiro [`supabase_schema.sql`](./supabase_schema.sql) incluído neste projecto.

Depois, em **Project Settings → API**, copie também a **`service_role` key** (diferente da `anon` key usada no Passo 1 — esta é secreta e só deve existir no servidor, nunca no frontend).

---

## 2. ☁️ Configuração do Cloudinary (Upload Directo de PDFs e Imagens)

1. Acesse [cloudinary.com](https://cloudinary.com/) e crie uma conta gratuita.
2. No Dashboard, copie o seu **Cloud Name** e a sua **API Key**.
3. Vá a **Settings** > **Upload** > **Upload presets**.
4. Clique em **Add upload preset**:
   - **Upload preset name**: Crie um nome (ex: `tarira_unsigned`) ou use o gerado.
   - **Signing Mode**: Altere para **Unsigned** (essencial para uploads diretos do frontend sem backend).
   - Guarde as alterações.

---

## 3. 🌐 Variáveis de Ambiente (.env)

Crie ou edite o ficheiro `.env` na raiz do seu projeto com os valores obtidos:

```env
# Supabase — usado pelo FRONTEND (browser), chave pública/anónima
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_ANON_KEY="sua-chave-anonima-supabase"

# Supabase — usado pelo SERVIDOR (server.ts), chave secreta (nunca expor no frontend)
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key-secreta"

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME="seu-cloud-name"
VITE_CLOUDINARY_API_KEY="sua-api-key"
VITE_CLOUDINARY_UPLOAD_PRESET="seu-upload-preset-unsigned"
```

Sem `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`, o servidor continua a arrancar (para não quebrar o ambiente de desenvolvimento local), mas mostra um aviso claro na consola e os dados voltam a viver só em memória — **isto nunca deve acontecer num ambiente de produção real**.

---

## 4. 🚀 Deploy na Vercel ou Netlify

### Deploy na Vercel:
1. Conecte o repositório GitHub à [Vercel](https://vercel.com/).
2. A Vercel deteta automaticamente o projeto Vite (`npm run build`, pasta `dist`) **e** a função serverless em `api/index.ts` (todos os pedidos a `/api/*` são tratados por ela — ver `vercel.json`).
3. Em **Environment Variables**, adicione as 7 variáveis do `.env.example`, incluindo `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (sem estas duas, a API na Vercel continua a responder, mas sem persistência real de dados).
4. Clique em **Deploy**.

**Nota sobre a arquitetura na Vercel:** a Vercel corre a API como funções serverless, não como um servidor Node persistente — por isso `server.ts` já não chama `app.listen()` quando `process.env.VERCEL` está definido; em vez disso, `api/index.ts` trata cada pedido. O estado (candidatos, contratações, pagamentos, etc.) é sempre lido e gravado no Supabase; mantemos também uma cópia em memória por instância para respostas rápidas, mas em picos de tráfego a Vercel pode criar várias instâncias em paralelo, cada uma com a sua cópia — nesse cenário há uma pequena janela (segundos) em que instâncias diferentes podem não ver de imediato a escrita mais recente de outra. Para o volume de utilização normal deste portal isto não é percetível; se o tráfego crescer muito, o próximo passo natural é passar a ler sempre directamente do Supabase em vez da cópia em memória.

### Deploy no Netlify:
1. Conecte o repositório no Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Em **Site Configuration** > **Environment Variables**, configure as variáveis de ambiente.
5. **Nota**: a função serverless em `api/index.ts` está escrita para a Vercel; no Netlify precisaria de a adaptar para uma Netlify Function (estrutura de pastas e assinatura diferentes) — o `server.ts` em si (a lógica da app) não muda.

---

## 🔒 Segurança e Boas Práticas

- As variáveis de ambiente com o prefixo `VITE_` são expostas com segurança no bundle do cliente Vite.
- `SUPABASE_SERVICE_ROLE_KEY` (sem o prefixo `VITE_`) **nunca** é incluída no bundle do cliente — só existe no lado do servidor/função serverless. Não a coloque em nenhuma variável com prefixo `VITE_`.
- O **Unsigned Upload Preset** do Cloudinary permite apenas upload de ficheiros no caminho configurado e é protegido por limite de tamanho de ficheiro e tipos MIME.
- O **Row Level Security (RLS)** do Supabase garante ao nível da base de dados que um utilizador não consiga ler nem alterar dados de outros utilizadores, mesmo que tente fazer requisições directas via API.
