import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUsuarioAtual } from '@/lib/supabase/usuario';
import type { PontoAcessivel, PontoRow } from '@/types';
import { FormularioDenuncia } from './FormularioDenuncia';

export default async function NovaDenunciaPage() {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect('/login?proximo=/denuncias/nova');

  const supabase = await createClient();
  const { data } = await supabase
    .from('pontos_acessiveis')
    .select('id, tipo, nome, lat, lng, ativo')
    .eq('ativo', true)
    .order('nome');

  const pontos: PontoAcessivel[] = ((data ?? []) as PontoRow[]).map((p) => ({
    id: String(p.id),
    tipo: p.tipo,
    nome: p.nome,
    lat: p.lat,
    lng: p.lng,
    ativo: p.ativo,
  }));

  return (
    <section className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold">Nova denúncia</h1>
      <p className="mt-2">
        Encontrou uma barreira de acessibilidade? Conte para a gente. Se você
        anexar uma foto, a IA sugere a classificação — e você sempre pode editar.
      </p>
      <FormularioDenuncia usuarioId={usuario.id} pontos={pontos} />
    </section>
  );
}
