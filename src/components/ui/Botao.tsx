import type { ButtonHTMLAttributes } from 'react';

type Variante = 'primario' | 'secundario' | 'perigo';

const ESTILOS: Record<Variante, string> = {
  primario: 'bg-blue-700 text-white hover:bg-blue-800',
  secundario: 'border border-gray-400 bg-white text-gray-900 hover:bg-gray-100',
  perigo: 'bg-red-700 text-white hover:bg-red-800',
};

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
}

// Alvo de toque ≥ 44px (WCAG 2.5.8) e contraste AA em todas as variantes.
export function Botao({ variante = 'primario', className = '', ...props }: BotaoProps) {
  return (
    <button
      className={`min-h-[44px] rounded-md px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-60 ${ESTILOS[variante]} ${className}`}
      {...props}
    />
  );
}
