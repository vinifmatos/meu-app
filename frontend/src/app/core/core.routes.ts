import { Routes } from '@angular/router';

export const coreRoutes: Routes = [
  {
    path: 'usuarios',
    loadComponent: () => import('./pages/admin/usuarios/usuarios').then((m) => m.Usuarios),
  },
];
