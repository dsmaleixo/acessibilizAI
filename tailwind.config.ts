import type { Config } from 'tailwindcss';

// Paleta pensada para acessibilidade (contraste AA). Ajuste conforme a marca.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        marca: {
          DEFAULT: '#0B5FFF',
          escuro: '#083FB0',
        },
        urgencia: {
          baixa: '#0F766E',
          media: '#B45309',
          alta: '#B91C1C',
        },
      },
    },
  },
  plugins: [],
};

export default config;
