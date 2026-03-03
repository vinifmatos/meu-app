import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TemaService {
  private readonly STORAGE_KEY = 'meuapp_tema_escuro';
  
  // Signal para o estado do tema
  isDarkMode = signal<boolean>(false);

  constructor() {
    this.carregarTema();
  }

  toggleTema(): void {
    this.isDarkMode.update(v => !v);
    this.aplicarTema();
    this.salvarTema();
  }

  private carregarTema(): void {
    const salvo = localStorage.getItem(this.STORAGE_KEY);
    if (salvo !== null) {
      this.isDarkMode.set(salvo === 'true');
    } else {
      // Fallback para preferência do sistema
      const prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode.set(prefereEscuro);
    }
    this.aplicarTema();
  }

  private aplicarTema(): void {
    const html = document.documentElement;
    if (this.isDarkMode()) {
      html.classList.add('p-dark');
    } else {
      html.classList.remove('p-dark');
    }
  }

  private salvarTema(): void {
    localStorage.setItem(this.STORAGE_KEY, this.isDarkMode().toString());
  }
}
