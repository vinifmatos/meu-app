import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed, effect, HostListener, OnDestroy } from '@angular/core';
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
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { PreviewCartaComponent } from './preview-carta.component';
import { AuthService } from '@core/servicos/auth.service';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

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
    FormsModule,
    ReactiveFormsModule,
    PreviewCartaComponent
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
             @if (hasChanges()) {
                <p-button label="Salvar Alterações" icon="pi pi-save" (click)="salvar()" [loading]="salvando()"></p-button>
             }
             @if (validacao().valido) {
                <p-message severity="success" text="Deck Válido"></p-message>
             } @else {
                <p-button label="Erros ({{ validacao().erros.length }})" severity="danger" icon="pi pi-exclamation-triangle" (click)="exibirErros = !exibirErros"></p-button>
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
                  <p-inputIcon [styleClass]="carregandoBusca() ? 'pi pi-spin pi-spinner' : 'pi pi-search'"></p-inputIcon>
                  <input type="text" pInputText placeholder="Nome da carta..." [formControl]="buscaControl" class="w-full" />
                </p-iconField>

                <div class="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2">
                  @for (c of resultadosBusca(); track c.id) {
                    <div class="flex items-center justify-between p-2 hover:bg-surface-50 rounded-lg border border-transparent hover:border-surface-200 transition-all"
                         (mouseenter)="mostrarPreview(c, $event)"
                         (mouseleave)="esconderPreview()">
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
                          <p-button icon="pi pi-star" size="small" [text]="true" pTooltip="Comandante" (click)="adicionarAoDeckLocal(c, true)"></p-button>
                        }
                        <p-button icon="pi pi-plus" size="small" [text]="true" (click)="adicionarAoDeckLocal(c)"></p-button>
                      </div>
                    </div>
                  } @empty {
                    @if (buscaControl.value && !carregandoBusca()) {
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
                    @for (item of cat.cartas; track item.carta.id + (item.ehComandante ? '-cmd' : '')) {
                      <div class="flex items-center justify-between p-3 hover:bg-surface-50 group"
                           (mouseenter)="mostrarPreview(item.carta, $event)"
                           (mouseleave)="esconderPreview()">
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
                            <p-button icon="pi pi-plus" size="small" [text]="true" (click)="adicionarAoDeckLocal(item.carta, item.ehComandante)"></p-button>
                            <p-button icon="pi pi-minus" size="small" [text]="true" severity="secondary" (click)="removerDoDeckLocal(item.carta, item.ehComandante)"></p-button>
                            <p-button icon="pi pi-trash" size="small" [text]="true" severity="danger" (click)="removerDoDeckLocal(item.carta, item.ehComandante, true)"></p-button>
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

      <!-- Preview no Hover -->
      <app-preview-carta class="deck-editor-preview" [carta]="cartaPreview()" [x]="mouseX()" [y]="mouseY()"></app-preview-carta>
    </div>
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorDeckComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly decksService = inject(DecksService);
  private readonly cartasService = inject(CartasService);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  deck = signal<Deck | null>(null);
  deckOriginal = signal<string>('');
  isNovoDeck = signal(false);
  salvando = signal(false);
  validacao = signal<{ valido: boolean, erros: string[] }>({ valido: true, erros: [] });
  exibirErros = false;

  hasChanges = computed(() => {
    const d = this.deck();
    if (!d) return false;
    if (this.isNovoDeck() && d.estatisticas.totalCartas === 0) {
       return true;
    }
    return JSON.stringify(this.serializarParaLocal(d)) !== this.deckOriginal();
  });

  buscaControl = new FormControl('');
  resultadosBusca = signal<Carta[]>([]);
  carregandoBusca = signal(false);

  // Preview
  cartaPreview = signal<Carta | null>(null);
  mouseX = signal(0);
  mouseY = signal(0);

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

  constructor() {
    effect(() => {
      const d = this.deck();
      if (d && this.authService.estaAutenticado()) {
        const chave = `deck_edicao_${d.id || 'novo'}`;
        localStorage.setItem(chave, JSON.stringify(this.serializarParaLocal(d)));
      }
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id === 'novo') {
        this.isNovoDeck.set(true);
        const queryParams = this.route.snapshot.queryParams;
        const nome = queryParams['nome'] ?? 'Novo Deck';
        const formato = (queryParams['formato'] as FormatoDeck) ?? 'pauper';
        this.restaurarOuInicializar(0, nome, formato);
      } else if (id) {
        this.isNovoDeck.set(false);
        this.carregarDeck(+id);
      }
    });

    this.configurarBuscaAutomatica();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private configurarBuscaAutomatica() {
    this.buscaControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(termo => {
      this.buscarCartas(termo || '');
    });
  }

  private serializarParaLocal(d: Deck) {
    return {
      nome: d.nome,
      formato: d.formato,
      cartas: Object.entries(d.cartas).reduce((acc, [key, val]) => {
        acc[key] = (val as DeckCarta[]).map(dc => ({
           cartaId: dc.carta.id,
           quantidade: dc.quantidade,
           ehComandante: dc.ehComandante,
           carta: dc.carta
        }));
        return acc;
      }, {} as any)
    };
  }

  private restaurarOuInicializar(id: number, nomePadrao?: string, formatoPadrao?: FormatoDeck) {
    const chave = `deck_edicao_${id || 'novo'}`;
    const salvo = localStorage.getItem(chave);

    if (salvo) {
      try {
        const dados = JSON.parse(salvo);
        const d: Deck = {
          id: id,
          nome: dados.nome,
          formato: dados.formato,
          usuarioId: 0,
          cartas: dados.cartas,
          estatisticas: { totalCartas: this.calcularTotal(dados.cartas), valido: false },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.deck.set(d);
        return;
      } catch (e) {
        console.error('Erro ao restaurar deck do localStorage', e);
      }
    }

    if (id === 0) {
      this.inicializarNovoDeck(nomePadrao!, formatoPadrao!);
    }
  }

  private calcularTotal(cartas: any): number {
    return Object.values(cartas).flat().reduce((acc: number, c: any) => acc + (c.quantidade || 0), 0);
  }

  private inicializarNovoDeck(nome: string, formato: FormatoDeck) {
    const novoDeck: Deck = {
      id: 0,
      nome,
      formato,
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
    this.deckOriginal.set(JSON.stringify(this.serializarParaLocal(novoDeck)));
  }

  async carregarDeck(id: number) {
    const d = await this.decksService.obterDeck(id);
    if (d) {
      this.deckOriginal.set(JSON.stringify(this.serializarParaLocal(d)));
      
      const chave = `deck_edicao_${id}`;
      const salvo = localStorage.getItem(chave);
      if (salvo) {
         this.restaurarOuInicializar(id);
      } else {
         this.deck.set(d);
      }
      this.validarLocalmente();
    }
  }

  buscarCartas(termo: string) {
    if (!termo || termo.trim().length === 0) {
      this.resultadosBusca.set([]);
      return;
    }
    
    this.carregandoBusca.set(true);
    this.cartasService.obterCartas(1, 15, { nome: termo }).subscribe(res => {
      this.resultadosBusca.set(res.data?.cartas ?? []);
      this.carregandoBusca.set(false);
    });
  }

  adicionarAoDeckLocal(carta: Carta, comoComandante: boolean = false) {
    this.deck.update(d => {
      if (!d) return null;
      
      const novaEstrutura = { ...d.cartas };
      const categoria = this.obterCategoriaCarta(carta, comoComandante);
      const lista = [...(novaEstrutura as any)[categoria]];
      
      const index = lista.findIndex((dc: any) => dc.carta.id === carta.id && dc.ehComandante === comoComandante);
      
      if (index >= 0) {
        lista[index] = { ...lista[index], quantidade: lista[index].quantidade + 1 };
      } else {
        lista.push({ carta, quantidade: 1, ehComandante: comoComandante });
      }
      
      (novaEstrutura as any)[categoria] = lista;
      
      const novoDeck = { 
        ...d, 
        cartas: novaEstrutura,
        estatisticas: { ...d.estatisticas, totalCartas: d.estatisticas.totalCartas + 1 }
      };
      
      return novoDeck;
    });
    this.validarLocalmente();
  }

  removerDoDeckLocal(carta: Carta, comoComandante: boolean = false, tudo: boolean = false) {
    this.deck.update(d => {
      if (!d) return null;
      
      const novaEstrutura = { ...d.cartas };
      const categoria = this.obterCategoriaCarta(carta, comoComandante);
      let lista = [...(novaEstrutura as any)[categoria]];
      
      const index = lista.findIndex((dc: any) => dc.carta.id === carta.id && dc.ehComandante === comoComandante);
      if (index === -1) return d;

      const qtdRemover = tudo ? lista[index].quantidade : 1;

      if (tudo || lista[index].quantidade === 1) {
        lista = lista.filter((_, i) => i !== index);
      } else {
        lista[index] = { ...lista[index], quantidade: lista[index].quantidade - 1 };
      }
      
      (novaEstrutura as any)[categoria] = lista;
      
      return { 
        ...d, 
        cartas: novaEstrutura,
        estatisticas: { ...d.estatisticas, totalCartas: d.estatisticas.totalCartas - qtdRemover }
      };
    });
    this.validarLocalmente();
  }

  private obterCategoriaCarta(c: Carta, comoComandante: boolean): keyof Deck['cartas'] {
    if (comoComandante) return 'comandantes';
    const tl = (c.typeLine || '').toLowerCase();
    if (tl.includes('planeswalker')) return 'planeswalkers';
    if (tl.includes('creature')) return 'criaturas';
    if (tl.includes('instant')) return 'instantes';
    if (tl.includes('sorcery')) return 'feiticos';
    if (tl.includes('artifact')) return 'artefatos';
    if (tl.includes('enchantment')) return 'encantamentos';
    if (tl.includes('land')) return 'terrenos';
    return 'outros';
  }

  async salvar() {
    const d = this.deck();
    if (!d) return;

    this.salvando.set(true);
    try {
      let resultado: Deck | null;
      
      const listaSimples: { carta_id: number, quantidade: number, eh_comandante: boolean }[] = [];
      Object.values(d.cartas).flat().forEach((dc: any) => {
        listaSimples.push({
          carta_id: dc.carta.id,
          quantidade: dc.quantidade,
          eh_comandante: dc.ehComandante
        });
      });

      if (this.isNovoDeck()) {
        resultado = await this.decksService.criarDeckComCartas(d.nome, d.formato, listaSimples);
      } else {
        resultado = await this.decksService.atualizarCartasDeck(d.id, listaSimples);
      }

      if (resultado) {
        const chave = `deck_edicao_${d.id || 'novo'}`;
        localStorage.removeItem(chave);
        
        if (this.isNovoDeck()) {
          this.router.navigate(['/decks', resultado.id], { replaceUrl: true });
        } else {
          this.deck.set(resultado);
          this.deckOriginal.set(JSON.stringify(this.serializarParaLocal(resultado)));
          this.validarLocalmente();
        }
      }
    } catch (e) {
      console.error('Erro ao salvar deck', e);
    } finally {
      this.salvando.set(false);
    }
  }

  private async validarLocalmente() {
  }

  mostrarPreview(c: Carta, event: MouseEvent) {
    this.cartaPreview.set(c);
    this.mouseX.set(event.clientX);
    this.mouseY.set(event.clientY);
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.cartaPreview()) {
      this.mouseX.set(event.clientX);
      this.mouseY.set(event.clientY);
    }
  }

  esconderPreview() {
    this.cartaPreview.set(null);
  }

  obterImagemSmall(c: Carta): string {
    return c.imageUris?.small ?? c.faces[0]?.imageUris?.small ?? '';
  }
}


