import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-criar-deck-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, SelectModule],
  template: `
    <div class="flex flex-col gap-4 pt-2">
      <div class="flex flex-col gap-2">
        <label for="nome" class="font-bold text-surface">Nome do Deck</label>
        <input
          pInputText
          id="nome"
          [(ngModel)]="nome"
          placeholder="Ex: Meu Mono Red"
          autofocus
          class="w-full"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="formato" class="font-bold text-surface">Formato</label>
        <p-select
          id="formato"
          [options]="formatos"
          [(ngModel)]="formato"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        ></p-select>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <p-button label="Cancelar" severity="secondary" [text]="true" (click)="fechar()"></p-button>
        <p-button label="Criar Deck" (click)="confirmar()" [disabled]="!nome()"></p-button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CriarDeckComponent {
  private readonly ref = inject(DynamicDialogRef);

  nome = signal('');
  formato = signal('pauper');

  formatos = [
    { label: 'Pauper', value: 'pauper' },
    { label: 'Commander', value: 'commander' },
  ];

  fechar() {
    this.ref.close();
  }

  confirmar() {
    if (this.nome()) {
      this.ref.close({
        nome: this.nome(),
        formato: this.formato(),
      });
    }
  }
}
