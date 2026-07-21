'use client';

import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { CATEGORIA_LABEL, PONTO_TIPO_LABEL, type PontoTipo } from '@/config/categorias';
import type { No } from '@/lib/rotas/grafo';
import type { PontoRow } from '@/types';
import type { BarreiraAberta } from './MapaInterativo';

// Cores AA sobre o tile claro; a informação nunca depende só da cor —
// popups e as listas abaixo do mapa carregam o texto (WCAG 1.4.1).
const COR_TIPO: Record<PontoTipo, string> = {
  rampa: '#1d4ed8',
  elevador: '#6d28d9',
  banheiro_acessivel: '#0f766e',
  piso_tatil: '#a16207',
  entrada_acessivel: '#15803d',
};

export default function MapaLeaflet({
  pontos,
  barreiras,
  rota,
}: {
  pontos: PontoRow[];
  barreiras: BarreiraAberta[];
  rota: No[];
}) {
  const centro: [number, number] =
    pontos.length > 0 ? [pontos[0].lat, pontos[0].lng] : [-7.2172, -35.9085];

  return (
    <div
      role="img"
      aria-label="Mapa do campus com pontos acessíveis e barreiras abertas. O mesmo conteúdo está disponível nas listas abaixo do mapa."
    >
      <MapContainer
        center={centro}
        zoom={17}
        className="h-80 w-full rounded-md border border-gray-300"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pontos.map((p) => (
          <CircleMarker
            key={`ponto-${p.id}`}
            center={[p.lat, p.lng]}
            radius={9}
            pathOptions={{ color: COR_TIPO[p.tipo], fillColor: COR_TIPO[p.tipo], fillOpacity: 0.7 }}
          >
            <Popup>
              {PONTO_TIPO_LABEL[p.tipo]}: {p.nome}
            </Popup>
          </CircleMarker>
        ))}
        {barreiras
          .filter((b) => b.lat != null && b.lng != null)
          .map((b) => (
            <CircleMarker
              key={`barreira-${b.id}`}
              center={[b.lat!, b.lng!]}
              radius={11}
              pathOptions={{ color: '#b91c1c', fillColor: '#b91c1c', fillOpacity: 0.6, dashArray: '4' }}
            >
              <Popup>
                Barreira aberta: {CATEGORIA_LABEL[b.categoria]}
                {b.local_texto ? ` — ${b.local_texto}` : ''}
              </Popup>
            </CircleMarker>
          ))}
        {rota.length > 1 ? (
          <Polyline
            positions={rota.map((n) => [n.lat, n.lng] as [number, number])}
            pathOptions={{ color: '#0b5fff', weight: 5 }}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}
