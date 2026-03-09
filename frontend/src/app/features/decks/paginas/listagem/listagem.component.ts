import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal, input } from '@angular/core';
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
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, TagModule],
  providers: [DialogService],
  template: `
    <div class="container mx-auto p-6 max-w-6xl">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-extrabold text-surface">{{ titulo() }}</h1>
        @if (apenasMeus() && estaAutenticado()) {
          <p-button label="Novo Deck" icon="pi pi-plus" (click)="abrirCriacao()"></p-button>
        }
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (deck of decks(); track deck.id) {
          <p-card
            [header]="deck.nome"
            styleClass="hover:bg-highlight group transition-all cursor-pointer border border-surface shadow-sm"
            [routerLink]="['/decks', deck.id]"
          >
            <div class="flex flex-col gap-3">
              <div class="flex justify-between items-center">
                <p-tag
                  [value]="deck.formato.toUpperCase()"
                  [severity]="deck.formato === 'pauper' ? 'info' : 'warn'"
                ></p-tag>
                <div class="flex flex-col items-end">
                  <span class="text-sm text-surface group-hover:text-color-emphasis"
                    >{{ deck.estatisticas.totalCartas }} cartas</span
                  >
                  @if (!apenasMeus()) {
                    <span
                      class="text-[10px] text-surface group-hover:text-color-emphasis/80 font-bold uppercase tracking-tighter"
                      >Por {{ deck.usuario?.nome }}</span
                    >
                  }
                </div>
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

              <div class="flex items-center gap-2 mt-2 pt-2 border-t border-surface">
                <i class="pi pi-calendar text-surface group-hover:text-color-emphasis text-xs"></i>
                <span
                  class="text-[10px] text-surface group-hover:text-color-emphasis/80 uppercase font-medium"
                >
                  Atualizado em {{ deck.updatedAt | date: 'dd/MM/yyyy HH:mm' }}
                </span>
              </div>
            </div>
          </p-card>
        } @empty {
          <div class="col-span-full p-12 text-center  border border-surface rounded-xl">
            <p class="text-xl text-surface-500">Nenhum deck encontrado.</p>
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

  apenasMeus = input<boolean>(false);

  titulo = signal('Decks da Comunidade');
  decks = signal<Deck[]>([]);
  estaAutenticado = this.authService.estaAutenticado;

  ngOnInit() {
    if (this.apenasMeus()) {
      this.titulo.set('Meus Decks');
    }
    this.carregarDecks();
  }

  async carregarDecks() {
    const lista = await this.decksService.listarDecks(this.apenasMeus());
    this.decks.set(lista);
  }

  abrirCriacao() {
    this.ref = this.dialogService.open(CriarDeckComponent, {
      header: 'Criar Novo Deck',
      width: '400px',
      modal: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });

    if (this.ref) {
      this.ref.onClose.subscribe((dados: { nome: string; formato: string } | undefined) => {
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
