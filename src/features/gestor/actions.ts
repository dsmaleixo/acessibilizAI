'use server';

import { revalidatePath } from 'next/cache';
import { STATUS, type Status } from '@/config/categorias';
import { createClient } from '@/lib/supabase/server';
import { getUsuarioAtual } from '@/lib/supabase/usuario';

export interface EstadoGestao {
  erro?: string;
  mensagem?: string;
}

// US-15: gestor muda o status e comenta. A RLS reforça o papel no banco;
// o trigger do banco notifica o autor (US-16).
export async function atualizarStatus(
  _prev: EstadoGestao,
  formData: FormData,
): Promise<EstadoGestao> {
  const usuario = await getUsuarioAtual();
  if (!usuario || usuario.papel !== 'gestor') {
    return { erro: 'Apenas gestores podem alterar o status.' };
  }

  const denunciaId = String(formData.get('denunciaId') ?? '');
  const paraStatus = String(formData.get('paraStatus') ?? '') as Status;
  const comentario = String(formData.get('comentario') ?? '').trim();
  if (!denunciaId || !STATUS.includes(paraStatus)) {
    return { erro: 'Escolha o novo status.' };
  }

  const supabase = await createClient();
  const { data: atual } = await supabase
    .from('denuncias')
    .select('status')
    .eq('id', denunciaId)
    .single();
  if (!atual) return { erro: 'Denúncia não encontrada.' };

  if (atual.status !== paraStatus) {
    const { error } = await supabase
      .from('denuncias')
      .update({ status: paraStatus })
      .eq('id', denunciaId);
    if (error) return { erro: 'Não foi possível atualizar o status.' };
  }

  const { error: erroEvento } = await supabase.from('denuncia_eventos').insert({
    denuncia_id: denunciaId,
    gestor_id: usuario.id,
    de_status: atual.status,
    para_status: paraStatus,
    comentario: comentario || null,
  });
  if (erroEvento) return { erro: 'Status atualizado, mas falhou ao registrar o comentário.' };

  revalidatePath(`/denuncias/${denunciaId}`);
  revalidatePath('/gestor');
  revalidatePath('/mapa');
  return { mensagem: 'Denúncia atualizada.' };
}
