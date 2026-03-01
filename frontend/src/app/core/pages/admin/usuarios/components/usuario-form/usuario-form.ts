import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiValidationError } from '@core/interfaces/api-response';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialog, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';
import { IUsuario } from '../../usuario.interface';
import { UsuariosService } from '../../usuarios.service';

@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule, ButtonModule, InputText],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.scss',
})
export class UsuarioForm implements OnInit, OnDestroy {
  private dialogService = inject(DialogService);
  private service = inject(UsuariosService);
  private instance?: DynamicDialog;
  private ref: DynamicDialogRef = inject(DynamicDialogRef);
  private fb: FormBuilder = inject(FormBuilder);
  private messageService = inject(MessageService);
  usuario?: IUsuario;
  form!: FormGroup;

  ngOnInit() {
    this.instance = this.dialogService.getInstance(this.ref);

    if (this.instance && this.instance.data) {
      this.usuario = this.instance.data['usuario'];
    }

    this.form = this.fb.group({
      nome: [this.usuario?.nome ?? ''],
      role: [this.usuario?.role ?? 'usuario'],
      password: [''],
      passwordConfirmation: [''],
      oldPassword: [''],
    });
  }

  get isNew() {
    return !this.usuario?.id;
  }

  close() {
    this.ref.close();
  }

  async save() {
    try {
      if (this.isNew) {
        await this.service.criarUsuario(this.form.value);
      } else {
        await this.service.atualizarUsuario(this.usuario!.id, this.form.value);
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Usuário salvo com sucesso',
      });
      this.ref.close();
    } catch (e: any) {
      if (e instanceof ErrorEvent) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: `Ocorreu um erro de rede: ${e.message}`,
        });
        return;
      }

      if (e.status === 422) {
        const err = e.error as ApiValidationError;

        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err.message ?? 'Ocorreu um erro ao salvar o usuário',
        });
      }
    }
  }

  ngOnDestroy() {
    if (this.ref) this.ref.close();
  }
}
