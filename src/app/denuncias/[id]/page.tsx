export default async function DetalheDenunciaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // TODO(US-11): exibir status (aberta/em_analise/resolvida/rejeitada) + protocolo + histórico
  return (
    <section className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold">Denúncia {id}</h1>
      <p className="mt-2">Acompanhamento do status (a implementar).</p>
    </section>
  );
}
