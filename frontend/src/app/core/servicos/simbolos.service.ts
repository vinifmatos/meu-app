import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '@core/servicos/api.service';
import { Simbolo } from '@core/interfaces/simbolos.interface';

@Injectable({
  providedIn: 'root'
})
export class SimbolosService {
  private readonly api = inject(ApiService);
  
  // Cache de simbolos em um Map para acesso rápido por chave {W}, {1}, etc.
  private simbolosMap = signal<Map<string, string>>(new Map());

  async carregarSimbolos(): Promise<void> {
    try {
      const resposta = await this.api.get<{ simbolos: Simbolo[] }>('simbolos');
      if (resposta.data?.simbolos) {
        const mapa = new Map<string, string>();
        resposta.data.simbolos.forEach(s => {
          if (s.svgUri) {
            mapa.set(s.symbol, s.svgUri);
          }
        });
        this.simbolosMap.set(mapa);
      }
    } catch (erro) {
      console.error('Erro ao carregar simbolos:', erro);
    }
  }

  obterSvg(simbolo: string): string | undefined {
    return this.simbolosMap().get(simbolo);
  }
}
