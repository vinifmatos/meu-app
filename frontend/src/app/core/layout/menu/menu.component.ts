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
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {
  titulo = input<string>();

  itens: MenuItem[] = [
    {
      label: 'Decks',
      items: [
        {
          label: 'Home',
          icon: 'pi pi-home',
          routerLink: '/',
        },
      ],
    },
    {
      label: 'Admin',
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
