import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/paginas/inicio/inicio.component').then((m) => m.InicioComponent),
  },
  {
    path: 'admin',
    loadChildren: () => import('./core/core.routes').then((m) => m.coreRoutes),
  },
  {
    path: 'cartas',
    loadComponent: () => import('./features/cartas/paginas/listagem/listagem.component').then(m => m.ListagemComponent)
  }
];
