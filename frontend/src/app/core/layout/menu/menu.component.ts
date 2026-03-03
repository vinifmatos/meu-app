import { CommonModule } from '@angular/common';
import { Component, input, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { TemaService } from '../../servicos/tema.service';

@Component({
  selector: 'app-menu',
  imports: [MenuModule, BadgeModule, RippleModule, AvatarModule, CommonModule, ButtonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  private readonly temaService = inject(TemaService);
  titulo = input<string>();
  
  isDarkMode = this.temaService.isDarkMode;

  toggleTema(): void {
    this.temaService.toggleTema();
  }

  itens: MenuItem[] = [
    {
      label: 'Decks',
      items: [
        {
          label: 'Início',
          icon: 'pi pi-home',
          routerLink: '/',
        },
        {
          label: 'Cartas',
          icon: 'pi pi-objects-column',
          routerLink: '/cartas',
        },
      ],
    },
    {
      label: 'Administração',
      items: [
        {
          label: 'Usuários',
          icon: 'pi pi-users',
          routerLink: '/admin/usuarios',
        },
      ],
    },
  ];
}
