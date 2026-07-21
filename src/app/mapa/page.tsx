import { createClient } from '@/lib/supabase/server';
import { getUsuarioAtual } from '@/lib/supabase/usuario';
import type { PontoRow, SegmentoRow } from '@/types';
import { MapaInterativo, type BarreiraAberta } from '@/components/mapa/MapaInterativo';

export default async function MapaPage() {
  const supabase = await createClient();
  const usuario = await getUsuarioAtual();

  const [{ data: pontos }, { data: segmentos }, { data: barreiras }] = await Promise.all([
    supabase
      .from('pontos_acessiveis')
      .select('id, tipo, nome, lat, lng, ativo')
      .eq('ativo', true)
      .order('nome'),
    supabase.from('segmentos_rota').select('id, ponto_origem_id, ponto_destino_id, custo, restricoes'),
    supabase
      .from('barreiras_abertas')
      .select('id, categoria, urgencia, status, local_texto, lat, lng'),
  ]);

  return (
    <section className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Mapa de rotas acessíveis</h1>
      <p className="mt-2">
        Piloto: Bloco CA e Biblioteca. Escolha origem, destino e seu perfil — a
        rota evita barreiras conhecidas e respeita suas necessidades. Tudo que
        está no mapa também aparece em lista.
      </p>
      <MapaInterativo
        pontos={(pontos ?? []) as PontoRow[]}
        segmentos={(segmentos ?? []) as SegmentoRow[]}
        barreiras={(barreiras ?? []) as BarreiraAberta[]}
        perfilInicial={usuario?.perfis[0] ?? 'mobilidade_reduzida'}
      />
    </section>
  );
}
