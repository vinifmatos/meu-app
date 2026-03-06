import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ErroService } from '@core/servicos/erro.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialog, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { IUsuario } from '../../usuario.interface';
import { UsuariosService } from '../../usuarios.service';

@Component({
  selector: 'app-usuario-formulario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputText,
    PasswordModule,
    SelectModule,
    MessageModule,
  ],
  templateUrl: './usuario-formulario.component.html',
  styleUrl: './usuario-formulario.component.scss',
})
export class UsuarioFormularioComponent implements OnInit, OnDestroy {
  private servicoDialogo = inject(DialogService);
  private servicoUsuarios = inject(UsuariosService);
  private instancia?: DynamicDialog;
  private ref: DynamicDialogRef = inject(DynamicDialogRef);
  private fb: FormBuilder = inject(FormBuilder);
  private messageService = inject(MessageService);
  private erroService = inject(ErroService);

  perfis = [
    { label: 'Administrador', value: 'admin' },
    { label: 'Usuário', value: 'usuario' },
  ];
  usuario?: IUsuario;
  formulario!: FormGroup;
  erros: Record<string, string[]> = {};

  ngOnInit() {
    this.instancia = this.servicoDialogo.getInstance(this.ref);

    if (this.instancia && this.instancia.data) {
      this.usuario = this.instancia.data['usuario'];
    }

    this.formulario = this.fb.group({
      username: [this.usuario?.username ?? ''],
      nome: [this.usuario?.nome ?? ''],
      role: [this.usuario?.role ?? 'usuario'],
      password: [''],
      passwordConfirmation: [''],
    });
  }

  get ehNovo() {
    return !this.usuario?.id;
  }

  limparErro(campo: string) {
    if (this.erros[campo]) {
      delete this.erros[campo];
    }
  }

  fechar() {
    this.ref.close();
  }

  async salvar() {
    this.erros = {};
    try {
      if (this.ehNovo) {
        await this.servicoUsuarios.criarUsuario(this.formulario.value);
      } else {
        await this.servicoUsuarios.atualizarUsuario(this.usuario!.id, this.formulario.value);
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Usuário salvo com sucesso',
      });
      this.ref.close(true);
    } catch (erro: any) {
      this.erroService.handle(erro);
    }
  }

  ngOnDestroy() {
    if (this.ref) this.ref.close();
  }
}
