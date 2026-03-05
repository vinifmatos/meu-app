import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/servicos/auth.service';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    RouterLink
  ],
  template: `
    <div class="flex items-center justify-center min-h-[80vh] px-4">
      <p-card header="Acesso ao Sistema" subheader="Entre com suas credenciais" class="w-full max-w-md shadow-2xl">
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="username" class="font-bold">Usuário</label>
            <input 
              pInputText 
              id="username" 
              formControlName="username" 
              placeholder="Digite seu username"
              [class.ng-invalid]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="password" class="font-bold">Senha</label>
            <p-password 
              id="password" 
              formControlName="password" 
              [feedback]="false" 
              [toggleMask]="true"
              styleClass="w-full"
              inputStyleClass="w-full"
              placeholder="Digite sua senha"
              [class.ng-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            ></p-password>
          </div>

          @if (erro()) {
            <p-message severity="error" [text]="erro()"></p-message>
          }

          <p-button 
            label="Entrar" 
            type="submit" 
            [loading]="carregando()" 
            [disabled]="loginForm.invalid"
            class="mt-2"
          ></p-button>

          <div class="text-center mt-4">
            Não tem uma conta? <a routerLink="/registro" class="text-primary font-bold hover:underline">Registre-se aqui</a>
          </div>
        </form>
      </p-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  carregando = signal(false);
  erro = signal<string | undefined>(undefined);

  loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.carregando.set(true);
    this.erro.set(undefined);

    const { username, password } = this.loginForm.value;
    const sucesso = await this.authService.login(username!, password!);

    if (sucesso) {
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/';
      this.router.navigateByUrl(returnUrl);
    } else {
      console.error('Falha na autenticação: Credenciais inválidas ou erro de conexão.');
      this.erro.set('Credenciais inválidas ou erro de conexão.');
    }

    this.carregando.set(false);
  }
}
