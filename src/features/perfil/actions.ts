'use server';

import { revalidatePath } from 'next/cache';
import { PERFIS, type PerfilAcessibilidade } from '@/config/categorias';
import { createClient } from '@/lib/supabase/server';

export interface EstadoPerfil {
  erro?: string;
  mensagem?: string;
}

export async function salvarPerfil(_prev: EstadoPerfil, formData: FormData): Promise<EstadoPerfil> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: 'Sessão expirada. Entre novamente.' };

  const nome = String(formData.get('nome') ?? '').trim();
  if (!nome) return { erro: 'Informe seu nome.' };

  const selecionados = formData
    .getAll('perfis')
    .filter((p): p is PerfilAcessibilidade => PERFIS.includes(p as PerfilAcessibilidade));

  const { error: erroNome } = await supabase
    .from('usuarios')
    .update({ nome })
    .eq('id', user.id);
  if (erroNome) return { erro: 'Não foi possível salvar. Tente novamente.' };

  // Sincroniza os perfis: remove os desmarcados, insere os novos.
  const { error: erroLimpa } = await supabase
    .from('perfis_acessibilidade')
    .delete()
    .eq('usuario_id', user.id);
  if (erroLimpa) return { erro: 'Não foi possível salvar os perfis. Tente novamente.' };

  if (selecionados.length > 0) {
    const { error: erroInsere } = await supabase
      .from('perfis_acessibilidade')
      .insert(selecionados.map((tipo) => ({ usuario_id: user.id, tipo })));
    if (erroInsere) return { erro: 'Não foi possível salvar os perfis. Tente novamente.' };
  }

  revalidatePath('/perfil');
  revalidatePath('/mapa');
  return { mensagem: 'Perfil salvo!' };
}
