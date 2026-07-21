import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Rotas que exigem sessão (o papel gestor é verificado na própria página +
// reforçado por RLS no banco).
const ROTAS_PROTEGIDAS = ['/denuncias', '/perfil', '/gestor', '/notificacoes'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: não remover — mantém o token de sessão renovado.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const precisaSessao = ROTAS_PROTEGIDAS.some((r) => pathname.startsWith(r));

  if (!user && precisaSessao) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('proximo', pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
