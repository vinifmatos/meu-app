import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CartasService } from '@features/cartas/servicos/cartas.service';
import { Carta } from '@core/interfaces/cartas.interface';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { SimbolosPipe } from '@core/pipes/simbolos.pipe';

@Component({
  selector: 'app-detalhes',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    RouterLink,
    ButtonModule,
    TagModule,
    CardModule,
    DividerModule,
    SelectModule,
    FormsModule,
    SimbolosPipe
  ],
  template: `
    <div class="container mx-auto p-4 max-w-6xl">
      <div class="flex justify-between items-center mb-6">
        <p-button label="Voltar" icon="pi pi-arrow-left" [text]="true" routerLink="/cartas"></p-button>
        
        @if (idiomas().length > 1) {
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-surface">IDIOMA:</span>
            <p-select 
              [options]="opcoesIdiomas()" 
              [(ngModel)]="idiomaSelecionado" 
              (onChange)="aoMudarIdioma()"
              optionLabel="label" 
              optionValue="value"
              class="w-40"
            ></p-select>
          </div>
        }
      </div>

      @if (carta(); as carta) {
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
          <!-- Coluna da Imagem -->
          <div class="md:col-span-4 lg:col-span-3">
            <div class="sticky top-4">
              <div class="relative w-full aspect-[2.5/3.5] rounded-xl shadow-2xl overflow-hidden bg-surface">
                <img 
                  [ngSrc]="imagemExibida()" 
                  [alt]="carta.name" 
                  fill 
                  priority
                  class="object-cover"
                />
              </div>
              
              @if (carta.faces.length > 1) {
                <div class="grid grid-cols-2 gap-2 mt-4">
                  @for (face of carta.faces; track face.id) {
                    <div 
                      (click)="selecionarImagem(face.imageUris.normal)"
                      class="relative aspect-[2.5/3.5] rounded-md overflow-hidden shadow-md cursor-pointer border-2 border-transparent hover:border-primary-500">
                      <img [ngSrc]="face.imageUris.small" [alt]="face.name" fill class="object-cover" />
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Coluna de Informações -->
          <div class="md:col-span-8 lg:col-span-9">
            <div class="flex flex-col gap-4">
              <div class="flex justify-between items-start">
                <div class="flex flex-col gap-1">
                  <h1 class="text-4xl font-extrabold tracking-tight">{{ carta.name }}</h1>
                  <p class="text-xl font-medium text-surface">{{ carta.typeLine }}</p>
                </div>
                @if (carta.manaCost) {
                  <div class="text-2xl font-bold px-4 py-2 rounded-full border border-surface shadow-sm flex items-center justify-center shrink-0" [innerHTML]="carta.manaCost | simbolos"></div>
                }
              </div>

              <p-divider></p-divider>

              <p-card>
                <div class="italic whitespace-pre-wrap text-lg"
                     [innerHTML]="(carta.oracleText || 'Sem texto de regras.') | simbolos">
                </div>
              </p-card>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <p-card header="Coleção" subheader="{{ carta.set.toUpperCase() }} #{{ carta.collectorNumber }}">
                  <div class="flex items-center gap-2">
                    <p-tag [value]="obterRaridadeTraduzida(carta.rarity)" [severity]="obterRaridadeSeverity(carta.rarity)"></p-tag>
                  </div>
                </p-card>
                <p-card header="Lançamento">
                  <span class="font-bold">{{ carta.releasedAt | date: 'mediumDate' }}</span>
                </p-card>
                @if (carta.power) {
                  <p-card header="Atributos">
                    <span class="text-xl font-bold">{{ carta.power }} / {{ carta.toughness }}</span>
                  </p-card>
                }
              </div>

              <!-- Lista de Versões -->
              @if (versoes().length > 0) {
                <div class="mt-8">
                  <h3 class="text-2xl font-bold mb-4 uppercase text-surface">Artes Disponíveis ({{ idiomaSelecionado().toUpperCase() }})</h3>
                  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    @for (versao of versoes(); track versao.id) {
                      <div 
                        (click)="selecionarImagem(obterImagemNormal(versao))"
                        [class.border-primary-500]="imagemExibida() === obterImagemNormal(versao)"
                        class="flex flex-col items-center gap-2 p-2 border-2 border-transparent rounded-lg hover:bg-surface cursor-pointer transition-all"
                      >
                        <div class="relative w-full aspect-[2.5/3.5] rounded-md overflow-hidden shadow-sm">
                          <img [ngSrc]="obterImagemNormal(versao, 'small')" [alt]="versao.name" fill class="object-cover" />
                        </div>
                        <div class="flex flex-col items-center">
                          <span class="text-[10px] font-bold uppercase text-surface">{{ versao.set }}</span>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="flex justify-center items-center h-64">
          <i class="pi pi-spin pi-spinner text-4xl"></i>
        </div>
      }
    </div>
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetalhesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cartasService = inject(CartasService);

  carta = signal<Carta | null>(null);
  versoes = signal<Carta[]>([]);
  idiomas = signal<string[]>([]);
  idiomaSelecionado = signal<string>('en');
  imagemExibida = signal<string>('');

  opcoesIdiomas = signal<{ label: string, value: string }[]>([]);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.carregarDadosCarta(+params['id']);
      }
    });
  }

  carregarDadosCarta(id: number): void {
    this.cartasService.obterCarta(id).subscribe({
      next: (resposta) => {
        if (resposta.data) {
          this.carta.set(resposta.data.carta);
          this.versoes.set(resposta.data.versoes);
          this.idiomas.set(resposta.data.idiomasDisponiveis);
          this.idiomaSelecionado.set(resposta.data.carta.lang);
          
          this.imagemExibida.set(this.obterImagemNormal(resposta.data.carta));

          this.opcoesIdiomas.set(
            resposta.data.idiomasDisponiveis.map(l => ({ 
              label: l.toUpperCase(), 
              value: l 
            }))
          );
        }
      }
    });
  }

  async aoMudarIdioma(): Promise<void> {
    const cartaAtual = this.carta();
    if (!cartaAtual) return;

    const novoIdioma = this.idiomaSelecionado();

    this.cartasService.obterCartas(1, 1, { 
      oracleId: cartaAtual.oracleId, 
      edicao: cartaAtual.set, 
      idioma: novoIdioma 
    }).subscribe(respostaSet => {
      if (resposta_tem_cartas(respostaSet)) {
        this.router.navigate(['/cartas', respostaSet.data!.cartas[0].id]);
      } else {
        this.cartasService.obterCartas(1, 1, { 
          oracleId: cartaAtual.oracleId, 
          idioma: novoIdioma 
        }).subscribe(respostaMaisRecente => {
          if (resposta_tem_cartas(respostaMaisRecente)) {
            this.router.navigate(['/cartas', respostaMaisRecente.data!.cartas[0].id]);
          }
        });
      }
    });
  }

  selecionarImagem(url: string): void {
    this.imagemExibida.set(url);
  }

  obterImagemNormal(carta: Carta, size: 'normal' | 'small' = 'normal'): string {
    if (carta.imageUris?.[size]) return carta.imageUris[size];
    if (carta.faces?.length > 0 && carta.faces[0].imageUris?.[size]) return carta.faces[0].imageUris[size];
    return '';
  }

  obterRaridadeTraduzida(raridade: string): string {
    const mapa: Record<string, string> = {
      'common': 'Comum', 'uncommon': 'Incomum', 'rare': 'Rara', 'mythic': 'Mítica'
    };
    return mapa[raridade] || raridade;
  }

  obterRaridadeSeverity(raridade: string): "secondary" | "info" | "success" | "warn" | "danger" | "contrast" | undefined {
    switch (raridade) {
      case 'common': return 'secondary';
      case 'uncommon': return 'info';
      case 'rare': return 'warn';
      case 'mythic': return 'danger';
      default: return 'secondary';
    }
  }
}

function resposta_tem_cartas(resposta: any): boolean {
  return !!(resposta && resposta.data && resposta.data.cartas && resposta.data.cartas.length > 0);
}
