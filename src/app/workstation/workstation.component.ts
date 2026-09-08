import { afterNextRender, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';

@Component({
  selector: 'app-workstation',
  template: `
    <div class="studio">
      <div #stage class="stage" role="img" aria-label="Animación anime 2D de Jean con gafas, rizos y barba en un estudio acogedor. Programa frente a tres pantallas, revisa su trabajo, te mira, sonríe y saluda antes de continuar.">
        <div class="frames" [class.loaded]="ready" [style.background-position]="position"></div>
        <p class="loading" [hidden]="ready" role="status">{{ failed ? 'No se pudo cargar la animación.' : 'Preparando el estudio de Jean…' }}</p>
      </div>
      <div class="caption">
        <span>DESARROLLO · DATOS · IA</span>
        <button type="button" (click)="toggle()" [attr.aria-pressed]="paused" [disabled]="!ready">{{ paused ? 'Reanudar animación' : 'Pausar animación' }}</button>
      </div>
    </div>`,
  styles: [`
    .studio{width:100%;overflow:hidden;border:1px solid #b6677155;border-radius:24px;background:#2b1820;box-shadow:0 24px 65px #15070c40}
    .stage{position:relative;width:100%;aspect-ratio:1;overflow:hidden;background:#39252b}
    .frames{position:absolute;inset:0;background-image:url('/anime-jean-studio.webp');background-size:400% 400%;background-repeat:no-repeat;opacity:0}
    .frames.loaded{opacity:1}
    .loading{position:absolute;inset:40% 10%;color:#f0d4d8;text-align:center;font-size:16px}
    .loading[hidden]{display:none}
    .caption{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;flex-wrap:wrap;color:#efb9bf;font-size:12px;letter-spacing:.08em}
    .caption button{border:1px solid #efb9bf55;background:#351019;color:#fff;border-radius:8px;padding:9px 12px;font-size:14px;letter-spacing:0}
    .caption button:focus-visible{outline:2px solid #fff;outline-offset:3px}
    .caption button:disabled{opacity:.55}
  `]
})
export class WorkstationComponent implements OnDestroy {
  @ViewChild('stage') stage!: ElementRef<HTMLDivElement>;
  ready = false;
  failed = false;
  paused = false;
  position = '0% 0%';
  private destroyed = false;
  private cleanup = () => {};

  constructor(private zone: NgZone) {
    afterNextRender(() => this.init());
  }
  toggle() { this.paused = !this.paused; }
  ngOnDestroy() { this.destroyed = true; this.cleanup(); }

  private init() {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    this.paused = reduced.matches;
    const preference = () => this.zone.run(() => { this.paused = reduced.matches; });
    reduced.addEventListener('change', preference);
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(this.stage.nativeElement);
    // Deliberately held anime poses: work, review, turn, greet and return.
    const timeline: [number, number][] = [];
    for (let repeat = 0; repeat < 4; repeat++) for (let frame = 0; frame < 4; frame++) timeline.push([frame, 180]);
    timeline.push([4, 850], [5, 200], [6, 220], [7, 250]);
    for (let repeat = 0; repeat < 3; repeat++) for (const frame of [8, 9, 10, 11, 10, 9]) timeline.push([frame, 170]);
    timeline.push([12, 300], [13, 220], [14, 220], [15, 300]);
    const total = timeline.reduce((sum, [,duration]) => sum + duration, 0);
    let time = 0, previous = 0, handle = 0, shown = -1;
    const tick = (now: number) => {
      if (this.destroyed) return;
      handle = requestAnimationFrame(tick);
      const delta = Math.min(now - previous, 80); previous = now;
      if (!this.ready || !visible || document.hidden || this.paused) return;
      time = (time + delta) % total;
      let elapsed = 0;
      for (const [frame, duration] of timeline) {
        elapsed += duration;
        if (time < elapsed) {
          if (shown !== frame) {
            shown = frame;
            this.zone.run(() => { this.position = `${(frame % 4) * 100 / 3}% ${Math.floor(frame / 4) * 100 / 3}%`; });
          }
          break;
        }
      }
    };
    const sprite = new Image();
    sprite.onload = () => {
      if (this.destroyed) return;
      this.zone.run(() => { this.ready = true; });
      this.zone.runOutsideAngular(() => { handle = requestAnimationFrame(tick); });
    };
    sprite.onerror = () => { if (!this.destroyed) this.zone.run(() => { this.failed = true; }); };
    sprite.src = '/anime-jean-studio.webp';
    this.cleanup = () => {
      cancelAnimationFrame(handle);
      observer.disconnect();
      reduced.removeEventListener('change', preference);
      sprite.onload = null; sprite.onerror = null;
    };
  }
}
