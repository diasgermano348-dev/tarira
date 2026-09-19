-- ============================================================================
-- TARIRA PORTAL — ESQUEMA COMPLETO DE BASE DE DADOS POSTGRESQL / SUPABASE
-- 
-- Módulos Cobertos:
--   1. Autenticação & Perfis (Admin, Central de Atendimento, Comercial, Prestadores, Empresas)
--   2. Operadores da Organização (Central & Multi-Logins com Auditoria)
--   3. Prestadores de Ofício & Profissionais Especialistas (Tarira Connect / Recruit)
--   4. Categorias de Serviços & Especialidades
--   5. Pedidos de Clientes & Central de Atendimento / Despacho WhatsApp
--   6. Registo de Auditoria de Eliminação & Alterações (Audit Trail)
--   7. Ordens de Pagamento & Pedidos de Saque
--   8. CMS / Conteúdo Dinâmico
--   9. Candidaturas Espontâneas & Banco de Talentos
--  10. Parceiros (Empresas & Lojas Axofacil) & Banners da Landing Page
--  11. Supabase Storage Buckets & Políticas RLS
--
-- Como aplicar:
--   1. Aceda a https://supabase.com/dashboard
--   2. Selecione o seu projeto → "SQL Editor" → "New Query"
--   3. Cole este ficheiro completo e clique em "Run"
-- ============================================================================

-- Extensões úteis
create extension if not exists "uuid-ossp";

-- ============================================================================
-- 1. AUTENTICAÇÃO REAL (SUPABASE AUTH) — PERFIS DE UTILIZADOR
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Utilizador',
  email text not null default '',
  role text not null default 'prestador',
  phone text,
  city text default 'Maputo',
  nuit text,
  category text,
  candidate_id text,
  client_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garantir colunas caso a tabela já existisse
alter table public.profiles add column if not exists name text default 'Utilizador';
alter table public.profiles add column if not exists email text default '';
alter table public.profiles add column if not exists role text default 'prestador';
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists city text default 'Maputo';
alter table public.profiles add column if not exists nuit text;
alter table public.profiles add column if not exists category text;
alter table public.profiles add column if not exists candidate_id text;
alter table public.profiles add column if not exists client_id text;
alter table public.profiles add column if not exists is_active boolean default true;
alter table public.profiles add column if not exists company_name text;
alter table public.profiles add column if not exists company_sector text;
alter table public.profiles add column if not exists company_employees text;
alter table public.profiles add column if not exists condo_name text;
alter table public.profiles add column if not exists condo_type text;
alter table public.profiles add column if not exists condo_units integer;
alter table public.profiles add column if not exists residential_type text;
alter table public.profiles add column if not exists contact_person text;
alter table public.profiles add column if not exists contact_person_title text;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

alter table public.profiles enable row level security;
create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_category_idx on public.profiles (category);

-- Políticas RLS para Perfis (seguras desde a origem — o utilizador só pode
-- criar/alterar o SEU PRÓPRIO registo; o servidor usa a service_role key,
-- que ignora RLS, para as operações administrativas/automáticas).
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Utilizador vê o próprio perfil') then
    create policy "Utilizador vê o próprio perfil" on public.profiles for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Utilizador cria o próprio perfil') then
    create policy "Utilizador cria o próprio perfil" on public.profiles for insert with check (auth.uid() = id or auth.role() = 'service_role');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Utilizador actualiza o próprio perfil') then
    create policy "Utilizador actualiza o próprio perfil" on public.profiles for update using (auth.uid() = id or auth.role() = 'service_role');
  end if;
exception when others then null;
end $$;

-- Trigger automático no Supabase Auth: cria ou sincroniza o perfil logo que o utilizador é criado em auth.users
-- Com protecção de bloco EXCEPTION para garantir que falhas em colunas/tabelas nunca bloqueiem a criação da conta
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_full_name text;
  user_role text;
  user_phone text;
  user_city text;
  user_nuit text;
  user_category text;
begin
  begin
    user_full_name := coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(coalesce(new.email, ''), '@', 1), 'Utilizador');
    user_role := coalesce(new.raw_user_meta_data->>'role', 'lar');
    user_phone := coalesce(new.raw_user_meta_data->>'phone', '');
    user_city := coalesce(new.raw_user_meta_data->>'city', 'Maputo');
    user_nuit := coalesce(new.raw_user_meta_data->>'nuit', '');
    user_category := coalesce(new.raw_user_meta_data->>'category', '');

    -- Se for o email do administrador oficial, define logo o perfil como admin
    if lower(coalesce(new.email, '')) = 'tarira.ecossistema@gmail.com' or lower(coalesce(new.email, '')) = 'tariraecossystem@gmail.com' or lower(coalesce(new.email, '')) = 'admin@tarira.co.mz' then
      user_role := 'admin';
    end if;

    insert into public.profiles (
      id, name, email, role, phone, city, nuit, category, is_active,
      company_name, company_sector, company_employees,
      condo_name, condo_type, condo_units, residential_type,
      contact_person, contact_person_title,
      created_at, updated_at
    )
    values (
      new.id,
      user_full_name,
      lower(coalesce(new.email, '')),
      user_role,
      user_phone,
      user_city,
      user_nuit,
      user_category,
      true,
      nullif(new.raw_user_meta_data->>'company_name', ''),
      nullif(new.raw_user_meta_data->>'company_sector', ''),
      nullif(new.raw_user_meta_data->>'company_employees', ''),
      nullif(new.raw_user_meta_data->>'condo_name', ''),
      nullif(new.raw_user_meta_data->>'condo_type', ''),
      case when new.raw_user_meta_data->>'condo_units' ~ '^[0-9]+$' then (new.raw_user_meta_data->>'condo_units')::integer else null end,
      nullif(new.raw_user_meta_data->>'residential_type', ''),
      nullif(new.raw_user_meta_data->>'contact_person', ''),
      nullif(new.raw_user_meta_data->>'contact_person_title', ''),
      now(),
      now()
    )
    on conflict (id) do update set
      name = coalesce(excluded.name, public.profiles.name),
      email = coalesce(excluded.email, public.profiles.email),
      role = case when public.profiles.role = 'admin' then 'admin' else coalesce(excluded.role, public.profiles.role) end,
      phone = coalesce(nullif(excluded.phone, ''), public.profiles.phone),
      city = coalesce(nullif(excluded.city, ''), public.profiles.city),
      nuit = coalesce(nullif(excluded.nuit, ''), public.profiles.nuit),
      category = coalesce(nullif(excluded.category, ''), public.profiles.category),
      company_name = coalesce(nullif(excluded.company_name, ''), public.profiles.company_name),
      company_sector = coalesce(nullif(excluded.company_sector, ''), public.profiles.company_sector),
      condo_name = coalesce(nullif(excluded.condo_name, ''), public.profiles.condo_name),
      contact_person = coalesce(nullif(excluded.contact_person, ''), public.profiles.contact_person),
      updated_at = now();
  exception when others then
    -- Bloqueio silencioso de erro: garante que o utilizador é SEMPRE criado em auth.users
    null;
  end;

  return new;
end;
$$;

-- Vincular o trigger à tabela auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 2. OPERADORES DA ORGANIZAÇÃO (CENTRAL DE ATENDIMENTO, ADMIN & COMERCIAL)
-- ============================================================================
create table if not exists public.operators (
  id text primary key,
  name text not null,
  email text not null,
  role text not null default 'Central de Atendimento & Despacho',
  access_level text not null default 'central',
  org_id text not null default 'admin-org',
  org_name text not null default 'Central TARIRA Admin',
  permissions jsonb not null default '["Validar Pedidos", "Despachar Prestadores", "Contactar WhatsApp", "Gerir Categorias"]'::jsonb,
  status text not null default 'Ativo',
  last_active timestamptz not null default now(),
  avatar text default '🎯',
  created_by text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garantir colunas caso a tabela já existisse
alter table public.operators add column if not exists name text;
alter table public.operators add column if not exists email text;
alter table public.operators add column if not exists role text default 'Central de Atendimento & Despacho';
alter table public.operators add column if not exists access_level text default 'central';
alter table public.operators add column if not exists org_id text default 'admin-org';
alter table public.operators add column if not exists org_name text default 'Central TARIRA Admin';
alter table public.operators add column if not exists permissions jsonb default '["Validar Pedidos", "Despachar Prestadores", "Contactar WhatsApp", "Gerir Categorias"]'::jsonb;
alter table public.operators add column if not exists status text default 'Ativo';
alter table public.operators add column if not exists last_active timestamptz default now();
alter table public.operators add column if not exists avatar text default '🎯';
alter table public.operators add column if not exists created_by text;
alter table public.operators add column if not exists data jsonb default '{}'::jsonb;
alter table public.operators add column if not exists created_at timestamptz default now();
alter table public.operators add column if not exists updated_at timestamptz default now();

create index if not exists operators_access_level_idx on public.operators (access_level);

-- ============================================================================
-- 3. PRESTADORES DE SERVIÇOS & PROFISSIONAIS (CONNECT & RECRUIT)
-- ============================================================================
create table if not exists public.candidates (
  id text primary key,
  name text not null default '',
  surname text,
  email text,
  phone text,
  whatsapp text,
  category text not null default 'Outros',
  sub_category text,
  title text,
  city text default 'Maputo',
  residence text,
  hourly_rate_mzn numeric(10,2),
  expected_salary_min numeric(10,2),
  expected_salary_max numeric(10,2),
  experience_years integer default 3,
  rating numeric(3,2) default 5.0,
  completed_jobs integer default 0,
  match_score integer default 90,
  available_now boolean default true,
  available_for_emergency boolean default false,
  is_professional boolean default false,
  status text not null default 'approved',
  bio text,
  skills jsonb default '[]'::jsonb,
  documents jsonb default '[]'::jsonb,
  portfolio jsonb default '[]'::jsonb,
  photo_url text,
  data jsonb not null default '{}'::jsonb,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz not null default now()
);

-- Garantir que a coluna 'category' e todas as outras colunas existam mesmo se a tabela já foi criada anteriormente
alter table public.candidates add column if not exists name text default '';
alter table public.candidates add column if not exists surname text;
alter table public.candidates add column if not exists email text;
alter table public.candidates add column if not exists phone text;
alter table public.candidates add column if not exists whatsapp text;
alter table public.candidates add column if not exists category text default 'Outros';
alter table public.candidates add column if not exists sub_category text;
alter table public.candidates add column if not exists title text;
alter table public.candidates add column if not exists city text default 'Maputo';
alter table public.candidates add column if not exists residence text;
alter table public.candidates add column if not exists hourly_rate_mzn numeric(10,2);
alter table public.candidates add column if not exists expected_salary_min numeric(10,2);
alter table public.candidates add column if not exists expected_salary_max numeric(10,2);
alter table public.candidates add column if not exists experience_years integer default 3;
alter table public.candidates add column if not exists rating numeric(3,2) default 5.0;
alter table public.candidates add column if not exists completed_jobs integer default 0;
alter table public.candidates add column if not exists match_score integer default 90;
alter table public.candidates add column if not exists available_now boolean default true;
alter table public.candidates add column if not exists available_for_emergency boolean default false;
alter table public.candidates add column if not exists is_professional boolean default false;
alter table public.candidates add column if not exists status text default 'approved';
alter table public.candidates add column if not exists bio text;
alter table public.candidates add column if not exists skills jsonb default '[]'::jsonb;
alter table public.candidates add column if not exists documents jsonb default '[]'::jsonb;
alter table public.candidates add column if not exists portfolio jsonb default '[]'::jsonb;
alter table public.candidates add column if not exists photo_url text;
alter table public.candidates add column if not exists data jsonb default '{}'::jsonb;
alter table public.candidates add column if not exists created_by text;
alter table public.candidates add column if not exists created_at timestamptz default now();
alter table public.candidates add column if not exists updated_at timestamptz default now();

create index if not exists candidates_category_idx on public.candidates (category);
create index if not exists candidates_status_idx on public.candidates (status);
create index if not exists candidates_is_professional_idx on public.candidates (is_professional);

-- ============================================================================
-- 4. CATEGORIAS DE SERVIÇOS & ESPECIALIDADES
-- ============================================================================
create table if not exists public.service_categories (
  id text primary key,
  name text not null default '',
  category_group text not null default 'trades',
  icon text not null default '🔧',
  badge text,
  description text,
  specialties jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_by text,
  data jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garantir colunas caso a tabela já existisse
alter table public.service_categories add column if not exists name text default '';
alter table public.service_categories add column if not exists category_group text default 'trades';
alter table public.service_categories add column if not exists icon text default '🔧';
alter table public.service_categories add column if not exists badge text;
alter table public.service_categories add column if not exists description text;
alter table public.service_categories add column if not exists specialties jsonb default '[]'::jsonb;
alter table public.service_categories add column if not exists is_active boolean default true;
alter table public.service_categories add column if not exists created_by text;
alter table public.service_categories add column if not exists data jsonb default '{}'::jsonb;
alter table public.service_categories add column if not exists created_at timestamptz default now();
alter table public.service_categories add column if not exists updated_at timestamptz default now();

-- ============================================================================
-- 5. PEDIDOS DE CLIENTES & CENTRAL DE DESPACHO (HIRES / ORDENS DE SERVIÇO)
-- ============================================================================
create table if not exists public.hires (
  id text primary key,
  client_id text,
  client_name text not null default 'Cliente',
  client_email text,
  client_phone text,
  candidate_id text references public.candidates(id) on delete set null,
  candidate_name text,
  service_name text not null default 'Serviço',
  service_category text,
  category text,
  location text,
  target_date text,
  preferred_time text,
  description text,
  rate_mzn numeric(10,2),
  total_estimate numeric(10,2),
  payment_modality text default 'diario_pos_servico',
  payment_status text default 'pending',
  status text not null default 'pending',
  central_notes text,
  assigned_operator_id text,
  assigned_operator_name text,
  whatsapp_client_contacted_at timestamptz,
  whatsapp_provider_contacted_at timestamptz,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garantir colunas caso a tabela já existisse
alter table public.hires add column if not exists client_id text;
alter table public.hires add column if not exists client_name text default 'Cliente';
alter table public.hires add column if not exists client_email text;
alter table public.hires add column if not exists client_phone text;
alter table public.hires add column if not exists candidate_id text;
alter table public.hires add column if not exists candidate_name text;
alter table public.hires add column if not exists service_name text default 'Serviço';
alter table public.hires add column if not exists service_category text;
alter table public.hires add column if not exists category text;
alter table public.hires add column if not exists location text;
alter table public.hires add column if not exists target_date text;
alter table public.hires add column if not exists preferred_time text;
alter table public.hires add column if not exists description text;
alter table public.hires add column if not exists rate_mzn numeric(10,2);
alter table public.hires add column if not exists total_estimate numeric(10,2);
alter table public.hires add column if not exists payment_modality text default 'diario_pos_servico';
alter table public.hires add column if not exists payment_status text default 'pending';
alter table public.hires add column if not exists status text default 'pending';
alter table public.hires add column if not exists central_notes text;
alter table public.hires add column if not exists assigned_operator_id text;
alter table public.hires add column if not exists assigned_operator_name text;
alter table public.hires add column if not exists whatsapp_client_contacted_at timestamptz;
alter table public.hires add column if not exists whatsapp_provider_contacted_at timestamptz;
alter table public.hires add column if not exists data jsonb default '{}'::jsonb;
alter table public.hires add column if not exists created_at timestamptz default now();
alter table public.hires add column if not exists updated_at timestamptz default now();

create index if not exists hires_status_idx on public.hires (status);
create index if not exists hires_client_id_idx on public.hires (client_id);
create index if not exists hires_candidate_id_idx on public.hires (candidate_id);

-- ============================================================================
-- 6. CLIENTES CONTRATANTES (EMPRESAS, LARES & CONDOMÍNIOS)
-- ============================================================================
create table if not exists public.clients (
  id text primary key,
  name text not null default 'Cliente',
  type text not null default 'company',
  email text,
  phone text,
  address text,
  bi text,
  nuit text,
  linkedin text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garantir colunas caso a tabela já existisse
alter table public.clients add column if not exists name text default 'Cliente';
alter table public.clients add column if not exists type text default 'company';
alter table public.clients add column if not exists email text;
alter table public.clients add column if not exists phone text;
alter table public.clients add column if not exists address text;
alter table public.clients add column if not exists bi text;
alter table public.clients add column if not exists nuit text;
alter table public.clients add column if not exists linkedin text;
alter table public.clients add column if not exists data jsonb default '{}'::jsonb;
alter table public.clients add column if not exists created_at timestamptz default now();
alter table public.clients add column if not exists updated_at timestamptz default now();

-- ============================================================================
-- 6.1 OPERADORES INTERNOS (contas de staff/admin do ecossistema TARIRA)
-- ============================================================================
-- Tabela genérica (id / data jsonb / updated_at) — mesmo padrão simples usado
-- por outras coleções de estado (ver loadTable/bulkUpsertTable/deleteFromTable
-- em supabaseServer.ts). Antes desta tabela existir, os "operadores" viviam
-- apenas como um array fixo no frontend, nunca persistido — eliminar um
-- operador na Central não tinha qualquer efeito real. Isto corrige isso.
create table if not exists public.operators (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.operators add column if not exists data jsonb default '{}'::jsonb;
alter table public.operators add column if not exists created_at timestamptz default now();
alter table public.operators add column if not exists updated_at timestamptz default now();

-- ============================================================================
-- 7. AUDIT LOGS — REGISTO DE QUEM ELIMINOU/EDITOU PERFIS E PEDIDOS
-- ============================================================================
create table if not exists public.audit_logs (
  id text primary key,
  user_name text,
  user_email text,
  user_role text default 'admin',
  action_type text,
  target_entity_type text,
  target_entity_id text,
  target_entity_name text,
  details text,
  ip_address text default '197.249.0.12',
  category text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Garantir colunas caso a tabela já existisse
alter table public.audit_logs add column if not exists user_name text;
alter table public.audit_logs add column if not exists user_email text;
alter table public.audit_logs add column if not exists user_role text default 'admin';
alter table public.audit_logs add column if not exists action_type text;
alter table public.audit_logs add column if not exists target_entity_type text;
alter table public.audit_logs add column if not exists target_entity_id text;
alter table public.audit_logs add column if not exists target_entity_name text;
alter table public.audit_logs add column if not exists details text;
alter table public.audit_logs add column if not exists ip_address text default '197.249.0.12';
alter table public.audit_logs add column if not exists category text;
alter table public.audit_logs add column if not exists data jsonb default '{}'::jsonb;
alter table public.audit_logs add column if not exists created_at timestamptz default now();

create index if not exists audit_logs_action_type_idx on public.audit_logs (action_type);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);

-- ============================================================================
-- 8. PROPOSTAS COMERCIAIS & CONCURSOS (B2B / OUTSOURCING / CONSULTORIA)
-- ============================================================================
create table if not exists public.commercial_proposals (
  id text primary key,
  company_name text not null default 'Empresa',
  contact_person text,
  contact_email text not null default '',
  contact_phone text not null default '',
  operation_type text not null default 'outsourcing',
  headcount integer not null default 1,
  sla_level text not null default 'Ouro',
  source text not null default 'tender',
  comments text,
  budget_estimate_mzn numeric(12,2) default 0,
  assigned_manager text,
  status text not null default 'pending',
  internal_notes text,
  document_name text,
  data jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garantir colunas caso a tabela já existisse
alter table public.commercial_proposals add column if not exists company_name text default 'Empresa';
alter table public.commercial_proposals add column if not exists contact_person text;
alter table public.commercial_proposals add column if not exists contact_email text default '';
alter table public.commercial_proposals add column if not exists contact_phone text default '';
alter table public.commercial_proposals add column if not exists operation_type text default 'outsourcing';
alter table public.commercial_proposals add column if not exists headcount integer default 1;
alter table public.commercial_proposals add column if not exists sla_level text default 'Ouro';
alter table public.commercial_proposals add column if not exists source text default 'tender';
alter table public.commercial_proposals add column if not exists comments text;
alter table public.commercial_proposals add column if not exists budget_estimate_mzn numeric(12,2) default 0;
alter table public.commercial_proposals add column if not exists assigned_manager text;
alter table public.commercial_proposals add column if not exists status text default 'pending';
alter table public.commercial_proposals add column if not exists internal_notes text;
alter table public.commercial_proposals add column if not exists document_name text;
alter table public.commercial_proposals add column if not exists data jsonb default '{}'::jsonb;
alter table public.commercial_proposals add column if not exists submitted_at timestamptz default now();
alter table public.commercial_proposals add column if not exists updated_at timestamptz default now();

-- ============================================================================
-- 9. PAGAMENTOS & PEDIDOS DE SAQUE (PAYOUTS)
-- ============================================================================
create table if not exists public.payment_orders (
  id text primary key,
  client_name text not null default 'Cliente',
  amount numeric(10,2) not null default 0,
  currency text not null default 'MZN',
  status text not null default 'pending',
  method text,
  reference text,
  user_email text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Garantir colunas caso a tabela já existisse
alter table public.payment_orders add column if not exists client_name text default 'Cliente';
alter table public.payment_orders add column if not exists amount numeric(10,2) default 0;
alter table public.payment_orders add column if not exists currency text default 'MZN';
alter table public.payment_orders add column if not exists status text default 'pending';
alter table public.payment_orders add column if not exists method text;
alter table public.payment_orders add column if not exists reference text;
alter table public.payment_orders add column if not exists user_email text;
alter table public.payment_orders add column if not exists data jsonb default '{}'::jsonb;
alter table public.payment_orders add column if not exists created_at timestamptz default now();

create table if not exists public.payout_requests (
  id text primary key,
  candidate_id text references public.candidates(id) on delete set null,
  candidate_name text not null default 'Prestador',
  amount numeric(10,2) not null default 0,
  payout_channel text not null default 'M-Pesa',
  phone_number text not null default '',
  status text not null default 'pending',
  approved_by text,
  approved_at timestamptz,
  notes text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Garantir colunas caso a tabela já existisse
alter table public.payout_requests add column if not exists candidate_id text;
alter table public.payout_requests add column if not exists candidate_name text default 'Prestador';
alter table public.payout_requests add column if not exists amount numeric(10,2) default 0;
alter table public.payout_requests add column if not exists payout_channel text default 'M-Pesa';
alter table public.payout_requests add column if not exists phone_number text default '';
alter table public.payout_requests add column if not exists status text default 'pending';
alter table public.payout_requests add column if not exists approved_by text;
alter table public.payout_requests add column if not exists approved_at timestamptz;
alter table public.payout_requests add column if not exists notes text;
alter table public.payout_requests add column if not exists data jsonb default '{}'::jsonb;
alter table public.payout_requests add column if not exists created_at timestamptz default now();

-- ============================================================================
-- 10. CMS & CONTEÚDO DINÂMICO
-- ============================================================================
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Garantir colunas caso a tabela já existisse
alter table public.site_content add column if not exists value jsonb default '{}'::jsonb;
alter table public.site_content add column if not exists updated_at timestamptz default now();

-- ============================================================================
-- 11. CANDIDATURAS ESPONTÂNEAS (PORTAL DE TALENTO & BANCO DE PERFIS)
-- ============================================================================
create table if not exists public.spontaneous_applications (
  id text primary key,
  full_name text not null default 'Candidato',
  phone text not null default '',
  email text,
  residence text default 'Maputo Cidade',
  career_focus text default 'recruitment_no_exp',
  nuit text,
  id_document_name text,
  id_document_url text,
  cv_document_name text,
  cv_document_url text,
  is_ats_validated boolean default true,
  ats_score integer default 90,
  experiences jsonb default '[]'::jsonb,
  status text not null default 'pending',
  notes text,
  data jsonb default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garantir colunas caso a tabela já existisse
alter table public.spontaneous_applications add column if not exists full_name text default 'Candidato';
alter table public.spontaneous_applications add column if not exists phone text default '';
alter table public.spontaneous_applications add column if not exists email text;
alter table public.spontaneous_applications add column if not exists residence text default 'Maputo Cidade';
alter table public.spontaneous_applications add column if not exists career_focus text default 'recruitment_no_exp';
alter table public.spontaneous_applications add column if not exists nuit text;
alter table public.spontaneous_applications add column if not exists id_document_name text;
alter table public.spontaneous_applications add column if not exists id_document_url text;
alter table public.spontaneous_applications add column if not exists cv_document_name text;
alter table public.spontaneous_applications add column if not exists cv_document_url text;
alter table public.spontaneous_applications add column if not exists is_ats_validated boolean default true;
alter table public.spontaneous_applications add column if not exists ats_score integer default 90;
alter table public.spontaneous_applications add column if not exists experiences jsonb default '[]'::jsonb;
alter table public.spontaneous_applications add column if not exists status text default 'pending';
alter table public.spontaneous_applications add column if not exists notes text;
alter table public.spontaneous_applications add column if not exists data jsonb default '{}'::jsonb;
alter table public.spontaneous_applications add column if not exists submitted_at timestamptz default now();
alter table public.spontaneous_applications add column if not exists updated_at timestamptz default now();

-- ============================================================================
-- 12. REDE DE PARCEIROS: EMPRESAS & LOJAS CONNECT
-- ============================================================================
create table if not exists public.partner_companies (
  id text primary key,
  name text not null default 'Empresa Parceira',
  sector text not null default 'Geral',
  city text default 'Maputo',
  discount_rate text,
  logo_url text,
  active boolean default true,
  notes text,
  data jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garantir colunas caso a tabela já existisse
alter table public.partner_companies add column if not exists name text default 'Empresa Parceira';
alter table public.partner_companies add column if not exists sector text default 'Geral';
alter table public.partner_companies add column if not exists city text default 'Maputo';
alter table public.partner_companies add column if not exists discount_rate text;
alter table public.partner_companies add column if not exists logo_url text;
alter table public.partner_companies add column if not exists active boolean default true;
alter table public.partner_companies add column if not exists notes text;
alter table public.partner_companies add column if not exists data jsonb default '{}'::jsonb;
alter table public.partner_companies add column if not exists created_at timestamptz default now();
alter table public.partner_companies add column if not exists updated_at timestamptz default now();

create table if not exists public.partner_stores (
  id text primary key,
  name text not null default 'Loja Parceira',
  category text not null default 'Material de Construção',
  city text default 'Maputo',
  phone text,
  website text,
  logo_url text,
  active boolean default true,
  notes text,
  data jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garantir que a coluna 'category' e outras existam caso a tabela partner_stores já existisse
alter table public.partner_stores add column if not exists name text default 'Loja Parceira';
alter table public.partner_stores add column if not exists category text default 'Material de Construção';
alter table public.partner_stores add column if not exists city text default 'Maputo';
alter table public.partner_stores add column if not exists phone text;
alter table public.partner_stores add column if not exists website text;
alter table public.partner_stores add column if not exists logo_url text;
alter table public.partner_stores add column if not exists active boolean default true;
alter table public.partner_stores add column if not exists notes text;
alter table public.partner_stores add column if not exists data jsonb default '{}'::jsonb;
alter table public.partner_stores add column if not exists created_at timestamptz default now();
alter table public.partner_stores add column if not exists updated_at timestamptz default now();

-- ============================================================================
-- 13. BANNERS DINÂMICOS DA LANDING PAGE
-- ============================================================================
create table if not exists public.landing_banners (
  id text primary key,
  category text not null default 'Geral',
  title text not null default '',
  tagline text,
  description text,
  url text not null default '',
  active boolean default true,
  data jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garantir que a coluna 'category' e outras existam caso a tabela landing_banners já existisse
alter table public.landing_banners add column if not exists category text default 'Geral';
alter table public.landing_banners add column if not exists title text default '';
alter table public.landing_banners add column if not exists tagline text;
alter table public.landing_banners add column if not exists description text;
alter table public.landing_banners add column if not exists url text default '';
alter table public.landing_banners add column if not exists active boolean default true;
alter table public.landing_banners add column if not exists data jsonb default '{}'::jsonb;
alter table public.landing_banners add column if not exists created_at timestamptz default now();
alter table public.landing_banners add column if not exists updated_at timestamptz default now();

-- ============================================================================
-- 14. SUPABASE STORAGE BUCKETS (DOCUMENTOS, FOTOGRAFIAS E PROPOSTAS COM LIMITE 50MB OU UNSET)
-- ============================================================================
-- Criação / Atualização de Buckets de Storage com limite de 50 MB (52428800 bytes) ou unset (null)
insert into storage.buckets (id, name, public, file_size_limit)
values 
  ('tarira-documents', 'tarira-documents', true, 52428800),
  ('tarira-photos', 'tarira-photos', true, 52428800),
  ('proposals_documents', 'proposals_documents', true, 52428800),
  ('consulting_proposals', 'consulting_proposals', true, 52428800),
  ('uploads', 'uploads', true, 52428800)
on conflict (id) do update set 
  public = true,
  file_size_limit = 52428800;

-- NOTA: Para deixar o limite ilimitado/unset (sem restrição local do bucket no Supabase),
-- pode executar alternativamente:
-- update storage.buckets set file_size_limit = null where id in ('tarira-documents', 'tarira-photos', 'proposals_documents', 'consulting_proposals', 'uploads');

-- Políticas de Leitura e Escrita Públicas para Storage
do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Permitir upload publico tarira') then
    create policy "Permitir upload publico tarira" on storage.objects for insert with check (bucket_id in ('tarira-documents', 'tarira-photos', 'proposals_documents', 'consulting_proposals', 'uploads'));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Permitir leitura publica tarira') then
    create policy "Permitir leitura publica tarira" on storage.objects for select using (bucket_id in ('tarira-documents', 'tarira-photos', 'proposals_documents', 'consulting_proposals', 'uploads'));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Permitir update publico tarira') then
    create policy "Permitir update publico tarira" on storage.objects for update using (bucket_id in ('tarira-documents', 'tarira-photos', 'proposals_documents', 'consulting_proposals', 'uploads'));
  end if;
exception when others then null;
end $$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) — SEGURANÇA E ACESSO
-- ============================================================================
alter table public.operators enable row level security;
alter table public.candidates enable row level security;
alter table public.service_categories enable row level security;
alter table public.hires enable row level security;
alter table public.clients enable row level security;
alter table public.audit_logs enable row level security;
alter table public.commercial_proposals enable row level security;
alter table public.payment_orders enable row level security;
alter table public.payout_requests enable row level security;
alter table public.site_content enable row level security;
alter table public.spontaneous_applications enable row level security;
alter table public.partner_companies enable row level security;
alter table public.partner_stores enable row level security;
alter table public.landing_banners enable row level security;

-- Políticas universais de leitura e inserção protegidas contra duplicações
do $$ begin
  create policy "Public read candidates" on public.candidates for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Public read service_categories" on public.service_categories for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Public read landing_banners" on public.landing_banners for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Public read partner_companies" on public.partner_companies for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Public read partner_stores" on public.partner_stores for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Public insert spontaneous" on public.spontaneous_applications for insert with check (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Public insert hires" on public.hires for insert with check (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Public insert proposals" on public.commercial_proposals for insert with check (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Public read site_content" on public.site_content for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Apenas o servidor modifica site_content" on public.site_content for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
exception when duplicate_object then null;
end $$;

-- ============================================================================
-- 15. ATIVAÇÃO DE CONTA ADMINISTRATIVA (tarira.ecossistema@gmail.com)
-- ============================================================================
-- Executar para dar permissões de Administrador Geral a tarira.ecossistema@gmail.com
-- (ou a qualquer outra conta que crie no portal):

update public.profiles
set 
  role = 'admin',
  is_active = true,
  updated_at = now()
where lower(email) = 'tarira.ecossistema@gmail.com';

update auth.users
set 
  raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
where lower(email) = 'tarira.ecossistema@gmail.com';

-- ============================================================================
-- 16. REFORÇO DE SEGURANÇA DAS POLÍTICAS RLS (idempotente — seguro repetir)
-- ============================================================================
-- As secções 1 e 3 acima já criam as políticas seguras desde a origem para
-- uma base de dados nova. Este bloco existe apenas para quem já tinha corrido
-- uma versão ANTERIOR deste ficheiro (com with check (true) / using (true) ou
-- com "auth.uid() is not null" nas políticas de profiles) — nesse caso,
-- ⚠️ EXECUTE ESTE BLOCO AGORA no SQL Editor do Supabase para substituir as
-- políticas antigas e inseguras pelas versões corretas. Repetir não faz mal.

drop policy if exists "Utilizador cria o próprio perfil" on public.profiles;
create policy "Utilizador cria o próprio perfil" on public.profiles
  for insert with check (auth.uid() = id or auth.role() = 'service_role');

drop policy if exists "Utilizador actualiza o próprio perfil" on public.profiles;
create policy "Utilizador actualiza o próprio perfil" on public.profiles
  for update using (auth.uid() = id or auth.role() = 'service_role');

drop policy if exists "Public modify site_content" on public.site_content;
drop policy if exists "Apenas o servidor modifica site_content" on public.site_content;
create policy "Apenas o servidor modifica site_content" on public.site_content
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ============================================================================
-- 17. CORREÇÃO: TABELAS EM FALTA QUE CAUSAVAM O ERRO
--     "processado no servidor mas falhou ao gravar de forma permanente"
-- ============================================================================
-- O servidor (server.ts) sincroniza estas 4 tabelas a cada escrita, mas elas
-- nunca chegaram a ser criadas neste schema — qualquer tentativa de gravar
-- nelas falhava sempre com "relation does not exist". Antes da correção no
-- código, essa falha bloqueava TODAS as escritas do site (mesmo as que não
-- tinham nada a ver com recrutamento/consultoria/briefings/contacto), porque
-- o servidor sincronizava as 13 tabelas em bloco em qualquer submissão.
create table if not exists public.recruit_subscriptions (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.recruit_subscriptions enable row level security;

create table if not exists public.consulting_requests (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.consulting_requests enable row level security;

create table if not exists public.briefings (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.briefings enable row level security;

create table if not exists public.contact_inquiries (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.contact_inquiries enable row level security;

-- Nenhuma política de acesso público é criada de propósito: o servidor
-- grava sempre com a Service Role Key, que ignora RLS. Isto mantém estas
-- tabelas fechadas a qualquer acesso directo do browser (anon key).

-- CORREÇÃO ADICIONAL: a tabela payout_requests tinha "created_at" mas nunca
-- ganhou a coluna "updated_at" — e o servidor envia sempre {id, data,
-- updated_at} em cada upsert genérico. Sem esta coluna, TODA a gravação em
-- payout_requests (aprovar/rejeitar levantamentos) falhava sempre.
alter table public.payout_requests add column if not exists updated_at timestamptz not null default now();


