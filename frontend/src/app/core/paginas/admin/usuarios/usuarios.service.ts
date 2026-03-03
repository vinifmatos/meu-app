import { Injectable, inject } from '@angular/core';
import { ApiData } from '@core/interfaces/api-response';
import { Api } from '@core/services/api';
import { IUsuarioFormData } from './usuario-form-data.interface';
import { IUsuario } from './usuario.interface';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private api = inject(Api);
  private readonly endpoint = 'usuarios';

  async getUsuarios() {
    const response = (await this.api.get<IUsuario[]>(this.endpoint)) as ApiData<IUsuario[]>;
    return response.data;
  }

  async getUsuario(id: number) {
    const response = (await this.api.get<IUsuario>(`${this.endpoint}/${id}`)) as ApiData<IUsuario>;
    return response.data;
  }

  async criarUsuario(usuario: IUsuarioFormData) {
    const response = (await this.api.post<IUsuario>(this.endpoint, {
      usuario,
    })) as ApiData<IUsuario>;
    return response.data;
  }

  async atualizarUsuario(id: number, usuario: IUsuarioFormData) {
    const response = (await this.api.put<IUsuario>(`${this.endpoint}/${id}`, {
      usuario,
    })) as ApiData<IUsuario>;
    return response.data;
  }

  async deletarUsuario(id: number) {
    await this.api.delete(`${this.endpoint}/${id}`);
  }
}
