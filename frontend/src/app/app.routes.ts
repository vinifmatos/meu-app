import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/pages/home/home').then((m) => m.Home),
  },
];
