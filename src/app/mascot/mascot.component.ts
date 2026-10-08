import { afterNextRender, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { advanceBody, ByteBody, ByteBounds, clamp } from './byte-physics';
import { FormsModule } from '@angular/forms';
import { quickTopics, replyTo } from './replies';
import { ByteCharacterComponent, ByteGesture } from './byte-character.component';

@Component({ selector: 'app-mascot', imports: [FormsModule, ByteCharacterComponent], templateUrl: './mascot.component.html', styleUrl: './mascot.component.css' })
export class MascotComponent implements OnDestroy {
  @ViewChild('actor') actor!: ElementRef<HTMLElement>;
  @ViewChild('spriteButton') spriteButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('messagesBox') messagesBox?: ElementRef<HTMLElement>;
  @ViewChild('closeButton') closeButton?: ElementRef<HTMLButtonElement>;
  readonly topics = quickTopics;
  messages: { author: 'byte' | 'you'; text: string }[] = [{ author: 'byte', text: '¡Hola! Soy Byte, compañero de píxeles de Jean. ¿Exploramos su trabajo? 🕹️' }];
  input = ''; open = false; hidden = false; paused = false; reduced = false;
  gesture: ByteGesture = 'idle';
  gestureSequence = 0;
  bubble = '¡Hola! Soy Byte. Tócame 🕹️'; panelLeft = 24;
  private raf = 0; private lastTime = 0; private target = 24;
  private body: ByteBody = { x: 24, y: 0, vx: 0, vy: 0, bounced: false };
  private get x() { return this.body.x; }
  private set x(value: number) { this.body.x = value; }
  dragging = false; falling = false;
  private suppressClick = false;
  private held?: { id: number; startX: number; startY: number; offsetX: number; offsetY: number; lastX: number; lastY: number; lastTime: number; vx: number; vy: number };
  private get floorTop() { return innerHeight - this.actor.nativeElement.offsetHeight - (innerWidth <= 767 ? 12 : 14); }
  private get bounds(): ByteBounds { return { left: 8, right: Math.max(8, innerWidth - this.actor.nativeElement.offsetWidth - 24), ceiling: Math.min(0, 8 - this.floorTop) }; }
  private pointerX = 0; private pointerY = 0; private eyeX = 0; private eyeY = 0;
  private nextWalk = 0; private engaged = false; private fine = false; private motion?: MediaQueryList;
  private gestureUntil = 0; private nextGesture = 0; private gestureIndex = 0;
  private readonly idleGestures: ByteGesture[] = ['smile', 'think', 'yawn', 'wave'];
  private cleanup = () => {}; private destroyed = false;

  constructor(private zone: NgZone) { afterNextRender(() => this.zone.runOutsideAngular(() => this.init())); }
  private init() {
    this.motion = matchMedia('(prefers-reduced-motion: reduce)');
    const input = matchMedia('(pointer: fine)');
    const resize = () => {
      this.fine = input.matches && innerWidth > 767;
      this.x = clamp(this.x, this.bounds.left, this.bounds.right);
      this.body.y = clamp(this.body.y, this.bounds.ceiling, 0);
      this.target = clamp(this.target, 16, Math.max(16, innerWidth - 160));
      this.renderPosition();
      this.zone.run(() => this.panelLeft = innerWidth <= 767 ? 16 : clamp(this.x, 24, innerWidth - 392));
    };
    const move = (event: PointerEvent) => this.movePointer(event);
    const release = (event: PointerEvent) => this.releasePointer(event.pointerId);
    const blur = () => this.releasePointer();
    const visibility = () => { if (document.hidden) { this.releasePointer(); this.stop(); } else this.start(); };
    const motion = () => { this.zone.run(() => this.reduced = !!this.motion?.matches); if (this.reduced) { this.stop(); this.actor.nativeElement.style.setProperty('--eye-x', '0px'); this.actor.nativeElement.style.setProperty('--eye-y', '0px'); this.body.y = 0; this.body.vx = this.body.vy = 0; this.falling = false; this.renderPosition(); this.setGesture('idle'); } else this.start(); };
    let saved = false;
    try { saved = sessionStorage.getItem('byte-hidden') === 'true'; } catch { /* Storage can be unavailable in private browsers. */ }
    this.zone.run(() => this.hidden = saved);
    this.pointerX = innerWidth / 2; this.pointerY = innerHeight / 2;
    resize(); motion();
    this.nextWalk = performance.now() + 5000;
    this.zone.run(() => this.perform('wave'));
    window.addEventListener('pointermove', move, { passive: true }); window.addEventListener('pointerup', release); window.addEventListener('pointercancel', release); window.addEventListener('blur', blur); window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', visibility); this.motion.addEventListener('change', motion); input.addEventListener('change', resize);
    this.cleanup = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', release); window.removeEventListener('pointercancel', release); window.removeEventListener('blur', blur); window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', visibility); this.motion?.removeEventListener('change', motion); input.removeEventListener('change', resize); };
  }
  private start() { if (!this.raf && !this.destroyed && !this.hidden && !this.reduced && !document.hidden) { this.lastTime = 0; this.raf = requestAnimationFrame(this.tick); } }
  private stop() { if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0; }
  private tick = (time: number) => {
    this.raf = 0;
    if (this.destroyed || this.hidden || this.reduced || document.hidden) return;
    const dt = this.lastTime ? Math.min(time - this.lastTime, 50) : 16; this.lastTime = time;
    const node = this.actor.nativeElement;
    if (this.falling && !this.dragging) {
      const result = advanceBody(this.body, this.bounds, dt / 1000);
      this.body = result.body;
      if (result.settled) {
        this.zone.run(() => { this.falling = false; this.perform('landed'); this.bubble = '¡Uf! Aterrizaje completado. Todo bajo control.'; });
        this.engaged = this.open;
      }
    }
    const performing = time < this.gestureUntil;
    const canWalk = this.fine && !this.paused && !this.engaged && !this.open && !performing && !this.dragging && !this.falling;
    if (!performing && !this.open && !this.dragging && !this.falling && time > this.nextGesture) {
      this.zone.run(() => this.perform(this.idleGestures[this.gestureIndex++ % this.idleGestures.length]));
    }
    if (canWalk && time > this.nextWalk && time >= this.gestureUntil) { this.target = 24 + Math.random() * Math.max(0, innerWidth - 210); this.nextWalk = time + 12000 + Math.random() * 6000; }
    const remaining = this.target - this.x;
    const moving = canWalk && time >= this.gestureUntil && Math.abs(remaining) > 1;
    if (moving) this.x += Math.sign(remaining) * Math.min(Math.abs(remaining), dt * .032, Math.abs(remaining) * dt * .003);
    this.renderPosition();
    if (!this.dragging && !this.falling && time >= this.gestureUntil) this.setGesture(moving ? 'walk' : 'idle');
    const rect = node.getBoundingClientRect();
    const desiredX = this.fine ? Math.max(-1.8, Math.min(1.8, (this.pointerX - rect.left - rect.width / 2) / 160)) : 0;
    const desiredY = this.fine ? Math.max(-2, Math.min(2, (this.pointerY - rect.top - rect.height * .44) / 160)) : 0;
    const easing = 1 - Math.exp(-dt / 90);
    this.eyeX += (desiredX - this.eyeX) * easing; this.eyeY += (desiredY - this.eyeY) * easing;
    node.style.setProperty('--eye-x', `${this.eyeX.toFixed(2)}px`); node.style.setProperty('--eye-y', `${this.eyeY.toFixed(2)}px`);
    this.raf = requestAnimationFrame(this.tick);
  };
  private renderPosition() {
    const node = this.actor.nativeElement;
    node.style.transform = `translate3d(${this.x.toFixed(2)}px,${this.body.y.toFixed(2)}px,0)`;
    node.style.setProperty('--shadow-opacity', String(Math.max(.08, 1 + this.body.y / 500)));
    node.dataset['physics'] = this.dragging ? 'held' : this.falling ? 'falling' : 'grounded';
  }
  grab(event: PointerEvent) {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const rect = this.actor.nativeElement.getBoundingClientRect();
    this.suppressClick = false;
    this.held = { id: event.pointerId, startX: event.clientX, startY: event.clientY, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top, lastX: event.clientX, lastY: event.clientY, lastTime: performance.now(), vx: 0, vy: 0 };
    this.spriteButton.nativeElement.setPointerCapture(event.pointerId);
  }
  private movePointer(event: PointerEvent) {
    this.pointerX = event.clientX; this.pointerY = event.clientY;
    const held = this.held;
    if (!held || event.pointerId !== held.id) return;
    if (!this.dragging && Math.hypot(event.clientX - held.startX, event.clientY - held.startY) < 6) return;
    if (!this.dragging) this.zone.run(() => {
      this.dragging = true; this.falling = false; this.open = false; this.engaged = true;
      this.gestureUntil = 0; this.setGesture('grabbed'); this.gestureSequence++;
      this.bubble = '¡Eeeh! ¡Mis píxeles! Suéltame con cariño.';
    });
    const now = performance.now(); const seconds = Math.max((now - held.lastTime) / 1000, .008);
    held.vx = clamp((event.clientX - held.lastX) / seconds, -750, 750);
    held.vy = clamp((event.clientY - held.lastY) / seconds, -900, 900);
    held.lastX = event.clientX; held.lastY = event.clientY; held.lastTime = now;
    this.x = clamp(event.clientX - held.offsetX, this.bounds.left, this.bounds.right);
    this.body.y = clamp(event.clientY - held.offsetY - this.floorTop, this.bounds.ceiling, 0);
    this.target = this.x;
    this.renderPosition();
  }
  private releasePointer(id?: number) {
    const held = this.held;
    if (!held || (id !== undefined && id !== held.id)) return;
    this.held = undefined;
    if (this.spriteButton.nativeElement.hasPointerCapture(held.id)) this.spriteButton.nativeElement.releasePointerCapture(held.id);
    if (!this.dragging) return;
    const fresh = performance.now() - held.lastTime < 120;
    this.body.vx = fresh ? held.vx : 0; this.body.vy = fresh ? held.vy : 0; this.body.bounced = false;
    this.zone.run(() => {
      this.dragging = false; this.suppressClick = true; this.engaged = false;
      this.falling = !this.reduced;
      this.setGesture(this.falling ? 'falling' : 'idle'); this.gestureSequence++;
      this.bubble = '¡Aterrizaje en progreso!';
      if (this.reduced) { this.body.y = 0; this.body.vx = this.body.vy = 0; }
    });
    this.renderPosition(); this.start();
  }
  spriteClick(event: MouseEvent) {
    if (this.suppressClick && event.detail > 0) { this.suppressClick = false; return; }
    this.suppressClick = false;
    this.toggleChat();
  }
  private setGesture(value: ByteGesture) { if (this.gesture !== value) this.zone.run(() => this.gesture = value); }
  perform(value: ByteGesture) {
    this.target = this.x;
    if (this.dragging || this.falling) return;
    const duration = value === 'landed' ? 900 : value === 'yawn' ? 3400 : value === 'wave' ? 2800 : 2400;
    this.setGesture(this.reduced ? value === 'think' ? 'think' : 'smile' : value); this.gestureSequence++; this.gestureUntil = performance.now() + duration;
    this.nextGesture = this.gestureUntil + 8000 + Math.random() * 5000;
    this.nextWalk = this.gestureUntil + 1800;
    this.bubble = value === 'yawn' ? 'Pausa de píxeles… ya vuelvo 💤' : value === 'wave' ? '¡Hola! Qué bueno verte 👋' : value === 'think' ? 'Un momento… conectando ideas.' : '¡Me gusta lo que hace Jean!';
  }
  engage(value: boolean) { this.engaged = value || this.open || this.actor.nativeElement.contains(document.activeElement); if (this.engaged) this.target = this.x; this.nextWalk = performance.now() + 6000; }
  toggleChat() {
    if (this.dragging) return;
    this.open = !this.open; this.panelLeft = innerWidth <= 767 ? 16 : Math.max(24, Math.min(this.x, innerWidth - 392)); this.engage(this.open);
    if (this.open) { this.perform('wave'); this.later(() => { this.closeButton?.nativeElement.focus({ preventScroll: true }); this.scrollMessages(); }); }
    else this.spriteButton.nativeElement.focus({ preventScroll: true });
  }
  closeChat() { if (this.open) this.toggleChat(); }
  send(question = this.input) {
    const value = question.trim().slice(0, 240); if (!value) return;
    this.messages = [...this.messages.slice(-18), { author: 'you', text: value }, { author: 'byte', text: replyTo(value) }]; this.input = '';
    this.perform('smile');
    this.later(() => this.scrollMessages());
  }
  coffee() { this.perform('smile'); this.bubble = '¡Café recibido! +1 de alegría ☕'; this.messages = [...this.messages.slice(-19), { author: 'byte', text: '¡Gracias por el café! Jean pone el criterio técnico; yo pongo la sonrisa ☕' }]; this.later(() => this.scrollMessages()); }
  dance() { this.perform('dance'); this.bubble = 'Compilando pasos de baile… 🎵'; }
  toggleWalk() { this.paused = !this.paused; this.target = this.x; }
  setHidden(value: boolean) { this.hidden = value; this.open = false; try { sessionStorage.setItem('byte-hidden', String(value)); } catch { /* Hiding still works without storage. */ } if (value) this.stop(); else { this.bubble = '¡Estoy de vuelta! 🕹️'; this.engaged = false; this.start(); } }
  private scrollMessages() { const box = this.messagesBox?.nativeElement; if (box) box.scrollTo({ top: box.scrollHeight, behavior: this.reduced ? 'instant' : 'smooth' }); }
  private later(fn: () => void) { setTimeout(() => { if (!this.destroyed) fn(); }); }
  ngOnDestroy() { this.releasePointer(); this.destroyed = true; this.stop(); this.cleanup(); }
}
