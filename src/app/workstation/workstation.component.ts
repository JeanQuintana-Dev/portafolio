import { afterNextRender, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';

@Component({
  selector: 'app-workstation',
  template: `
    <div class="studio">
      <div #stage class="stage">
        <video #player muted loop playsinline preload="auto" poster="/anime-jean-poster.webp"
          aria-label="Jean en anime 2D: programa frente a tres pantallas, revisa su trabajo, te mira, sonríe y saluda antes de continuar."
          (loadeddata)="onReady()" (error)="failed = true">
          <source src="/anime-jean-smooth.mp4" type="video/mp4">
        </video>
        <p class="error" [hidden]="!failed" role="status">No se pudo cargar la animación.</p>
      </div>
      <div class="caption">
        <span>DESARROLLO · DATOS · IA</span>
        <button type="button" (click)="toggle()" [attr.aria-pressed]="paused" [disabled]="failed">{{ paused ? 'Reanudar animación' : 'Pausar animación' }}</button>
      </div>
    </div>`,
  styles: [`
    .studio{width:100%;overflow:hidden;border:1px solid #b6677155;border-radius:24px;background:#2b1820;box-shadow:0 24px 65px #15070c40}
    .stage{position:relative;width:100%;aspect-ratio:1;overflow:hidden;background:#39252b}
    video{display:block;width:100%;height:100%;object-fit:cover}
    .error{position:absolute;bottom:0;left:0;right:0;margin:0;padding:12px;background:#291920e6;color:#fff;text-align:center;font-size:14px}
    .error[hidden]{display:none}
    .caption{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;flex-wrap:wrap;color:#efb9bf;font-size:12px;letter-spacing:.08em}
    .caption button{border:1px solid #efb9bf55;background:#351019;color:#fff;border-radius:8px;padding:9px 12px;font-size:14px;letter-spacing:0}
    .caption button:focus-visible{outline:2px solid #fff;outline-offset:3px}
    .caption button:disabled{opacity:.55}
  `]
})
export class WorkstationComponent implements OnDestroy {
  @ViewChild('stage') stage!: ElementRef<HTMLDivElement>;
  @ViewChild('player') player!: ElementRef<HTMLVideoElement>;
  failed = false;
  paused = true;
  private initialized = false;
  private visible = true;
  private destroyed = false;
  private playAttempt = 0;
  private cleanup = () => {};
  constructor(private zone: NgZone) { afterNextRender(() => this.init()); }
  toggle() { this.paused = !this.paused; this.syncPlayback(); }
  onReady() { if (this.initialized) this.syncPlayback(); }
  ngOnDestroy() { this.destroyed = true; this.cleanup(); }
  private syncPlayback() {
    if (!this.initialized || this.destroyed) return;
    const video = this.player.nativeElement;
    const attempt = ++this.playAttempt;
    if (this.paused || !this.visible || document.hidden) { video.pause(); return; }
    void video.play().catch(() => {
      if (!this.destroyed && attempt === this.playAttempt && this.visible && !document.hidden) {
        this.zone.run(() => { this.paused = true; });
      }
    });
  }
  private init() {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    this.paused = reduced.matches;
    this.player.nativeElement.muted = true;
    this.initialized = true;
    const preference = () => this.zone.run(() => { this.paused = reduced.matches; this.syncPlayback(); });
    reduced.addEventListener('change', preference);
    const observer = new IntersectionObserver(([entry]) => { this.visible = entry.isIntersecting; this.syncPlayback(); });
    observer.observe(this.stage.nativeElement);
    const visibility = () => this.syncPlayback();
    document.addEventListener('visibilitychange', visibility);
    this.syncPlayback();
    this.cleanup = () => {
      this.player.nativeElement.pause();
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      reduced.removeEventListener('change', preference);
    };
  }
}
