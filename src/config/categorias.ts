// Conjunto controlado de categorias de barreira (PRD RF05).
// A IA só pode sugerir valores deste conjunto.

export const CATEGORIAS = [
  'rampa_obstruida',
  'elevador_quebrado',
  'piso_tatil_danificado',
  'corrimao_quebrado',
  'obstaculo_via',
  'banheiro_interditado',
  'outro',
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export const CATEGORIA_LABEL: Record<Categoria, string> = {
  rampa_obstruida: 'Rampa obstruída/danificada',
  elevador_quebrado: 'Elevador quebrado',
  piso_tatil_danificado: 'Piso tátil ausente/danificado',
  corrimao_quebrado: 'Corrimão quebrado',
  obstaculo_via: 'Obstáculo na via',
  banheiro_interditado: 'Banheiro acessível interditado',
  outro: 'Outro',
};

export const URGENCIAS = ['baixa', 'media', 'alta'] as const;
export type Urgencia = (typeof URGENCIAS)[number];

export const STATUS = ['aberta', 'em_analise', 'resolvida', 'rejeitada'] as const;
export type Status = (typeof STATUS)[number];

// Perfis de acessibilidade que parametrizam interface e roteamento (PRD RF02).
export const PERFIS = ['cadeira', 'visual', 'mobilidade_reduzida'] as const;
export type PerfilAcessibilidade = (typeof PERFIS)[number];
