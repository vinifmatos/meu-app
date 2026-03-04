import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Deck } from '@core/interfaces/decks.interface';
import { AuthService } from '@core/servicos/auth.service';
import { DecksService } from '@core/servicos/decks.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CriarDeckComponent } from './criar-deck.component';

@Component({
  selector: 'app-listagem-decks',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    TagModule,
  ],
  providers: [DialogService],
  template: `
    <div class="container mx-auto p-6 max-w-6xl">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-extrabold text-surface">Meus Decks</h1>
        @if (estaAutenticado()) {
          <p-button label="Novo Deck" icon="pi pi-plus" (click)="abrirCriacao()"></p-button>
        }
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (deck of decks(); track deck.id) {
          <p-card
            [header]="deck.nome"
            class="hover:shadow-md transition-shadow cursor-pointer"
            [routerLink]="['/decks', deck.id]"
          >
            <div class="flex flex-col gap-3">
              <div class="flex justify-between items-center">
                <p-tag
                  [value]="deck.formato.toUpperCase()"
                  [severity]="deck.formato === 'pauper' ? 'info' : 'warn'"
                ></p-tag>
                <span class="text-sm text-surface-500"
                  >{{ deck.estatisticas.totalCartas }} cartas</span
                >
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
          <div class="col-span-full p-12 text-center  border border-surface rounded-xl">
            <p class="text-xl text-surface-500">Você ainda não criou nenhum deck.</p>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListagemDecksComponent implements OnInit {
  private readonly decksService = inject(DecksService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialogService = inject(DialogService);
  
  private ref: DynamicDialogRef | null = null;

  decks = signal<Deck[]>([]);
  estaAutenticado = this.authService.estaAutenticado;

  ngOnInit() {
    this.carregarDecks();
  }

  async carregarDecks() {
    const lista = await this.decksService.listarDecks();
    this.decks.set(lista);
  }

  abrirCriacao() {
    this.ref = this.dialogService.open(CriarDeckComponent, {
      header: 'Criar Novo Deck',
      width: '400px',
      modal: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    if (this.ref) {
      this.ref.onClose.subscribe((dados: { nome: string, formato: string } | undefined) => {
        if (dados) {
          this.router.navigate(['/decks/novo'], {
            queryParams: {
              nome: dados.nome,
              formato: dados.formato,
            },
          });
        }
      });
    }
  }
}
