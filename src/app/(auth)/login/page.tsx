'use client';

import { Suspense, useActionState, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { entrar, entrarComLink, type EstadoAuth } from '@/features/auth/actions';
import { Alerta } from '@/components/ui/Alerta';
import { Botao } from '@/components/ui/Botao';
import { CampoTexto } from '@/components/ui/Campo';

const INICIAL: EstadoAuth = {};

function FormularioLogin() {
  const searchParams = useSearchParams();
  const proximo = searchParams.get('proximo') ?? '/';
  const [modo, setModo] = useState<'senha' | 'link'>('senha');
  const [estadoSenha, acaoSenha, pendenteSenha] = useActionState(entrar, INICIAL);
  const [estadoLink, acaoLink, pendenteLink] = useActionState(entrarComLink, INICIAL);

  const estado = modo === 'senha' ? estadoSenha : estadoLink;
  const pendente = modo === 'senha' ? pendenteSenha : pendenteLink;

  return (
    <section className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-bold">Entrar</h1>

      <div className="mt-4 flex flex-col gap-3">
        {searchParams.get('erro') === 'confirmacao' ? (
          <Alerta tom="erro">Link inválido ou expirado. Tente entrar novamente.</Alerta>
        ) : null}
        {estado.erro ? <Alerta tom="erro">{estado.erro}</Alerta> : null}
        {estado.mensagem ? <Alerta tom="sucesso">{estado.mensagem}</Alerta> : null}
      </div>

      <form action={modo === 'senha' ? acaoSenha : acaoLink} className="mt-4 flex flex-col gap-4">
        <input type="hidden" name="proximo" value={proximo} />
        <CampoTexto
          id="email"
          name="email"
          type="email"
          rotulo="E-mail"
          autoComplete="email"
          required
        />
        {modo === 'senha' ? (
          <CampoTexto
            id="senha"
            name="senha"
            type="password"
            rotulo="Senha"
            autoComplete="current-password"
            required
          />
        ) : null}
        <Botao type="submit" disabled={pendente}>
          {pendente
            ? 'Entrando…'
            : modo === 'senha'
              ? 'Entrar'
              : 'Enviar link de acesso por e-mail'}
        </Botao>
        <p aria-live="polite" className="sr-only">
          {pendente ? 'Enviando, aguarde.' : ''}
        </p>
      </form>

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          className="min-h-[44px] text-left underline"
          onClick={() => setModo(modo === 'senha' ? 'link' : 'senha')}
        >
          {modo === 'senha' ? 'Prefiro receber um link por e-mail' : 'Prefiro entrar com senha'}
        </button>
        <p>
          Não tem conta?{' '}
          <Link className="underline" href="/cadastro">
            Criar conta
          </Link>
        </p>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <FormularioLogin />
    </Suspense>
  );
}
