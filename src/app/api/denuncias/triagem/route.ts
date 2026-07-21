import { NextResponse } from 'next/server';
import { classificarFoto } from '@/lib/ia/client';
import { createClient } from '@/lib/supabase/server';

// POST /api/denuncias/triagem  { fotoPath }
// Retorna a sugestão da IA (categoria/urgência/descrição/confiança) ou
// { sugestao: null } para o cliente cair no preenchimento manual (RNF06).
export async function POST(req: Request) {
  try {
    // Só usuários autenticados podem gastar chamadas de IA (RNF05/RNF08).
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ erro: 'não autenticado' }, { status: 401 });
    }

    const { fotoPath } = (await req.json()) as { fotoPath?: string };
    if (!fotoPath) {
      return NextResponse.json({ erro: 'fotoPath é obrigatório' }, { status: 400 });
    }
    // A RLS do storage garante que só o dono assina a própria foto.
    if (!fotoPath.startsWith(`${user.id}/`)) {
      return NextResponse.json({ erro: 'caminho inválido' }, { status: 403 });
    }

    const { data: assinada } = await supabase.storage
      .from('fotos-denuncias')
      .createSignedUrl(fotoPath, 60);
    if (!assinada?.signedUrl) {
      return NextResponse.json({ sugestao: null });
    }

    const sugestao = await classificarFoto(assinada.signedUrl);
    const minima = Number(process.env.IA_CONFIANCA_MINIMA ?? 0.55);

    // Abaixo do limiar de confiança, não empurramos sugestão ao usuário.
    if (!sugestao || sugestao.confianca < minima) {
      return NextResponse.json({ sugestao: null });
    }
    return NextResponse.json({ sugestao });
  } catch {
    return NextResponse.json({ sugestao: null });
  }
}
