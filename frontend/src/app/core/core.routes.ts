import { Routes } from '@angular/router';

export const coreRoutes: Routes = [
  {
    path: 'usuarios',
    loadComponent: () => import('./paginas/admin/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
  },
];
