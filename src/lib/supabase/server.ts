import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Cliente Supabase para Server Components / Route Handlers.
// A autorização por papel (usuario/gestor) é reforçada por RLS no banco.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // chamado de um Server Component — ignorável quando há middleware de refresh
          }
        },
      },
    },
  );
}
