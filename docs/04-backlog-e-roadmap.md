# acessibilizAI — Backlog & Roadmap do MVP

- **Versão:** v1.0 · **Data:** 2026-07-20 · **Status:** rascunho
- **Relacionados:** `02-prd.md`, `03-arquitetura-tecnica.md`
- **Contexto:** time pequeno (1–4 pessoas), MVP em poucas semanas. Sprints de 1 semana.

---

## 1. Épicos

- **E1 — Fundações:** setup do projeto, auth, modelo de dados, deploy, CI.
- **E2 — Denúncia com IA (núcleo do MVP):** criar denúncia com foto + triagem por IA + acompanhamento.
- **E3 — Painel do gestor:** receber, filtrar e resolver denúncias.
- **E4 — Mapa & rotas (piloto):** pontos acessíveis + roteamento simples.
- **E5 — Acessibilidade & qualidade:** WCAG 2.2 AA, testes, privacidade/LGPD.
- **E6 — Validação & métricas:** instrumentação e experimentos do Lean Canvas.

## 2. Backlog priorizado (user stories)

Formato: *Como <persona>, quero <ação>, para <benefício>.* Estimativa em pontos
(P=1, M=3, G=5). Prioridade: Must/Should/Could.

### E1 — Fundações
| ID | História | Prio | Est |
|---|---|---|---|
| US-01 | Como time, quero o projeto inicializado (Next.js+TS+Tailwind, PWA) e no deploy, para termos base de trabalho | Must | M |
| US-02 | Como time, quero Supabase configurado (DB, Auth, Storage, PostGIS) e migrations, para persistir dados | Must | M |
| US-03 | Como usuário, quero criar conta e entrar, para usar o app com identidade | Must | M |
| US-04 | Como time, quero papéis `usuario`/`gestor` e RLS, para autorização correta | Must | M |

### E2 — Denúncia com IA (núcleo)
| ID | História | Prio | Est |
|---|---|---|---|
| US-05 | Como usuária (Marina), quero tirar/anexar uma foto de uma barreira, para iniciar uma denúncia | Must | M |
| US-06 | Como usuária, quero que a foto seja comprimida e enviada mesmo em conexão ruim, para não travar | Must | M |
| US-07 | Como usuária, quero que a IA sugira categoria, urgência e descrição a partir da foto, para não preencher tudo do zero | Must | G |
| US-08 | Como usuária, quero editar/confirmar as sugestões da IA, para manter o controle e corrigir erros | Must | M |
| US-09 | Como usuária, quero informar a localização (GPS ou seleção de prédio/ponto), para o problema ser localizável | Must | M |
| US-10 | Como sistema, quero degradar para preenchimento manual se a IA falhar, para nunca bloquear o envio | Must | P |
| US-11 | Como usuária, quero acompanhar o status das minhas denúncias (com protocolo), para saber se será resolvido | Must | M |
| US-12 | Como usuária, quero um aviso de privacidade e a opção de denunciar sem rosto, para respeitar a LGPD | Must | P |

### E3 — Painel do gestor
| ID | História | Prio | Est |
|---|---|---|---|
| US-13 | Como gestor (Sr. Antônio), quero listar e filtrar denúncias por prédio/categoria/urgência/status, para priorizar | Must | M |
| US-14 | Como gestor, quero abrir o detalhe (foto, categoria da IA, local, histórico), para entender o caso | Must | M |
| US-15 | Como gestor, quero mudar o status e comentar, para gerir a resolução | Must | M |
| US-16 | Como autor, quero ser notificado quando meu status mudar, para acompanhar | Should | M |

### E4 — Mapa & rotas (piloto)
| ID | História | Prio | Est |
|---|---|---|---|
| US-17 | Como time, quero cadastrar pontos acessíveis do piloto (rampas, elevadores, banheiros, piso tátil) em GeoJSON, para alimentar o mapa | Should | M |
| US-18 | Como usuário, quero ver os pontos acessíveis e barreiras abertas no mapa, para me orientar | Should | M |
| US-19 | Como João, quero uma rota entre dois pontos respeitando meu perfil (evitando escadas / priorizando piso tátil), para chegar com segurança | Should | G |
| US-20 | Como João, quero a rota também em descrição textual passo a passo, para usar com leitor de tela | Should | M |
| US-21 | Como usuário, quero acessar tudo por lista/formulário além do mapa, para não depender do mapa visual | Should | M |

### E5 — Acessibilidade & qualidade
| ID | História | Prio | Est |
|---|---|---|---|
| US-22 | Como PcD, quero o app navegável por teclado com foco visível, para usar sem mouse | Must | M |
| US-23 | Como usuário de leitor de tela, quero rótulos/alternativas textuais em tudo, para entender a interface | Must | M |
| US-24 | Como usuária com baixa visão, quero contraste AA e alvos de toque adequados, para enxergar e tocar | Must | P |
| US-25 | Como time, quero testes automatizados de acessibilidade + revisão manual (leitor de tela/teclado) no DoD, para garantir conformidade | Must | M |

### E6 — Validação & métricas
| ID | História | Prio | Est |
|---|---|---|---|
| US-26 | Como time, quero instrumentar métricas (denúncias, aceitação da IA, latência/erros, retenção), para validar hipóteses | Must | M |
| US-27 | Como time, quero rodar o teste técnico da IA com fotos reais e registrar acurácia/precisão/recall, para validar H3 | Must | M |
| US-28 | Como time, quero rodar teste de usabilidade com ≥1 usuário de leitor de tela, para validar H6 | Should | M |

## 3. Roadmap sugerido (sprints de 1 semana)

> Ajuste conforme o tamanho do time. A ordem prioriza validar o núcleo (denúncia
> + IA) cedo, porque é o maior diferencial e o menos dependente de dados.

**Sprint 0 — Descoberta & setup (paralelo)**
- Entrevistas de problema + conversa com o núcleo de acessibilidade (H1, H2).
- Coleta de 30–50 fotos reais + teste técnico inicial da IA (H3, US-27).
- US-01, US-02 (fundações e deploy "hello world").

**Sprint 1 — Denúncia ponta a ponta (sem IA ainda)**
- US-03, US-04 (auth + papéis).
- US-05, US-06, US-09, US-11, US-12 (criar denúncia manual + acompanhamento + privacidade).

**Sprint 2 — Triagem por IA + painel do gestor**
- US-07, US-08, US-10 (IA sugere/edita/fallback).
- US-13, US-14, US-15 (painel do gestor).
- US-26 (instrumentação de métricas).

**Sprint 3 — Mapa & rotas piloto + acessibilidade**
- US-17, US-18, US-19, US-20, US-21 (mapa e rota do piloto).
- US-22, US-23, US-24 (acessibilidade transversal — na verdade contínua desde o Sprint 1).

**Sprint 4 — Polimento, validação e entrega**
- US-16 (notificações), US-25 (testes de acessibilidade no DoD), US-28 (usabilidade).
- Piloto real (≥20 denúncias), coleta de métricas, ajuste de IA.
- Relatório/deck da disciplina + deploy final.

> Se o time for de 1–2 pessoas: cortar E4 (mapa/rotas) para "Could" e entregar um
> MVP só de **denúncia com IA + painel** — já é um produto completo e validável.

## 4. Definition of Ready (DoR)

Uma história está pronta para começar quando: tem critério de aceite claro,
dependências resolvidas, design/fluxo definido, e considerações de
acessibilidade e privacidade explícitas.

## 5. Definition of Done (DoD)

Uma história está pronta quando:
- Atende aos critérios de aceite e foi revisada por outra pessoa.
- **Acessibilidade:** navegável por teclado, testada com leitor de tela quando envolve UI, contraste AA, alternativas textuais.
- **Privacidade:** trata foto/local conforme LGPD (consentimento, minimização) quando aplicável.
- Testes relevantes passam; sem regressões; deploy em preview funcionando.
- Métricas/observabilidade instrumentadas quando aplicável.
- Documentação/README atualizados quando muda o setup.

## 6. Critérios de aceite — exemplos-chave

**US-07 (IA sugere a partir da foto):**
- Dado que enviei uma foto de uma barreira, quando a triagem roda, então recebo categoria (do conjunto válido), urgência e uma descrição-rascunho, com estado de carregamento acessível.
- Se a IA falhar ou demorar além do timeout, então posso preencher manualmente sem perder a foto (US-10).
- A sugestão vem pré-preenchida e **editável** (US-08).

**US-19 (rota acessível):**
- Dado meu perfil "cadeirante", quando peço rota, então o caminho não inclui escadas e evita barreiras abertas conhecidas.
- A rota é apresentada no mapa **e** em texto passo a passo (US-20).

**US-23 (leitor de tela):**
- Todos os controles têm nome acessível; imagens têm alternativa textual; o mapa tem alternativa em lista; navegação e envio da denúncia são completáveis só com leitor de tela.

## 7. Riscos de execução

Ver `01-lean-canvas-e-validacao.md` (seção 3) e `03-arquitetura-tecnica.md`
(seção 9). Principais: parceria institucional (H2), acurácia da IA (H3) e tempo
de mapeamento do piloto (H5). Mitigação central: validar cedo e manter o mapa
pequeno.
