import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { UsuarioForm } from './components/usuario-form/usuario-form';
import { IUsuario } from './usuario.interface';
import { UsuariosService } from './usuarios.service';

@Component({
  selector: 'app-usuarios',
  imports: [TableModule, ButtonModule, DynamicDialogModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
  providers: [DialogService],
})
export class Usuarios implements OnInit {
  private service = inject(UsuariosService);
  usuarios: IUsuario[] = [];
  private dialogService = inject(DialogService);
  private dialogRef: DynamicDialogRef | null = null;

  async ngOnInit() {
    this.usuarios = await this.service.getUsuarios();
  }

  openDialog() {
    this.dialogRef = this.dialogService.open(UsuarioForm, {
      header: 'Novo Usuário',
      width: '50%',
    });
  }
}
