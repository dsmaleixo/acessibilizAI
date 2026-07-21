import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUsuarioAtual } from '@/lib/supabase/usuario';
import {
  CATEGORIAS,
  CATEGORIA_LABEL,
  STATUS,
  STATUS_LABEL,
  URGENCIAS,
  URGENCIA_LABEL,
  protocolo,
  type Categoria,
  type Status,
  type Urgencia,
} from '@/config/categorias';
import { denunciaFromRow, type DenunciaRow } from '@/types';
import { BadgeStatus, BadgeUrgencia } from '@/components/ui/Badge';
import { Botao } from '@/components/ui/Botao';
import { CampoSelecao, CampoTexto } from '@/components/ui/Campo';

interface Filtros {
  status?: string;
  categoria?: string;
  urgencia?: string;
  local?: string;
}

export default async function PainelGestorPage({
  searchParams,
}: {
  searchParams: Promise<Filtros>;
}) {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect('/login?proximo=/gestor');
  if (usuario.papel !== 'gestor') redirect('/');

  const filtros = await searchParams;
  const supabase = await createClient();

  let consulta = supabase
    .from('denuncias')
    .select('*')
    .order('urgencia', { ascending: false })
    .order('criado_em', { ascending: false });

  if (filtros.status && STATUS.includes(filtros.status as Status)) {
    consulta = consulta.eq('status', filtros.status);
  }
  if (filtros.categoria && CATEGORIAS.includes(filtros.categoria as Categoria)) {
    consulta = consulta.eq('categoria', filtros.categoria);
  }
  if (filtros.urgencia && URGENCIAS.includes(filtros.urgencia as Urgencia)) {
    consulta = consulta.eq('urgencia', filtros.urgencia);
  }
  if (filtros.local) {
    consulta = consulta.ilike('local_texto', `%${filtros.local}%`);
  }

  const { data } = await consulta;
  const denuncias = ((data ?? []) as DenunciaRow[]).map(denunciaFromRow);
  const abertas = denuncias.filter((d) => d.status === 'aberta' || d.status === 'em_analise');

  return (
    <section className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold">Painel do gestor</h1>
      <p className="mt-2">
        {abertas.length} não resolvida{abertas.length === 1 ? '' : 's'} nos filtros atuais (
        {denuncias.length} no total).
      </p>

      <form method="get" className="mt-4 grid gap-4 rounded-md border border-gray-400 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <CampoSelecao id="status" name="status" rotulo="Status" defaultValue={filtros.status ?? ''}>
          <option value="">Todos</option>
          {STATUS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </CampoSelecao>
        <CampoSelecao
          id="categoria"
          name="categoria"
          rotulo="Categoria"
          defaultValue={filtros.categoria ?? ''}
        >
          <option value="">Todas</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {CATEGORIA_LABEL[c]}
            </option>
          ))}
        </CampoSelecao>
        <CampoSelecao
          id="urgencia"
          name="urgencia"
          rotulo="Urgência"
          defaultValue={filtros.urgencia ?? ''}
        >
          <option value="">Todas</option>
          {URGENCIAS.map((u) => (
            <option key={u} value={u}>
              {URGENCIA_LABEL[u]}
            </option>
          ))}
        </CampoSelecao>
        <CampoTexto
          id="local"
          name="local"
          rotulo="Prédio/local contém"
          defaultValue={filtros.local ?? ''}
        />
        <div className="flex items-end">
          <Botao type="submit" variante="secundario" className="w-full">
            Filtrar
          </Botao>
        </div>
      </form>

      {denuncias.length === 0 ? (
        <p className="mt-6">Nenhuma denúncia encontrada com esses filtros.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {denuncias.map((d) => (
            <li
              key={d.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-gray-300 bg-white p-4"
            >
              <div className="mr-auto">
                <Link className="font-medium underline" href={`/denuncias/${d.id}`}>
                  {CATEGORIA_LABEL[d.categoria]} — {protocolo(d.id)}
                </Link>
                <p className="mt-1 text-sm text-gray-700">
                  {d.localTexto ?? 'Local via GPS'} ·{' '}
                  {new Date(d.criadoEm).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <BadgeUrgencia urgencia={d.urgencia} />
              <BadgeStatus status={d.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
