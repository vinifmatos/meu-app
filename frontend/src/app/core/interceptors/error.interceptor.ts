import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../interfaces/api-response';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Erros de validação do Rails (422) são tratados no componente.
      if (error.status === 422) {
        return throwError(() => error);
      }

      let errorMessage = 'Ocorreu um erro desconhecido.';

      if (error.error instanceof ErrorEvent) {
        // Erro do lado do cliente ou de rede.
        errorMessage = error.error.message;
      } else {
        // Erro retornado pelo backend.
        const serverError = error.error as ApiError;
        const message = serverError?.message;

        switch (error.status) {
          case 400:
            errorMessage = `Requisição inválida: ${message || 'O servidor não entendeu a requisição.'}`;
            break;
          case 401:
            errorMessage = 'Acesso não autorizado. Por favor, faça login novamente.';
            // Opcional: aqui você pode adicionar uma lógica para deslogar o usuário ou redirecioná-lo.
            break;
          case 403:
            errorMessage = 'Você não tem permissão para executar esta ação.';
            break;
          case 404:
            errorMessage = 'O recurso solicitado não foi encontrado.';
            break;
          case 500:
            errorMessage = 'Ocorreu um erro interno no servidor. Tente novamente mais tarde.';
            break;
          default:
            if (message) {
              errorMessage = `Erro ${error.status}: ${message}`;
            } else {
              errorMessage = `Erro ${error.status}: ${error.statusText || 'Ocorreu uma falha na comunicação com o servidor.'}`;
            }
            break;
        }
      }

      messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: errorMessage,
      });

      return throwError(() => error);
    }),
  );
};
