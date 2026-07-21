// Utilidades de imagem no cliente: comprimir antes do upload (RNF02) e
// remover metadados EXIF/geoloc por privacidade (LGPD, doc de arquitetura §6).

export interface ResultadoCompressao {
  arquivo: Blob;
  largura: number;
  altura: number;
}

// TODO(US-06): implementar compressão via <canvas> (redimensionar p/ ~1280px,
// exportar como JPEG ~0.7). Redesenhar em canvas já descarta o EXIF.
export async function comprimirImagem(_file: File): Promise<ResultadoCompressao> {
  throw new Error('comprimirImagem: implementar (stub US-06).');
}
