import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/pages/home/home').then((m) => m.Home),
  },
  {
    path: 'admin',
    loadChildren: () => import('./core/core.routes').then((m) => m.coreRoutes),
  },
];
