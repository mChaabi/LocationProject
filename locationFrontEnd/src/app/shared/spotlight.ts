import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appSpotlight]',
  standalone: true,
  host: { '(pointermove)': 'move($event)' },
})
export class SpotlightDirective {
  private el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  move(e: PointerEvent) {
    const r = this.el.getBoundingClientRect();
    this.el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    this.el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }
}
