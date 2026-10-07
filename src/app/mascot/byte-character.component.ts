import { afterNextRender, Component, ElementRef, Input, NgZone, OnChanges, OnDestroy, ViewChild } from '@angular/core';

export type ByteGesture = 'idle' | 'walk' | 'wave' | 'yawn' | 'smile' | 'think' | 'dance';
const hold = (frame: number, count: number) => Array<number>(count).fill(frame);
export const byteFrames: Record<ByteGesture, readonly number[]> = {
  idle: [...hold(24, 34), 19, 20, 19, ...hold(24, 34)],
  walk: [0, 1, 2, 3, 4, 5],
  wave: [...hold(24, 2), 7, 7, ...Array.from({ length: 8 }, () => [8, 9]).flat(), 7, 7, 6, 6, ...hold(24, 4)],
  yawn: [...hold(24, 2), 12, 12, ...hold(13, 3), ...hold(14, 4), ...hold(15, 8), ...hold(14, 4), ...hold(13, 3), 16, 16, 17, 17, ...hold(24, 4)],
  smile: [24, 24, 21, 21, ...hold(22, 12), ...hold(21, 3), ...hold(24, 5)],
  think: [24, 24, ...hold(23, 18), ...hold(24, 4)],
  dance: Array.from({ length: 4 }, () => [0, 1, 2, 3, 4, 5]).flat()
};

@Component({
  selector: 'app-byte-character',
  templateUrl: './byte-character.component.html',
  styleUrl: './byte-character.component.css',
  host: { '[attr.data-gesture]': 'gesture', 'aria-hidden': 'true' }
})
export class ByteCharacterComponent implements OnChanges, OnDestroy {
  @Input() gesture: ByteGesture = 'idle';
  @Input() sequence = 0;
  @Input() active = true;
  @Input() animated = true;
  @ViewChild('frame') frame?: ElementRef<HTMLElement>;
  private ready = false; private destroyed = false; private reduced = false;
  private raf = 0; private epoch = 0; private displayedFrame = -1;
  private cleanup = () => {};

  constructor(private zone: NgZone) {
    afterNextRender(() => this.zone.runOutsideAngular(() => {
      this.ready = true;
      const motion = matchMedia('(prefers-reduced-motion: reduce)');
      const change = () => { this.reduced = motion.matches; this.sync(); };
      const visibility = () => this.sync();
      motion.addEventListener('change', change);
      document.addEventListener('visibilitychange', visibility);
      this.cleanup = () => { motion.removeEventListener('change', change); document.removeEventListener('visibilitychange', visibility); };
      change();
    }));
  }
  ngOnChanges() { this.epoch = 0; if (this.ready) this.zone.runOutsideAngular(() => this.sync()); }
  private sync() {
    this.stop();
    if (!this.active || this.reduced || !this.animated || document.hidden) { this.paint(24); return; }
    this.raf = requestAnimationFrame(this.tick);
  }
  private tick = (time: number) => {
    this.raf = 0;
    if (this.destroyed || !this.active || this.reduced || !this.animated || document.hidden) return;
    if (!this.epoch) this.epoch = time;
    const frames = byteFrames[this.gesture];
    const index = Math.floor((time - this.epoch) / (this.gesture === 'walk' ? 1000 / 12 : 100));
    const looping = this.gesture === 'walk' || this.gesture === 'idle';
    this.paint(frames[looping ? index % frames.length : Math.min(index, frames.length - 1)]);
    this.raf = requestAnimationFrame(this.tick);
  };
  private paint(frame: number) {
    const node = this.frame?.nativeElement;
    if (!node || frame === this.displayedFrame) return;
    this.displayedFrame = frame;
    node.style.backgroundPosition = `${(frame % 6) * 20}% ${Math.floor(frame / 6) * 25}%`;
    node.dataset['frame'] = String(frame);
    node.classList.toggle('show-gaze', frame === 24 && this.animated && !this.reduced);
  }
  private stop() { if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0; }
  ngOnDestroy() { this.destroyed = true; this.stop(); this.cleanup(); }
}
