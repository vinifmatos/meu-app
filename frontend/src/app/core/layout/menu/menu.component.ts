import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../servicos/auth.service';
import { TemaService } from '../../servicos/tema.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    MenuModule,
    BadgeModule,
    RippleModule,
    AvatarModule,
    CommonModule,
    ButtonModule,
    RouterLink,
    DividerModule,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  private readonly temaService = inject(TemaService);
  private readonly authService = inject(AuthService);

  titulo = input<string>();

  isDarkMode = this.temaService.isDarkMode;
  estaAutenticado = this.authService.estaAutenticado;
  isAdmin = this.authService.isAdmin;
  usuario = this.authService.usuario;

  toggleTema(): void {
    this.temaService.toggleTema();
  }

  logout(): void {
    this.authService.logout();
  }

  itens = computed<MenuItem[]>(() => {
    const auth = this.estaAutenticado();
    const admin = this.isAdmin();

    const menu: MenuItem[] = [
      {
        label: 'Cartas e Decks',
        items: [
          { label: 'Cartas', icon: 'pi pi-objects-column', routerLink: '/cartas' },
          { label: 'Decks', icon: 'pi pi-clone', routerLink: '/decks' },
        ],
      },
    ];

    if (auth) {
      menu.push({
        label: 'Meu Espaço',
        items: [
          { label: 'Meus Decks', icon: 'pi pi-clone', routerLink: '/meus-decks' },
        ],
      });
    }

    if (admin) {
      menu.push({
        label: 'Administração',
        items: [{ label: 'Usuários', icon: 'pi pi-users', routerLink: '/admin/usuarios' }],
      });
    }

    return menu;
  });
}
