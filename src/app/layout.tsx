import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'acessibilizAI',
  description: 'Rotas acessíveis e denúncia de barreiras no campus.',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#0B5FFF',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a href="#conteudo" className="skip-link">
          Pular para o conteúdo
        </a>
        <main id="conteudo">{children}</main>
      </body>
    </html>
  );
}
