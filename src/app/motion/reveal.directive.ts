import { afterNextRender, Directive, ElementRef, Input, NgZone, OnDestroy } from '@angular/core';

@Directive({ selector: '[appReveal]', host: { class: 'motion-item' } })
export class RevealDirective implements OnDestroy {
  @Input() motionDelay = 0;
  private cleanup = () => {};
  constructor(element: ElementRef<HTMLElement>, zone: NgZone) {
    afterNextRender(() => zone.runOutsideAngular(() => {
      const node = element.nativeElement;
      const motion = matchMedia('(prefers-reduced-motion: reduce)');
      if (motion.matches || !('IntersectionObserver' in window)) return;
      node.style.setProperty('--motion-delay', `${Math.min(this.motionDelay, 240)}ms`);
      node.classList.add('motion-pending');
      const reveal = () => { node.classList.remove('motion-pending'); node.classList.add('motion-in'); observer.disconnect(); };
      const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) reveal(); }, { threshold: .06, rootMargin: '0px 0px -24px 0px' });
      const preference = () => { if (motion.matches) reveal(); };
      observer.observe(node);
      motion.addEventListener('change', preference);
      this.cleanup = () => { observer.disconnect(); motion.removeEventListener('change', preference); };
    }));
  }
  ngOnDestroy() { this.cleanup(); }
}
