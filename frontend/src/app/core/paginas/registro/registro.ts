import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegistroService } from '@core/servicos/registro';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-registro',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    CardModule,
    RouterLink,
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistroComponent {
  private fb = inject(FormBuilder);
  private registroService = inject(RegistroService);
  private router = inject(Router);

  mensagemSucesso = signal<string | null>(null);
  erro = signal<string | null>(null);
  carregando = signal(false);

  form = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      nome: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      email_confirmation: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required]],
    },
    {
      validators: [
        (control) => {
          const email = control.get('email');
          const confirm = control.get('email_confirmation');
          return email?.value === confirm?.value ? null : { emailMismatch: true };
        },
        (control) => {
          const pass = control.get('password');
          const confirm = control.get('password_confirmation');
          return pass?.value === confirm?.value ? null : { passwordMismatch: true };
        },
      ],
    },
  );

  async registrar() {
    if (this.form.invalid) return;

    this.carregando.set(true);
    this.erro.set(null);

    try {
      const resp = await this.registroService.registrar(this.form.value);
      this.mensagemSucesso.set(resp.message || 'Registro realizado com sucesso!');
      this.form.reset();
    } catch (e: any) {
      this.erro.set(e.error?.message || 'Erro ao realizar registro');
    } finally {
      this.carregando.set(false);
    }
  }
}
