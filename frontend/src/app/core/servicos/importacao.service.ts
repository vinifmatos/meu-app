import { Injectable, inject } from '@angular/core';
import { ImportacaoScryfall, ImportacaoTipo } from '@core/interfaces/importacao-scryfall.interface';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ImportacaoService {
  private api = inject(ApiService);

  async listar(): Promise<ImportacaoScryfall[]> {
    const resposta = await this.api.get<{ impotacoes: ImportacaoScryfall[] }>('admin/importacoes');
    return resposta.data?.impotacoes ?? [];
  }

  async iniciar(tipo: ImportacaoTipo, force: boolean = false): Promise<ImportacaoScryfall | null> {
    const resposta = await this.api.post<ImportacaoScryfall>('admin/importacoes', {
      data: {
        importacao: { tipo },
        force,
      },
    });
    return resposta.data;
  }

  async cancelar(id: number): Promise<void> {
    await this.api.delete<void>(`admin/importacoes/${id}`);
  }
}
