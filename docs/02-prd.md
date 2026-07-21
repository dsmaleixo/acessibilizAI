# acessibilizAI — PRD (Product Requirements Document)

- **Versão:** v1.0 · **Data:** 2026-07-20 · **Autor:** time acessibilizAI · **Status:** rascunho
- **Documentos relacionados:** `01-lean-canvas-e-validacao.md`, `03-arquitetura-tecnica.md`, `04-backlog-e-roadmap.md`

---

## 1. Resumo executivo

acessibilizAI é uma aplicação web (PWA) que ajuda pessoas com deficiência da
comunidade universitária a (1) se deslocar pelo campus por rotas adequadas à sua
necessidade de acessibilidade e (2) reportar barreiras físicas quebradas ou
ausentes (elevador parado, piso tátil danificado, rampa bloqueada, corrimão
solto), com uma IA que analisa a foto enviada, classifica o tipo de problema e
agiliza o encaminhamento para o setor responsável.

O objetivo do MVP é provar valor com **um canal de denúncia inteligente** e um
**mapa de rotas acessíveis em escala piloto**, gerando dados estruturados de
acessibilidade e reduzindo o tempo até a resolução das barreiras.

## 2. Problema

Pessoas com deficiência no campus enfrentam duas dores conectadas:

1. **Navegação:** descobrir um caminho que de fato funciona (só com rampas, com
   elevador em operação, com piso tátil contínuo) é feito na tentativa e erro,
   perguntando a terceiros, e muitas vezes resulta em desistir do trajeto.
2. **Manutenção:** quando uma barreira está quebrada ou ausente, não há um canal
   simples e rastreável para reportar; o conserto demora e ninguém tem
   visibilidade de onde estão os problemas.

Consequência: perda de autonomia e de tempo para as PcD, e ausência de dados que
permitam à universidade priorizar consertos.

## 3. Objetivos e OKRs

**Objetivo do produto (MVP):** validar que uma plataforma de denúncia com IA +
rotas acessíveis reduz a fricção de navegação e acelera a resolução de barreiras.

| Objective | Key Results (MVP) |
|---|---|
| Provar desejabilidade | ≥ 20 denúncias reais no piloto; ≥ 30 rotas geradas; ≥ 40% de retenção em 7 dias entre early adopters |
| Provar a IA | Classificação de categoria com acurácia ≥ 70%; ≥ 60% das sugestões aceitas sem edição |
| Provar impacto institucional | ≥ 1 barreira resolvida pela universidade via plataforma; tempo médio de resolução medido |
| Garantir acessibilidade do app | Conformidade WCAG 2.2 AA nas telas do MVP; aprovado em teste com ≥ 1 usuário de leitor de tela |

**Fora de escopo do MVP (Non-goals):** navegação turn-by-turn em tempo real
(GPS indoor), mapear o campus inteiro, app nativo iOS/Android, gamificação,
integração automática com o sistema de chamados da universidade.

## 4. Personas

**Persona 1 — Marina, a cadeirante (usuária final primária)**
- 22 anos, estudante de Engenharia. Usa cadeira de rodas manual.
- *Necessidades:* rotas só com rampas/elevadores; saber se o elevador do prédio está funcionando antes de sair; reportar rampa bloqueada rapidamente.
- *Dores:* chegar a um prédio e descobrir que o elevador está quebrado; rampas usadas como estacionamento improvisado.
- *Cenário-chave:* precisa ir do bloco CA ao banheiro acessível mais próximo entre uma aula e outra.

**Persona 2 — João, o estudante com deficiência visual (usuária final primária)**
- 27 anos, mestrando. Baixa visão; usa leitor de tela e bengala.
- *Necessidades:* caminhos com piso tátil contínuo; app 100% compatível com leitor de tela; descrições textuais claras.
- *Dores:* piso tátil que some no meio do caminho ou está danificado; interfaces cheias de ícones sem rótulo.
- *Cenário-chave:* quer chegar à biblioteca por um caminho com piso tátil e reportar um trecho onde o piso está quebrado.

**Persona 3 — Sr. Antônio, servidor da prefeitura do campus / núcleo de acessibilidade (gestor)**
- 45 anos. Responsável por manutenção e acessibilidade.
- *Necessidades:* receber denúncias organizadas, com foto, categoria e localização; priorizar por urgência; marcar como resolvido.
- *Dores:* reclamações desencontradas por vários canais; falta de dado para justificar orçamento de conserto.
- *Cenário-chave:* abre o painel de manhã e vê as barreiras abertas ordenadas por urgência e prédio.

**Persona 4 — Beatriz, estudante sem deficiência (colaboradora ocasional)**
- Reporta barreiras que encontra pelo campus. Amplia a base de dados. (Secundária.)

## 5. Jornadas do usuário

**Jornada A — Denunciar uma barreira (foto + IA)**
1. Marina encontra uma rampa bloqueada por entulho.
2. Abre o acessibilizAI → "Nova denúncia".
3. Tira/anexa a foto. Opcional: localização automática (GPS) ou seleção no mapa/prédio.
4. A IA analisa a foto e **sugere**: categoria ("rampa obstruída"), urgência ("alta") e uma descrição rascunho.
5. Marina confere, ajusta se quiser, adiciona comentário e envia.
6. Recebe um protocolo e acompanha o status (aberta → em análise → resolvida).

**Jornada B — Encontrar uma rota acessível**
1. João define seu perfil de acessibilidade (deficiência visual → prioriza piso tátil).
2. Escolhe origem e destino (ex.: "banheiro acessível mais próximo").
3. O sistema calcula a rota respeitando o perfil e evitando barreiras abertas conhecidas.
4. João recebe a rota no mapa + descrição textual acessível passo a passo.

**Jornada C — Gestão de denúncias (gestor)**
1. Sr. Antônio abre o painel, filtra por prédio/urgência/status.
2. Abre um chamado, vê foto, categoria da IA, localização e histórico.
3. Atualiza o status e, ao resolver, marca como resolvido (a rota volta a considerar aquele ponto como acessível).

## 6. Escopo do MVP — priorização MoSCoW

| Prioridade | Funcionalidade |
|---|---|
| **Must** | Cadastro/login leve; perfil de acessibilidade; criar denúncia com foto; **classificação da foto por IA** (categoria + urgência + descrição sugerida, editável); localização por prédio/ponto; listagem e status da denúncia; painel do gestor (listar, filtrar, mudar status); acessibilidade WCAG 2.2 AA das telas core |
| **Should** | Mapa reduzido (piloto: 1–2 prédios) com pontos acessíveis (rampas, elevadores, banheiros, piso tátil); rota acessível simples entre pontos do piloto; notificação de mudança de status; foto com localização por GPS |
| **Could** | Votar/confirmar denúncia de outra pessoa ("também vi isso"); histórico/estatísticas públicas; modo alto contraste custom; exportar dados para a universidade |
| **Won't (agora)** | Navegação turn-by-turn em tempo real; roteamento indoor por sensores; app nativo; login federado institucional; integração automática com ERP de chamados |

## 7. Requisitos funcionais (RF)

- **RF01 — Autenticação:** o usuário pode criar conta e autenticar (e-mail/senha ou magic link). Deve haver papel `usuario` e `gestor`.
- **RF02 — Perfil de acessibilidade:** o usuário define uma ou mais necessidades (mobilidade/cadeira, visual, mobilidade reduzida) que parametrizam o roteamento e a interface.
- **RF03 — Criar denúncia:** anexar foto (câmera ou galeria), informar localização (GPS, ou seleção de prédio/ponto no mapa) e enviar.
- **RF04 — Triagem por IA:** ao enviar a foto, o sistema chama o serviço de visão e retorna categoria sugerida, nível de urgência e um texto-rascunho de descrição. As sugestões são **editáveis** pelo usuário (a IA assiste, não decide sozinha).
- **RF05 — Categorias de barreira:** conjunto controlado — ex.: `rampa obstruída/danificada`, `elevador quebrado`, `piso tátil ausente/danificado`, `corrimão quebrado`, `obstáculo na via`, `banheiro acessível interditado`, `outro`.
- **RF06 — Acompanhamento:** o usuário vê suas denúncias e o status (`aberta`, `em análise`, `resolvida`, `rejeitada`) com protocolo.
- **RF07 — Painel do gestor:** listar/filtrar denúncias por prédio, categoria, urgência e status; abrir detalhe; alterar status; comentar.
- **RF08 — Mapa de acessibilidade (piloto):** exibir pontos acessíveis cadastrados (rampas, elevadores, banheiros acessíveis, trechos de piso tátil) e barreiras abertas.
- **RF09 — Roteamento acessível (piloto):** dado origem, destino e perfil, retornar uma rota que respeite as restrições do perfil e evite barreiras abertas, com descrição textual acessível.
- **RF10 — Notificação:** notificar o autor quando o status da sua denúncia mudar (in-app e/ou e-mail).

## 8. Requisitos não-funcionais (RNF)

- **RNF01 — Acessibilidade:** conformidade **WCAG 2.2 nível AA** nas telas do MVP (ver seção 9). É requisito de aceitação, não "nice to have".
- **RNF02 — Responsividade/PWA:** mobile-first; instalável como PWA; utilizável em conexões ruins (upload de foto resiliente, compressão client-side).
- **RNF03 — Desempenho:** carregamento inicial < 3s em 4G; resposta da triagem por IA idealmente < 8s, com estado de carregamento acessível e possibilidade de enviar sem esperar a IA.
- **RNF04 — Privacidade/LGPD:** consentimento para envio de foto e localização; minimização de dados; fotos podem conter pessoas → orientar/expor aviso e permitir denúncia sem rosto; base legal e retenção definidas (ver arquitetura).
- **RNF05 — Segurança:** autenticação segura, autorização por papel, upload validado (tipo/tamanho), proteção contra abuso/spam de denúncias.
- **RNF06 — Confiabilidade da IA:** o sistema nunca bloqueia o envio por falha da IA — se o serviço de visão falhar, o usuário preenche manualmente (degradação graciosa).
- **RNF07 — Observabilidade:** logs e métricas mínimas (denúncias criadas, latência/erros da IA, taxa de aceitação da sugestão).
- **RNF08 — Custo:** operar dentro de free/low tiers; limitar chamadas de IA (1 por denúncia; cache/limite anti-abuso).
- **RNF09 — Manutenibilidade:** código organizado, README de setup, deploy reproduzível — para a universidade poder assumir depois.
- **RNF10 — i18n (idioma):** PT-BR no MVP; textos centralizados para futura tradução.

## 9. Requisitos de acessibilidade do próprio app (checklist WCAG 2.2 AA)

Como é um app *de acessibilidade*, ele precisa ser exemplar. Critérios mínimos:

- **Perceptível:** contraste de texto ≥ 4.5:1 (≥ 3:1 para texto grande e componentes); todo conteúdo não-textual (ícones, fotos) com alternativa textual; não usar cor como único meio de informação (status também com rótulo/ícone).
- **Operável:** 100% navegável por teclado, com foco visível; alvos de toque ≥ 24×24px (ideal 44×44); sem limites de tempo rígidos; nada que pisque > 3x/s.
- **Compreensível:** rótulos e instruções claros em todos os campos; mensagens de erro descritivas e associadas ao campo; idioma da página definido (`lang="pt-BR"`).
- **Robusto:** HTML semântico; uso correto de ARIA apenas quando necessário; nomes/estados acessíveis em componentes customizados (mapa incluso — prover alternativa textual/lista para o mapa).
- **Mapa acessível:** o mapa nunca é a única forma de completar uma tarefa — sempre há alternativa por lista/formulário (ex.: selecionar prédio por nome). Rotas têm descrição textual passo a passo.
- **Teste obrigatório:** validação com leitor de tela (NVDA/VoiceOver/TalkBack) e navegação só por teclado antes de considerar uma tela "pronta".

## 10. Métricas e critérios de aceite

Ver `01-lean-canvas-e-validacao.md` (seção 5). Critério de aceite de cada
história no `04-backlog-e-roadmap.md`. Definição de Pronto inclui: testado,
acessível (checklist acima), e revisado.

## 11. Riscos e mitigações (resumo)

| Risco | Mitigação |
|---|---|
| IA não classifica bem fotos reais | Teste técnico na semana 0; fallback manual; começar com poucas categorias claras |
| Universidade não age sobre denúncias | Buscar parceiro institucional antes de construir (H2); no mínimo, exportar relatório |
| Mapear campus consome todo o tempo | Restringir a 1–2 prédios-piloto; roteamento simples |
| App inacessível | Acessibilidade como Definition of Done; teste com usuário real de leitor de tela |
| Privacidade das fotos | Aviso de consentimento, minimização, opção de denúncia sem rosto, retenção limitada |
