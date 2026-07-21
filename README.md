# acessibilizAI ♿️🗺️

> Rotas acessíveis e denúncia inteligente de barreiras físicas no campus universitário.

**acessibilizAI** é uma aplicação web (PWA) que ajuda pessoas com deficiência (PcD) da
comunidade universitária a (1) se deslocar pelo campus por rotas adequadas ao seu perfil
de acessibilidade e (2) reportar barreiras físicas quebradas ou ausentes — elevador
parado, piso tátil danificado, rampa bloqueada, corrimão solto — tirando uma foto. Uma
**IA de visão** analisa a foto, sugere a categoria, a urgência e uma descrição, e o
gestor da universidade acompanha e resolve.

Projeto final da disciplina **Introdução à IA Generativa** — Universidade Federal de
Campina Grande (UFCG).

---

## ✨ Funcionalidades (MVP)

- 📸 **Denúncia com foto + triagem por IA** — a IA sugere categoria/urgência/descrição; o usuário confirma ou edita (a IA assiste, o humano decide).
- 🔎 **Acompanhamento** — protocolo e status (`aberta → em análise → resolvida`).
- 🧑‍💼 **Painel do gestor** — listar, filtrar por prédio/urgência/status e resolver denúncias.
- 🗺️ **Mapa de rotas acessíveis (piloto)** — pontos acessíveis e rota por perfil, com **alternativa textual** para leitor de tela.
- ♿ **Acessível por padrão** — alvo de conformidade **WCAG 2.2 AA**.

## 🧱 Stack

- **Frontend/Backend:** [Next.js 15](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS · PWA
- **Dados/Auth/Storage:** [Supabase](https://supabase.com) (Postgres + PostGIS, Auth, Storage, RLS)
- **IA (visão):** modelo multimodal (VLM) via API — chamado apenas no servidor
- **Mapa:** [Leaflet](https://leafletjs.com) + OpenStreetMap
- **Deploy:** Vercel (app) + Supabase (dados)

Racional completo em [`docs/03-arquitetura-tecnica.md`](docs/03-arquitetura-tecnica.md).

## 📁 Estrutura de diretórios

```
acessibilizAI/
├── docs/                       # Artefatos de produto (visão, lean canvas, PRD, arquitetura, backlog)
├── public/                     # Estáticos + manifest PWA
│   └── icons/
├── supabase/
│   ├── migrations/             # Esquema do banco (SQL) — 0001_init.sql
│   └── seed/                   # Dados do piloto (GeoJSON dos pontos acessíveis)
├── src/
│   ├── app/                    # Rotas (App Router)
│   │   ├── (auth)/             # login, cadastro
│   │   ├── denuncias/          # nova, [id] (acompanhamento)
│   │   ├── mapa/               # mapa + rotas
│   │   ├── perfil/             # perfil de acessibilidade
│   │   ├── gestor/             # painel do gestor
│   │   └── api/denuncias/triagem/   # endpoint da IA (foto → sugestão)
│   ├── components/             # UI reutilizável (ui, a11y, denuncia, mapa)
│   ├── features/               # Código por domínio (auth, denuncias, triagem-ia, mapa-rotas)
│   ├── lib/
│   │   ├── supabase/           # clients (browser/server)
│   │   ├── ia/                 # schema (zod), prompt e client da IA
│   │   ├── rotas/              # grafo + Dijkstra + descrição textual da rota
│   │   └── utils/              # utilidades (ex.: compressão de imagem)
│   ├── config/                 # constantes (categorias, urgências, perfis)
│   ├── types/                  # tipos TypeScript compartilhados
│   └── styles/                 # CSS global (Tailwind + foco visível)
├── scripts/                    # utilitários (seed, avaliação da IA)
└── .github/workflows/          # CI (lint, typecheck, build)
```

A organização segue **feature-first**: regra de negócio vive em `src/features/*`, UI
"burra" e reutilizável vive em `src/components/*`, e integrações/algoritmos em `src/lib/*`.

## 🚀 Como rodar localmente

Pré-requisitos: **Node 20+** e npm. Para o banco, uma conta gratuita no **Supabase**
(ou a [Supabase CLI](https://supabase.com/docs/guides/cli) para rodar local).

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
#   edite .env.local com as chaves do seu projeto Supabase e do provedor de IA

# 3. Aplicar o esquema do banco (via Supabase CLI, ou cole o SQL no editor do Supabase)
#    supabase/migrations/0001_init.sql

# 4. Rodar em desenvolvimento
npm run dev
#   abre em http://localhost:3000
```

### Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Ambiente de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build |
| `npm run lint` | ESLint (inclui regras de acessibilidade) |
| `npm run typecheck` | Checagem de tipos (tsc) |
| `npm run format` | Prettier |

## 🔑 Variáveis de ambiente

Veja [`.env.example`](.env.example). Resumo:

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública (cliente) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service-role — **somente servidor** |
| `IA_API_KEY` | Chave do provedor do modelo de IA — **nunca no cliente** |
| `IA_MODEL` / `IA_TIMEOUT_MS` / `IA_CONFIANCA_MINIMA` | Config da triagem |

> ⚠️ Segredos ficam só no servidor. A chave da IA nunca deve ir para o bundle do cliente.

## 🧠 Como funciona a triagem por IA

1. O cliente comprime a foto e faz upload para o Storage.
2. `POST /api/denuncias/triagem` chama o modelo de visão com um prompt estruturado
   ([`src/lib/ia/prompt.ts`](src/lib/ia/prompt.ts)).
3. A resposta é validada por um schema Zod ([`src/lib/ia/schema.ts`](src/lib/ia/schema.ts)).
4. Abaixo do limiar de confiança **ou** em falha/timeout, o app cai no **preenchimento
   manual** — a IA nunca bloqueia o envio (degradação graciosa).

O ponto de integração com o provedor real está marcado com `TODO(US-07)` em
[`src/lib/ia/client.ts`](src/lib/ia/client.ts).

## ♿ Acessibilidade

Sendo um app *de acessibilidade*, ele precisa ser exemplar. Metas: navegação completa por
teclado com foco visível, compatibilidade com leitor de tela, contraste AA, e **alternativa
textual sempre que houver mapa**. O checklist completo está no PRD, seção 9.

## 🗂️ Documentação do projeto

| Documento | Conteúdo |
|---|---|
| [`docs/00-visao-geral.md`](docs/00-visao-geral.md) | Visão geral, glossário, princípios |
| [`docs/01-lean-canvas-e-validacao.md`](docs/01-lean-canvas-e-validacao.md) | Lean Canvas, hipóteses, experimentos, métricas |
| [`docs/02-prd.md`](docs/02-prd.md) | Personas, jornadas, escopo MVP, requisitos, acessibilidade |
| [`docs/03-arquitetura-tecnica.md`](docs/03-arquitetura-tecnica.md) | Arquitetura, dados, design da IA, LGPD, deploy |
| [`docs/04-backlog-e-roadmap.md`](docs/04-backlog-e-roadmap.md) | Épicos, user stories, roadmap, DoR/DoD |

## 🗺️ Roadmap (resumo)

`Sprint 0` descoberta + setup · `Sprint 1` denúncia ponta a ponta · `Sprint 2` IA + painel
do gestor · `Sprint 3` mapa & rotas + acessibilidade · `Sprint 4` polimento, validação e
entrega. Detalhes em [`docs/04-backlog-e-roadmap.md`](docs/04-backlog-e-roadmap.md).

## 🤝 Contribuindo

Convenção de commits sugerida: [Conventional Commits](https://www.conventionalcommits.org)
(`feat:`, `fix:`, `docs:`, `chore:`…). Antes de abrir PR: `npm run lint && npm run typecheck && npm run build`.
As user stories (`US-xx`) referenciadas nos `TODO` do código mapeiam para o backlog.

## 📄 Licença

[MIT](LICENSE).
