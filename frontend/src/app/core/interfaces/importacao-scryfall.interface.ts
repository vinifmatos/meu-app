export type ImportacaoTipo = 'bulk_data' | 'simbolos';
export type ImportacaoStatus = 'pendente' | 'processando' | 'concluido' | 'falha' | 'cancelado';

export interface ImportacaoScryfall {
  id: number;
  tipo: ImportacaoTipo;
  status: ImportacaoStatus;
  progresso: number;
  sizeProcessado: number;
  mensagemErro?: string;
  metadata?: {
    id?: string;
    updatedAt?: string;
    size?: number;
    downloadUri?: string;
  };
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
