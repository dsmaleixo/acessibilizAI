-- acessibilizAI — grants explícitos para a Data API
--
-- Nesta versão do Supabase, tabelas criadas em migrations NÃO recebem
-- privilégios automáticos para anon/authenticated: sem GRANT a API retorna
-- "permission denied" antes mesmo da RLS rodar. Princípio do menor
-- privilégio: cada papel recebe apenas o que o app usa; a RLS continua
-- filtrando as linhas.

-- Conta do usuário (nome editável; papel NUNCA — só via SQL/admin)
grant select on usuarios to authenticated;
grant update (nome) on usuarios to authenticated;

-- Perfis de acessibilidade (o dono sincroniza: select/insert/delete)
grant select, insert, delete on perfis_acessibilidade to authenticated;

-- Denúncias (autor insere e lê; gestor atualiza status — RLS decide quem)
grant select, insert, update on denuncias to authenticated;

-- Histórico (autor/gestor leem; gestor insere — RLS decide)
grant select, insert on denuncia_eventos to authenticated;

-- Notificações (dono lê e marca como lida)
grant select, update on notificacoes to authenticated;

-- Mapa do piloto: leitura pública
grant select on pontos_acessiveis, segmentos_rota to anon, authenticated;

-- Sequências (colunas identity de denuncia_eventos/notificacoes)
grant usage, select on all sequences in schema public to authenticated;
