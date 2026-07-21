'use client';

import { useActionState } from 'react';
import { STATUS, STATUS_LABEL, type Status } from '@/config/categorias';
import { atualizarStatus, type EstadoGestao } from '@/features/gestor/actions';
import { Alerta } from '@/components/ui/Alerta';
import { Botao } from '@/components/ui/Botao';
import { CampoArea, CampoSelecao } from '@/components/ui/Campo';

const INICIAL: EstadoGestao = {};

export function FormularioGestao({
  denunciaId,
  statusAtual,
}: {
  denunciaId: string;
  statusAtual: Status;
}) {
  const [estado, acao, pendente] = useActionState(atualizarStatus, INICIAL);

  return (
    <form action={acao} className="mt-6 flex flex-col gap-4 rounded-md border border-blue-700 p-4">
      <h2 className="text-xl font-bold">Gestão (gestor)</h2>
      {estado.erro ? <Alerta tom="erro">{estado.erro}</Alerta> : null}
      {estado.mensagem ? <Alerta tom="sucesso">{estado.mensagem}</Alerta> : null}

      <input type="hidden" name="denunciaId" value={denunciaId} />
      <CampoSelecao
        id="paraStatus"
        name="paraStatus"
        rotulo="Novo status"
        defaultValue={statusAtual}
        required
      >
        {STATUS.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </CampoSelecao>
      <CampoArea
        id="comentario"
        name="comentario"
        rotulo="Comentário (opcional)"
        dica="Visível para quem fez a denúncia."
      />
      <Botao type="submit" disabled={pendente}>
        {pendente ? 'Salvando…' : 'Atualizar denúncia'}
      </Botao>
      <p aria-live="polite" className="sr-only">
        {pendente ? 'Salvando, aguarde.' : ''}
      </p>
    </form>
  );
}
