import { Routes } from '@angular/router';

export const coreRoutes: Routes = [
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./paginas/admin/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
  },
  {
    path: 'importacoes',
    loadComponent: () =>
      import('./paginas/admin/importacao-scryfall/importacao-scryfall.component').then(
        (m) => m.ImportacaoScryfallComponent,
      ),
  },
];
