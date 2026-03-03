import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartasService } from '@features/cartas/servicos/cartas.service';
import { Carta, Paginacao } from '@core/interfaces/cartas.interface';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-listagem',
  imports: [
    CommonModule, 
    DataViewModule, 
    TagModule, 
    InputTextModule, 
    ButtonModule, 
    FormsModule,
    NgOptimizedImage
  ],
  template: `
    <div class="card p-4">
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 class="text-2xl font-bold">Listagem de Cartas</h2>
        <span class="p-input-icon-left w-full md:w-auto">
          <i class="pi pi-search"></i>
          <input 
            type="text" 
            pInputText 
            placeholder="Buscar por nome..." 
            [(ngModel)]="filtroNome" 
            (keyup.enter)="buscar()" 
            class="w-full"
          />
        </span>
      </div>

      <p-dataView 
        [value]="cartas()" 
        [paginator]="true" 
        [rows]="20" 
        [lazy]="true" 
        [totalRecords]="totalItems()"
        (onLazyLoad)="onPageChange($event)"
        layout="grid"
      >
        <ng-template #grid let-cartas>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <div *ngFor="let carta of cartas; let i = index" class="p-4 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded-lg shadow-sm flex flex-col items-center">
              <div class="relative w-full aspect-[2.5/3.5] mb-4 overflow-hidden rounded-md shadow-md">
                <img 
                  [ngSrc]="obterImagemCarta(carta)" 
                  [alt]="carta.name" 
                  fill
                  [priority]="i < 5"
                  class="object-cover"
                />
              </div>
              <div class="text-center w-full">
                <div class="text-lg font-semibold mb-1 truncate" [title]="carta.name">{{ carta.name }}</div>
                <div class="text-sm text-surface-500 mb-2">{{ carta.typeLine }}</div>
                <p-tag [value]="carta.set" severity="secondary"></p-tag>
              </div>
            </div>
          </div>
        </ng-template>

        <ng-template #empty>
          <div class="flex flex-col items-center justify-center p-12 text-surface-500">
            <i class="pi pi-search text-5xl mb-4"></i>
            <span class="text-xl">Nenhuma carta encontrada</span>
          </div>
        </ng-template>
      </p-dataView>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListagemComponent implements OnInit {
  private readonly cartasService = inject(CartasService);

  // Estados com Signals
  cartas = signal<Carta[]>([]);
  paginacao = signal<Paginacao | null>(null);
  filtroNome = '';
  
  totalItems = computed(() => this.paginacao()?.totalCount || 0);

  ngOnInit(): void {
    this.carregarCartas();
  }

  carregarCartas(pagina: number = 1): void {
    this.cartasService.obterCartas(pagina, 20, { nome: this.filtroNome }).subscribe({
      next: (resposta) => {
        if (resposta.data) {
          this.cartas.set(resposta.data.cartas);
          this.paginacao.set(resposta.data.pagination);
        }
      }
    });
  }

  buscar(): void {
    this.carregarCartas(1);
  }

  onPageChange(event: any): void {
    const pagina = (event.first / event.rows) + 1;
    this.carregarCartas(pagina);
  }

  obterImagemCarta(carta: Carta): string {
    if (carta.imageUris?.normal) {
      return carta.imageUris.normal;
    }
    
    if (carta.faces?.length > 0 && carta.faces[0].imageUris?.normal) {
      return carta.faces[0].imageUris.normal;
    }

    return 'assets/images/placeholder-card.jpg'; // Placeholder caso não tenha imagem
  }
}
