import { z } from 'zod';
import { CATEGORIAS, URGENCIAS } from '@/config/categorias';

// Contrato de saída da IA (doc de arquitetura, seção 4.3).
// Validamos a resposta do modelo ANTES de confiar nela.
export const sugestaoIaSchema = z.object({
  categoria: z.enum(CATEGORIAS),
  urgencia: z.enum(URGENCIAS),
  descricao: z.string().min(3).max(280),
  confianca: z.number().min(0).max(1),
  contemPessoas: z.boolean(),
});

export type SugestaoIaValidada = z.infer<typeof sugestaoIaSchema>;
