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
  },
  {
    path: 'cartas/:id',
    loadComponent: () => import('./features/cartas/paginas/detalhes/detalhes.component').then(m => m.DetalhesComponent)
  },
  {
    path: 'decks',
    loadComponent: () => import('./features/decks/paginas/listagem/listagem.component').then(m => m.ListagemDecksComponent)
  },
  {
    path: 'decks/:id',
    loadComponent: () => import('./features/decks/paginas/editor/editor.component').then(m => m.EditorDeckComponent)
  }
];
