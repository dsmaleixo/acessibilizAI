import Link from 'next/link';
import { getUsuarioAtual } from '@/lib/supabase/usuario';

const ACOES = [
  {
    href: '/denuncias/nova',
    titulo: 'Fazer uma denúncia',
    texto: 'Foto + IA: reporte uma barreira em menos de um minuto.',
  },
  {
    href: '/mapa',
    titulo: 'Encontrar uma rota acessível',
    texto: 'Rotas que respeitam o seu perfil e evitam barreiras abertas.',
  },
  {
    href: '/perfil',
    titulo: 'Meu perfil de acessibilidade',
    texto: 'Diga o que você precisa — o app se adapta.',
  },
];

export default async function HomePage() {
  const usuario = await getUsuarioAtual();

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold">acessibilizAI</h1>
      <p className="mt-2 text-lg">
        Chegue a qualquer lugar do campus por um caminho que funciona para você — e
        ajude a consertar o que está quebrado tirando uma foto.
      </p>
      {usuario ? (
        <p className="mt-2">
          Olá, <span className="font-medium">{usuario.nome}</span>!
        </p>
      ) : (
        <p className="mt-2">
          <Link className="underline" href="/cadastro">
            Crie uma conta
          </Link>{' '}
          para denunciar barreiras e acompanhar a resolução.
        </p>
      )}
      <nav aria-label="Ações principais" className="mt-6 grid gap-4 sm:grid-cols-1">
        {ACOES.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="rounded-md border border-gray-300 bg-white p-4 hover:border-blue-700"
          >
            <span className="block text-lg font-bold text-blue-800 underline">{a.titulo}</span>
            <span className="mt-1 block">{a.texto}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
