import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUsuarioAtual } from '@/lib/supabase/usuario';
import type { Notificacao } from '@/types';
import { Botao } from '@/components/ui/Botao';

async function marcarTodasComoLidas() {
  'use server';
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('notificacoes').update({ lida: true }).eq('usuario_id', user.id);
  revalidatePath('/notificacoes');
  revalidatePath('/', 'layout');
}

export default async function NotificacoesPage() {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect('/login?proximo=/notificacoes');

  const supabase = await createClient();
  const { data } = await supabase
    .from('notificacoes')
    .select('id, denuncia_id, titulo, corpo, lida, criado_em')
    .eq('usuario_id', usuario.id)
    .order('criado_em', { ascending: false })
    .limit(50);

  const notificacoes: Notificacao[] = (data ?? []).map((n) => ({
    id: n.id,
    denunciaId: n.denuncia_id,
    titulo: n.titulo,
    corpo: n.corpo,
    lida: n.lida,
    criadoEm: n.criado_em,
  }));
  const temNaoLida = notificacoes.some((n) => !n.lida);

  return (
    <section className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold">Notificações</h1>

      {temNaoLida ? (
        <form action={marcarTodasComoLidas} className="mt-4">
          <Botao type="submit" variante="secundario">
            Marcar todas como lidas
          </Botao>
        </form>
      ) : null}

      {notificacoes.length === 0 ? (
        <p className="mt-4">
          Nada por aqui ainda. Você será avisado quando suas denúncias mudarem de status.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {notificacoes.map((n) => (
            <li
              key={n.id}
              className={`rounded-md border p-4 ${
                n.lida ? 'border-gray-300 bg-white' : 'border-blue-700 bg-blue-50'
              }`}
            >
              <p className="font-medium">
                {n.titulo}
                {!n.lida ? <span className="sr-only"> (não lida)</span> : null}
              </p>
              {n.corpo ? <p className="mt-1">{n.corpo}</p> : null}
              <p className="mt-1 text-sm text-gray-700">
                {new Date(n.criadoEm).toLocaleString('pt-BR')}
              </p>
              {n.denunciaId ? (
                <Link className="mt-1 inline-block underline" href={`/denuncias/${n.denunciaId}`}>
                  Ver denúncia
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
