import { afterNextRender, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import type { ShaderInstance } from 'shaders/js';

@Component({
  selector: 'app-ambient',
  template: `<div class="ambient-wash" aria-hidden="true"><span class="glow glow-a"></span><span class="glow glow-b"></span><div class="ambient-grid"></div><svg class="contours" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice"><path d="M-100 650C200 100 550 950 1300 150"/><path d="M-100 690C240 160 620 990 1300 210"/><path d="M-100 730C280 220 690 1030 1300 270"/></svg></div><canvas #canvas aria-hidden="true" style="width:100%;height:100%"></canvas>`,
  styles: [`:host{display:block;position:absolute;inset:0;pointer-events:none;overflow:hidden}canvas{position:absolute;inset:0;display:block;opacity:.48;transition:opacity .4s}.ambient-wash{position:absolute;inset:0;overflow:hidden}.glow{position:absolute;width:55vw;min-width:400px;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#b65c6960,transparent 65%);will-change:transform}.glow-a{right:-15%;top:-40%;animation:drift-a 22s ease-in-out infinite alternate}.glow-b{left:-25%;bottom:-60%;background:radial-gradient(circle,#efb9bf26,transparent 65%);animation:drift-b 28s ease-in-out infinite alternate}.ambient-grid{position:absolute;inset:0;background-image:linear-gradient(#efb9bf0a 1px,transparent 1px),linear-gradient(90deg,#efb9bf0a 1px,transparent 1px);background-size:72px 72px;mask-image:linear-gradient(90deg,transparent,#000)}.contours{position:absolute;inset:0;width:100%;height:100%;fill:none;stroke:#efb9bf24;stroke-width:1;stroke-dasharray:300 1800;animation:flow-lines 24s linear infinite}@keyframes flow-lines{to{stroke-dashoffset:-2100}}@keyframes drift-a{to{transform:translate(-12%,25%) scale(1.16)}}@keyframes drift-b{to{transform:translate(20%,-20%) scale(.92)}}@media(prefers-reduced-motion:reduce){.glow,.contours{animation:none;will-change:auto}}`]

})
export class AmbientComponent implements OnDestroy {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  ready = false;
  reduced = false;
  private shader?: ShaderInstance;
  private destroyed = false;
  private cleanup = () => {};

  constructor(private zone: NgZone) { afterNextRender(() => { void this.init(); }); }
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
        onError: () => { canvas.style.opacity = '0'; this.zone.run(() => this.ready = false); } });
      if (this.destroyed) { shader.destroy(); return; }
      this.shader = shader;
      this.zone.run(() => this.ready = !shader.getFailureReason());
      let visible = true;
      const sync = () => {
        this.zone.run(() => this.reduced = motion.matches);
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
