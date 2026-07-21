'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import {
  CATEGORIA_LABEL,
  PERFIS,
  PERFIL_LABEL,
  PONTO_TIPO_LABEL,
  URGENCIA_LABEL,
  type Categoria,
  type PerfilAcessibilidade,
  type PontoTipo,
  type Urgencia,
} from '@/config/categorias';
import { montarGrafo, arestasPermitidas, type No } from '@/lib/rotas/grafo';
import { menorCaminho, descreverRota } from '@/lib/rotas/dijkstra';
import type { PontoRow, SegmentoRow } from '@/types';
import { Alerta } from '@/components/ui/Alerta';
import { Botao } from '@/components/ui/Botao';
import { CampoSelecao } from '@/components/ui/Campo';

export interface BarreiraAberta {
  id: string;
  categoria: Categoria;
  urgencia: Urgencia;
  status: string;
  local_texto: string | null;
  lat: number | null;
  lng: number | null;
}

// Leaflet só funciona no browser (window) — carregamento dinâmico sem SSR.
const MapaLeaflet = dynamic(() => import('./MapaLeaflet'), {
  ssr: false,
  loading: () => (
    <p className="flex h-72 items-center justify-center rounded-md border border-gray-300 bg-gray-100">
      Carregando o mapa…
    </p>
  ),
});

const RAIO_BLOQUEIO_METROS = 40;

function distanciaMetros(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLng = (bLng - aLng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function MapaInterativo({
  pontos,
  segmentos,
  barreiras,
  perfilInicial,
}: {
  pontos: PontoRow[];
  segmentos: SegmentoRow[];
  barreiras: BarreiraAberta[];
  perfilInicial: PerfilAcessibilidade;
}) {
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [perfil, setPerfil] = useState<PerfilAcessibilidade>(perfilInicial);
  const [rota, setRota] = useState<No[] | null>(null);
  const [buscou, setBuscou] = useState(false);

  const grafo = useMemo(() => montarGrafo(pontos, segmentos), [pontos, segmentos]);

  // Barreira aberta bloqueia o ponto acessível mais próximo (RF09), dentro de
  // um raio curto, ou o ponto com o mesmo nome no texto do local.
  const nosBloqueados = useMemo(() => {
    const bloqueados = new Set<string>();
    for (const b of barreiras) {
      for (const n of grafo.nos) {
        const porNome = b.local_texto != null && b.local_texto === n.nome;
        const porRaio =
          b.lat != null &&
          b.lng != null &&
          distanciaMetros(b.lat, b.lng, n.lat, n.lng) <= RAIO_BLOQUEIO_METROS;
        if (porNome || porRaio) bloqueados.add(n.id);
      }
    }
    return bloqueados;
  }, [barreiras, grafo]);

  function calcular(e: React.FormEvent) {
    e.preventDefault();
    if (!origem || !destino) return;
    const arestas = arestasPermitidas(grafo, perfil, nosBloqueados);
    setRota(menorCaminho(grafo, arestas, origem, destino));
    setBuscou(true);
  }

  const passos = rota ? descreverRota(rota) : null;
  const pontosPorTipo = useMemo(() => {
    const grupos = new Map<PontoTipo, PontoRow[]>();
    for (const p of pontos) {
      grupos.set(p.tipo, [...(grupos.get(p.tipo) ?? []), p]);
    }
    return grupos;
  }, [pontos]);

  return (
    <div className="mt-4 flex flex-col gap-6">
      <form onSubmit={calcular} className="grid gap-4 rounded-md border border-gray-400 p-4 sm:grid-cols-2">
        <CampoSelecao
          id="origem"
          rotulo="Origem"
          value={origem}
          onChange={(e) => setOrigem(e.target.value)}
          required
        >
          <option value="">Selecione…</option>
          {grafo.nos.map((n) => (
            <option key={n.id} value={n.id}>
              {n.nome}
            </option>
          ))}
        </CampoSelecao>
        <CampoSelecao
          id="destino"
          rotulo="Destino"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
          required
        >
          <option value="">Selecione…</option>
          {grafo.nos.map((n) => (
            <option key={n.id} value={n.id}>
              {n.nome}
            </option>
          ))}
        </CampoSelecao>
        <CampoSelecao
          id="perfil"
          rotulo="Meu perfil"
          dica="Cadeira de rodas evita escadas; visual prioriza piso tátil."
          value={perfil}
          onChange={(e) => setPerfil(e.target.value as PerfilAcessibilidade)}
        >
          {PERFIS.map((p) => (
            <option key={p} value={p}>
              {PERFIL_LABEL[p]}
            </option>
          ))}
        </CampoSelecao>
        <div className="flex items-end">
          <Botao type="submit" className="w-full">
            Calcular rota acessível
          </Botao>
        </div>
      </form>

      {/* Resultado textual passo a passo (US-20) — anunciado ao leitor de tela */}
      <div aria-live="polite">
        {buscou && passos ? (
          rota && rota.length > 0 ? (
            <section aria-label="Rota em texto, passo a passo">
              <h2 className="text-xl font-bold">Sua rota</h2>
              <ol className="mt-2 list-decimal pl-6">
                {passos.map((p, i) => (
                  <li key={i} className="py-1">
                    {p}
                  </li>
                ))}
              </ol>
            </section>
          ) : null
        ) : null}
        {buscou && (!rota || rota.length === 0) ? (
          <Alerta tom="aviso">
            Nenhuma rota acessível encontrada para esse perfil — pode haver uma
            barreira aberta no caminho. Tente outro destino ou verifique as
            denúncias abertas.
          </Alerta>
        ) : null}
      </div>

      <MapaLeaflet pontos={pontos} barreiras={barreiras} rota={rota ?? []} />

      {/* Alternativa em lista (US-21): o mapa nunca é o único caminho */}
      <section aria-label="Pontos acessíveis em lista">
        <h2 className="text-xl font-bold">Pontos acessíveis (lista)</h2>
        {[...pontosPorTipo.entries()].map(([tipo, itens]) => (
          <div key={tipo} className="mt-3">
            <h3 className="font-medium">{PONTO_TIPO_LABEL[tipo]}</h3>
            <ul className="mt-1 list-disc pl-6">
              {itens.map((p) => (
                <li key={p.id} className={nosBloqueados.has(String(p.id)) ? 'text-red-800' : ''}>
                  {p.nome}
                  {nosBloqueados.has(String(p.id))
                    ? ' — atenção: barreira aberta neste ponto'
                    : ''}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section aria-label="Barreiras abertas em lista">
        <h2 className="text-xl font-bold">Barreiras abertas</h2>
        {barreiras.length === 0 ? (
          <p className="mt-2">Nenhuma barreira aberta no momento. 🎉</p>
        ) : (
          <ul className="mt-2 list-disc pl-6">
            {barreiras.map((b) => (
              <li key={b.id}>
                {CATEGORIA_LABEL[b.categoria]} — urgência {URGENCIA_LABEL[b.urgencia].toLowerCase()}
                {b.local_texto ? ` — ${b.local_texto}` : ''}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
