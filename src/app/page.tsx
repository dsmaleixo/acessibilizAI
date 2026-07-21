import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold">acessibilizAI</h1>
      <p className="mt-2 text-lg">
        Chegue a qualquer lugar do campus por um caminho que funciona para você — e ajude a
        consertar o que está quebrado tirando uma foto.
      </p>
      <nav aria-label="Ações principais" className="mt-6 flex flex-col gap-3">
        <Link className="underline" href="/denuncias/nova">
          Fazer uma denúncia
        </Link>
        <Link className="underline" href="/mapa">
          Encontrar uma rota acessível
        </Link>
        <Link className="underline" href="/perfil">
          Meu perfil de acessibilidade
        </Link>
      </nav>
    </div>
  );
}
