import { describe, expect, it } from 'vitest';
import { arestasPermitidas, montarGrafo, type Grafo } from './grafo';
import { descreverRota, menorCaminho } from './dijkstra';
import type { PontoRow, SegmentoRow } from '@/types';

const PONTOS: PontoRow[] = [
  { id: 1, tipo: 'entrada_acessivel', nome: 'Entrada CA', lat: -7.217, lng: -35.9078, ativo: true },
  { id: 2, tipo: 'rampa', nome: 'Rampa CA', lat: -7.2171, lng: -35.9079, ativo: true },
  { id: 3, tipo: 'banheiro_acessivel', nome: 'Banheiro CA', lat: -7.2172, lng: -35.908, ativo: true },
];

const SEGMENTOS: SegmentoRow[] = [
  // Caminho curto com escada; caminho longo com rampa.
  { id: 1, ponto_origem_id: 1, ponto_destino_id: 3, custo: 10, restricoes: { tem_escada: true } },
  { id: 2, ponto_origem_id: 1, ponto_destino_id: 2, custo: 8, restricoes: { tem_rampa: true } },
  { id: 3, ponto_origem_id: 2, ponto_destino_id: 3, custo: 8, restricoes: { tem_rampa: true } },
];

function rota(grafo: Grafo, perfil: 'cadeira' | 'visual' | 'mobilidade_reduzida', bloqueados = new Set<string>()) {
  const arestas = arestasPermitidas(grafo, perfil, bloqueados);
  return menorCaminho(grafo, arestas, '1', '3');
}

describe('roteamento acessível (US-19)', () => {
  const grafo = montarGrafo(PONTOS, SEGMENTOS);

  it('monta o grafo a partir das linhas do banco', () => {
    expect(grafo.nos).toHaveLength(3);
    expect(grafo.arestas).toHaveLength(3);
  });

  it('perfil cadeirante nunca passa por escadas', () => {
    const caminho = rota(grafo, 'cadeira');
    expect(caminho?.map((n) => n.id)).toEqual(['1', '2', '3']);
  });

  it('mobilidade reduzida pode usar a escada quando compensa', () => {
    const caminho = rota(grafo, 'mobilidade_reduzida');
    expect(caminho?.map((n) => n.id)).toEqual(['1', '3']);
  });

  it('barreira aberta bloqueia o nó e a rota desvia ou falha', () => {
    const caminho = rota(grafo, 'cadeira', new Set(['2']));
    expect(caminho).toBeNull();
  });

  it('retorna null quando não há rota acessível', () => {
    const soEscada = montarGrafo(PONTOS, [SEGMENTOS[0]]);
    expect(rota(soEscada, 'cadeira')).toBeNull();
  });

  it('descreve a rota passo a passo em texto (US-20)', () => {
    const caminho = rota(grafo, 'cadeira')!;
    const passos = descreverRota(caminho);
    expect(passos[0]).toContain('Partida: Entrada CA');
    expect(passos.at(-1)).toContain('Chegada: Banheiro CA');
    expect(passos.at(-1)).toMatch(/metros/);
  });
});

describe('perfil visual prioriza piso tátil', () => {
  it('prefere o caminho com piso tátil mesmo um pouco mais longo', () => {
    const segmentos: SegmentoRow[] = [
      { id: 1, ponto_origem_id: 1, ponto_destino_id: 3, custo: 10, restricoes: {} },
      { id: 2, ponto_origem_id: 1, ponto_destino_id: 2, custo: 7, restricoes: { tem_piso_tatil: true } },
      { id: 3, ponto_origem_id: 2, ponto_destino_id: 3, custo: 7, restricoes: { tem_piso_tatil: true } },
    ];
    const grafo = montarGrafo(PONTOS, segmentos);
    const caminho = rota(grafo, 'visual');
    expect(caminho?.map((n) => n.id)).toEqual(['1', '2', '3']);
  });
});
