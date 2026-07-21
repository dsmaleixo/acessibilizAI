import type { Aresta, Grafo, No } from './grafo';

// Menor caminho (Dijkstra) sobre o subconjunto de arestas permitidas.
// Retorna a sequência de nós ou null se não houver rota acessível.
export function menorCaminho(
  grafo: Grafo,
  arestas: Aresta[],
  origemId: string,
  destinoId: string,
): No[] | null {
  const adj = new Map<string, Aresta[]>();
  for (const a of arestas) {
    (adj.get(a.de) ?? adj.set(a.de, []).get(a.de)!).push(a);
    (adj.get(a.para) ?? adj.set(a.para, []).get(a.para)!).push({ ...a, de: a.para, para: a.de });
  }

  const dist = new Map<string, number>();
  const anterior = new Map<string, string>();
  const pendentes = new Set(grafo.nos.map((n) => n.id));
  grafo.nos.forEach((n) => dist.set(n.id, Infinity));
  dist.set(origemId, 0);

  while (pendentes.size) {
    let atual: string | null = null;
    let melhor = Infinity;
    for (const id of pendentes) {
      const d = dist.get(id)!;
      if (d < melhor) [melhor, atual] = [d, id];
    }
    if (atual === null || atual === destinoId) break;
    pendentes.delete(atual);

    for (const a of adj.get(atual) ?? []) {
      const alt = dist.get(atual)! + a.custo;
      if (alt < (dist.get(a.para) ?? Infinity)) {
        dist.set(a.para, alt);
        anterior.set(a.para, atual);
      }
    }
  }

  if (!anterior.has(destinoId) && origemId !== destinoId) return null;
  const caminhoIds: string[] = [destinoId];
  let cur = destinoId;
  while (cur !== origemId) {
    const prev = anterior.get(cur);
    if (!prev) break;
    caminhoIds.unshift(prev);
    cur = prev;
  }
  const byId = new Map(grafo.nos.map((n) => [n.id, n]));
  return caminhoIds.map((id) => byId.get(id)!).filter(Boolean);
}

// Distância aproximada em metros entre dois nós (haversine).
function distanciaMetros(a: No, b: No): number {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Descrição textual acessível da rota, passo a passo (US-20).
export function descreverRota(caminho: No[]): string[] {
  if (caminho.length === 0) return ['Nenhuma rota acessível encontrada.'];
  if (caminho.length === 1) return [`Você já está em ${caminho[0].nome}.`];

  const passos = caminho.map((n, i) => {
    if (i === 0) return `Partida: ${n.nome}.`;
    const metros = Math.round(distanciaMetros(caminho[i - 1], n));
    const chegada = i === caminho.length - 1 ? 'Chegada' : 'Siga';
    return `${chegada}: ${n.nome} (aproximadamente ${metros} metros).`;
  });
  return passos;
}
