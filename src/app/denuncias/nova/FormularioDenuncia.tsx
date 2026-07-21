'use client';

import { useActionState, useRef, useState } from 'react';
import {
  CATEGORIAS,
  CATEGORIA_LABEL,
  URGENCIAS,
  URGENCIA_LABEL,
} from '@/config/categorias';
import { criarDenuncia, type EstadoDenuncia } from '@/features/denuncias/actions';
import { comprimirImagem } from '@/lib/utils/imagem';
import { createClient } from '@/lib/supabase/client';
import type { SugestaoIA, PontoAcessivel } from '@/types';
import { Alerta } from '@/components/ui/Alerta';
import { Botao } from '@/components/ui/Botao';
import { CampoArea, CampoSelecao, CampoTexto } from '@/components/ui/Campo';

const INICIAL: EstadoDenuncia = {};

type EstadoFoto =
  | { fase: 'sem_foto' }
  | { fase: 'enviando' }
  | { fase: 'analisando'; path: string; preview: string }
  | { fase: 'pronta'; path: string; preview: string }
  | { fase: 'erro'; mensagem: string };

export function FormularioDenuncia({
  usuarioId,
  pontos,
}: {
  usuarioId: string;
  pontos: PontoAcessivel[];
}) {
  const [estado, acao, pendente] = useActionState(criarDenuncia, INICIAL);
  const [foto, setFoto] = useState<EstadoFoto>({ fase: 'sem_foto' });
  const [sugestao, setSugestao] = useState<SugestaoIA | null>(null);
  const [avisoIa, setAvisoIa] = useState<string>('');
  const [coordenada, setCoordenada] = useState<{ lat: number; lng: number } | null>(null);
  const [localTexto, setLocalTexto] = useState('');
  const [gpsMensagem, setGpsMensagem] = useState('');

  // Campos editáveis (US-08): a sugestão da IA só PRÉ-preenche.
  const [categoria, setCategoria] = useState<string>('');
  const [urgencia, setUrgencia] = useState<string>('media');
  const [descricao, setDescricao] = useState('');
  const inputFoto = useRef<HTMLInputElement>(null);

  async function aoEscolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSugestao(null);
    setAvisoIa('');
    setFoto({ fase: 'enviando' });

    try {
      // Compressão client-side também descarta EXIF/geoloc do arquivo (LGPD).
      const { arquivo } = await comprimirImagem(file);
      const path = `${usuarioId}/${crypto.randomUUID()}.jpg`;
      const supabase = createClient();
      const { error } = await supabase.storage
        .from('fotos-denuncias')
        .upload(path, arquivo, { contentType: 'image/jpeg' });
      if (error) throw error;

      const preview = URL.createObjectURL(arquivo);
      setFoto({ fase: 'analisando', path, preview });

      // Triagem por IA (US-07). Falhou/limiar baixo → segue manual (US-10).
      try {
        const resposta = await fetch('/api/denuncias/triagem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fotoPath: path }),
        });
        const json = (await resposta.json()) as { sugestao: SugestaoIA | null };
        if (json.sugestao) {
          setSugestao(json.sugestao);
          setCategoria(json.sugestao.categoria);
          setUrgencia(json.sugestao.urgencia);
          setDescricao(json.sugestao.descricao);
          setAvisoIa(
            json.sugestao.contemPessoas
              ? 'A foto parece conter pessoas. Se possível, prefira enquadrar apenas a barreira — ou confirme que tem consentimento de quem aparece.'
              : '',
          );
        } else {
          setAvisoIa('A IA não conseguiu analisar a foto. Preencha os campos manualmente.');
        }
      } catch {
        setAvisoIa('A IA não conseguiu analisar a foto. Preencha os campos manualmente.');
      }
      setFoto((f) => (f.fase === 'analisando' ? { fase: 'pronta', path: f.path, preview: f.preview } : f));
    } catch {
      setFoto({ fase: 'erro', mensagem: 'Falha ao enviar a foto. Tente novamente.' });
    }
  }

  function usarGps() {
    if (!navigator.geolocation) {
      setGpsMensagem('Seu navegador não oferece geolocalização. Selecione um ponto ou descreva o local.');
      return;
    }
    setGpsMensagem('Obtendo sua localização…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordenada({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsMensagem('Localização capturada pelo GPS.');
      },
      () => setGpsMensagem('Não foi possível obter o GPS. Selecione um ponto ou descreva o local.'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function aoEscolherPonto(e: React.ChangeEvent<HTMLSelectElement>) {
    const ponto = pontos.find((p) => p.id === e.target.value);
    if (ponto) {
      setLocalTexto(ponto.nome);
      setCoordenada({ lat: ponto.lat, lng: ponto.lng });
    }
  }

  const analisando = foto.fase === 'analisando';
  const temFoto = foto.fase === 'pronta' || analisando;

  return (
    <form action={acao} className="mt-6 flex flex-col gap-5">
      {estado.erro ? <Alerta tom="erro">{estado.erro}</Alerta> : null}

      {/* 1. Foto (US-05/US-06) */}
      <fieldset className="flex flex-col gap-3 rounded-md border border-gray-400 p-4">
        <legend className="px-1 font-medium">1. Foto da barreira (opcional, recomendada)</legend>
        <Alerta tom="info">
          Fotografe a barreira, evitando pessoas no enquadramento. A imagem é
          comprimida no seu aparelho e os metadados de localização do arquivo são
          removidos antes do envio.
        </Alerta>
        <label htmlFor="arquivo-foto" className="font-medium">
          Tirar ou escolher foto
        </label>
        <input
          id="arquivo-foto"
          ref={inputFoto}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={aoEscolherFoto}
          disabled={foto.fase === 'enviando' || analisando}
          className="min-h-[44px]"
        />
        <p aria-live="polite">
          {foto.fase === 'enviando' ? 'Enviando a foto…' : ''}
          {analisando ? 'Foto enviada. A IA está analisando a imagem — você pode preencher os campos enquanto isso.' : ''}
          {foto.fase === 'erro' ? foto.mensagem : ''}
        </p>
        {temFoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foto.preview}
            alt="Pré-visualização da foto anexada à denúncia"
            className="max-h-64 w-auto rounded-md"
          />
        ) : null}
        {temFoto ? <input type="hidden" name="fotoPath" value={foto.path} /> : null}
        {temFoto ? (
          <label className="flex min-h-[44px] items-start gap-3">
            <input type="checkbox" name="consentimento" required className="mt-1 h-5 w-5" />
            <span>
              Confirmo que li o aviso de privacidade: a foto será usada apenas para
              melhorar a acessibilidade do campus e, se houver pessoas
              identificáveis, tenho o consentimento delas.
            </span>
          </label>
        ) : null}
      </fieldset>

      {/* 2. Sugestão da IA (US-07/US-08) */}
      <div aria-live="polite" className="flex flex-col gap-3">
        {sugestao ? (
          <Alerta tom="sucesso">
            A IA analisou a foto e sugeriu categoria, urgência e descrição
            (confiança de {Math.round(sugestao.confianca * 100)}%). Revise e ajuste
            o que quiser — você tem a palavra final.
          </Alerta>
        ) : null}
        {avisoIa ? <Alerta tom="aviso">{avisoIa}</Alerta> : null}
      </div>
      {sugestao ? (
        <input type="hidden" name="iaSugestaoJson" value={JSON.stringify(sugestao)} />
      ) : null}

      {/* 3. Detalhes (editáveis) */}
      <fieldset className="flex flex-col gap-4 rounded-md border border-gray-400 p-4">
        <legend className="px-1 font-medium">2. O problema</legend>
        <CampoSelecao
          id="categoria"
          name="categoria"
          rotulo="Categoria da barreira"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          required
        >
          <option value="">Selecione…</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {CATEGORIA_LABEL[c]}
            </option>
          ))}
        </CampoSelecao>
        <CampoSelecao
          id="urgencia"
          name="urgencia"
          rotulo="Urgência"
          dica="Alta: bloqueia totalmente o acesso. Média: dificulta bastante. Baixa: problema menor."
          value={urgencia}
          onChange={(e) => setUrgencia(e.target.value)}
          required
        >
          {URGENCIAS.map((u) => (
            <option key={u} value={u}>
              {URGENCIA_LABEL[u]}
            </option>
          ))}
        </CampoSelecao>
        <CampoArea
          id="descricao"
          name="descricao"
          rotulo="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
          minLength={5}
        />
      </fieldset>

      {/* 4. Localização (US-09) */}
      <fieldset className="flex flex-col gap-4 rounded-md border border-gray-400 p-4">
        <legend className="px-1 font-medium">3. Onde fica</legend>
        <CampoSelecao
          id="ponto"
          rotulo="Selecionar um ponto conhecido do campus"
          dica="Alternativa ao GPS e ao mapa — escolha pelo nome."
          onChange={aoEscolherPonto}
          defaultValue=""
        >
          <option value="">Selecione…</option>
          {pontos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </CampoSelecao>
        <CampoTexto
          id="localTexto"
          name="localTexto"
          rotulo="Descrição do local"
          dica='Ex.: "Bloco CA, térreo, perto da cantina".'
          value={localTexto}
          onChange={(e) => setLocalTexto(e.target.value)}
        />
        <div className="flex flex-col gap-2">
          <Botao type="button" variante="secundario" onClick={usarGps}>
            Usar minha localização (GPS)
          </Botao>
          <p aria-live="polite">{gpsMensagem}</p>
        </div>
        <input type="hidden" name="lat" value={coordenada?.lat ?? ''} />
        <input type="hidden" name="lng" value={coordenada?.lng ?? ''} />
      </fieldset>

      <Botao type="submit" disabled={pendente || foto.fase === 'enviando'}>
        {pendente ? 'Enviando denúncia…' : 'Enviar denúncia'}
      </Botao>
      <p aria-live="polite" className="sr-only">
        {pendente ? 'Enviando, aguarde.' : ''}
      </p>
    </form>
  );
}
