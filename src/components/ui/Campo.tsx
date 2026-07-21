import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

// Campos de formulário com rótulo SEMPRE visível e erro associado ao controle
// via aria-describedby (WCAG 3.3.1/3.3.2).

interface Base {
  id: string;
  rotulo: string;
  erro?: string;
  dica?: string;
}

function Moldura({
  id,
  rotulo,
  erro,
  dica,
  children,
}: Base & { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-medium">
        {rotulo}
      </label>
      {dica ? (
        <p id={`${id}-dica`} className="text-sm text-gray-700">
          {dica}
        </p>
      ) : null}
      {children}
      {erro ? (
        <p id={`${id}-erro`} className="text-sm font-medium text-red-800" role="alert">
          {erro}
        </p>
      ) : null}
    </div>
  );
}

function descreverPor(id: string, erro?: string, dica?: string) {
  const ids = [dica ? `${id}-dica` : null, erro ? `${id}-erro` : null].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
}

const ESTILO_CONTROLE =
  'min-h-[44px] rounded-md border border-gray-500 px-3 py-2 aria-[invalid=true]:border-red-700';

export function CampoTexto({
  id,
  rotulo,
  erro,
  dica,
  ...props
}: Base & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Moldura id={id} rotulo={rotulo} erro={erro} dica={dica}>
      <input
        id={id}
        className={ESTILO_CONTROLE}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descreverPor(id, erro, dica)}
        {...props}
      />
    </Moldura>
  );
}

export function CampoArea({
  id,
  rotulo,
  erro,
  dica,
  ...props
}: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Moldura id={id} rotulo={rotulo} erro={erro} dica={dica}>
      <textarea
        id={id}
        className={`${ESTILO_CONTROLE} min-h-[6rem]`}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descreverPor(id, erro, dica)}
        {...props}
      />
    </Moldura>
  );
}

export function CampoSelecao({
  id,
  rotulo,
  erro,
  dica,
  children,
  ...props
}: Base & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Moldura id={id} rotulo={rotulo} erro={erro} dica={dica}>
      <select
        id={id}
        className={`${ESTILO_CONTROLE} bg-white`}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descreverPor(id, erro, dica)}
        {...props}
      >
        {children}
      </select>
    </Moldura>
  );
}
