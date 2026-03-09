import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SimbolosService } from '@core/servicos/simbolos.service';

@Pipe({
  name: 'simbolos',
  standalone: true,
})
export class SimbolosPipe implements PipeTransform {
  private readonly simbolosService = inject(SimbolosService);
  private readonly sanitizer = inject(DomSanitizer);

  transform(texto: string | undefined): SafeHtml {
    if (!texto) return '';

    // Expressão regular para encontrar conteúdos entre chaves: {W}, {1}, {T}, etc.
    const regex = /\{([^}]+)\}/g;

    const htmlProcessado = texto.replace(regex, (match) => {
      const svgUri = this.simbolosService.obterSvg(match);

      if (svgUri) {
        return `<img src="${svgUri}" alt="${match}" class="inline-block w-4 h-4 align-text-bottom mx-0.5" />`;
      }

      return match; // Fallback para o texto original entre chaves
    });

    return this.sanitizer.bypassSecurityTrustHtml(htmlProcessado);
  }
}
