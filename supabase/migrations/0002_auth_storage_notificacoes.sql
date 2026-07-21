-- acessibilizAI — correções de segurança + objetos de suporte
-- (auth trigger, storage, notificações, RLS faltante, seed do piloto)

-- 1. is_gestor: SECURITY DEFINER para não recursar na RLS de `usuarios`
--    (a política usuarios_self chama is_gestor(), que lê usuarios — sem
--    definer isso dispara recursão infinita de políticas).
create or replace function is_gestor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from usuarios u where u.id = auth.uid() and u.papel = 'gestor');
$$;

-- 2. Espelhar auth.users → usuarios no cadastro
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into usuarios (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 3. atualizado_em automático em denuncias
create or replace function set_atualizado_em() returns trigger
language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists denuncias_atualizado_em on denuncias;
create trigger denuncias_atualizado_em
  before update on denuncias
  for each row execute function set_atualizado_em();

-- 3b. lat/lng derivados do geom (PostGIS) para leitura simples via API.
--     Inserção continua pelo geom (EWKT 'SRID=4326;POINT(lng lat)').
alter table denuncias
  add column lat double precision generated always as (st_y(geom)) stored,
  add column lng double precision generated always as (st_x(geom)) stored;
alter table pontos_acessiveis
  add column lat double precision generated always as (st_y(geom)) stored,
  add column lng double precision generated always as (st_x(geom)) stored;

-- Barreiras abertas visíveis no mapa público (RF08). View SECURITY DEFINER
-- de propósito: expõe SOMENTE colunas não pessoais de denúncias não resolvidas.
create view barreiras_abertas as
  select id, categoria, urgencia, status, local_texto, lat, lng, criado_em
  from denuncias
  where status in ('aberta', 'em_analise');
grant select on barreiras_abertas to anon, authenticated;

-- 4. RLS faltante (toda tabela em schema exposto precisa de RLS)
alter table denuncia_eventos enable row level security;
alter table pontos_acessiveis enable row level security;
alter table segmentos_rota enable row level security;

-- Eventos: autor da denúncia e gestor leem; só gestor escreve.
create policy eventos_select on denuncia_eventos
  for select to authenticated
  using (
    is_gestor()
    or exists (
      select 1 from denuncias d
      where d.id = denuncia_eventos.denuncia_id and d.autor_id = (select auth.uid())
    )
  );
create policy eventos_insert_gestor on denuncia_eventos
  for insert to authenticated
  with check (is_gestor() and gestor_id = (select auth.uid()));

-- Mapa do piloto: leitura pública (dados não pessoais).
create policy pontos_leitura on pontos_acessiveis
  for select to anon, authenticated using (true);
create policy segmentos_leitura on segmentos_rota
  for select to anon, authenticated using (true);

-- Usuário pode atualizar o próprio nome — e SÓ o nome: grant por coluna
-- impede escalar o próprio papel (papel muda apenas via SQL/admin).
revoke update on usuarios from authenticated;
grant update (nome) on usuarios to authenticated;
create policy usuarios_update_self on usuarios
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- 5. Notificações in-app (US-16)
create table notificacoes (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references usuarios (id) on delete cascade,
  denuncia_id uuid references denuncias (id) on delete cascade,
  titulo text not null,
  corpo text,
  lida boolean not null default false,
  criado_em timestamptz not null default now()
);
create index notificacoes_usuario_idx on notificacoes (usuario_id, lida);

alter table notificacoes enable row level security;
create policy notificacoes_owner_select on notificacoes
  for select to authenticated using (usuario_id = (select auth.uid()));
create policy notificacoes_owner_update on notificacoes
  for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

-- Notificar o autor quando o status da denúncia mudar (trigger = não depende
-- do caminho de código que fez a alteração).
create or replace function notificar_mudanca_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into notificacoes (usuario_id, denuncia_id, titulo, corpo)
    values (
      new.autor_id,
      new.id,
      'Sua denúncia mudou de status',
      format('Protocolo %s: %s → %s', upper(left(new.id::text, 8)), old.status, new.status)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists denuncias_notifica_status on denuncias;
create trigger denuncias_notifica_status
  after update on denuncias
  for each row execute function notificar_mudanca_status();

-- 6. Storage: bucket privado para fotos (URLs assinadas no servidor)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-denuncias', 'fotos-denuncias', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Upload apenas na própria pasta (uid/arquivo); leitura: dono ou gestor.
create policy fotos_upload on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'fotos-denuncias'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy fotos_leitura on storage.objects
  for select to authenticated
  using (
    bucket_id = 'fotos-denuncias'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or is_gestor())
  );

-- 7. Seed do piloto (Bloco CA — grafo pequeno e revisado, doc §5/ADR-5)
insert into pontos_acessiveis (tipo, nome, geom, atributos) values
  ('entrada_acessivel', 'Entrada acessível — Bloco CA',        st_setsrid(st_makepoint(-35.90780, -7.21700), 4326), '{"predio":"CA"}'),
  ('rampa',             'Rampa — Bloco CA (térreo)',            st_setsrid(st_makepoint(-35.90790, -7.21710), 4326), '{"predio":"CA"}'),
  ('elevador',          'Elevador — Bloco CA',                  st_setsrid(st_makepoint(-35.90800, -7.21705), 4326), '{"predio":"CA"}'),
  ('banheiro_acessivel','Banheiro acessível — Bloco CA (térreo)', st_setsrid(st_makepoint(-35.90805, -7.21720), 4326), '{"predio":"CA"}'),
  ('piso_tatil',        'Piso tátil — corredor central CA',     st_setsrid(st_makepoint(-35.90770, -7.21715), 4326), '{"predio":"CA"}'),
  ('entrada_acessivel', 'Entrada acessível — Biblioteca',       st_setsrid(st_makepoint(-35.90880, -7.21760), 4326), '{"predio":"Biblioteca"}'),
  ('rampa',             'Rampa — Biblioteca',                   st_setsrid(st_makepoint(-35.90870, -7.21755), 4326), '{"predio":"Biblioteca"}'),
  ('banheiro_acessivel','Banheiro acessível — Biblioteca',      st_setsrid(st_makepoint(-35.90890, -7.21770), 4326), '{"predio":"Biblioteca"}'),
  ('piso_tatil',        'Piso tátil — calçada CA↔Biblioteca',   st_setsrid(st_makepoint(-35.90830, -7.21735), 4326), '{"predio":null}');

-- Arestas do grafo (bidirecionais na aplicação). custo ~ metros.
insert into segmentos_rota (ponto_origem_id, ponto_destino_id, custo, restricoes) values
  (1, 2, 15, '{"tem_rampa": true,  "tem_piso_tatil": false, "tem_escada": false}'),
  (1, 5, 12, '{"tem_rampa": false, "tem_piso_tatil": true,  "tem_escada": false}'),
  (2, 3, 10, '{"tem_rampa": true,  "tem_piso_tatil": false, "tem_escada": false}'),
  (3, 4, 8,  '{"tem_rampa": false, "tem_piso_tatil": false, "tem_escada": false}'),
  (5, 4, 14, '{"tem_rampa": false, "tem_piso_tatil": true,  "tem_escada": false}'),
  (5, 9, 60, '{"tem_rampa": false, "tem_piso_tatil": true,  "tem_escada": false}'),
  (1, 9, 55, '{"tem_rampa": false, "tem_piso_tatil": false, "tem_escada": true}'),
  (9, 6, 50, '{"tem_rampa": false, "tem_piso_tatil": true,  "tem_escada": false}'),
  (6, 7, 12, '{"tem_rampa": true,  "tem_piso_tatil": false, "tem_escada": false}'),
  (7, 8, 18, '{"tem_rampa": true,  "tem_piso_tatil": false, "tem_escada": false}'),
  (6, 8, 10, '{"tem_rampa": false, "tem_piso_tatil": false, "tem_escada": true}');
