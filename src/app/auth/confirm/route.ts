import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

// Apenas caminhos internos — bloqueia open redirect ("//evil.com", "/\evil.com").
function destinoSeguro(p: string | null): string {
  return p && p.startsWith('/') && !p.startsWith('//') && !p.startsWith('/\\') ? p : '/';
}

// Confirmação de e-mail / magic link (Supabase envia token_hash + type).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      redirect(destinoSeguro(searchParams.get('next')));
    }
  }
  redirect('/login?erro=confirmacao');
}
