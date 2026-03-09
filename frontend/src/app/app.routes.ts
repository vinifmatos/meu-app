import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { adminGuard } from '@core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/paginas/inicio/inicio.component').then((m) => m.InicioComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./core/paginas/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./core/paginas/registro/registro').then((m) => m.RegistroComponent),
  },
  {
    path: 'confirmar-conta',
    loadComponent: () =>
      import('./core/paginas/confirmar-conta/confirmar-conta').then(
        (m) => m.ConfirmarContaComponent,
      ),
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./core/paginas/perfil/perfil').then((m) => m.PerfilComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./core/core.routes').then((m) => m.coreRoutes),
  },
  {
    path: 'cartas',
    loadComponent: () =>
      import('./features/cartas/paginas/listagem/listagem.component').then(
        (m) => m.ListagemComponent,
      ),
  },
  {
    path: 'cartas/:id',
    loadComponent: () =>
      import('./features/cartas/paginas/detalhes/detalhes.component').then(
        (m) => m.DetalhesComponent,
      ),
  },
  {
    path: 'decks',
    loadComponent: () =>
      import('./features/decks/paginas/listagem/listagem.component').then(
        (m) => m.ListagemDecksComponent,
      ),
  },
  {
    path: 'meus-decks',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/decks/paginas/listagem/listagem.component').then(
        (m) => m.ListagemDecksComponent,
      ),
    data: { apenasMeus: true },
  },
  {
    path: 'decks/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/decks/paginas/editor/editor.component').then((m) => m.EditorDeckComponent),
  },
];
