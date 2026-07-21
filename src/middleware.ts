import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Tudo, exceto estáticos e imagens (evita rodar auth em assets).
    '/((?!_next/static|_next/image|icons|manifest.webmanifest|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)',
  ],
};
