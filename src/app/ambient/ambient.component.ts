import { afterNextRender, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import type { ShaderInstance } from 'shaders/js';

@Component({
  selector: 'app-ambient',
  template: `<canvas #canvas aria-hidden="true" style="width:100%;height:100%"></canvas>
    <button type="button" [hidden]="!ready" (click)="toggle()" [attr.aria-pressed]="paused" [disabled]="reduced">
      {{ paused || reduced ? 'Fondo en pausa' : 'Pausar fondo' }}
    </button>`,
  styles: [':host{display:block;position:absolute;inset:0;pointer-events:none;}canvas{display:block;opacity:.48;transition:opacity .4s}button{position:absolute;right:1rem;top:1rem;z-index:2;pointer-events:auto;border:1px solid #efb9bf60;border-radius:999px;background:#341319;color:#ffe8ec;padding:.45rem .8rem;font-size:.875rem}button[hidden]{display:none}']
})
export class AmbientComponent implements OnDestroy {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  ready = false;
  paused = false;
  reduced = false;
  private sync = () => {};
  private shader?: ShaderInstance;
  private destroyed = false;
  private cleanup = () => {};

  constructor(private zone: NgZone) { afterNextRender(() => { void this.init(); }); }
  ngOnDestroy() { this.destroyed = true; this.cleanup(); this.shader?.destroy(); }

  toggle() { this.paused = !this.paused; this.sync(); }

  private async init() {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    if (!('gpu' in navigator) || motion.matches) return;
    try {
      const [{ createShader }, { default: flowing }] = await Promise.all([
        import('shaders/js'), import('shaders/core/FlowingGradient')
      ]);
      if (this.destroyed) return;
      const canvas = this.canvas.nativeElement;
      const shader = await createShader(canvas, {
        components: [{ type: 'FlowingGradient', props: {
          colorA: '#20090f', colorB: '#681920', colorC: '#883235', colorD: '#c87983',
          speed: .18, distortion: .65, seed: 7
        } }]
      }, { components: [flowing], disableTelemetry: true, observeElement: false,
        onError: () => { canvas.style.opacity = '0'; this.zone.run(() => this.ready = false); } });
      if (this.destroyed) { shader.destroy(); return; }
      this.shader = shader;
      this.zone.run(() => this.ready = !shader.getFailureReason());
      let visible = true;
      const sync = () => {
        this.zone.run(() => this.reduced = motion.matches);
        if (this.paused || motion.matches || document.hidden || !visible) shader.pause();
        else shader.resume();
      };
      this.sync = sync;
      const resize = new ResizeObserver(() => shader.resize());
      const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
      resize.observe(canvas); visibility.observe(canvas);
      motion.addEventListener('change', sync);
      document.addEventListener('visibilitychange', sync);
      sync();
      this.cleanup = () => {
        resize.disconnect(); visibility.disconnect();
        motion.removeEventListener('change', sync);
        document.removeEventListener('visibilitychange', sync);
      };
    } catch { /* The CSS gradient remains available when WebGPU cannot render. */ }
  }
}
