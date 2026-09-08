import { afterNextRender, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';

@Component({
  selector: 'app-workstation',
  template: `<div class="studio"><div #stage class="stage" role="img" aria-label="Representación 3D de Jean programando frente a tres monitores: web, código y dashboard."></div><img [hidden]="ready" src="Perfil.svg" alt="Jean Quintana" class="fallback"><div class="caption"><span>DESARROLLO · DATOS · IA</span><button type="button" (click)="toggle()" [attr.aria-pressed]="paused" [disabled]="!ready">{{ paused ? 'Reanudar animación' : 'Pausar animación' }}</button></div></div>`,
  styles: [`.studio{position:relative;width:100%;border:1px solid #b6677155;border-radius:28px;background:radial-gradient(ellipse at 50% 55%,#88323555,transparent 70%);overflow:hidden}.stage{width:100%;aspect-ratio:1/1.05}.fallback{position:absolute;inset:5%;width:90%;height:80%;object-fit:contain}.fallback[hidden]{display:none}.caption{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 20px 20px;flex-wrap:wrap;color:#efb9bf;font-size:12px;letter-spacing:.08em}.caption button{border:1px solid #efb9bf55;background:#351019;color:#fff;border-radius:8px;padding:9px 12px;font-size:14px;letter-spacing:0}.caption button:focus-visible{outline:2px solid #fff;outline-offset:3px}`]
})
export class WorkstationComponent implements OnDestroy {
  @ViewChild('stage') stage!: ElementRef<HTMLDivElement>;
  ready = false;
  paused = false;
  private destroyed = false;
  private cleanup = () => {};
  constructor(private zone: NgZone) {
    afterNextRender(() => { void this.init(); });
  }
  toggle() { this.paused = !this.paused; }
  ngOnDestroy() { this.destroyed = true; this.cleanup(); }
  private async init() {
    try {
      const T = await import('three');
      if (this.destroyed) return;
      const host = this.stage.nativeElement;
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
      host.appendChild(renderer.domElement);
      renderer.domElement.style.display = 'block';
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(38, 1, .1, 60);
      camera.position.set(8, 7.8, 11.8); camera.lookAt(0, 1.9, 0);
      scene.add(new T.HemisphereLight(0xffe5d9, 0x391420, 2.5));
      const key = new T.DirectionalLight(0xffeedf, 4); key.position.set(3, 9, 6); key.castShadow = true; scene.add(key);
      const rim = new T.PointLight(0xe07887, 35); rim.position.set(-4, 4, -2); scene.add(rim);
      const mat = (color: number) => new T.MeshStandardMaterial({ color, roughness: .55 });
      const wine = mat(0x883235), dark = mat(0x241f26), skin = mat(0xc98d6d), hair = mat(0x201817), metal = mat(0x61545b), cream = mat(0xe4ccc3);
      function box(parent: any, w: number, h: number, d: number, x: number, y: number, z: number, material: any) {
        const mesh = new T.Mesh(new T.BoxGeometry(w,h,d),material); mesh.position.set(x,y,z); mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
      }
      function ball(parent: any, x:number,y:number,z:number,sx:number,sy:number,sz:number,material:any) {
        const mesh=new T.Mesh(new T.SphereGeometry(1,24,16),material);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=true;parent.add(mesh);return mesh;
      }
      const floor = new T.Mesh(new T.CylinderGeometry(4.1,4.25,.15,64),mat(0x40202b)); floor.position.y=-.1; floor.receiveShadow=true;scene.add(floor);
      box(scene,6.6,.22,2.8,0,2,-.6,wine);
      for(const x of [-2.8,2.8]) for(const z of [-1.65,.45]) box(scene,.14,2,.14,x,.95,z,metal);
      // The three real 3D monitors face the seated developer and the camera.
      const screens: {canvas:HTMLCanvasElement;texture:import('three').CanvasTexture}[]=[];
      [-2.12,0,2.12].forEach((x,i)=>{
        const monitor=new T.Group();monitor.position.set(x,3.12,-1.2);monitor.rotation.y=i===0?.2:i===2?-.2:0;scene.add(monitor);
        box(monitor,2.03,1.36,.12,0,0,0,dark);box(monitor,.12,.55,.12,0,-.85,0,metal);box(monitor,.75,.06,.45,0,-1.05,.08,metal);
        const canvas=document.createElement('canvas');canvas.width=640;canvas.height=400;
        const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
        const display=new T.Mesh(new T.PlaneGeometry(1.87,1.17),new T.MeshBasicMaterial({map:texture}));display.position.z=.067;monitor.add(display);screens.push({canvas,texture});
      });
      box(scene,1.65,.06,.62,0,2.15,.12,dark);
      for(let r=0;r<4;r++)for(let c=0;c<12;c++)box(scene,.095,.018,.085,-.71+c*.13,2.19,-.08+r*.13,cream);
      ball(scene,1.25,2.17,.2,.13,.07,.2,cream);
      // Articulated stylized avatar, with separate head and forearms.
      const person=new T.Group();person.position.set(0,0,1.1);scene.add(person);
      box(person,1.25,.2,1.05,0,1.15,.25,dark);box(person,1.15,1.5,.18,0,1.8,.85,dark);box(person,.15,1,.15,0,.55,.25,metal);
      for(const x of [-.6,.6])box(person,.12,.08,1.1,x,.06,.25,metal);
      ball(person,0,1.98,.16,.63,.83,.36,wine);
      for(const x of [-.35,.35]){box(person,.3,.3,.85,x,1.15,-.15,dark);box(person,.28,.85,.28,x,.65,-.5,dark);box(person,.38,.2,.65,x,.18,-.66,cream);}
      const head=new T.Group();head.position.set(0,2.98,.08);person.add(head);
      ball(head,0,0,0,.43,.51,.4,skin);ball(head,0,.23,.03,.45,.34,.41,hair);ball(head,0,-.05,-.4,.1,.12,.09,skin);
      for(const x of [-.17,.17])ball(head,x,.07,-.37,.055,.045,.025,dark);
      const arms: import('three').Group[]=[];
      for(const x of [-.54,.54]){
        const arm=new T.Group();arm.position.set(x,2.37,.05);person.add(arm);
        ball(arm,0,-.15,-.17,.2,.27,.28,wine);box(arm,.2,.2,.66,0,-.22,-.6,skin);ball(arm,0,-.22,-.96,.15,.1,.18,skin);arms.push(arm);
      }
      function paint(index:number,t:number,typing:boolean){
        const {canvas,texture}=screens[index],ctx=canvas.getContext('2d')!;
        ctx.fillStyle='#14151d';ctx.fillRect(0,0,640,400);ctx.fillStyle='#30212a';ctx.fillRect(0,0,640,42);ctx.font='18px monospace';ctx.fillStyle='#f0c4c9';ctx.fillText(['WEB / vista previa','CODE / app.ts','DATA / dashboard'][index],20,28);
        if(index===0){ctx.fillStyle='#f5e9e5';ctx.fillRect(16,58,608,326);ctx.fillStyle='#883235';ctx.fillRect(35,80,130,12);ctx.font='bold 34px sans-serif';ctx.fillText('Ideas que funcionan.',35,156);ctx.fillStyle='#3b2932';ctx.font='20px sans-serif';ctx.fillText('Desarrollo + datos + IA',35,196);ctx.fillStyle='#883235';ctx.fillRect(35,222,155,34);for(let j=0;j<3;j++){ctx.fillStyle='#e2c9ca';ctx.fillRect(35+j*193,283,173,76);}}
        if(index===1){const lines=['const proyecto = {','  web: Angular,','  datos: PowerBI,','  ideas: inteligenciaArtificial','};','','async function construir() {','  const datos = await consultar();','  return transformar(datos);','}'];ctx.font='22px monospace';const count=typing?Math.floor(t*5)%30+8:30;lines.forEach((line,j)=>{ctx.fillStyle=j%2?'#ead4bc':'#e792a2';ctx.fillText(line.slice(0,Math.max(0,count-j*2)),23,78+j*29);});if(typing&&Math.sin(t*8)>0){ctx.fillStyle='#fff';ctx.fillRect(24+(count%20)*12,361,10,22);}}
        if(index===2){ctx.font='18px sans-serif';ctx.fillStyle='#e9c4ca';ctx.fillText('INDICADORES / DEMO',24,77);for(let j=0;j<3;j++){ctx.fillStyle='#382731';ctx.fillRect(24+j*205,98,183,70);ctx.fillStyle='#fff';ctx.font='bold 30px sans-serif';ctx.fillText(['95%','128','24'][j],40+j*205,143);}for(let j=0;j<8;j++){const h=45+j*15+Math.sin(t*.8+j)*14;ctx.fillStyle=j%2?'#d5a2ac':'#a34a58';ctx.fillRect(35+j*73,352-h,45,h);}}
        texture.needsUpdate=true;
      }
      const resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(w&&h){renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}});resize.observe(host);
      const reduced=matchMedia('(prefers-reduced-motion: reduce)');this.paused=reduced.matches;
      const preference=()=>{this.zone.run(()=>{this.paused=reduced.matches;});};reduced.addEventListener('change',preference);
      let visible=true;const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});observer.observe(host);
      let frame=0,last=0,time=0,paintTime=-1;let first=true;
      const tick=(now:number)=>{
        if(this.destroyed)return;
        frame=requestAnimationFrame(tick);const dt=Math.min((now-last)/1000,.05);last=now;
        if(!visible||document.hidden)return;
        if(!this.paused)time+=dt;
        const phase=time%12,typing=phase<5||phase>8.5;
        if(!this.paused||first){
          head.rotation.y=phase<5?0:phase<6.7?-.48:phase<8.5?.48:0;
          head.rotation.x=typing?.13:0;
          arms.forEach((arm,i)=>{arm.rotation.x=typing?Math.sin(time*18+i*2)*.055: -.12;});
          person.rotation.z=typing?Math.sin(time*2)*.012:0;
          if(time-paintTime>.12||first){screens.forEach((_,i)=>paint(i,time,typing));paintTime=time;}
        }
        renderer.render(scene,camera);first=false;
      };
      this.ready=true;
      this.zone.runOutsideAngular(()=>{frame=requestAnimationFrame(tick);});
      this.cleanup=()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();reduced.removeEventListener('change',preference);scene.traverse(o=>{const m=o as import('three').Mesh;if(m.geometry)m.geometry.dispose();if(m.material){(Array.isArray(m.material)?m.material:[m.material]).forEach(v=>v.dispose());}});screens.forEach(s=>s.texture.dispose());renderer.dispose();renderer.domElement.remove();};
    } catch { this.ready=false; }
  }
}
