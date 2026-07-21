import type { PerfilAcessibilidade } from '@/config/categorias';
import type { PontoRow, SegmentoRow } from '@/types';

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

// Monta o grafo a partir das linhas do banco (pontos_acessiveis + segmentos_rota).
export function montarGrafo(pontos: PontoRow[], segmentos: SegmentoRow[]): Grafo {
  const nos: No[] = pontos
    .filter((p) => p.ativo)
    .map((p) => ({ id: String(p.id), nome: p.nome, lat: p.lat, lng: p.lng }));
  const idsAtivos = new Set(nos.map((n) => n.id));

  const arestas: Aresta[] = segmentos
    .map((s) => ({
      de: String(s.ponto_origem_id),
      para: String(s.ponto_destino_id),
      custo: s.custo,
      temRampa: s.restricoes?.tem_rampa === true,
      temElevador: false,
      temPisoTatil: s.restricoes?.tem_piso_tatil === true,
      temEscada: s.restricoes?.tem_escada === true,
    }))
    .filter((a) => idsAtivos.has(a.de) && idsAtivos.has(a.para));

  return { nos, arestas };
}

// Filtra as arestas permitidas conforme o perfil do usuário e barreiras abertas,
// ajustando o custo para expressar preferências (US-19).
export function arestasPermitidas(
  grafo: Grafo,
  perfil: PerfilAcessibilidade,
  nosBloqueados: Set<string>,
): Aresta[] {
  return grafo.arestas
    .filter((a) => {
      if (nosBloqueados.has(a.de) || nosBloqueados.has(a.para)) return false;
      if (perfil === 'cadeira') return !a.temEscada; // exige rampa/elevador
      return true;
    })
    .map((a) => {
      // Perfil visual: prioriza piso tátil sem inviabilizar o resto do grafo.
      if (perfil === 'visual' && !a.temPisoTatil) return { ...a, custo: a.custo * 2 };
      // Mobilidade reduzida: escadas são permitidas, mas penalizadas.
      if (perfil === 'mobilidade_reduzida' && a.temEscada) return { ...a, custo: a.custo * 1.5 };
      return a;
    });
}
