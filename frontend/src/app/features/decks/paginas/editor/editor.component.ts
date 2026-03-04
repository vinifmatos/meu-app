import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { DecksService } from '@core/servicos/decks.service';
import { CartasService } from '@features/cartas/servicos/cartas.service';
import { Deck, DeckCarta, FormatoDeck } from '@core/interfaces/decks.interface';
import { Carta } from '@core/interfaces/cartas.interface';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SimbolosPipe } from '@core/pipes/simbolos.pipe';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editor-deck',
  standalone: true,
  imports: [
    CommonModule, 
    NgOptimizedImage, 
    RouterLink, 
    ButtonModule, 
    InputTextModule, 
    CardModule, 
    TagModule, 
    SimbolosPipe,
    IconFieldModule,
    InputIconModule,
    MessageModule,
    FormsModule
  ],
  template: `
    <div class="container mx-auto p-4 max-w-7xl">
      @if (deck(); as d) {
        <!-- Cabeçalho do Editor -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-surface p-6 rounded-xl border border-surface shadow-sm">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-3">
              <p-button icon="pi pi-arrow-left" [text]="true" routerLink="/decks"></p-button>
              <h1 class="text-3xl font-bold">{{ d.nome }}</h1>
              <p-tag [value]="d.formato.toUpperCase()" [severity]="d.formato === 'pauper' ? 'info' : 'warn'"></p-tag>
            </div>
            <p class="text-surface-500 pl-12">{{ d.estatisticas.totalCartas }} cartas no total</p>
          </div>

          <div class="flex gap-2 pl-12 md:pl-0">
            @if (isNovoDeck()) {
              <p-button label="Salvar Deck" icon="pi pi-save" (click)="salvarNovoDeck()" [loading]="salvando"></p-button>
            } @else {
              @if (validacao().valido) {
                <p-message severity="success" text="Deck Válido para {{ d.formato.toUpperCase() }}"></p-message>
              } @else {
                <p-button label="Ver Erros ({{ validacao().erros.length }})" severity="danger" icon="pi pi-exclamation-triangle" (click)="exibirErros = !exibirErros"></p-button>
              }
            }
          </div>
        </div>

        @if (exibirErros && !validacao().valido) {
          <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <h3 class="font-bold mb-2">Erros de Validação:</h3>
            <ul class="list-disc pl-5">
              @for (erro of validacao().erros; track $index) {
                <li>{{ erro }}</li>
              }
            </ul>
          </div>
        }

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Coluna da Esquerda: Busca -->
          <div class="lg:col-span-4 flex flex-col gap-4">
            <p-card header="Adicionar Cartas">
              <div class="flex flex-col gap-4">
                <p-iconField iconPosition="left">
                  <p-inputIcon styleClass="pi pi-search"></p-inputIcon>
                  <input type="text" pInputText placeholder="Nome da carta..." [(ngModel)]="buscaTermo" (keyup.enter)="buscarCartas()" class="w-full" />
                </p-iconField>

                <div class="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2">
                  @for (c of resultadosBusca(); track c.id) {
                    <div class="flex items-center justify-between p-2 hover:bg-surface-50 rounded-lg border border-transparent hover:border-surface-200 transition-all">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-14 relative rounded overflow-hidden shadow-sm shrink-0">
                          <img [ngSrc]="obterImagemSmall(c)" [alt]="c.name" fill class="object-cover" />
                        </div>
                        <div class="flex flex-col">
                          <span class="text-sm font-bold truncate w-32 md:w-40">{{ c.name }}</span>
                          <span class="text-xs text-surface-500 uppercase">{{ c.set }}</span>
                        </div>
                      </div>
                      <div class="flex gap-1">
                        @if (d.formato === 'commander') {
                          <p-button icon="pi pi-star" size="small" [text]="true" pTooltip="Comandante" (click)="adicionarAoDeck(c, true)" [disabled]="isNovoDeck()"></p-button>
                        }
                        <p-button icon="pi pi-plus" size="small" [text]="true" (click)="adicionarAoDeck(c)" [disabled]="isNovoDeck()"></p-button>
                      </div>
                    </div>
                  } @empty {
                    @if (buscaTermo && !carregandoBusca) {
                      <p class="text-center text-surface-400 py-4 italic">Nenhuma carta encontrada.</p>
                    }
                  }
                </div>
              </div>
            </p-card>
          </div>

          <!-- Coluna da Direita: Lista do Deck -->
          <div class="lg:col-span-8 flex flex-col gap-6">
            @for (cat of categorias(); track cat.titulo) {
              @if (cat.cartas.length > 0) {
                <div class="bg-surface rounded-xl border border-surface overflow-hidden">
                  <div class="bg-surface-50 px-4 py-2 border-b border-surface flex justify-between items-center">
                    <h3 class="font-bold text-lg">{{ cat.titulo }}</h3>
                    <p-tag [value]="cat.total.toString()" severity="secondary"></p-tag>
                  </div>
                  <div class="divide-y divide-surface-100">
                    @for (item of cat.cartas; track item.carta.id) {
                      <div class="flex items-center justify-between p-3 hover:bg-surface-50 group">
                        <div class="flex items-center gap-4">
                          <span class="font-mono font-bold text-primary-500 w-6 text-center">{{ item.quantidade }}</span>
                          <div class="flex flex-col">
                            <span class="font-bold hover:text-primary-500 cursor-pointer" [routerLink]="['/cartas', item.carta.id]">{{ item.carta.name }}</span>
                            <div class="flex items-center gap-2">
                              <span class="text-xs text-surface-500 uppercase">{{ item.carta.set }}</span>
                              @if (item.ehComandante) {
                                <p-tag value="COMANDANTE" severity="warn" styleClass="text-[8px] px-1 py-0"></p-tag>
                              }
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center gap-4">
                          <div class="hidden md:block text-sm" [innerHTML]="item.carta.manaCost | simbolos"></div>
                          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p-button icon="pi pi-plus" size="small" [text]="true" (click)="adicionarAoDeck(item.carta)" [disabled]="isNovoDeck()"></p-button>
                            <p-button icon="pi pi-minus" size="small" [text]="true" severity="secondary" (click)="removerDoDeck(item.carta)" [disabled]="isNovoDeck()"></p-button>
                            <p-button icon="pi pi-trash" size="small" [text]="true" severity="danger" (click)="removerDoDeck(item.carta, true)" [disabled]="isNovoDeck()"></p-button>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            }
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
export class EditorDeckComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly decksService = inject(DecksService);
  private readonly cartasService = inject(CartasService);

  deck = signal<Deck | null>(null);
  isNovoDeck = signal(false);
  salvando = false;
  validacao = signal<{ valido: boolean, erros: string[] }>({ valido: true, erros: [] });
  exibirErros = false;

  buscaTermo = '';
  resultadosBusca = signal<Carta[]>([]);
  carregandoBusca = false;

  categorias = computed(() => {
    const d = this.deck();
    if (!d) return [];

    const totalGrupo = (grupo: DeckCarta[]) => grupo.reduce((acc, c) => acc + c.quantidade, 0);

    return [
      { titulo: 'Comandantes', cartas: d.cartas.comandantes, total: totalGrupo(d.cartas.comandantes) },
      { titulo: 'Criaturas', cartas: d.cartas.criaturas, total: totalGrupo(d.cartas.criaturas) },
      { titulo: 'Planinautas', cartas: d.cartas.planeswalkers, total: totalGrupo(d.cartas.planeswalkers) },
      { titulo: 'Mágicas Instantâneas', cartas: d.cartas.instantes, total: totalGrupo(d.cartas.instantes) },
      { titulo: 'Feitiços', cartas: d.cartas.feiticos, total: totalGrupo(d.cartas.feiticos) },
      { titulo: 'Artefatos', cartas: d.cartas.artefatos, total: totalGrupo(d.cartas.artefatos) },
      { titulo: 'Encantamentos', cartas: d.cartas.encantamentos, total: totalGrupo(d.cartas.encantamentos) },
      { titulo: 'Terrenos', cartas: d.cartas.terrenos, total: totalGrupo(d.cartas.terrenos) },
      { titulo: 'Outros', cartas: d.cartas.outros, total: totalGrupo(d.cartas.outros) }
    ];
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id === 'novo') {
        this.inicializarNovoDeck();
      } else if (id) {
        this.carregarDeck(+id);
      }
    });
  }

  private inicializarNovoDeck() {
    this.isNovoDeck.set(true);
    const params = this.route.snapshot.queryParams;
    
    // Cria um deck "fake" localmente
    const novoDeck: Deck = {
      id: 0,
      nome: params['nome'] ?? 'Novo Deck',
      formato: (params['formato'] as FormatoDeck) ?? 'pauper',
      usuarioId: 0,
      cartas: {
        comandantes: [], criaturas: [], planeswalkers: [], instantes: [], 
        feiticos: [], artefatos: [], encantamentos: [], terrenos: [], outros: []
      },
      estatisticas: { totalCartas: 0, valido: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.deck.set(novoDeck);
  }

  async carregarDeck(id: number) {
    this.isNovoDeck.set(false);
    const d = await this.decksService.obterDeck(id);
    this.deck.set(d);
    if (d) {
      this.atualizarValidacao(id);
    }
  }

  async salvarNovoDeck() {
    const d = this.deck();
    if (!d) return;

    this.salvando = true;
    try {
      const novoDeckReal = await this.decksService.criarDeck(d.nome, d.formato);
      this.salvando = false;

      if (novoDeckReal) {
        this.router.navigate(['/decks', novoDeckReal.id], { replaceUrl: true });
      }
    } catch (error) {
      this.salvando = false;
    }
  }

  async atualizarValidacao(id: number) {
    const res = await this.decksService.validarDeck(id);
    this.validacao.set(res);
  }

  buscarCartas() {
    if (!this.buscaTermo) return;
    this.carregandoBusca = true;
    this.cartasService.obterCartas(1, 15, { nome: this.buscaTermo }).subscribe(res => {
      this.resultadosBusca.set(res.data?.cartas ?? []);
      this.carregandoBusca = false;
    });
  }

  async adicionarAoDeck(carta: Carta, comoComandante: boolean = false) {
    const d = this.deck();
    if (!d || this.isNovoDeck()) return;

    const novoDeck = await this.decksService.adicionarCarta(d.id, carta.id, 1, comoComandante);
    if (novoDeck) {
      this.deck.set(novoDeck);
      this.atualizarValidacao(d.id);
    }
  }

  async removerDoDeck(carta: Carta, removerTudo: boolean = false) {
    const d = this.deck();
    if (!d || this.isNovoDeck()) return;

    const novoDeck = await this.decksService.removerCarta(d.id, carta.id, removerTudo);
    if (novoDeck) {
      this.deck.set(novoDeck);
      this.atualizarValidacao(d.id);
    }
  }

  obterImagemSmall(c: Carta): string {
    return c.imageUris?.small ?? c.faces[0]?.imageUris?.small ?? '';
  }

  obterRaridadeTraduzida(raridade: string): string {
    const mapa: Record<string, string> = {
      'common': 'Comum', 'uncommon': 'Incomum', 'rare': 'Rara', 'mythic': 'Mítica'
    };
    return mapa[raridade] ?? raridade;
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
