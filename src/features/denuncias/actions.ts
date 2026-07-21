'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { CATEGORIAS, URGENCIAS, type Categoria, type Urgencia } from '@/config/categorias';
import { sugestaoIaSchema } from '@/lib/ia/schema';
import { createClient } from '@/lib/supabase/server';

export interface EstadoDenuncia {
  erro?: string;
}

export async function criarDenuncia(
  _prev: EstadoDenuncia,
  formData: FormData,
): Promise<EstadoDenuncia> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: 'Sessão expirada. Entre novamente.' };

  const categoria = String(formData.get('categoria') ?? '') as Categoria;
  const urgencia = String(formData.get('urgencia') ?? '') as Urgencia;
  const descricao = String(formData.get('descricao') ?? '').trim();
  const localTexto = String(formData.get('localTexto') ?? '').trim();
  const fotoPath = String(formData.get('fotoPath') ?? '').trim();
  const lat = Number(formData.get('lat'));
  const lng = Number(formData.get('lng'));
  const temCoordenada = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);

  if (!CATEGORIAS.includes(categoria)) return { erro: 'Escolha a categoria da barreira.' };
  if (!URGENCIAS.includes(urgencia)) return { erro: 'Escolha o nível de urgência.' };
  if (descricao.length < 5) return { erro: 'Descreva o problema (pelo menos 5 caracteres).' };
  if (!localTexto && !temCoordenada) {
    return { erro: 'Informe a localização (prédio/ponto, texto ou GPS).' };
  }
  if (fotoPath && !fotoPath.startsWith(`${user.id}/`)) {
    return { erro: 'Foto inválida. Anexe novamente.' };
  }
  if (fotoPath && formData.get('consentimento') !== 'on') {
    return { erro: 'Confirme o aviso de privacidade para enviar a foto.' };
  }

  // Sugestão da IA (se houve): registrada para métricas (US-26).
  let iaSugestao = null;
  const bruto = formData.get('iaSugestaoJson');
  if (typeof bruto === 'string' && bruto) {
    try {
      const parsed = sugestaoIaSchema.safeParse(JSON.parse(bruto));
      if (parsed.success) iaSugestao = parsed.data;
    } catch {
      iaSugestao = null;
    }
  }
  const aceitouSugestao =
    iaSugestao !== null &&
    iaSugestao.categoria === categoria &&
    iaSugestao.urgencia === urgencia;

  const { data, error } = await supabase
    .from('denuncias')
    .insert({
      autor_id: user.id,
      categoria,
      urgencia,
      descricao,
      status: 'aberta',
      foto_url: fotoPath || null,
      local_texto: localTexto || null,
      geom: temCoordenada ? `SRID=4326;POINT(${lng} ${lat})` : null,
      ia_categoria_sugerida: iaSugestao?.categoria ?? null,
      ia_urgencia_sugerida: iaSugestao?.urgencia ?? null,
      ia_confianca: iaSugestao?.confianca ?? null,
      ia_payload: iaSugestao,
      aceitou_sugestao_ia: aceitouSugestao,
    })
    .select('id')
    .single();

  if (error || !data) return { erro: 'Não foi possível enviar a denúncia. Tente novamente.' };

  revalidatePath('/denuncias');
  revalidatePath('/mapa');
  redirect(`/denuncias/${data.id}?criada=1`);
}
