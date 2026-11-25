import { Directive, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';

@Directive({ selector: '[appReveal]', standalone: true })
export class RevealDirective implements OnInit, OnDestroy {
  private node = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private io?: IntersectionObserver;

  ngOnInit() {
    if (typeof IntersectionObserver === 'undefined') return;
    this.node.classList.add('reveal');
    this.io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { this.node.classList.add('in'); this.io?.disconnect(); }
    }, { threshold: .15 });
    this.io.observe(this.node);
  }
  ngOnDestroy() { this.io?.disconnect(); }
}