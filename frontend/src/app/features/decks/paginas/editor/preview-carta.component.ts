import { Component, input, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Carta } from '@core/interfaces/cartas.interface';

@Component({
  selector: 'app-preview-carta',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  template: `
    @if (carta()) {
      <div class="fixed z-[9999] pointer-events-none shadow-2xl rounded-xl overflow-hidden border border-surface bg-surface-emphasis animate-in fade-in zoom-in duration-200"
           [style.left.px]="x() + 20"
           [style.top.px]="y() - 150">
        <div class="relative w-[250px] h-[350px]">
          <img [ngSrc]="obterImagemNormal(carta()!)" 
               [alt]="carta()!.name" 
               fill 
               class="object-contain"
               priority />
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PreviewCartaComponent {
  carta = input<Carta | null>(null);
  x = input<number>(0);
  y = input<number>(0);

  obterImagemNormal(c: Carta): string {
    return c.imageUris?.normal ?? c.faces[0]?.imageUris?.normal ?? '/card.png';
  }
}
