import { describe, expect, it } from 'vitest';
import { sugestaoIaSchema } from './schema';

const VALIDA = {
  categoria: 'rampa_obstruida',
  urgencia: 'alta',
  descricao: 'Rampa bloqueada por entulho de obra.',
  confianca: 0.9,
  contemPessoas: false,
};

describe('contrato de saída da IA (doc §4.3)', () => {
  it('aceita uma sugestão válida', () => {
    expect(sugestaoIaSchema.safeParse(VALIDA).success).toBe(true);
  });

  it('rejeita categoria fora do conjunto controlado', () => {
    expect(sugestaoIaSchema.safeParse({ ...VALIDA, categoria: 'buraco' }).success).toBe(false);
  });

  it('rejeita confiança fora de [0,1]', () => {
    expect(sugestaoIaSchema.safeParse({ ...VALIDA, confianca: 1.2 }).success).toBe(false);
  });

  it('rejeita descrição vazia ou gigante', () => {
    expect(sugestaoIaSchema.safeParse({ ...VALIDA, descricao: '' }).success).toBe(false);
    expect(
      sugestaoIaSchema.safeParse({ ...VALIDA, descricao: 'x'.repeat(300) }).success,
    ).toBe(false);
  });
});
