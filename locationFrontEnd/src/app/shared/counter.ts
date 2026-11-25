import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';

@Directive({ selector: '[appCounter]', standalone: true })
export class CounterDirective implements OnInit, OnDestroy {
  target = input.required<number>({ alias: 'appCounter' });
  suffix = input('');
  private el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private io?: IntersectionObserver;

  ngOnInit() {
    this.el.textContent = '0' + this.suffix();
    if (typeof IntersectionObserver === 'undefined') return;
    this.io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { this.run(); this.io?.disconnect(); }
    });
    this.io.observe(this.el);
  }

  private run() {
    const end = this.target(), start = performance.now(), duration = 1600;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      this.el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + this.suffix();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  ngOnDestroy() { this.io?.disconnect(); }
}