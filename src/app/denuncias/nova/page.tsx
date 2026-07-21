export default function NovaDenunciaPage() {
  // TODO(US-05..US-12): fluxo de denúncia
  //  - captura/anexo de foto (US-05) + compressão client-side (US-06)
  //  - POST /api/denuncias/triagem => sugestão da IA (US-07)
  //  - campos pré-preenchidos e EDITÁVEIS (US-08)
  //  - localização por GPS ou seleção de prédio/ponto (US-09)
  //  - fallback manual se IA falhar (US-10)
  //  - aviso de privacidade + opção sem rosto (US-12)
  return (
    <section className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold">Nova denúncia</h1>
      <p className="mt-2">Formulário de denúncia (a implementar).</p>
    </section>
  );
}
