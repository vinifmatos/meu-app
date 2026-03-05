import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { PerfilResposta } from '../interfaces/usuario.interface';

@Injectable({
  providedIn: 'root',
})
export class RegistroService {
  private api = inject(ApiService);

  registrar(dados: any) {
    return this.api.post<any>('registro_usuarios', { usuario: dados });
  }

  confirmarConta(token: string) {
    return this.api.get<any>('registro_usuarios/confirmar', { query: { token } });
  }

  getPerfil() {
    return this.api.get<PerfilResposta>('perfil');
  }

  atualizarPerfil(dados: any) {
    return this.api.patch<PerfilResposta>('perfil', { usuario: dados });
  }
}
