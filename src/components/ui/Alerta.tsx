type Tom = 'info' | 'sucesso' | 'erro' | 'aviso';

const ESTILOS: Record<Tom, string> = {
  info: 'border-blue-700 bg-blue-50 text-blue-900',
  sucesso: 'border-green-700 bg-green-50 text-green-900',
  erro: 'border-red-700 bg-red-50 text-red-900',
  aviso: 'border-amber-700 bg-amber-50 text-amber-900',
};

// role="alert" para erros (anunciado imediatamente por leitores de tela);
// role="status" para os demais (anúncio educado).
export function Alerta({ tom = 'info', children }: { tom?: Tom; children: React.ReactNode }) {
  return (
    <div
      role={tom === 'erro' ? 'alert' : 'status'}
      className={`rounded-md border-l-4 p-3 ${ESTILOS[tom]}`}
    >
      {children}
    </div>
  );
}
