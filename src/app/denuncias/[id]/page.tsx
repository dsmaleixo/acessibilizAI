import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUsuarioAtual } from '@/lib/supabase/usuario';
import {
  CATEGORIA_LABEL,
  STATUS_LABEL,
  protocolo,
} from '@/config/categorias';
import { denunciaFromRow, type DenunciaRow, type DenunciaEvento } from '@/types';
import { Alerta } from '@/components/ui/Alerta';
import { BadgeStatus, BadgeUrgencia } from '@/components/ui/Badge';
import { FormularioGestao } from './FormularioGestao';

export default async function DetalheDenunciaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ criada?: string }>;
}) {
  const { id } = await params;
  const { criada } = await searchParams;

  const usuario = await getUsuarioAtual();
  if (!usuario) redirect(`/login?proximo=/denuncias/${id}`);

  const supabase = await createClient();
  const { data: row } = await supabase.from('denuncias').select('*').eq('id', id).single();
  if (!row) notFound(); // RLS: só autor e gestor enxergam

  const denuncia = denunciaFromRow(row as DenunciaRow);

  const { data: eventosData } = await supabase
    .from('denuncia_eventos')
    .select('id, de_status, para_status, comentario, criado_em')
    .eq('denuncia_id', id)
    .order('criado_em', { ascending: true });
  const eventos: DenunciaEvento[] = (eventosData ?? []).map((e) => ({
    id: e.id,
    deStatus: e.de_status,
    paraStatus: e.para_status,
    comentario: e.comentario,
    criadoEm: e.criado_em,
  }));

  let fotoAssinada: string | null = null;
  if (denuncia.fotoUrl) {
    const { data } = await supabase.storage
      .from('fotos-denuncias')
      .createSignedUrl(denuncia.fotoUrl, 60 * 60);
    fotoAssinada = data?.signedUrl ?? null;
  }

  return (
    <section className="mx-auto max-w-xl p-6">
      {criada ? (
        <div className="mb-4">
          <Alerta tom="sucesso">
            Denúncia enviada! Guarde o protocolo {protocolo(denuncia.id)} para acompanhar.
          </Alerta>
        </div>
      ) : null}

      <h1 className="text-2xl font-bold">
        {CATEGORIA_LABEL[denuncia.categoria]}
        <span className="block text-base font-normal text-gray-700">
          Protocolo {protocolo(denuncia.id)}
        </span>
      </h1>

      <p className="mt-3 flex flex-wrap gap-2">
        <BadgeStatus status={denuncia.status} />
        <BadgeUrgencia urgencia={denuncia.urgencia} />
      </p>

      <dl className="mt-4 flex flex-col gap-2">
        <div>
          <dt className="font-medium">Local</dt>
          <dd>{denuncia.localTexto ?? 'Localização por GPS (ver mapa)'}</dd>
        </div>
        <div>
          <dt className="font-medium">Descrição</dt>
          <dd>{denuncia.descricao}</dd>
        </div>
        <div>
          <dt className="font-medium">Criada em</dt>
          <dd>{new Date(denuncia.criadoEm).toLocaleString('pt-BR')}</dd>
        </div>
        {denuncia.iaSugestao ? (
          <div>
            <dt className="font-medium">Triagem por IA</dt>
            <dd>
              Sugeriu {CATEGORIA_LABEL[denuncia.iaSugestao.categoria]} (confiança{' '}
              {Math.round(denuncia.iaSugestao.confianca * 100)}%) —{' '}
              {denuncia.aceitouSugestaoIa ? 'sugestão aceita' : 'ajustada pelo autor'}.
            </dd>
          </div>
        ) : null}
      </dl>

      {fotoAssinada ? (
        <Image
          src={fotoAssinada}
          alt={`Foto da barreira: ${denuncia.descricao.slice(0, 120)}`}
          width={640}
          height={480}
          className="mt-4 h-auto w-full rounded-md"
        />
      ) : null}

      <h2 className="mt-6 text-xl font-bold">Histórico</h2>
      {eventos.length === 0 ? (
        <p className="mt-2">Sem atualizações ainda. Você será notificado quando o status mudar.</p>
      ) : (
        <ol className="mt-2 flex flex-col gap-3">
          {eventos.map((e) => (
            <li key={e.id} className="rounded-md border border-gray-300 bg-white p-3">
              <p className="font-medium">
                {e.deStatus && e.paraStatus
                  ? `${STATUS_LABEL[e.deStatus]} → ${STATUS_LABEL[e.paraStatus]}`
                  : 'Atualização'}
              </p>
              {e.comentario ? <p className="mt-1">{e.comentario}</p> : null}
              <p className="mt-1 text-sm text-gray-700">
                {new Date(e.criadoEm).toLocaleString('pt-BR')}
              </p>
            </li>
          ))}
        </ol>
      )}

      {usuario.papel === 'gestor' ? (
        <FormularioGestao denunciaId={denuncia.id} statusAtual={denuncia.status} />
      ) : null}
    </section>
  );
}
