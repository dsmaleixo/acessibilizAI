# acessibilizAI — Lean Canvas & Plano de Validação

> **Artefato inicial de validação.** Este é o primeiro documento a ser lido e o
> primeiro a ser validado com usuários reais antes de escrever código de produção.
> Objetivo: provar que o problema é real, doloroso e que a solução proposta é
> desejável e viável dentro do prazo de uma disciplina (MVP em poucas semanas,
> time pequeno).

- **Produto:** acessibilizAI — mapa de rotas acessíveis + canal de denúncia de barreiras físicas no campus, com triagem por IA.
- **Contexto:** Projeto final da disciplina "Introdução à IA Generativa" — UFCG.
- **Versão do documento:** v1.0 · **Data:** 2026-07-20 · **Status:** rascunho para validação.

---

## 1. Lean Canvas

| Bloco | Conteúdo |
|---|---|
| **1. Problema** | (a) Pessoas com deficiência (PcD) gastam tempo e energia descobrindo *como* chegar a um destino no campus por um caminho acessível (rampa, elevador, piso tátil). (b) Barreiras quebradas (elevador parado, piso tátil danificado, rampa bloqueada, corrimão solto) demoram a ser reportadas e consertadas porque o canal atual é burocrático/inexistente. (c) A universidade não tem dado estruturado sobre onde estão os problemas de acessibilidade. |
| **Alternativas atuais** | Perguntar para colegas/porteiros; tentativa e erro; ligar/enviar e-mail para a prefeitura do campus; grupos de WhatsApp; simplesmente desistir de ir ao local. |
| **2. Segmentos de clientes** | **Usuários finais:** estudantes, professores e funcionários com deficiência física (cadeirantes, mobilidade reduzida) e visual. **Comprador/patrocinador:** Núcleo de Acessibilidade / Prefeitura do Campus / PRAC da UFCG. **Early adopters:** estudantes PcD ativos em coletivos de acessibilidade + o próprio núcleo de acessibilidade da universidade. |
| **3. Proposta de valor única** | "Chegue a qualquer lugar do campus por um caminho que funciona para você — e ajude a consertar o que está quebrado tirando uma foto." Rotas filtradas por necessidade de acessibilidade + denúncia em segundos com triagem automática por IA. |
| **Conceito de alto nível** | "Waze das rotas acessíveis + Colab/1746 do campus." |
| **4. Solução** | (1) Mapa interativo com roteamento que respeita o perfil de acessibilidade do usuário. (2) Denúncia com foto → IA classifica o tipo de barreira, sugere categoria/urgência e localiza no mapa. (3) Painel para o núcleo de acessibilidade acompanhar e resolver chamados. |
| **5. Canais** | Divulgação via núcleo de acessibilidade, coletivos estudantis, DCE/centros acadêmicos, redes sociais da universidade, QR codes em pontos físicos do campus. App web (PWA) — sem fricção de instalação. |
| **6. Fontes de receita** | *Não é um produto comercial.* "Receita" = valor institucional: convênio/adoção pela universidade, métrica de barreiras resolvidas, nota da disciplina, portfólio. Sustentabilidade via infraestrutura de baixo custo (free tier) + eventual manutenção pela própria universidade. |
| **7. Estrutura de custos** | Hospedagem (free/low tier), banco de dados, armazenamento de imagens, chamadas de API do modelo de IA (custo por imagem classificada), domínio. Tempo do time. Detalhado no doc de arquitetura. |
| **8. Métricas-chave** | Rotas acessíveis geradas; denúncias criadas; % de denúncias com foto classificadas corretamente pela IA; tempo médio até resolução; barreiras resolvidas; usuários ativos recorrentes. |
| **9. Vantagem injusta** | Acesso direto aos usuários (comunidade universitária) e ao "dono do problema" (a própria universidade, que pode consertar). Base de dados de acessibilidade do campus construída de forma colaborativa — difícil de replicar de fora. |

---

## 2. Priorização: qual dor atacar primeiro?

As duas funcionalidades (roteamento acessível vs. denúncia com IA) têm dores e
custos diferentes. Recomendação de sequência para um MVP de disciplina:

| Funcionalidade | Dor resolvida | Esforço de dados | Recomendação |
|---|---|---|---|
| **Denúncia com foto + IA** | Alta e recorrente; gera valor institucional visível | Baixo — não exige mapear todo o campus | **MVP núcleo (fazer primeiro)** |
| **Mapa de rotas acessíveis** | Alta, mas exige base de dados geoespacial rica | Alto — mapear rampas, elevadores, pisos táteis de todo o campus | **Fase 2 / versão reduzida no MVP** |

> **Insight de produto:** o roteamento acessível é a parte mais "sexy", mas
> depende de mapear fisicamente o campus (levantamento de rampas, elevadores,
> pisos táteis com coordenadas). Isso é caro em tempo e é o maior risco de
> cronograma. A denúncia com IA entrega valor com muito menos dado inicial —
> e as próprias denúncias vão *alimentando* a base que o mapa precisa.
> Por isso o MVP começa pela denúncia e entrega o mapa em versão reduzida
> (um subconjunto pequeno do campus — ex.: 1 ou 2 prédios-piloto).

---

## 3. Hipóteses de risco (ordenadas por risco)

Todo projeto morre pelas suposições erradas. Listamos as hipóteses do mais
arriscado (validar primeiro) ao menos arriscado.

| # | Tipo | Hipótese | Se for falsa... |
|---|---|---|---|
| H1 | Desejabilidade | PcD do campus consideram a dificuldade de rota/denúncia dolorosa o suficiente para usar um app | O produto não tem razão de existir |
| H2 | Viabilidade (org) | O núcleo de acessibilidade/prefeitura vai *agir* sobre as denúncias recebidas | Vira "buraco negro de reclamações"; usuários abandonam |
| H3 | Viabilidade (técnica-IA) | Um modelo de visão consegue classificar tipos de barreira a partir de fotos reais do campus com acurácia útil | A parte de IA vira só um formulário; perde o diferencial |
| H4 | Desejabilidade | Usuários preferem tirar foto a preencher formulário | O fluxo com IA não reduz fricção |
| H5 | Viabilidade (dados) | É factível mapear rampas/elevadores/piso tátil de ao menos um prédio-piloto no prazo | O roteamento acessível não sai do papel |
| H6 | Acessibilidade | O próprio app é utilizável por leitor de tela / com baixa visão / navegação por teclado | Ironia fatal: app de acessibilidade inacessível |

---

## 4. Experimentos de validação (antes/durante o build)

Barato primeiro. Nenhum destes exige o produto pronto.

**Semana 0 — Descoberta (validar H1, H2, H4)**
- 5–8 entrevistas de problema com PcD do campus (roteiro focado em "conte a última vez que teve dificuldade para chegar a um lugar / relatar algo quebrado"). Não vender solução — investigar dor.
- 1–2 conversas com o núcleo de acessibilidade / prefeitura do campus: eles têm processo hoje? Topariam receber e tratar denúncias estruturadas? (valida H2, o maior risco de "morte" do produto).
- Levantar quantas barreiras "quebradas" existem hoje e quanto tempo levam para ser resolvidas (baseline da métrica).

**Semana 0/1 — Teste técnico da IA (validar H3)**
- Coletar 30–50 fotos reais de barreiras no campus (rampa, elevador, piso tátil danificado, corrimão, obstáculo) + fotos "negativas".
- Testar um modelo de visão (VLM via API) com um prompt de classificação e medir acurácia/precisão/recall por categoria. Documentar. Isto define se a IA é classificação supervisionada, VLM por prompt, ou apenas assistência (ver doc de arquitetura, seção IA).

**Semana 1 — Teste de desejabilidade (validar H4, H6)**
- Protótipo navegável (Figma ou HTML) do fluxo de denúncia com foto e do mapa reduzido. Teste de usabilidade moderado com 3–5 PcD, incluindo ao menos 1 usuário de leitor de tela.

**Critério de "go":** H1 e H2 confirmadas (dor real + parceiro institucional disposto a agir) e H3 com sinal positivo (IA acima de um limiar mínimo útil, ex. ≥70% de acerto na categoria) ou plano B de IA definido.

---

## 5. Métricas de sucesso (North Star + apoio)

- **North Star Metric:** número de **barreiras de acessibilidade resolvidas** com origem na plataforma. Captura valor real para o usuário final e para a instituição.
- **Métricas de produto (AARRR simplificado):**
  - *Aquisição:* usuários cadastrados / que abriram o app.
  - *Ativação:* usuários que criaram a 1ª denúncia OU geraram a 1ª rota.
  - *Retenção:* usuários que voltam em 7/30 dias.
  - *Engajamento:* denúncias por semana; rotas geradas por semana.
- **Métricas da IA:** acurácia de classificação, precisão/recall por categoria, % de denúncias em que o usuário aceitou a sugestão da IA sem editar.
- **Métrica de impacto (operacional):** tempo médio entre denúncia → resolução.

**Metas do MVP (proposta, ajustar após descoberta):** ≥1 prédio-piloto mapeado; ≥20 denúncias reais no piloto; IA ≥70% de acerto de categoria; ≥1 barreira efetivamente resolvida pela universidade via plataforma.

---

## 6. Restrições e premissas assumidas

- Prazo de disciplina (poucas semanas), time pequeno (1–4 pessoas), orçamento ~zero → priorizar free tiers e serviços gerenciados.
- Não construir mapa/base geoespacial do campus inteiro no MVP — apenas piloto.
- Parceria (ainda que informal) com o núcleo de acessibilidade é o maior fator de sucesso — buscar cedo.
- Privacidade: fotos podem conter pessoas → tratar LGPD desde o design (ver arquitetura).

> **Próximos artefatos:** o *PRD* detalha personas, jornadas e requisitos; a
> *Arquitetura Técnica* detalha stack, dados e o design da IA; o *Backlog &
> Roadmap* organiza a execução em sprints.
