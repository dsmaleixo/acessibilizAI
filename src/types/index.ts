import type {
  Categoria,
  PontoTipo,
  Status,
  Urgencia,
  PerfilAcessibilidade,
} from '@/config/categorias';

export type Papel = 'usuario' | 'gestor';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  perfis: PerfilAcessibilidade[];
}

export interface Denuncia {
  id: string;
  autorId: string;
  categoria: Categoria;
  urgencia: Urgencia;
  descricao: string;
  status: Status;
  fotoUrl: string | null;
  localTexto: string | null;
  lat: number | null;
  lng: number | null;
  iaSugestao: SugestaoIA | null;
  aceitouSugestaoIa: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface SugestaoIA {
  categoria: Categoria;
  urgencia: Urgencia;
  descricao: string;
  confianca: number; // 0..1
  contemPessoas: boolean;
}

export interface PontoAcessivel {
  id: string;
  tipo: PontoTipo;
  nome: string;
  lat: number;
  lng: number;
  ativo: boolean;
}

export interface DenunciaEvento {
  id: number;
  deStatus: Status | null;
  paraStatus: Status | null;
  comentario: string | null;
  criadoEm: string;
}

export interface Notificacao {
  id: number;
  denunciaId: string | null;
  titulo: string;
  corpo: string | null;
  lida: boolean;
  criadoEm: string;
}

// ---------------------------------------------------------------------------
// Linhas do banco (snake_case) + conversores. O PostGIS entrega o geom como
// GeoJSON quando selecionado via st_asgeojson; guardamos lat/lng planos.
// ---------------------------------------------------------------------------

export interface DenunciaRow {
  id: string;
  autor_id: string;
  categoria: Categoria;
  urgencia: Urgencia;
  descricao: string;
  status: Status;
  foto_url: string | null;
  local_texto: string | null;
  lat: number | null;
  lng: number | null;
  ia_categoria_sugerida: Categoria | null;
  ia_urgencia_sugerida: Urgencia | null;
  ia_confianca: number | null;
  ia_payload: Record<string, unknown> | null;
  aceitou_sugestao_ia: boolean;
  criado_em: string;
  atualizado_em: string;
}

export function denunciaFromRow(r: DenunciaRow): Denuncia {
  const payload = r.ia_payload as Partial<SugestaoIA> | null;
  return {
    id: r.id,
    autorId: r.autor_id,
    categoria: r.categoria,
    urgencia: r.urgencia,
    descricao: r.descricao,
    status: r.status,
    fotoUrl: r.foto_url,
    localTexto: r.local_texto,
    lat: r.lat,
    lng: r.lng,
    iaSugestao:
      r.ia_categoria_sugerida && r.ia_urgencia_sugerida
        ? {
            categoria: r.ia_categoria_sugerida,
            urgencia: r.ia_urgencia_sugerida,
            descricao: typeof payload?.descricao === 'string' ? payload.descricao : '',
            confianca: r.ia_confianca ?? 0,
            contemPessoas: payload?.contemPessoas === true,
          }
        : null,
    aceitouSugestaoIa: r.aceitou_sugestao_ia,
    criadoEm: r.criado_em,
    atualizadoEm: r.atualizado_em,
  };
}

export interface PontoRow {
  id: number;
  tipo: PontoTipo;
  nome: string;
  lat: number;
  lng: number;
  ativo: boolean;
}

export interface SegmentoRow {
  id: number;
  ponto_origem_id: number;
  ponto_destino_id: number;
  custo: number;
  restricoes: {
    tem_rampa?: boolean;
    tem_piso_tatil?: boolean;
    tem_escada?: boolean;
  } | null;
}
