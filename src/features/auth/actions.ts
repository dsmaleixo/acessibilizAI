'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface EstadoAuth {
  erro?: string;
  mensagem?: string;
}

// Apenas caminhos internos — bloqueia open redirect ("//evil.com", "/\evil.com").
function destinoSeguro(proximo: FormDataEntryValue | null): string {
  const p = typeof proximo === 'string' ? proximo : '';
  return p.startsWith('/') && !p.startsWith('//') && !p.startsWith('/\\') ? p : '/';
}

export async function entrar(_prev: EstadoAuth, formData: FormData): Promise<EstadoAuth> {
  const email = String(formData.get('email') ?? '').trim();
  const senha = String(formData.get('senha') ?? '');
  if (!email || !senha) return { erro: 'Informe e-mail e senha.' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) return { erro: 'E-mail ou senha incorretos.' };

  revalidatePath('/', 'layout');
  redirect(destinoSeguro(formData.get('proximo')));
}

export async function entrarComLink(_prev: EstadoAuth, formData: FormData): Promise<EstadoAuth> {
  const email = String(formData.get('email') ?? '').trim();
  if (!email) return { erro: 'Informe seu e-mail para receber o link.' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/auth/confirm`,
    },
  });
  if (error) return { erro: 'Não foi possível enviar o link. Tente novamente.' };
  return { mensagem: 'Link de acesso enviado! Verifique seu e-mail.' };
}

export async function cadastrar(_prev: EstadoAuth, formData: FormData): Promise<EstadoAuth> {
  const nome = String(formData.get('nome') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const senha = String(formData.get('senha') ?? '');
  if (!nome) return { erro: 'Informe seu nome.' };
  if (!email) return { erro: 'Informe seu e-mail.' };
  if (senha.length < 8) return { erro: 'A senha precisa de pelo menos 8 caracteres.' };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { nome },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/auth/confirm`,
    },
  });
  if (error) return { erro: 'Não foi possível criar a conta. Tente novamente.' };

  // Sem confirmação de e-mail habilitada, a sessão já vem ativa.
  if (data.session) {
    revalidatePath('/', 'layout');
    redirect('/perfil');
  }
  return { mensagem: 'Conta criada! Verifique seu e-mail para confirmar o acesso.' };
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}
