import Link from 'next/link';
import { getUsuarioAtual } from '@/lib/supabase/usuario';
import { createClient } from '@/lib/supabase/server';
import { sair } from '@/features/auth/actions';

export async function Cabecalho() {
  const usuario = await getUsuarioAtual();

  let naoLidas = 0;
  if (usuario) {
    const supabase = await createClient();
    const { count } = await supabase
      .from('notificacoes')
      .select('id', { count: 'exact', head: true })
      .eq('usuario_id', usuario.id)
      .eq('lida', false);
    naoLidas = count ?? 0;
  }

  return (
    <header className="border-b border-gray-300 bg-white">
      <nav
        aria-label="Navegação principal"
        className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 p-4"
      >
        <Link href="/" className="mr-auto text-lg font-bold text-blue-800">
          acessibilizAI
        </Link>
        <Link className="min-h-[44px] py-2 underline" href="/mapa">
          Mapa
        </Link>
        {usuario ? (
          <>
            <Link className="min-h-[44px] py-2 underline" href="/denuncias/nova">
              Nova denúncia
            </Link>
            <Link className="min-h-[44px] py-2 underline" href="/denuncias">
              Minhas denúncias
            </Link>
            {usuario.papel === 'gestor' ? (
              <Link className="min-h-[44px] py-2 underline" href="/gestor">
                Painel do gestor
              </Link>
            ) : null}
            <Link className="min-h-[44px] py-2 underline" href="/notificacoes">
              Notificações
              {naoLidas > 0 ? (
                <span className="ml-1 rounded-full bg-red-700 px-2 py-0.5 text-sm font-bold text-white">
                  {naoLidas}
                  <span className="sr-only"> não lidas</span>
                </span>
              ) : null}
            </Link>
            <Link className="min-h-[44px] py-2 underline" href="/perfil">
              Perfil
            </Link>
            <form action={sair}>
              <button type="submit" className="min-h-[44px] py-2 underline">
                Sair<span className="sr-only"> da conta de {usuario.nome}</span>
              </button>
            </form>
          </>
        ) : (
          <>
            <Link className="min-h-[44px] py-2 underline" href="/login">
              Entrar
            </Link>
            <Link className="min-h-[44px] py-2 underline" href="/cadastro">
              Criar conta
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
