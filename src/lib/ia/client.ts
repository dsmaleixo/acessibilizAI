import Anthropic from '@anthropic-ai/sdk';
import { sugestaoIaSchema, type SugestaoIaValidada } from './schema';
import { SYSTEM_PROMPT, USER_PROMPT } from './prompt';

const MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
type MediaType = (typeof MEDIA_TYPES)[number];

/**
 * Chama o modelo de visão (Claude) para classificar a foto de uma barreira.
 *
 * IMPORTANTE (RNF06 — degradação graciosa): esta função NUNCA lança para o
 * fluxo de UI. Em falha/timeout/JSON inválido, retorna null e o usuário
 * preenche a denúncia manualmente.
 */
export async function classificarFoto(imagemUrl: string): Promise<SugestaoIaValidada | null> {
  const timeout = Number(process.env.IA_TIMEOUT_MS ?? 8000);

  try {
    const apiKey = process.env.IA_API_KEY;
    if (!apiKey || apiKey.startsWith('placeholder') || apiKey.startsWith('coloque')) return null;

    // A URL da foto é assinada (bucket privado) e pode não ser alcançável pela
    // API externa — baixamos aqui e enviamos como base64.
    const resposta = await fetch(imagemUrl, { signal: AbortSignal.timeout(timeout) });
    if (!resposta.ok) return null;
    const tipo = (resposta.headers.get('content-type') ?? 'image/jpeg').split(';')[0];
    if (!MEDIA_TYPES.includes(tipo as MediaType)) return null;
    const base64 = Buffer.from(await resposta.arrayBuffer()).toString('base64');

    const anthropic = new Anthropic({ apiKey, timeout, maxRetries: 0 });
    const mensagem = await anthropic.messages.create({
      model: process.env.IA_MODEL ?? 'claude-opus-4-8',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: tipo as MediaType, data: base64 },
            },
            { type: 'text', text: USER_PROMPT },
          ],
        },
      ],
    });

    const texto = mensagem.content.find((b) => b.type === 'text')?.text ?? '';
    // O modelo deve responder só JSON, mas toleramos cercas de código.
    const json = texto.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
    const parsed = sugestaoIaSchema.safeParse(JSON.parse(json));
    return parsed.success ? parsed.data : null;
  } catch {
    return null; // fallback manual (US-10)
  }
}
