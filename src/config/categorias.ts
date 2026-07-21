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

export const URGENCIA_LABEL: Record<Urgencia, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
};

export const STATUS = ['aberta', 'em_analise', 'resolvida', 'rejeitada'] as const;
export type Status = (typeof STATUS)[number];

export const STATUS_LABEL: Record<Status, string> = {
  aberta: 'Aberta',
  em_analise: 'Em análise',
  resolvida: 'Resolvida',
  rejeitada: 'Rejeitada',
};

// Perfis de acessibilidade que parametrizam interface e roteamento (PRD RF02).
export const PERFIS = ['cadeira', 'visual', 'mobilidade_reduzida'] as const;
export type PerfilAcessibilidade = (typeof PERFIS)[number];

export const PERFIL_LABEL: Record<PerfilAcessibilidade, string> = {
  cadeira: 'Uso cadeira de rodas',
  visual: 'Deficiência visual',
  mobilidade_reduzida: 'Mobilidade reduzida',
};

export const PONTO_TIPOS = [
  'rampa',
  'elevador',
  'banheiro_acessivel',
  'piso_tatil',
  'entrada_acessivel',
] as const;
export type PontoTipo = (typeof PONTO_TIPOS)[number];

export const PONTO_TIPO_LABEL: Record<PontoTipo, string> = {
  rampa: 'Rampa',
  elevador: 'Elevador',
  banheiro_acessivel: 'Banheiro acessível',
  piso_tatil: 'Piso tátil',
  entrada_acessivel: 'Entrada acessível',
};

// Protocolo curto e legível derivado do id (RF06).
export function protocolo(id: string): string {
  return id.slice(0, 8).toUpperCase();
}
