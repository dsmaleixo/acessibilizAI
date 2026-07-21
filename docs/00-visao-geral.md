# acessibilizAI — Visão Geral do Projeto

**Projeto final · Introdução à IA Generativa · UFCG**
Uma aplicação web (PWA) que ajuda pessoas com deficiência da comunidade
universitária a se deslocar pelo campus por rotas acessíveis e a reportar
barreiras físicas (elevador quebrado, piso tátil danificado, rampa bloqueada,
corrimão solto) com triagem automática por IA a partir de uma foto.

- **Versão:** v1.0 · **Data:** 2026-07-20 · **Status:** artefatos iniciais para validação

---

## Resumo executivo

Pessoas com deficiência no campus enfrentam duas dores: descobrir um caminho que
realmente funciona para elas, e conseguir que barreiras quebradas sejam
consertadas. O acessibilizAI ataca as duas com um **canal de denúncia
inteligente** (foto → IA sugere categoria, urgência e descrição → gestor
resolve) e um **mapa de rotas acessíveis** em escala piloto. O diferencial de IA
generativa está na triagem por visão computacional, que reduz a fricção de
reportar e gera dados estruturados para a universidade agir.

**Estratégia de MVP:** começar pela denúncia com IA (alto valor, baixa
dependência de dados) e entregar o mapa/rotas em um piloto de 1–2 prédios. As
próprias denúncias alimentam a base que o mapa precisa.

## Índice dos artefatos

| # | Documento | Para quê serve |
|---|---|---|
| 00 | `00-visao-geral.md` (este) | Ponto de entrada, resumo e glossário |
| 01 | `01-lean-canvas-e-validacao.md` | **Artefato inicial de validação:** Lean Canvas, hipóteses de risco, experimentos e métricas |
| 02 | `02-prd.md` | Requisitos do produto: personas, jornadas, escopo MVP (MoSCoW), RF/RNF, acessibilidade |
| 03 | `03-arquitetura-tecnica.md` | Stack, modelo de dados, **design da IA (foto→problema)**, roteamento, LGPD, deploy |
| 04 | `04-backlog-e-roadmap.md` | Épicos, user stories priorizadas, roadmap por sprints, DoR/DoD |

**Ordem de leitura sugerida:** 00 → 01 → 02 → 03 → 04.

## Como usar estes artefatos (próximos passos)

1. **Validar antes de codar.** Rodar os experimentos do doc 01 (entrevistas com
   PcD, conversa com o núcleo de acessibilidade e teste técnico da IA com fotos
   reais). O critério de "go" está no doc 01.
2. **Buscar o parceiro institucional cedo.** O maior risco não é técnico: é a
   universidade *agir* sobre as denúncias (hipótese H2). Sem isso, o produto vira
   um "buraco negro de reclamações".
3. **Construir o núcleo primeiro.** Denúncia + IA + painel do gestor (docs 02–04).
4. **Manter o app acessível por princípio.** Um app de acessibilidade
   inacessível é uma contradição fatal — WCAG 2.2 AA é Definition of Done, não
   opcional.

## Glossário

- **PcD:** pessoa com deficiência.
- **PWA:** Progressive Web App — app web instalável, sem loja de aplicativos.
- **VLM:** Vision-Language Model — modelo multimodal que entende imagem + texto; usado para classificar a foto da barreira.
- **Barreira:** obstáculo físico à acessibilidade (rampa bloqueada, elevador quebrado, piso tátil danificado, etc.).
- **Piso tátil:** piso com textura que orienta pessoas com deficiência visual.
- **Triagem por IA:** processo em que a IA sugere categoria/urgência/descrição a partir da foto, para o humano confirmar.
- **WCAG 2.2 AA:** diretrizes internacionais de acessibilidade web, nível de conformidade AA.
- **RLS:** Row-Level Security — autorização no nível de linha do banco de dados.
- **LGPD:** Lei Geral de Proteção de Dados (Brasil).
- **MoSCoW:** priorização Must/Should/Could/Won't.

## Princípios do produto

1. **A IA assiste, o humano decide.** A IA sugere; a pessoa confirma. Nunca bloqueia o envio.
2. **Acessível por padrão.** Toda função tem alternativa não-visual; o mapa nunca é o único caminho.
3. **Valor real, não só reclamação.** Sucesso = barreiras efetivamente resolvidas.
4. **Simples e deployável.** Menor complexidade que entrega o MVP; free tiers; a universidade consegue manter depois.
5. **Privacidade desde o design.** Fotos podem conter pessoas — minimizar, consentir, permitir denúncia sem rosto.
