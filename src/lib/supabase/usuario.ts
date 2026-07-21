import { cache } from 'react';
import { createClient } from './server';
import type { Usuario } from '@/types';
import type { PerfilAcessibilidade } from '@/config/categorias';

// Usuário autenticado + linha de `usuarios` + perfis de acessibilidade.
// `cache` deduplica a consulta dentro de uma mesma renderização.
export const getUsuarioAtual = cache(async (): Promise<Usuario | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: linha }, { data: perfis }] = await Promise.all([
    supabase.from('usuarios').select('id, nome, email, papel').eq('id', user.id).single(),
    supabase.from('perfis_acessibilidade').select('tipo').eq('usuario_id', user.id),
  ]);
  if (!linha) return null;

  return {
    id: linha.id,
    nome: linha.nome,
    email: linha.email,
    papel: linha.papel,
    perfis: (perfis ?? []).map((p) => p.tipo as PerfilAcessibilidade),
  };
});
