import { afterNextRender, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import type { ShaderInstance } from 'shaders/js';

@Component({
  selector: 'app-ambient',
  template: '<canvas #canvas aria-hidden="true" style="width:100%;height:100%"></canvas>',
  styles: [':host{display:block;position:absolute;inset:0;pointer-events:none;opacity:.48}canvas{display:block;transition:opacity .4s}']
})
export class AmbientComponent implements OnDestroy {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  private shader?: ShaderInstance;
  private destroyed = false;
  private cleanup = () => {};

  constructor() { afterNextRender(() => { void this.init(); }); }
  ngOnDestroy() { this.destroyed = true; this.cleanup(); this.shader?.destroy(); }

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
        onError: () => { canvas.style.opacity = '0'; } });
      if (this.destroyed) { shader.destroy(); return; }
      this.shader = shader;
      let visible = true;
      const sync = () => {
        if (motion.matches || document.hidden || !visible) shader.pause();
        else shader.resume();
      };
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
