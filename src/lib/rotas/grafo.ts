import type { PerfilAcessibilidade } from '@/config/categorias';

// Grafo simples do piloto (doc de arquitetura, seção 5).
export interface No {
  id: string;
  nome: string;
  lat: number;
  lng: number;
}

export interface Aresta {
  de: string;
  para: string;
  custo: number;
  temRampa: boolean;
  temElevador: boolean;
  temPisoTatil: boolean;
  temEscada: boolean;
}

export interface Grafo {
  nos: No[];
  arestas: Aresta[];
}

// Filtra as arestas permitidas conforme o perfil do usuário e barreiras abertas.
export function arestasPermitidas(
  grafo: Grafo,
  perfil: PerfilAcessibilidade,
  nosBloqueados: Set<string>,
): Aresta[] {
  return grafo.arestas.filter((a) => {
    if (nosBloqueados.has(a.de) || nosBloqueados.has(a.para)) return false;
    if (perfil === 'cadeira') return !a.temEscada; // exige rampa/elevador
    if (perfil === 'visual') return a.temPisoTatil || !a.temEscada; // prioriza piso tátil
    return true; // mobilidade_reduzida: evita nada por padrão
  });
}
