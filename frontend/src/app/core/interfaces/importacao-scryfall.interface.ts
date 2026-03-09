export type ImportacaoTipo = 'bulk_data' | 'simbolos';
export type ImportacaoStatus = 'pendente' | 'processando' | 'concluido' | 'falha' | 'cancelado';

export interface ImportacaoScryfall {
  id: number;
  tipo: ImportacaoTipo;
  status: ImportacaoStatus;
  progresso: number;
  readedSize: number;
  fileSize: number;
  filePath?: string;
  mensagemErro?: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
