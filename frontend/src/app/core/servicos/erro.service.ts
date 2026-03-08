import { Injectable, inject } from '@angular/core';
import { ApiResposta } from '@core/interfaces/api-resposta.interface';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ErroService {
  private messageService = inject(MessageService);

  handle(
    erro: any,
    options?: { options442?: { severity?: string; summary?: string; detail?: string } },
  ): Record<string, string[]> | undefined {
    if (erro instanceof ErrorEvent) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: `Ocorreu um erro inesperado`,
      });

      throw erro;
    }

    if (erro.status === 422) {
      const opt = options?.options442;
      const err = erro.error as ApiResposta<unknown>;

      this.messageService.add({
        severity: opt?.severity ?? 'warn',
        summary: opt?.summary ?? 'Atenção',
        detail: err.message ?? opt?.detail ?? 'Não foi possível processar a solicitação',
      });

      return err.validationErrors;
    }

    return;
  }
}
