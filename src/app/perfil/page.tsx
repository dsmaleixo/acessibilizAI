import { redirect } from 'next/navigation';
import { getUsuarioAtual } from '@/lib/supabase/usuario';
import { FormularioPerfil } from './FormularioPerfil';

export default async function PerfilPage() {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect('/login?proximo=/perfil');

  return (
    <section className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold">Meu perfil de acessibilidade</h1>
      <p className="mt-2">
        Suas necessidades ajustam o cálculo de rotas: por exemplo, o perfil de
        cadeira de rodas evita escadas e o perfil visual prioriza piso tátil.
      </p>
      <FormularioPerfil nome={usuario.nome} email={usuario.email} perfis={usuario.perfis} />
    </section>
  );
}
