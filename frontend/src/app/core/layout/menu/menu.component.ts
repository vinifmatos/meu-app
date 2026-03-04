import { CommonModule } from '@angular/common';
import { Component, input, inject, computed } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { TemaService } from '../../servicos/tema.service';
import { AuthService } from '../../servicos/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [MenuModule, BadgeModule, RippleModule, AvatarModule, CommonModule, ButtonModule, RouterLink],
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
        label: 'Geral',
        items: [
          { label: 'Início', icon: 'pi pi-home', routerLink: '/' },
          { label: 'Cartas', icon: 'pi pi-objects-column', routerLink: '/cartas' },
          { label: 'Explorar Decks', icon: 'pi pi-search', routerLink: '/decks' },
        ],
      }
    ];

    if (admin) {
      menu.push({
        label: 'Administração',
        items: [
          { label: 'Usuários', icon: 'pi pi-users', routerLink: '/admin/usuarios' },
        ],
      });
    }

    return menu;
  });
}
