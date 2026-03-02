import { Component, inject, OnInit, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { Toast } from 'primeng/toast';
import { Menu } from './core/layout/menu/menu';
import { Config } from './core/services/config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menu, Toast, ConfirmPopup],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  config = inject(Config);
  title = inject(Title);
  titulo = signal('Deck builder MTG');

  ngOnInit(): void {
    this.title.setTitle(`Deck builder MTG - ${this.config.version}`);
  }
}
