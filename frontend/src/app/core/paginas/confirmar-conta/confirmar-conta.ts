import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RegistroService } from '@core/servicos/registro';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-confirmar-conta',
  imports: [MessageModule, CardModule, RouterLink, ProgressSpinnerModule, ButtonModule],
  templateUrl: './confirmar-conta.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmarContaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private registroService = inject(RegistroService);
  private router = inject(Router);

  carregando = signal(true);
  erro = signal<string | null>(null);
  sucesso = signal(false);

  async ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.erro.set('Token de confirmação não encontrado.');
      this.carregando.set(false);
      return;
    }

    try {
      await this.registroService.confirmarConta(token);
      this.sucesso.set(true);
    } catch (e: any) {
      this.erro.set(e.error?.message || 'Erro ao confirmar conta.');
    } finally {
      this.carregando.set(false);
    }
  }
}
