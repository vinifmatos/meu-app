import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ImportacaoScryfall } from '@core/interfaces/importacao-scryfall.interface';
import { ErroService } from '@core/servicos/erro.service';
import { ImportacaoService } from '@core/servicos/importacao.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { switchMap, tap, timer } from 'rxjs';

@Component({
  selector: 'app-importacao-scryfall',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    ProgressBarModule,
    TooltipModule,
  ],
  template: `
    <div class="p-4">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-surface">Gerenciamento de Importação de Dados</h1>
          <p class="text-sm text-surface/60 mt-1">
            Atualizando em
            <span class="font-mono font-bold text-primary">{{ tempoRestante() }}s</span>...
          </p>
        </div>

        <div class="flex gap-2">
          <p-button
            label="Importar Símbolos"
            icon="pi pi-refresh"
            (onClick)="iniciar('simbolos')"
            [loading]="carregando()"
            [disabled]="estaImportando('simbolos')"
            ariaLabel="Iniciar importação de símbolos"
          />
          <p-button
            label="Importar Cartas"
            icon="pi pi-cloud-download"
            severity="warn"
            (onClick)="iniciar('bulk_data')"
            [loading]="carregando()"
            [disabled]="estaImportando('bulk_data')"
            ariaLabel="Iniciar importação de cartas (Bulk Data)"
          />
        </div>
      </div>

      <!-- Últimas Importações por Tipo -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        @for (tipo of ['bulk_data', 'simbolos']; track tipo) {
          <p-card [header]="tipo === 'bulk_data' ? 'Status das Cartas' : 'Status dos Símbolos'">
            @if (getUltimaImportacao(tipo); as imp) {
              <div class="flex flex-col gap-3">
                <div class="flex justify-between items-center">
                  <span class="font-semibold text-surface">Status Atual:</span>
                  <p-tag [value]="imp.status.toUpperCase()" [severity]="getSeverity(imp.status)" />
                </div>

                @if (imp.status === 'processando' || imp.status === 'pendente') {
                  <div class="mt-2">
                    <div
                      class="flex justify-between text-[10px] mb-1 text-surface/60 uppercase font-bold tracking-wider"
                    >
                      @if (imp.status === 'processando') {
                        @if (calcularTempos(imp); as tempos) {
                          <div class="flex gap-3">
                            <span class="inline-flex items-center"
                              ><i class="pi pi-clock mr-1"></i>{{ tempos.decorrido }}</span
                            >
                            @if (tempos.restante) {
                              <span class="text-primary inline-flex items-center"
                                ><i class="pi pi-hourglass mr-1"></i>ETA:
                                {{ tempos.restante }}</span
                              >
                            }
                          </div>
                        }
                      } @else {
                        <span>Aguardando início...</span>
                      }
                      <span>{{ imp.progresso }}%</span>
                    </div>
                    <p-progressBar [value]="imp.progresso" [showValue]="false" styleClass="h-2" />

                    <div class="flex justify-between text-[10px] mt-1 text-surface/40 font-mono">
                      <span>{{ formatarBytes(imp.readedSize) }}</span>
                      <span>{{ formatarBytes(imp.fileSize) }}</span>
                    </div>
                  </div>

                  <p-button
                    label="Cancelar Importação"
                    icon="pi pi-stop-circle"
                    severity="danger"
                    size="small"
                    [outlined]="true"
                    class="mt-2"
                    (onClick)="cancelar(imp.id)"
                    [loading]="cancelandoId() === imp.id"
                  />
                } @else {
                  <div class="text-sm space-y-1">
                    <div class="flex justify-between">
                      <span class="text-surface/60">Duração total:</span>
                      <span>{{ calcularDuracaoTotal(imp) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-surface/60">Última execução:</span>
                      <span>{{ imp.startedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
                    </div>
                    @if (imp.finishedAt) {
                      <div class="flex justify-between">
                        <span class="text-surface/60">Finalizado em:</span>
                        <span>{{ imp.finishedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
                      </div>
                    }
                  </div>
                }

                @if (imp.status === 'falha' && imp.mensagemErro) {
                  <div
                    class="p-2 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs italic"
                  >
                    <i class="pi pi-exclamation-triangle mr-1"></i>
                    {{ imp.mensagemErro }}
                  </div>
                }
              </div>
            } @else {
              <div class="flex flex-col items-center justify-center py-6 text-surface/40 italic">
                <i class="pi pi-info-circle mb-2"></i>
                Nenhuma importação realizada
              </div>
            }
          </p-card>
        }
      </div>

      <!-- Histórico Completo -->
      <p-card header="Histórico">
        <p-table
          [value]="importacoes()"
          [rows]="10"
          [paginator]="true"
          styleClass="p-datatable-sm"
          [responsiveLayout]="'scroll'"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Progresso</th>
              <th>Duração</th>
              <th>Iniciado em</th>
              <th class="text-center">Ações</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-imp>
            <tr>
              <td>
                <span class="font-mono text-xs">{{ imp.id }}</span>
              </td>
              <td>
                <span class="capitalize">{{
                  imp.tipo === 'bulk_data' ? 'Cartas' : 'Símbolos'
                }}</span>
              </td>
              <td>
                <p-tag [value]="imp.status" [severity]="getSeverity(imp.status)" />
              </td>
              <td class="w-32">
                <div class="flex items-center gap-2">
                  <p-progressBar
                    [value]="imp.progresso"
                    [showValue]="false"
                    class="flex-1"
                    styleClass="h-1"
                  />
                  <span class="text-xs">{{ imp.progresso }}%</span>
                </div>
              </td>
              <td>
                <span class="text-sm">
                  {{
                    imp.status === 'processando'
                      ? calcularTempos(imp).decorrido
                      : calcularDuracaoTotal(imp)
                  }}
                </span>
              </td>
              <td>
                <span class="text-sm">{{ imp.startedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </td>
              <td class="text-center">
                @if (imp.status === 'processando' || imp.status === 'pendente') {
                  <p-button
                    icon="pi pi-stop"
                    severity="danger"
                    [rounded]="true"
                    [text]="true"
                    (onClick)="cancelar(imp.id)"
                    pTooltip="Cancelar"
                    tooltipPosition="left"
                    [loading]="cancelandoId() === imp.id"
                  />
                }
                @if (imp.status === 'falha' && imp.mensagemErro) {
                  <i
                    class="pi pi-info-circle text-red-500 cursor-help"
                    [pTooltip]="imp.mensagemErro"
                    tooltipPosition="left"
                  ></i>
                }
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center py-8 text-surface/40 italic">
                Nenhuma importação encontrada.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `,
  styles: [],
})
export class ImportacaoScryfallComponent implements OnInit {
  private importacaoService = inject(ImportacaoService);
  private messageService = inject(MessageService);
  private erroService = inject(ErroService);

  importacoes = signal<ImportacaoScryfall[]>([]);
  carregando = signal(false);
  cancelandoId = signal<number | null>(null);
  tempoRestante = signal(5);
  agora = signal(Date.now());

  private readonly INTERVALO_POLLING = 5; // segundos

  constructor() {
    // Configura o Polling com contador regressivo usando RxJS
    timer(0, 1000)
      .pipe(
        takeUntilDestroyed(),
        tap(() => {
          this.agora.set(Date.now());
          // Decrementa o tempo restante
          this.tempoRestante.update((v) => (v <= 1 ? this.INTERVALO_POLLING : v - 1));
        }),
        // Filtra para executar o fetch apenas quando o tempo chegar a 1 (próximo é zero)
        switchMap((segundo) => {
          // Executa a cada INTERVALO_POLLING segundos (quando o timer for múltiplo de INTERVALO_POLLING)
          if (segundo % this.INTERVALO_POLLING === 0) {
            return this.importacaoService.listar();
          }
          return []; // Retorna nada nos segundos intermediários
        }),
        tap((dados) => {
          if (Array.isArray(dados)) {
            this.importacoes.set(dados);
          }
        }),
      )
      .subscribe();
  }

  ngOnInit() {}

  getUltimaImportacao(tipo: string) {
    return this.importacoes().find((i) => i.tipo === tipo);
  }

  estaImportando(tipo: string) {
    return this.importacoes().some(
      (i) => i.tipo === tipo && (i.status === 'processando' || i.status === 'pendente'),
    );
  }

  async iniciar(tipo: 'bulk_data' | 'simbolos') {
    this.carregando.set(true);
    try {
      await this.importacaoService.iniciar(tipo, true);
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Importação enfileirada com sucesso',
      });
      this.resetarContadorEAtualizar();
    } catch (error) {
      this.erroService.handle(error);
    } finally {
      this.carregando.set(false);
    }
  }

  async cancelar(id: number) {
    this.cancelandoId.set(id);
    try {
      await this.importacaoService.cancelar(id);
      this.messageService.add({
        severity: 'info',
        summary: 'Cancelamento',
        detail: 'Solicitação de cancelamento enviada',
      });
      this.resetarContadorEAtualizar();
    } catch (error) {
      this.erroService.handle(error);
    } finally {
      this.cancelandoId.set(null);
    }
  }

  private async resetarContadorEAtualizar() {
    this.tempoRestante.set(this.INTERVALO_POLLING);
    const dados = await this.importacaoService.listar();
    this.importacoes.set(dados);
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

  calcularTempos(imp: ImportacaoScryfall) {
    if (!imp.startedAt) return { decorrido: '-', restante: null };

    const inicio = new Date(imp.startedAt).getTime();
    const decorridoMs = this.agora() - inicio;

    if (decorridoMs < 0) return { decorrido: '0s', restante: null };

    const decorridoStr = this.formatarDuracao(decorridoMs);

    // ETA: (Tempo Decorrido / Progresso) * (100 - Progresso)
    if (imp.progresso > 0 && imp.progresso < 100) {
      const totalEstimadoMs = (decorridoMs / imp.progresso) * 100;
      const restanteMs = totalEstimadoMs - decorridoMs;
      return { decorrido: decorridoStr, restante: this.formatarDuracao(restanteMs) };
    }

    return { decorrido: decorridoStr, restante: null };
  }

  calcularDuracaoTotal(imp: ImportacaoScryfall) {
    if (!imp.startedAt || !imp.finishedAt) return '-';
    const inicio = new Date(imp.startedAt).getTime();
    const fim = new Date(imp.finishedAt).getTime();
    return this.formatarDuracao(fim - inicio);
  }

  formatarDuracao(ms: number): string {
    const totalSegundos = Math.floor(ms / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    if (horas > 0) return `${horas}h ${minutos}m ${segundos}s`;
    if (minutos > 0) return `${minutos}m ${segundos}s`;
    return `${segundos}s`;
  }

  formatarBytes(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
