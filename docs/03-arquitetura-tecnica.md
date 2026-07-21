# acessibilizAI — Arquitetura Técnica & Design da IA

- **Versão:** v1.0 · **Data:** 2026-07-20 · **Status:** rascunho
- **Relacionados:** `02-prd.md`, `04-backlog-e-roadmap.md`
- **Princípio-guia:** menor complexidade que entrega o MVP; serviços gerenciados e free tiers; a IA *assiste*, não bloqueia.

---

## 1. Visão geral da arquitetura

Arquitetura de 3 camadas com IA como serviço externo, otimizada para um time
pequeno construir em poucas semanas.

```
┌───────────────────────────────────────────────────────────────┐
│  CLIENTE (PWA — mobile-first, acessível)                        │
│  UI de denúncia · mapa/lista · perfil · painel do gestor        │
└───────────────┬───────────────────────────────────────────────┘
                │ HTTPS (REST/JSON)
┌───────────────▼───────────────────────────────────────────────┐
│  BACKEND / API                                                 │
│  Auth · CRUD denúncias · orquestração da IA · roteamento       │
│  regras de autorização (usuario/gestor) · validação de upload  │
└───┬───────────────┬───────────────┬───────────────┬───────────┘
    │               │               │               │
    ▼               ▼               ▼               ▼
┌────────┐   ┌────────────┐   ┌────────────┐   ┌──────────────┐
│  DB    │   │  Storage   │   │  Serviço   │   │  Mapa/Geo    │
│(Postgres│  │  de fotos  │   │  de IA     │   │ (tiles +     │
│ +PostGIS│  │ (bucket)   │   │ (Visão/VLM)│   │  roteamento) │
└────────┘   └────────────┘   └────────────┘   └──────────────┘
```

## 2. Stack recomendada (MVP)

Duas opções válidas; escolha por familiaridade do time. A recomendação
prioriza velocidade de entrega.

| Camada | Opção A — "Serverless/BaaS" (recomendada p/ velocidade) | Opção B — "Full-stack tradicional" |
|---|---|---|
| Frontend | **Next.js (React) + TypeScript**, Tailwind, PWA | Mesmo |
| Auth + DB + Storage | **Supabase** (Postgres + PostGIS, Auth, Storage, RLS) | Backend próprio + Postgres + S3-compatível |
| Backend/API | Route handlers do Next.js + funções Supabase | **Node/NestJS** ou **Python/FastAPI** |
| IA (visão) | API de VLM (ex.: modelo multimodal via API) chamada pelo backend | Mesmo, ou microserviço Python |
| Mapa | **Leaflet + OpenStreetMap**; dados do piloto em GeoJSON | Mesmo |
| Deploy | **Vercel** (front) + Supabase (dados) | Render/Railway/Fly.io + Postgres gerenciado |

> **Recomendação do CTO:** Opção A (Next.js + Supabase + Vercel). Menos
> infraestrutura para manter, free tier generoso, PostGIS embutido (essencial
> para geo), RLS para autorização, e o time foca na lógica de produto e na IA.

## 3. Modelo de dados (essencial)

```
usuarios (id, nome, email, papel[usuario|gestor], criado_em)
perfis_acessibilidade (id, usuario_id → usuarios, tipo[cadeira|visual|mob_reduzida|...], criado_em)

denuncias (
  id, autor_id → usuarios,
  categoria,            -- enum controlado (ver PRD RF05)
  urgencia,             -- baixa|media|alta
  descricao,            -- texto (rascunho da IA + edição do usuário)
  status,               -- aberta|em_analise|resolvida|rejeitada
  foto_url,             -- referência ao storage
  local_texto,          -- ex.: "Bloco CA, térreo"
  geom,                 -- PostGIS Point (lat/long), nullable
  ia_categoria_sugerida, ia_urgencia_sugerida, ia_confianca, ia_payload_json,
  aceitou_sugestao_ia,  -- bool (métrica)
  criado_em, atualizado_em
)

denuncia_eventos (id, denuncia_id → denuncias, gestor_id, de_status, para_status, comentario, criado_em)

pontos_acessiveis (      -- base do mapa/piloto
  id, tipo[rampa|elevador|banheiro_acessivel|piso_tatil|entrada_acessivel],
  nome, geom, atributos_json, ativo, criado_em
)

segmentos_rota (         -- grafo simples do piloto p/ roteamento
  id, ponto_origem_id, ponto_destino_id, custo,
  restricoes_json       -- ex.: {"exige":"rampa","tem_piso_tatil":true}
)
```

Índices espaciais (GiST) em `geom`. RLS: usuário vê/edita apenas as próprias
denúncias; gestor vê todas e altera status.

## 4. Design da parte de IA (foto → problema)  ⭐

Esta é a parte central e o maior diferencial. **A IA assiste a triagem: ela
sugere, o humano confirma.** Isso reduz risco de erro e mantém a pessoa no
controle (importante para confiança e para acessibilidade).

### 4.1 Estratégia recomendada por fases

| Fase | Abordagem | Quando |
|---|---|---|
| **MVP (recomendado)** | **VLM multimodal via API** (modelo de visão-linguagem) recebe a foto + um prompt estruturado e retorna JSON com categoria, urgência, descrição e confiança | Sem dataset próprio; rápido de montar; flexível |
| Evolução | Fine-tuning / modelo de classificação próprio (CNN) treinado com as fotos coletadas | Quando houver volume de dados rotulados suficiente |
| Sempre | **Fallback manual** — se a IA falhar ou tiver baixa confiança, o usuário escolhe a categoria manualmente | Requisito (RNF06) |

> Por que VLM por prompt no MVP: não exige coletar e rotular milhares de imagens
> (inviável no prazo), lida bem com variação de fotos reais e permite gerar a
> *descrição textual* automaticamente. O modelo de classificação próprio fica
> como trabalho futuro / seção de "resultados de IA" do relatório da disciplina.

### 4.2 Fluxo técnico da triagem

```
1. Cliente comprime a imagem (client-side) e faz upload → Storage (URL)
2. Cliente chama POST /api/denuncias/triagem  { foto_url, local? }
3. Backend baixa/referencia a imagem e chama o serviço de IA com:
   - a imagem
   - um PROMPT estruturado (system + instruções) pedindo saída JSON
   - a lista fechada de categorias válidas
4. Serviço de IA retorna JSON validado (schema): { categoria, urgencia,
   descricao, confianca, contem_pessoas }
5. Backend valida o JSON (categoria ∈ enum; confiança ∈ [0,1]); se inválido
   ou timeout → retorna "sem sugestão" e o cliente segue no modo manual
6. Cliente exibe as sugestões PRÉ-PREENCHIDAS e EDITÁVEIS
7. Ao enviar, guarda ia_* (sugestão) + valores finais + aceitou_sugestao_ia
```

### 4.3 Contrato de saída da IA (JSON schema)

```json
{
  "categoria": "rampa_obstruida | elevador_quebrado | piso_tatil_danificado | corrimao_quebrado | obstaculo_via | banheiro_interditado | outro",
  "urgencia": "baixa | media | alta",
  "descricao": "texto curto e objetivo do problema observado",
  "confianca": 0.0,
  "contem_pessoas": true
}
```

O campo `contem_pessoas` alimenta o aviso de privacidade (LGPD) — se detectar
rostos, sugerir ao usuário desfocar/recortar ou confirmar consentimento.

### 4.4 Diretrizes de prompt (resumo)

- Papel: "você é um assistente de triagem de acessibilidade; classifique a
  barreira física na foto".
- Restringir a saída às categorias válidas; exigir JSON estrito; pedir urgência
  com critérios (ex.: "alta" quando bloqueia totalmente o acesso).
- Pedir confiança e instruir a usar `outro` + confiança baixa quando incerto.
- Descrição objetiva, em PT-BR, sem inventar detalhes que não estão na imagem.

### 4.5 Como validar a IA (liga com o Lean Canvas, H3)

- Montar conjunto de teste rotulado (30–50 fotos reais + negativas).
- Medir acurácia geral e precisão/recall por categoria; montar matriz de confusão.
- Definir limiar de confiança abaixo do qual não se mostra sugestão.
- Registrar tudo — vira a seção de resultados de IA do relatório da disciplina.

## 5. Roteamento acessível (piloto)

- Modelar o piloto (1–2 prédios) como **grafo simples**: nós = pontos
  (entradas, rampas, elevadores, banheiros); arestas = segmentos com custo e
  atributos (`tem_rampa`, `tem_piso_tatil`, `tem_elevador`).
- Aplicar **Dijkstra/A\*** filtrando arestas conforme o perfil (ex.: perfil
  cadeirante exclui escadas; perfil visual prioriza segmentos com piso tátil) e
  removendo pontos com barreira aberta.
- Saída: caminho no mapa (Leaflet) **+ descrição textual passo a passo**
  (acessível a leitor de tela).
- Dados do piloto em GeoJSON versionado no repositório (fácil de editar/revisar).

> Não usar roteamento indoor por sensores nem GPS turn-by-turn no MVP —
> complexidade alta, ganho baixo para validar a hipótese.

## 6. Segurança, privacidade e LGPD

- **Base legal e consentimento:** tela de consentimento no 1º uso e no envio de
  foto/localização; explicar finalidade (melhorar acessibilidade do campus).
- **Minimização:** coletar só o necessário; permitir denúncia **sem rosto**
  (orientar a fotografar a barreira, não pessoas); opção de desfoque/recorte.
- **Retenção:** definir prazo de retenção das fotos; anonimizar/remover metadados
  EXIF (inclusive geoloc do arquivo) no upload.
- **Autorização:** RLS/autorização por papel; gestor não expõe dados pessoais do
  autor além do necessário.
- **Upload seguro:** validar tipo/tamanho, gerar nomes aleatórios, servir por URL
  assinada; rate limit anti-spam.
- **Segredos:** chaves de API da IA só no backend, nunca no cliente.

## 7. Deploy, ambientes e custos

- **Ambientes:** `preview` (por PR) + `produção`. Migrations versionadas.
- **CI/CD:** deploy automático na Vercel a cada merge; lint + testes no CI.
- **Custos (estimativa, ordem de grandeza):** Vercel free; Supabase free tier
  (limites de DB/Storage); IA = custo por imagem classificada (limitar a 1
  chamada por denúncia + limite anti-abuso mantém baixo). Detalhar após escolher
  o provedor da IA.
- **Observabilidade:** logs do backend + métricas mínimas (denúncias, latência e
  erros da IA, taxa de aceitação da sugestão).

## 8. Decisões de arquitetura (ADRs — resumo)

| # | Decisão | Motivo |
|---|---|---|
| ADR-1 | PWA em vez de app nativo | Sem fricção de instalação; um só código; suficiente para o MVP |
| ADR-2 | VLM por prompt em vez de treinar CNN | Sem dataset; prazo curto; gera descrição também |
| ADR-3 | Supabase (Postgres+PostGIS) | Geo nativo, auth, storage e RLS em um só serviço gerenciado |
| ADR-4 | IA assiste (sugere), humano confirma | Reduz risco de erro; mantém controle e confiança; degradação graciosa |
| ADR-5 | Piloto de 1–2 prédios para o mapa | Limita o custo de mapeamento; foco em validar a hipótese |
| ADR-6 | Leaflet + OSM | Gratuito, aberto, bom suporte; alternativa textual do mapa é obrigatória |

## 9. Riscos técnicos

- Latência/instabilidade da IA → timeout + fallback manual; estado de loading acessível.
- Qualidade das fotos (luz, ângulo) → orientações na captura; permitir reenvio.
- Precisão do roteamento com dados manuais → manter piloto pequeno e revisado.
- Custo da IA fugir do controle → limitar chamadas, cache e rate limit.
