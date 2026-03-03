import { Component, inject, OnInit, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { Toast } from 'primeng/toast';
import { MenuComponent } from './core/layout/menu/menu.component';
import { ConfiguracaoService } from '@core/servicos/configuracao.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuComponent, Toast, ConfirmPopup],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private configuracaoService = inject(ConfiguracaoService);
  title = inject(Title);
  titulo = signal('Deck builder MTG');

  ngOnInit(): void {
    const versao = this.configuracaoService.valor?.version ?? '';
    this.title.setTitle(`Deck builder MTG - ${versao}`);
  }
}
