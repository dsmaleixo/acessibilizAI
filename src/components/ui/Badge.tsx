import {
  STATUS_LABEL,
  URGENCIA_LABEL,
  type Status,
  type Urgencia,
} from '@/config/categorias';

// Status/urgência sempre com rótulo textual — cor nunca é o único canal
// de informação (WCAG 1.4.1).

const STATUS_ESTILO: Record<Status, string> = {
  aberta: 'bg-amber-100 text-amber-900 border-amber-700',
  em_analise: 'bg-blue-100 text-blue-900 border-blue-700',
  resolvida: 'bg-green-100 text-green-900 border-green-700',
  rejeitada: 'bg-gray-200 text-gray-900 border-gray-600',
};

export function BadgeStatus({ status }: { status: Status }) {
  return (
    <span
      className={`inline-block rounded-full border px-3 py-0.5 text-sm font-medium ${STATUS_ESTILO[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

const URGENCIA_ESTILO: Record<Urgencia, string> = {
  baixa: 'bg-gray-100 text-gray-900 border-gray-600',
  media: 'bg-amber-100 text-amber-900 border-amber-700',
  alta: 'bg-red-100 text-red-900 border-red-700',
};

export function BadgeUrgencia({ urgencia }: { urgencia: Urgencia }) {
  return (
    <span
      className={`inline-block rounded-full border px-3 py-0.5 text-sm font-medium ${URGENCIA_ESTILO[urgencia]}`}
    >
      Urgência: {URGENCIA_LABEL[urgencia]}
    </span>
  );
}
