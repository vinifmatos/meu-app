import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegistroService } from '@core/servicos/registro';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { DatePipe } from '@angular/common';
import { Usuario } from '@core/interfaces/usuario.interface';

@Component({
  selector: 'app-perfil',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    CardModule,
    DatePipe
  ],
  templateUrl: './perfil.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  private registroService = inject(RegistroService);

  usuario = signal<Usuario | null>(null);
  carregando = signal(true);
  mensagemSucesso = signal<string | null>(null);
  erro = signal<string | null>(null);

  formNome = this.fb.group({
    nome: ['', [Validators.required]]
  });

  formEmail = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  formSenha = this.fb.group({
    current_password: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    password_confirmation: ['', [Validators.required]]
  }, {
    validators: (control) => {
      const pass = control.get('password');
      const confirm = control.get('password_confirmation');
      return pass?.value === confirm?.value ? null : { passwordMismatch: true };
    }
  });

  async ngOnInit() {
    await this.carregarPerfil();
  }

  async carregarPerfil() {
    try {
      const resp = await this.registroService.getPerfil();
      if (resp.data) {
        this.usuario.set(resp.data.usuario);
        this.formNome.patchValue({ nome: resp.data.usuario.nome });
        this.formEmail.patchValue({ email: resp.data.usuario.email });
      }
    } catch (e: any) {
      this.erro.set('Erro ao carregar perfil.');
    } finally {
      this.carregando.set(false);
    }
  }

  async atualizarNome() {
    await this.salvar({ nome: this.formNome.value.nome });
  }

  async atualizarEmail() {
    await this.salvar({ email: this.formEmail.value.email });
  }

  async atualizarSenha() {
    await this.salvar(this.formSenha.value);
    this.formSenha.reset();
  }

  private async salvar(dados: any) {
    this.mensagemSucesso.set(null);
    this.erro.set(null);
    try {
      const resp = await this.registroService.atualizarPerfil(dados);
      this.mensagemSucesso.set(resp.message || 'Atualizado com sucesso!');
      if (resp.data?.usuario) {
        this.usuario.set(resp.data.usuario);
      }
    } catch (e: any) {
      this.erro.set(e.error?.message || 'Erro ao atualizar.');
    }
  }
}
