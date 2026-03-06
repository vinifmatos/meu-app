import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ErroService } from '@core/servicos/erro.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { UsuarioFormularioComponent } from './componentes/usuario-formulario/usuario-formulario.component';
import { IUsuario } from './usuario.interface';
import { UsuariosService } from './usuarios.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [TableModule, ButtonModule, DynamicDialogModule, ConfirmPopupModule, DatePipe],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss',
})
export class UsuariosComponent implements OnInit {
  private servico = inject(UsuariosService);
  usuarios: IUsuario[] = [];
  private dialogService = inject(DialogService);
  private dialogRef: DynamicDialogRef | null = null;
  private confirmacaoService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private erroService = inject(ErroService);

  ngOnInit() {
    this.atualizarUsuarios();
  }

  abrirDialogo(usuario?: IUsuario) {
    this.dialogRef = this.dialogService.open(UsuarioFormularioComponent, {
      header: usuario ? 'Editar Usuário' : 'Novo Usuário',
      width: '50%',
      data: { usuario },
    });

    if (this.dialogRef) {
      this.dialogRef.onClose.subscribe((resultado) => {
        if (resultado) {
          this.atualizarUsuarios();
        }
      });
    }
  }

  async excluirUsuario(evento: Event, usuario: IUsuario) {
    this.confirmacaoService.confirm({
      target: evento.currentTarget as EventTarget,
      message: 'Tem certeza que deseja excluir este usuário?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { severity: 'secondary' },
      acceptButtonProps: { severity: 'danger' },
      accept: async () => {
        try {
          await this.servico.deletarUsuario(usuario.id);
          this.atualizarUsuarios();
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Usuário excluído com sucesso',
          });
        } catch (erro: any) {
          this.erroService.handle(erro);
        }
      },
    });
  }

  private async atualizarUsuarios() {
    this.usuarios = await this.servico.getUsuarios();
  }
}
