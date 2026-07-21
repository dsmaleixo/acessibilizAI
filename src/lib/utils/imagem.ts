// Utilidades de imagem no cliente: comprimir antes do upload (RNF02) e
// remover metadados EXIF/geoloc por privacidade (LGPD, doc de arquitetura §6).

export interface ResultadoCompressao {
  arquivo: Blob;
  largura: number;
  altura: number;
}

const LADO_MAXIMO = 1280;
const QUALIDADE_JPEG = 0.72;

// Redimensiona para no máximo 1280px no maior lado e exporta JPEG ~0.72.
// Redesenhar em canvas descarta o EXIF (inclusive geolocalização do arquivo).
export async function comprimirImagem(file: File): Promise<ResultadoCompressao> {
  const bitmap = await createImageBitmap(file);
  try {
    const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
    const largura = Math.max(1, Math.round(bitmap.width * escala));
    const altura = Math.max(1, Math.round(bitmap.height * escala));

    const canvas = document.createElement('canvas');
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas 2d indisponível');
    ctx.drawImage(bitmap, 0, 0, largura, altura);

    const arquivo = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('falha ao exportar JPEG'))),
        'image/jpeg',
        QUALIDADE_JPEG,
      );
    });
    return { arquivo, largura, altura };
  } finally {
    bitmap.close();
  }
}
