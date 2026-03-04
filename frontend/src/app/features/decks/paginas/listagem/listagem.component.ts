import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { DecksService } from '@core/servicos/decks.service';
import { Deck } from '@core/interfaces/decks.interface';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-listagem-decks',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, TagModule, FormsModule, InputTextModule, SelectModule],
  template: `
    <div class="container mx-auto p-6 max-w-6xl">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-extrabold text-surface">Meus Decks</h1>
        <p-button label="Novo Deck" icon="pi pi-plus" (click)="exibirCriacao = true"></p-button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (deck of decks(); track deck.id) {
          <p-card [header]="deck.nome" class="hover:shadow-md transition-shadow cursor-pointer" [routerLink]="['/decks', deck.id]">
            <div class="flex flex-col gap-3">
              <div class="flex justify-between items-center">
                <p-tag [value]="deck.formato.toUpperCase()" [severity]="deck.formato === 'pauper' ? 'info' : 'warn'"></p-tag>
                <span class="text-sm text-surface-500">{{ deck.estatisticas.totalCartas }} cartas</span>
              </div>
              
              <div class="flex items-center gap-2">
                @if (deck.estatisticas.valido) {
                  <i class="pi pi-check-circle text-green-500"></i>
                  <span class="text-xs text-green-500 font-bold">VÁLIDO</span>
                } @else {
                  <i class="pi pi-exclamation-circle text-red-500"></i>
                  <span class="text-xs text-red-500 font-bold">INVÁLIDO</span>
                }
              </div>

              <div class="flex items-center gap-2 mt-2 pt-2 border-t border-surface-100">
                <i class="pi pi-calendar text-surface-400 text-xs"></i>
                <span class="text-[10px] text-surface-400 uppercase font-medium">
                  Criado em {{ deck.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                </span>
              </div>
            </div>
          </p-card>
        } @empty {
          <div class="col-span-full p-12 text-center bg-surface-50 border border-surface rounded-xl">
            <i class="pi pi-folder-open text-5xl mb-4 opacity-20"></i>
            <p class="text-xl text-surface-500">Você ainda não criou nenhum deck.</p>
          </div>
        }
      </div>

      <!-- Diálogo Simples de Criação -->
      @if (exibirCriacao) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-surface rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 class="text-2xl font-bold mb-4">Criar Novo Deck</h2>
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label class="font-bold">Nome do Deck</label>
                <input pInputText [(ngModel)]="novoDeckNome" placeholder="Ex: Meu Mono Red" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="font-bold">Formato</label>
                <p-select [options]="formatos" [(ngModel)]="novoDeckFormato" optionLabel="label" optionValue="value" class="w-full"></p-select>
              </div>
              <div class="flex justify-end gap-2 mt-4">
                <p-button label="Cancelar" severity="secondary" (click)="exibirCriacao = false"></p-button>
                <p-button label="Criar Deck" (click)="criarDeck()" [disabled]="!novoDeckNome"></p-button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListagemDecksComponent implements OnInit {
  private readonly decksService = inject(DecksService);
  private readonly router = inject(Router);
  
  decks = signal<Deck[]>([]);
  exibirCriacao = false;
  novoDeckNome = '';
  novoDeckFormato = 'pauper';

  formatos = [
    { label: 'Pauper', value: 'pauper' },
    { label: 'Commander', value: 'commander' }
  ];

  ngOnInit() {
    this.carregarDecks();
  }

  async carregarDecks() {
    const lista = await this.decksService.listarDecks();
    this.decks.set(lista);
  }

  async criarDeck() {
    this.exibirCriacao = false;
    this.router.navigate(['/decks/novo'], { 
      queryParams: { 
        nome: this.novoDeckNome, 
        formato: this.novoDeckFormato 
      } 
    });
    this.novoDeckNome = '';
  }
}
