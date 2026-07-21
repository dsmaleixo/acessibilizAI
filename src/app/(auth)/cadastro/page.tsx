'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { cadastrar, type EstadoAuth } from '@/features/auth/actions';
import { Alerta } from '@/components/ui/Alerta';
import { Botao } from '@/components/ui/Botao';
import { CampoTexto } from '@/components/ui/Campo';

const INICIAL: EstadoAuth = {};

export default function CadastroPage() {
  const [estado, acao, pendente] = useActionState(cadastrar, INICIAL);

  return (
    <section className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-bold">Criar conta</h1>
      <p className="mt-2">
        Com uma conta você pode denunciar barreiras e acompanhar a resolução.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {estado.erro ? <Alerta tom="erro">{estado.erro}</Alerta> : null}
        {estado.mensagem ? <Alerta tom="sucesso">{estado.mensagem}</Alerta> : null}
      </div>

      <form action={acao} className="mt-4 flex flex-col gap-4">
        <CampoTexto id="nome" name="nome" rotulo="Nome" autoComplete="name" required />
        <CampoTexto
          id="email"
          name="email"
          type="email"
          rotulo="E-mail"
          autoComplete="email"
          required
        />
        <CampoTexto
          id="senha"
          name="senha"
          type="password"
          rotulo="Senha"
          dica="Pelo menos 8 caracteres."
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Botao type="submit" disabled={pendente}>
          {pendente ? 'Criando conta…' : 'Criar conta'}
        </Botao>
        <p aria-live="polite" className="sr-only">
          {pendente ? 'Enviando, aguarde.' : ''}
        </p>
      </form>

      <p className="mt-4">
        Já tem conta?{' '}
        <Link className="underline" href="/login">
          Entrar
        </Link>
      </p>
    </section>
  );
}
