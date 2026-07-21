# features/

Código organizado por **domínio** (não por tipo). Cada feature reúne seus
componentes, hooks, ações de servidor e regras.

- `auth/` — cadastro, login, sessão, papéis (US-03, US-04)
- `denuncias/` — criar, listar e acompanhar denúncias (US-05, US-09, US-11)
- `triagem-ia/` — orquestra a chamada à IA e a edição da sugestão (US-07, US-08, US-10)
- `mapa-rotas/` — mapa, pontos acessíveis e roteamento por perfil (US-17..US-21)

Convenção: UI reutilizável e "burra" fica em `src/components/`; regra de negócio
e composição de dados ficam aqui.
