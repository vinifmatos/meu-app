import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { ApiService } from '@core/servicos/api.service';
import { Router } from '@angular/router';

export interface UsuarioAutenticado {
  id: number;
  username: string;
  nome: string;
  role: 'admin' | 'usuario';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly CHAVE_TOKEN = 'meu_app_token';
  private readonly CHAVE_REFRESH = 'meu_app_refresh_token';
  private readonly CHAVE_USUARIO = 'meu_app_usuario';

  usuario = signal<UsuarioAutenticado | null>(null);
  token = signal<string | null>(null);
  refreshToken = signal<string | null>(null);

  estaAutenticado = computed(() => !!this.token());
  isAdmin = computed(() => this.usuario()?.role === 'admin');

  private refreshTimer: any;

  constructor() {
    this.carregarPersistencia();

    // Efeito para gerenciar o refresh automático quando o token muda
    effect(() => {
      const t = this.token();
      if (t) {
        this.configurarRefreshAutomatico();
      } else {
        this.limparRefreshAutomatico();
      }
    });
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const resposta = await this.api.post<{
        token: string;
        refreshToken: string;
        usuario: UsuarioAutenticado;
      }>('auth/login', {
        data: { auth: { username, password } },
      });

      if (resposta.data) {
        this.definirSessao(resposta.data.token, resposta.data.refreshToken, resposta.data.usuario);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  }

  async logout(forcarLocal = false) {
    if (!forcarLocal && this.refreshToken()) {
      try {
        await this.api.delete('auth/logout', {
          query: { 'data[refresh_token]': this.refreshToken() },
        });
      } catch (error) {
        console.warn('Erro ao revogar token no servidor', error);
      }
    }

    this.token.set(null);
    this.refreshToken.set(null);
    this.usuario.set(null);
    localStorage.removeItem(this.CHAVE_TOKEN);
    localStorage.removeItem(this.CHAVE_REFRESH);
    localStorage.removeItem(this.CHAVE_USUARIO);
    this.router.navigate(['/']);
  }

  private carregarPersistencia() {
    const tokenSalvo = localStorage.getItem(this.CHAVE_TOKEN);
    const refreshSalvo = localStorage.getItem(this.CHAVE_REFRESH);
    const usuarioSalvo = localStorage.getItem(this.CHAVE_USUARIO);

    if (tokenSalvo && refreshSalvo && usuarioSalvo) {
      this.token.set(tokenSalvo);
      this.refreshToken.set(refreshSalvo);
      this.usuario.set(JSON.parse(usuarioSalvo));
    }
  }

  private definirSessao(token: string, refreshToken: string, usuario: UsuarioAutenticado) {
    this.token.set(token);
    this.refreshToken.set(refreshToken);
    this.usuario.set(usuario);
    localStorage.setItem(this.CHAVE_TOKEN, token);
    localStorage.setItem(this.CHAVE_REFRESH, refreshToken);
    localStorage.setItem(this.CHAVE_USUARIO, JSON.stringify(usuario));
  }

  async refreshSessao() {
    if (!this.refreshToken()) {
      this.logout(true);
      return false;
    }

    try {
      const resposta = await this.api.post<{
        token: string;
        refreshToken: string;
        usuario: UsuarioAutenticado;
      }>('auth/refresh', {
        data: { refresh_token: this.refreshToken() },
      });
      if (resposta.data) {
        this.definirSessao(resposta.data.token, resposta.data.refreshToken, resposta.data.usuario);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Falha no refresh do token:', error);
      this.logout(true);
      return false;
    }
  }

  private configurarRefreshAutomatico() {
    this.limparRefreshAutomatico();
    // Refresh a cada 2 horas e 50 minutos (token dura 3h)
    const tresHorasMenosMargem = 1000 * 60 * 60 * 2.8;
    this.refreshTimer = setInterval(() => this.refreshSessao(), tresHorasMenosMargem);
  }

  private limparRefreshAutomatico() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }
}
