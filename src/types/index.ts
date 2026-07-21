import type { Categoria, Status, Urgencia, PerfilAcessibilidade } from '@/config/categorias';

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
  tipo: 'rampa' | 'elevador' | 'banheiro_acessivel' | 'piso_tatil' | 'entrada_acessivel';
  nome: string;
  lat: number;
  lng: number;
  ativo: boolean;
}
