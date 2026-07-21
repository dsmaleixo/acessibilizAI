-- acessibilizAI — esquema inicial (doc de arquitetura, seção 3)
-- Requer a extensão PostGIS para dados geoespaciais.

create extension if not exists postgis;

-- Papéis e perfis ---------------------------------------------------------
create type papel as enum ('usuario', 'gestor');
create type perfil_tipo as enum ('cadeira', 'visual', 'mobilidade_reduzida');
create type categoria as enum (
  'rampa_obstruida', 'elevador_quebrado', 'piso_tatil_danificado',
  'corrimao_quebrado', 'obstaculo_via', 'banheiro_interditado', 'outro'
);
create type urgencia as enum ('baixa', 'media', 'alta');
create type status_denuncia as enum ('aberta', 'em_analise', 'resolvida', 'rejeitada');
create type ponto_tipo as enum (
  'rampa', 'elevador', 'banheiro_acessivel', 'piso_tatil', 'entrada_acessivel'
);

-- Usuários (espelha auth.users do Supabase) -------------------------------
create table usuarios (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  email text not null,
  papel papel not null default 'usuario',
  criado_em timestamptz not null default now()
);

create table perfis_acessibilidade (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references usuarios (id) on delete cascade,
  tipo perfil_tipo not null,
  criado_em timestamptz not null default now(),
  unique (usuario_id, tipo)
);

-- Denúncias ---------------------------------------------------------------
create table denuncias (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null references usuarios (id) on delete cascade,
  categoria categoria not null,
  urgencia urgencia not null default 'media',
  descricao text not null,
  status status_denuncia not null default 'aberta',
  foto_url text,
  local_texto text,
  geom geometry (Point, 4326),
  ia_categoria_sugerida categoria,
  ia_urgencia_sugerida urgencia,
  ia_confianca real,
  ia_payload jsonb,
  aceitou_sugestao_ia boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index denuncias_geom_idx on denuncias using gist (geom);
create index denuncias_status_idx on denuncias (status);

create table denuncia_eventos (
  id bigint generated always as identity primary key,
  denuncia_id uuid not null references denuncias (id) on delete cascade,
  gestor_id uuid references usuarios (id),
  de_status status_denuncia,
  para_status status_denuncia,
  comentario text,
  criado_em timestamptz not null default now()
);

-- Base do mapa/piloto -----------------------------------------------------
create table pontos_acessiveis (
  id bigint generated always as identity primary key,
  tipo ponto_tipo not null,
  nome text not null,
  geom geometry (Point, 4326) not null,
  atributos jsonb,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);
create index pontos_geom_idx on pontos_acessiveis using gist (geom);

create table segmentos_rota (
  id bigint generated always as identity primary key,
  ponto_origem_id bigint not null references pontos_acessiveis (id),
  ponto_destino_id bigint not null references pontos_acessiveis (id),
  custo real not null default 1,
  restricoes jsonb
);

-- RLS (autorização) -------------------------------------------------------
alter table usuarios enable row level security;
alter table denuncias enable row level security;
alter table perfis_acessibilidade enable row level security;

-- Helper: o usuário atual é gestor?
create or replace function is_gestor() returns boolean language sql stable as $$
  select exists (select 1 from usuarios u where u.id = auth.uid() and u.papel = 'gestor');
$$;

-- Usuário vê/edita a própria conta; gestor vê todas.
create policy usuarios_self on usuarios
  for select using (id = auth.uid() or is_gestor());

-- Denúncias: autor gerencia as suas; gestor vê e atualiza todas.
create policy denuncias_autor_select on denuncias
  for select using (autor_id = auth.uid() or is_gestor());
create policy denuncias_autor_insert on denuncias
  for insert with check (autor_id = auth.uid());
create policy denuncias_gestor_update on denuncias
  for update using (is_gestor()) with check (is_gestor());

-- Perfis: só o dono.
create policy perfis_owner on perfis_acessibilidade
  for all using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
