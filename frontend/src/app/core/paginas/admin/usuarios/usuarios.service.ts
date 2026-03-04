import { Injectable, inject } from '@angular/core';
import { ApiResposta } from '@core/interfaces/api-resposta.interface';
import { ApiService } from '@core/servicos/api.service';
import { IUsuarioFormularioDados } from './usuario-formulario-dados.interface';
import { IUsuario } from './usuario.interface';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private api = inject(ApiService);
  private readonly endpoint = 'usuarios';

  async getUsuarios(): Promise<IUsuario[]> {
    const resposta = await this.api.get<{ usuarios: IUsuario[] }>(this.endpoint);
    return resposta.data?.usuarios ?? [];
  }

  async getUsuario(id: number): Promise<IUsuario | null> {
    const resposta = await this.api.get<{ usuario: IUsuario }>(`${this.endpoint}/${id}`);
    return resposta.data?.usuario ?? null;
  }

  async criarUsuario(usuario: IUsuarioFormularioDados): Promise<IUsuario | null> {
    const resposta = await this.api.post<{ usuario: IUsuario }>(this.endpoint, {
      data: { usuario },
    });
    return resposta.data?.usuario ?? null;
  }

  async atualizarUsuario(id: number, usuario: IUsuarioFormularioDados): Promise<IUsuario | null> {
    const resposta = await this.api.put<{ usuario: IUsuario }>(`${this.endpoint}/${id}`, {
      data: { usuario },
    });
    return resposta.data?.usuario ?? null;
  }

  async deletarUsuario(id: number): Promise<void> {
    await this.api.delete(`${this.endpoint}/${id}`);
  }
}
