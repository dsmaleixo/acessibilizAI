import { NextResponse } from 'next/server';
import { classificarFoto } from '@/lib/ia/client';

// POST /api/denuncias/triagem  { fotoUrl }
// Retorna a sugestão da IA (categoria/urgência/descrição/confiança) ou
// { sugestao: null } para o cliente cair no preenchimento manual (RNF06).
export async function POST(req: Request) {
  try {
    const { fotoUrl } = (await req.json()) as { fotoUrl?: string };
    if (!fotoUrl) {
      return NextResponse.json({ erro: 'fotoUrl é obrigatório' }, { status: 400 });
    }

    const sugestao = await classificarFoto(fotoUrl);
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
