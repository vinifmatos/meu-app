import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Carta, Paginacao } from '@core/interfaces/cartas.interface';
import { CartasService } from '@features/cartas/servicos/cartas.service';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-listagem',
  standalone: true,
  imports: [
    CommonModule,
    DataViewModule,
    TagModule,
    InputTextModule,
    ButtonModule,
    FormsModule,
    NgOptimizedImage,
    RouterLink,
    IconFieldModule,
    InputIconModule,
    SelectModule,
  ],
  template: `
    <div class="card p-4">
      <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <div class="flex flex-col">
          <h2 class="text-3xl font-extrabold text-surface">Explorar Cartas</h2>
          <p class="text-surface">Encontre as melhores versões das suas cartas favoritas.</p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <p-select
            [options]="opcoesIdiomas"
            [(ngModel)]="idiomaSelecionado"
            (onChange)="buscar()"
            optionLabel="label"
            optionValue="value"
            placeholder="Idioma"
            class="w-full sm:w-44"
          ></p-select>

          <p-iconField class="w-full md:w-80">
            <input
              type="text"
              pInputText
              placeholder="Buscar por nome..."
              [(ngModel)]="filtroNome"
              (keyup.enter)="buscar()"
              class="w-full h-12 shadow-sm"
            />
            <p-inputIcon styleClass="pi pi-search"></p-inputIcon>
          </p-iconField>
        </div>
      </div>

      <p-dataView
        [value]="cartas()"
        [paginator]="true"
        [rows]="20"
        [lazy]="true"
        [totalRecords]="totalItems()"
        [first]="first"
        (onLazyLoad)="onPageChange($event)"
        layout="grid"
      >
        <ng-template #grid let-cartas>
          <div
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            <div
              *ngFor="let carta of cartas; let i = index"
              [routerLink]="['/cartas', carta.id]"
              class="group p-4 border border-surface bg-surface rounded-xl shadow-sm flex flex-col items-center cursor-pointer hover:bg-highlight hover:border-surface transition-all duration-300"
            >
              <div
                class="relative w-full aspect-[2.5/3.5] mb-4 overflow-hidden rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
              >
                <img
                  [ngSrc]="obterImagemCarta(carta)"
                  [alt]="carta.name"
                  fill
                  [priority]="i < 5"
                  class="object-cover"
                />
              </div>

              <div class="text-center w-full">
                <div class="text-lg font-bold mb-1 truncate text-surface group-hover:text-color-emphasis" [title]="carta.name">
                  {{ carta.name }}
                </div>
                <div class="text-sm text-surface group-hover:text-color-emphasis/80 mb-3 truncate">{{ carta.typeLine }}</div>

                <div class="flex justify-center gap-2 flex-wrap">
                  <p-tag
                    [value]="carta.set.toUpperCase()"
                    severity="secondary"
                    styleClass="px-2"
                  ></p-tag>
                  <p-tag
                    [value]="obterRaridadeTraduzida(carta.rarity)"
                    [severity]="obterRaridadeSeverity(carta.rarity)"
                  ></p-tag>
                </div>
              </div>
            </div>
          </div>
        </ng-template>

        <ng-template #empty>
          <div class="flex flex-col items-center justify-center p-20 text-surface">
            <i class="pi pi-search text-6xl mb-4 opacity-20"></i>
            <span class="text-2xl font-medium">Nenhuma carta encontrada</span>
            <p>Tente ajustar os termos da sua busca ou trocar o idioma.</p>
          </div>
        </ng-template>
      </p-dataView>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      :host ::ng-deep .p-dataview-content {
        padding: 1.5rem; /* gap-6 do tailwind em todos os lados */
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListagemComponent implements OnInit {
  private readonly cartasService = inject(CartasService);
  private readonly STORAGE_KEY = 'deckbuilder_filtros_cartas';

  cartas = signal<Carta[]>([]);
  paginacao = signal<Paginacao | null>(null);

  filtroNome = '';
  idiomaSelecionado = 'en';
  paginaAtual = 1;
  first = 0;

  opcoesIdiomas = [
    { label: 'Inglês (EN)', value: 'en' },
    { label: 'Português (PT)', value: 'pt' },
    { label: 'Espanhol (ES)', value: 'es' },
    { label: 'Francês (FR)', value: 'fr' },
    { label: 'Alemão (DE)', value: 'de' },
    { label: 'Italiano (IT)', value: 'it' },
    { label: 'Japonês (JA)', value: 'ja' },
    { label: 'Coreano (KO)', value: 'ko' },
    { label: 'Chinês (ZH)', value: 'zhs' },
  ];

  totalItems = computed(() => this.paginacao()?.totalCount ?? 0);

  ngOnInit(): void {
    this.carregarFiltrosSalvos();
    this.carregarCartas();
  }

  carregarCartas(): void {
    const filtros = {
      nome: this.filtroNome,
      idioma: this.idiomaSelecionado,
    };

    this.cartasService.obterCartas(this.paginaAtual, 20, filtros).subscribe({
      next: (resposta) => {
        if (resposta.data) {
          this.cartas.set(resposta.data.cartas);
          this.paginacao.set(resposta.data.pagination);
          this.salvarFiltros();
        }
      },
    });
  }

  buscar(): void {
    this.paginaAtual = 1;
    this.first = 0;
    this.carregarCartas();
  }

  onPageChange(event: any): void {
    this.paginaAtual = event.first / event.rows + 1;
    this.first = event.first;
    this.carregarCartas();
  }

  private carregarFiltrosSalvos(): void {
    const salvos = localStorage.getItem(this.STORAGE_KEY);
    if (salvos) {
      try {
        const filtros = JSON.parse(salvos);
        this.filtroNome = filtros.nome ?? '';
        this.idiomaSelecionado = filtros.idioma ?? 'en';
        this.paginaAtual = filtros.pagina ?? 1;
        this.first = (this.paginaAtual - 1) * 20;
      } catch (e) {
        console.error('Erro ao carregar filtros salvos', e);
      }
    }
  }

  private salvarFiltros(): void {
    const dados = {
      nome: this.filtroNome,
      idioma: this.idiomaSelecionado,
      pagina: this.paginaAtual,
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dados));
  }

  obterImagemCarta(carta: Carta): string {
    if (carta.imageUris?.normal) return carta.imageUris.normal;
    if (carta.faces?.length > 0 && carta.faces[0].imageUris?.normal)
      return carta.faces[0].imageUris.normal;
    return 'assets/images/placeholder-card.jpg';
  }

  obterRaridadeTraduzida(raridade: string): string {
    const mapa: Record<string, string> = {
      common: 'Comum',
      uncommon: 'Incomum',
      rare: 'Rara',
      mythic: 'Mítica',
    };
    return mapa[raridade] ?? raridade;
  }

  obterRaridadeSeverity(
    raridade: string,
  ): 'secondary' | 'info' | 'success' | 'warn' | 'danger' | 'contrast' | undefined {
    switch (raridade) {
      case 'common':
        return 'secondary';
      case 'uncommon':
        return 'info';
      case 'rare':
        return 'warn';
      case 'mythic':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
