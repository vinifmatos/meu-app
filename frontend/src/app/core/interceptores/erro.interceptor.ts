import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError, switchMap, from } from 'rxjs';
import { ApiResposta } from '../interfaces/api-resposta.interface';
import { AuthService } from '../servicos/auth.service';

export const erroInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const messageService = inject(MessageService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Erros de validação do Rails (422) são tratados no componente.
      if (error.status === 422) {
        return throwError(() => error);
      }

      // Se for 401 e não for uma rota de auth, tenta o refresh
      if (error.status === 401 && !req.url.includes('/auth/')) {
        return from(authService.refreshSessao()).pipe(
          switchMap((sucesso) => {
            if (sucesso) {
              // Se o refresh deu certo, clona a requisição com o novo token e tenta de novo
              const novoReq = req.clone({
                setHeaders: { Authorization: `Bearer ${authService.token()}` },
              });
              return next(novoReq);
            } else {
              // Se o refresh falhou, exibe a mensagem e relança o erro
              messageService.add({
                severity: 'error',
                summary: 'Sessão Expirada',
                detail: 'Sua sessão expirou. Por favor, faça login novamente.',
              });
              return throwError(() => error);
            }
          }),
        );
      }

      let mensagemErro = 'Ocorreu um erro desconhecido.';

      if (error.error instanceof ErrorEvent) {
        // Erro do lado do cliente ou de rede.
        mensagemErro = error.error.message;
      } else {
        // Erro retornado pelo backend.
        const erroServidor = error.error as ApiResposta<unknown>;
        const mensagem = erroServidor?.message;

        switch (error.status) {
          case 400:
            mensagemErro = `Requisição inválida: ${mensagem ?? 'O servidor não entendeu a requisição.'}`;
            break;
          case 401:
            // Só cai aqui se for 401 em rotas de auth (login incorreto) ou se não conseguiu fazer o refresh e não tratou acima
            mensagemErro = mensagem ?? 'Acesso não autorizado. Por favor, faça login novamente.';
            break;
          case 403:
            mensagemErro = 'Você não tem permissão para executar esta ação.';
            break;
          case 404:
            mensagemErro = 'O recurso solicitado não foi encontrado.';
            break;
          case 500:
            mensagemErro = 'Ocorreu um erro interno no servidor. Tente novamente mais tarde.';
            break;
          default:
            if (mensagem) {
              mensagemErro = `Erro ${error.status}: ${mensagem}`;
            } else {
              mensagemErro = `Erro ${error.status}: ${error.statusText ?? 'Ocorreu uma falha na comunicação com o servidor.'}`;
            }
            break;
        }
      }

      messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: mensagemErro,
      });

      return throwError(() => error);
    }),
  );
};
