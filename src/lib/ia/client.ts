import { sugestaoIaSchema, type SugestaoIaValidada } from './schema';
import { SYSTEM_PROMPT, USER_PROMPT } from './prompt';

/**
 * Chama o modelo multimodal de visão para classificar a foto de uma barreira.
 *
 * IMPORTANTE (RNF06 — degradação graciosa): esta função NUNCA lança para o
 * fluxo de UI. Em falha/timeout/JSON inválido, retorna null e o usuário
 * preenche a denúncia manualmente.
 *
 * TODO(US-07): integrar o provedor real do modelo (ver .env: IA_API_KEY/IA_MODEL).
 */
export async function classificarFoto(_imagemUrl: string): Promise<SugestaoIaValidada | null> {
  const timeout = Number(process.env.IA_TIMEOUT_MS ?? 8000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    // --- ESQUELETO ---
    // 1. Baixar/referenciar a imagem (_imagemUrl).
    // 2. Chamar a API do modelo com SYSTEM_PROMPT + USER_PROMPT + imagem.
    // 3. Fazer parse do JSON retornado.
    // 4. Validar com sugestaoIaSchema.
    void SYSTEM_PROMPT;
    void USER_PROMPT;
    throw new Error('IA ainda não integrada — preencher manualmente (stub).');

    // const bruto = await chamarModelo(...)          // TODO
    // const json = JSON.parse(bruto);
    // const parsed = sugestaoIaSchema.safeParse(json);
    // return parsed.success ? parsed.data : null;
  } catch {
    return null; // fallback manual
  } finally {
    clearTimeout(timer);
  }
}
