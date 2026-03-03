import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-menu',
  imports: [MenuModule, BadgeModule, RippleModule, AvatarModule, CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  titulo = input<string>();

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
          icon: 'pi pi-search',
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
