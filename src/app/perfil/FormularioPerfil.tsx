'use client';

import { useActionState } from 'react';
import { PERFIS, PERFIL_LABEL, type PerfilAcessibilidade } from '@/config/categorias';
import { salvarPerfil, type EstadoPerfil } from '@/features/perfil/actions';
import { Alerta } from '@/components/ui/Alerta';
import { Botao } from '@/components/ui/Botao';
import { CampoTexto } from '@/components/ui/Campo';

const INICIAL: EstadoPerfil = {};

export function FormularioPerfil({
  nome,
  email,
  perfis,
}: {
  nome: string;
  email: string;
  perfis: PerfilAcessibilidade[];
}) {
  const [estado, acao, pendente] = useActionState(salvarPerfil, INICIAL);

  return (
    <form action={acao} className="mt-6 flex flex-col gap-4">
      {estado.erro ? <Alerta tom="erro">{estado.erro}</Alerta> : null}
      {estado.mensagem ? <Alerta tom="sucesso">{estado.mensagem}</Alerta> : null}

      <CampoTexto id="nome" name="nome" rotulo="Nome" defaultValue={nome} required />
      <p>
        <span className="font-medium">E-mail:</span> {email}
      </p>

      <fieldset className="flex flex-col gap-2 rounded-md border border-gray-400 p-4">
        <legend className="px-1 font-medium">Necessidades de acessibilidade</legend>
        {PERFIS.map((perfil) => (
          <label key={perfil} className="flex min-h-[44px] items-center gap-3">
            <input
              type="checkbox"
              name="perfis"
              value={perfil}
              defaultChecked={perfis.includes(perfil)}
              className="h-5 w-5"
            />
            {PERFIL_LABEL[perfil]}
          </label>
        ))}
      </fieldset>

      <Botao type="submit" disabled={pendente}>
        {pendente ? 'Salvando…' : 'Salvar perfil'}
      </Botao>
      <p aria-live="polite" className="sr-only">
        {pendente ? 'Salvando, aguarde.' : ''}
      </p>
    </form>
  );
}
