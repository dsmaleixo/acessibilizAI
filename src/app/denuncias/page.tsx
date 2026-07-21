import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUsuarioAtual } from '@/lib/supabase/usuario';
import { CATEGORIA_LABEL, protocolo } from '@/config/categorias';
import { denunciaFromRow, type DenunciaRow } from '@/types';
import { BadgeStatus, BadgeUrgencia } from '@/components/ui/Badge';

export default async function MinhasDenunciasPage() {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect('/login?proximo=/denuncias');

  const supabase = await createClient();
  const { data } = await supabase
    .from('denuncias')
    .select('*')
    .eq('autor_id', usuario.id)
    .order('criado_em', { ascending: false });

  const denuncias = ((data ?? []) as DenunciaRow[]).map(denunciaFromRow);

  return (
    <section className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Minhas denúncias</h1>
      {denuncias.length === 0 ? (
        <p className="mt-4">
          Você ainda não fez nenhuma denúncia.{' '}
          <Link className="underline" href="/denuncias/nova">
            Fazer a primeira
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {denuncias.map((d) => (
            <li key={d.id} className="rounded-md border border-gray-300 bg-white p-4">
              <Link className="font-medium underline" href={`/denuncias/${d.id}`}>
                {CATEGORIA_LABEL[d.categoria]} — protocolo {protocolo(d.id)}
              </Link>
              <p className="mt-1 text-sm text-gray-700">
                {d.localTexto ?? 'Local não informado'} ·{' '}
                {new Date(d.criadoEm).toLocaleDateString('pt-BR')}
              </p>
              <p className="mt-2 flex flex-wrap gap-2">
                <BadgeStatus status={d.status} />
                <BadgeUrgencia urgencia={d.urgencia} />
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
