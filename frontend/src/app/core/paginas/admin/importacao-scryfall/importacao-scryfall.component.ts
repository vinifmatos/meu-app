import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ImportacaoScryfall } from '@core/interfaces/importacao-scryfall.interface';
import { ErroService } from '@core/servicos/erro.service';
import { ImportacaoService } from '@core/servicos/importacao.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-importacao-scryfall',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TableModule, TagModule, ProgressBarModule],
  template: `
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold text-surface">Gerenciamento de Importação Scryfall</h1>
        <div class="flex gap-2">
          <p-button
            label="Importar Símbolos"
            icon="pi pi-refresh"
            (onClick)="iniciar('simbolos')"
            [loading]="carregando()"
          />
          <p-button
            label="Importar Cartas"
            icon="pi pi-download"
            severity="warn"
            (onClick)="iniciar('bulk_data')"
            [loading]="carregando()"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        @for (imp of ultimasImportacoesPorTipo(); track imp.tipo) {
          <p-card [header]="imp.tipo === 'bulk_data' ? 'Status das Cartas' : 'Status dos Símbolos'">
            <div class="flex flex-col gap-2">
              <div class="flex justify-between items-center">
                <span class="font-semibold">Status:</span>
                <p-tag [value]="imp.status" [severity]="getSeverity(imp.status)" />
              </div>

              @if (imp.status === 'processando') {
                <div class="mt-2">
                  <p-progressBar [value]="imp.progresso" />
                </div>
                <p-button
                  label="Parar"
                  icon="pi pi-stop-circle"
                  severity="danger"
                  size="small"
                  class="mt-2"
                  (onClick)="cancelar(imp.id)"
                />
              }

              <div class="text-sm mt-2">
                <div>Última execução: {{ imp.startedAt | date: 'dd/MM/yyyy HH:mm' }}</div>
                @if (imp.finishedAt) {
                  <div>Finalizado: {{ imp.finishedAt | date: 'dd/MM/yyyy HH:mm' }}</div>
                }
                @if (imp.metadata?.updatedAt) {
                  <div class="mt-1 text-gray-500">
                    Arquivo Scryfall: {{ imp.metadata?.updatedAt | date: 'dd/MM/yyyy' }}
                  </div>
                }
              </div>

              @if (imp.mensagemErro) {
                <div class="mt-2 text-red-500 text-sm italic">Erro: {{ imp.mensagemErro }}</div>
              }
            </div>
          </p-card>
        }
      </div>

      <p-card header="Histórico Recente">
        <p-table [value]="importacoes()" [rows]="10" [paginator]="true" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Progresso</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-imp>
            <tr>
              <td>{{ imp.id }}</td>
              <td><p-tag [value]="imp.tipo" severity="info" /></td>
              <td><p-tag [value]="imp.status" [severity]="getSeverity(imp.status)" /></td>
              <td>{{ imp.progresso }}%</td>
              <td>{{ imp.createdAt | date: 'short' }}</td>
              <td>
                @if (imp.status === 'processando') {
                  <p-button
                    icon="pi pi-stop"
                    severity="danger"
                    [rounded]="true"
                    [text]="true"
                    (onClick)="cancelar(imp.id)"
                  />
                }
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `,
  styles: [],
})
export class ImportacaoScryfallComponent implements OnInit, OnDestroy {
  private importacaoService = inject(ImportacaoService);
  private messageService = inject(MessageService);
  private erroService = inject(ErroService);

  importacoes = signal<ImportacaoScryfall[]>([]);
  carregando = signal(false);
  private intervalId?: any;

  ngOnInit() {
    this.carregar();
    // Atualiza a cada 5 segundos se houver alguma importação processando
    this.intervalId = setInterval(() => {
      if (this.importacoes().some((i) => i.status === 'processando')) {
        this.carregar();
      }
    }, 5000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  async carregar() {
    const importacoes = await this.importacaoService.listar();
    this.importacoes.set(importacoes);
  }

  ultimasImportacoesPorTipo() {
    const cartas = this.importacoes().find((i) => i.tipo === 'bulk_data');
    const simbolos = this.importacoes().find((i) => i.tipo === 'simbolos');
    return [cartas, simbolos].filter((i) => !!i) as ImportacaoScryfall[];
  }

  async iniciar(tipo: 'bulk_data' | 'simbolos') {
    this.carregando.set(true);
    try {
      await this.importacaoService.iniciar(tipo, true);
      this.carregar();
    } catch (error) {
      this.erroService.handle(error);
    } finally {
      this.carregando.set(false);
    }
  }

  async cancelar(id: number) {
    await this.importacaoService.cancelar(id);
    this.messageService.add({
      severity: 'info',
      summary: 'Cancelamento',
      detail: 'Solicitação enviada',
    });
    this.carregar();
  }

  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'concluido':
        return 'success';
      case 'processando':
        return 'info';
      case 'pendente':
        return 'warn';
      case 'falha':
        return 'danger';
      case 'cancelado':
        return 'secondary';
      default:
        return 'info';
    }
  }
}
