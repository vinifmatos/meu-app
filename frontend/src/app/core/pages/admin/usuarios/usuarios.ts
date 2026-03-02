import { Component, inject, OnInit } from '@angular/core';
import { ApiValidationError } from '@core/interfaces/api-response';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { UsuarioForm } from './components/usuario-form/usuario-form';
import { IUsuario } from './usuario.interface';
import { UsuariosService } from './usuarios.service';

@Component({
  selector: 'app-usuarios',
  imports: [TableModule, ButtonModule, DynamicDialogModule, ConfirmPopupModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios implements OnInit {
  private service = inject(UsuariosService);
  usuarios: IUsuario[] = [];
  private dialogService = inject(DialogService);
  private dialogRef: DynamicDialogRef | null = null;
  private confimationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  ngOnInit() {
    this.refreshUsuarios();
  }

  openDialog(usuario?: IUsuario) {
    this.dialogRef = this.dialogService.open(UsuarioForm, {
      header: usuario ? 'Editar Usuário' : 'Novo Usuário',
      width: '50%',
      data: { usuario },
    });

    if (this.dialogRef) {
      this.dialogRef.onClose.subscribe((result) => {
        if (result) {
          this.refreshUsuarios();
        }
      });
    }
  }

  async excluirUsuario(e: Event, usuario: IUsuario) {
    this.confimationService.confirm({
      target: e.currentTarget as EventTarget,
      message: 'Tem certeza que deseja excluir este usuário?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { severity: 'secondary' },
      acceptButtonProps: { severity: 'danger' },
      accept: async () => {
        try {
          await this.service.deletarUsuario(usuario.id);
          this.refreshUsuarios();
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Usuário excluído com sucesso',
          });
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
              severity: 'warn',
              summary: 'Atenção',
              detail: err.message ?? 'Não foi possível excluir o usuário',
            });
          }
        }
      },
    });
  }

  private async refreshUsuarios() {
    this.usuarios = await this.service.getUsuarios();
  }
}
