import { afterNextRender, Directive, ElementRef, Injectable, Input, NgZone, OnDestroy } from '@angular/core';

interface ScrollItem {
  node: HTMLElement;
  distance: number;
  stagger: number;
  rise: number;
  opacity: number;
}

/** One scroll listener and one layout/read-write pass for every reveal on the page. */
@Injectable({ providedIn: 'root' })
class ScrollReveal implements OnDestroy {
  private items = new Set<ScrollItem>();
  private frame = 0;
  private motion?: MediaQueryList;
  private resize?: ResizeObserver;
  private schedule = () => {
    if (!this.frame && !document.hidden) this.frame = requestAnimationFrame(() => this.paint());
  };

  add(node: HTMLElement, distance: number, stagger: number): () => void {
    if (!this.motion) {
      this.motion = matchMedia('(prefers-reduced-motion: reduce)');
      window.addEventListener('scroll', this.schedule, { passive: true });
      window.addEventListener('resize', this.schedule, { passive: true });
      document.addEventListener('visibilitychange', this.schedule);
      this.motion.addEventListener('change', this.schedule);
      if ('ResizeObserver' in window) this.resize = new ResizeObserver(this.schedule);
    }
    const item: ScrollItem = { node, distance: Math.max(0, Math.min(distance, 140)), stagger: Math.max(0, Math.min(stagger, 240)) * .15, rise: 0, opacity: 1 };
    this.items.add(item);
    this.resize?.observe(node);
    node.addEventListener('focusin', this.schedule);
    node.addEventListener('focusout', this.schedule);
    this.schedule();
    return () => {
      this.items.delete(item);
      this.resize?.unobserve(node);
      node.removeEventListener('focusin', this.schedule);
      node.removeEventListener('focusout', this.schedule);
      node.classList.remove('motion-scroll');
      node.style.removeProperty('--motion-rise');
      node.style.removeProperty('--motion-opacity');
    };
  }

  private paint() {
    this.frame = 0;
    const height = document.documentElement.clientHeight;
    const reduced = this.motion?.matches;
    // Remove our own transform from measurements to avoid feedback and jitter.
    // Long sections enter based on their top, never on their total height.
    const frames = [...this.items].map(item => {
      const top = item.node.getBoundingClientRect().top - item.rise;
      const focused = item.node.contains(document.activeElement);
      const progress = reduced || focused ? 1 : Math.max(0, Math.min(1, (height * .96 - top - item.stagger) / (height * .54)));
      const eased = 1 - (1 - progress) ** 3;
      const alpha = Math.min(1, progress / .7);
      return { item, rise: item.distance * (1 - eased), opacity: alpha * alpha * (3 - 2 * alpha) };
    });
    for (const { item, rise, opacity } of frames) {
      if (Math.abs(item.rise - rise) > .01 || Math.abs(item.opacity - opacity) > .001 || !item.node.classList.contains('motion-scroll')) {
        item.node.style.setProperty('--motion-rise', `${rise.toFixed(2)}px`);
        item.node.style.setProperty('--motion-opacity', opacity.toFixed(3));
        item.node.classList.add('motion-scroll');
        item.rise = rise;
        item.opacity = opacity;
      }
    }
  }

  ngOnDestroy() {
    if (!this.motion) return; // The service is also constructed during server rendering.
    cancelAnimationFrame(this.frame);
    window.removeEventListener('scroll', this.schedule);
    window.removeEventListener('resize', this.schedule);
    document.removeEventListener('visibilitychange', this.schedule);
    this.motion?.removeEventListener('change', this.schedule);
    this.resize?.disconnect();
  }
}

@Directive({ selector: '[appReveal]', host: { class: 'motion-item' } })
export class RevealDirective implements OnDestroy {
  @Input() motionDelay = 0;
  @Input() motionDistance = 80;
  private cleanup = () => {};
  constructor(element: ElementRef<HTMLElement>, zone: NgZone, reveal: ScrollReveal) {
    afterNextRender(() => zone.runOutsideAngular(() => {
      this.cleanup = reveal.add(element.nativeElement, this.motionDistance, this.motionDelay);
    }));
  }
  ngOnDestroy() { this.cleanup(); }
}
