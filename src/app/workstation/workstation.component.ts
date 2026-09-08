import { afterNextRender, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';

@Component({
  selector: 'app-workstation',
  template: `<div class="studio"><div #stage class="stage" role="img" aria-label="Jean en estilo anime 3D, con gafas, rizos y barba, en su estudio. Programa, se gira hacia ti, sonríe y saluda con la mano antes de continuar trabajando."></div><p [hidden]="ready" class="fallback" role="status">{{ failed ? 'La animación 3D no está disponible en este navegador.' : 'Preparando el estudio de Jean…' }}</p><div class="caption"><span>DESARROLLO · DATOS · IA</span><button type="button" (click)="toggle()" [attr.aria-pressed]="paused" [disabled]="!ready">{{ paused ? 'Reanudar animación' : 'Pausar animación' }}</button></div></div>`,
  styles: [`.studio{position:relative;width:100%;border:1px solid #b6677155;border-radius:28px;background:radial-gradient(ellipse at 50% 55%,#88323555,transparent 70%);overflow:hidden}.stage{width:100%;aspect-ratio:1/1.05}.fallback{position:absolute;inset:40% 10%;color:#f0d4d8;text-align:center;font-size:16px}.fallback[hidden]{display:none}.caption{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 20px 20px;flex-wrap:wrap;color:#efb9bf;font-size:12px;letter-spacing:.08em}.caption button{border:1px solid #efb9bf55;background:#351019;color:#fff;border-radius:8px;padding:9px 12px;font-size:14px;letter-spacing:0}.caption button:focus-visible{outline:2px solid #fff;outline-offset:3px}`]
})
export class WorkstationComponent implements OnDestroy {
  @ViewChild('stage') stage!: ElementRef<HTMLDivElement>;
  ready = false;
  failed = false;
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
      camera.position.set(8.4, 6.5, 12.5); camera.lookAt(0, 2.25, -.25);
      scene.add(new T.HemisphereLight(0xffe5d9, 0x391420, 2.5));
      const key = new T.DirectionalLight(0xffeedf, 4); key.position.set(3, 9, 6); key.castShadow = true; scene.add(key);
      const rim = new T.PointLight(0xe07887, 35); rim.position.set(-4, 4, -2); scene.add(rim);
      const mat = (color: number) => new T.MeshToonMaterial({ color });
      const wine = mat(0x883235), dark = mat(0x241f26), skin = mat(0xbc8057), hair = mat(0x211b1b), metal = mat(0x61545b), cream = mat(0xe4ccc3);
      function box(parent: any, w: number, h: number, d: number, x: number, y: number, z: number, material: any) {
        const mesh = new T.Mesh(new T.BoxGeometry(w,h,d),material); mesh.position.set(x,y,z); mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
      }
      function ball(parent: any, x:number,y:number,z:number,sx:number,sy:number,sz:number,material:any) {
        const mesh=new T.Mesh(new T.SphereGeometry(1,24,16),material);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=true;parent.add(mesh);return mesh;
      }
      const wood=mat(0xad795d), leaf=mat(0x47775c), leafLight=mat(0x739878), gold=mat(0xd3a66b);
      function tube(parent: import('three').Object3D, points: number[][], radius: number, material: import('three').Material, closed=false) {
        const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),closed);
        const mesh=new T.Mesh(new T.TubeGeometry(curve,32,radius,8,closed),material);parent.add(mesh);return mesh;
      }
      function cylinder(parent: import('three').Object3D, rTop:number,rBottom:number,height:number,x:number,y:number,z:number,material:import('three').Material) {
        const mesh=new T.Mesh(new T.CylinderGeometry(rTop,rBottom,height,24),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
      }
      function plant(x:number,y:number,z:number,size:number) {
        const pot=new T.Group();pot.position.set(x,y,z);pot.scale.setScalar(size);scene.add(pot);
        cylinder(pot,.28,.21,.42,0,.21,0,cream);
        cylinder(pot,.25,.25,.025,0,.43,0,mat(0x49372b));
        for(let j=0;j<7;j++){
          const a=j*2.4, tip=[Math.cos(a)*.34,.75+(j%3)*.15,Math.sin(a)*.34];
          tube(pot,[[0,.4,0],[tip[0]*.4,.66,tip[2]*.4],tip],.018,leaf);
          const foliage=ball(pot,tip[0],tip[1],tip[2],.15,.32,.065,j%2?leaf:leafLight);foliage.rotation.set(Math.sin(a)*.6, -a,Math.cos(a)*.6);
        }
      }
      // Open studio diorama: warm timber, soft wall panels, shelves and plants.
      box(scene,8.6,.18,6.5,0,-.12,-.25,wood);
      for(let j=0;j<11;j++)box(scene,.018,.012,6.5,-4+j*.8,-.022,-.25,mat(0x94644e));
      box(scene,8.6,5.5,.14,0,2.55,-3.5,mat(0x55333c));
      box(scene,.14,5.5,3,-4.3,2.55,-2.05,mat(0x69434a));
      const rug=cylinder(scene,2.25,2.25,.025,.1,.005,1,mat(0x74515a));rug.scale.z=.65;
      box(scene,6.6,.22,2.8,0,2,-.6,wood);
      for(const x of [-2.8,2.8])for(const z of [-1.65,.45])box(scene,.14,2,.14,x,.95,z,dark);
      const glowMaterial=new T.MeshBasicMaterial({color:0xffc795});
      box(scene,6.3,.035,.035,0,1.91,.77,glowMaterial);
      box(scene,3.8,.12,.62,-1.1,4.5,-3.13,wood);
      for(let j=0;j<6;j++)box(scene,.18,.46+(j%3)*.07,.32,-2.5+j*.22,4.8,-3.12,[wine,cream,gold][j%3]);
      plant(.3,4.56,-3.1,.65);plant(-3.65,0,.2,1.8);plant(2.8,2.12,-.45,.58);
      // Framed code mark, crafted as dimensional lettering.
      box(scene,1.12,.94,.08,2.7,4.25,-3.37,wood);box(scene,.95,.77,.02,2.7,4.25,-3.32,cream);
      tube(scene,[[2.48,4.48,-3.29],[2.28,4.25,-3.29],[2.48,4.03,-3.29]],.035,wine);
      tube(scene,[[2.9,4.48,-3.29],[3.1,4.25,-3.29],[2.9,4.03,-3.29]],.035,wine);
      tube(scene,[[2.77,4.51,-3.29],[2.62,3.99,-3.29]],.028,wine);
      // Floor lamp and a cozy pool of amber light.
      cylinder(scene,.37,.42,.09,3.7,.05,-2.35,dark);cylinder(scene,.045,.045,3.85,3.7,1.95,-2.35,gold);
      cylinder(scene,.28,.58,.55,3.7,4,-2.35,cream);
      const lamp=new T.PointLight(0xffcd94,12,6);lamp.position.set(3.7,3.64,-2.35);scene.add(lamp);
      cylinder(scene,.17,.14,.35,-2.8,2.28,.32,cream);
      cylinder(scene,.135,.135,.013,-2.8,2.462,.32,mat(0x51372d));
      tube(scene,[[-2.96,2.4,.32],[-3.13,2.34,.32],[-3.12,2.19,.32],[-2.96,2.18,.32]],.035,cream);
      box(scene,.62,.065,.78,2.4,2.16,.23,wine);
      box(scene,.55,.028,.68,2.4,2.21,.23,cream);
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
      // Anime proportions and recognizable features from Jean's existing portrait.
      // Chair and avatar rotate together; arms have shoulder, elbow and wrist joints.
      const person=new T.Group();person.position.set(0,0,1.15);scene.add(person);
      const chair=new T.Group();person.add(chair);
      ball(chair,0,1.15,.15,.73,.14,.58,dark);
      ball(chair,0,1.77,.64,.64,.64,.13,dark);
      box(chair,.08,.6,.08,-.75,1.42,.17,metal);box(chair,.08,.6,.08,.75,1.42,.17,metal);
      ball(chair,-.75,1.73,.06,.12,.06,.4,dark);ball(chair,.75,1.73,.06,.12,.06,.4,dark);
      cylinder(chair,.095,.095,.85,0,.63,.2,metal);
      for(let j=0;j<5;j++){
        const a=j*Math.PI*2/5;
        tube(chair,[[0,.23,.2],[Math.cos(a)*.7,.15,.2+Math.sin(a)*.7]],.055,metal);
        ball(chair,Math.cos(a)*.7,.1,.2+Math.sin(a)*.7,.1,.1,.1,dark);
      }
      const shirt=mat(0x744148), denim=mat(0x283442), beard=mat(0x49352c), eyeWhite=mat(0xffeee1);
      ball(person,0,2,.1,.59,.76,.35,shirt);
      cylinder(person,.18,.2,.32,0,2.68,.04,skin);
      // Open collar, shirt placket and buttons.
      const collarL=box(person,.25,.2,.055,-.16,2.56,-.23,shirt);collarL.rotation.z=-.35;
      const collarR=box(person,.25,.2,.055,.16,2.56,-.23,shirt);collarR.rotation.z=.35;
      tube(person,[[0,2.48,-.25],[0,2.05,-.26],[0,1.59,-.19]],.015,wine);
      for(let j=0;j<4;j++)ball(person,0,2.35-j*.2,-.265,.024,.024,.014,cream);
      for(const x of [-.32,.32]){
        ball(person,x,1.24,-.22,.27,.22,.53,denim);
        ball(person,x,.73,-.6,.19,.48,.2,denim);
        ball(person,x,.23,-.75,.24,.15,.4,cream);
      }
      const head=new T.Group();head.position.set(0,3.03,.03);person.add(head);
      ball(head,0,0,0,.59,.66,.51,skin);
      ball(head,0,-.32,-.09,.48,.33,.39,beard);
      ball(head,0,-.2,-.24,.435,.29,.29,skin);
      ball(head,0,-.45,-.23,.29,.13,.21,beard);
      for(const x of [-.57,.57]){ball(head,x,-.02,0,.12,.19,.1,skin);ball(head,x,-.02,-.075,.054,.1,.025,mat(0xa2664b));}
      // Short faded sides and a textured cap of tightly curled black hair.
      ball(head,0,.32,.06,.6,.4,.49,hair);
      for(let j=0;j<54;j++){
        const a=j*2.399963, y=.27+(j%9)/8*.4;
        const r=Math.sqrt(Math.max(0,1-Math.pow((y-.1)/.62,2)));
        ball(head,Math.cos(a)*.55*r,y,Math.sin(a)*.47*r+.015,.115,.105,.115,hair);
      }
      const eyes: import('three').Mesh[]=[];
      for(const x of [-.245,.245]){
        const eye=ball(head,x,.005,-.465,.148,.14,.035,eyeWhite);eyes.push(eye);
        const iris=ball(head,x,.004,-.499,.077,.095,.018,mat(0x62452c));eyes.push(iris);
        const pupil=ball(head,x,.002,-.516,.043,.073,.012,dark);eyes.push(pupil);
        ball(head,x-.024,.046,-.529,.022,.027,.008,eyeWhite);
        tube(head,[[x-.135,.207,-.463],[x,.226,-.49],[x+.13,.2,-.463]],.026,hair);
        // Rounded dark rectangular glasses, bridge and temples.
        tube(head,[[x-.17,.14,-.535],[x+.15,.14,-.535],[x+.19,.07,-.535],[x+.15,-.115,-.535],[x-.15,-.115,-.535],[x-.19,-.03,-.535]],.025,dark,true);
        tube(head,[[Math.sign(x)*.44,.08,-.5],[Math.sign(x)*.58,.08,-.2],[Math.sign(x)*.59,.02,.03]],.022,dark);
      }
      tube(head,[[-.062,.065,-.54],[0,.08,-.56],[.062,.065,-.54]],.021,dark);
      ball(head,0,-.12,-.505,.086,.125,.09,skin);
      // Upturned mouth with visible teeth; grows into a broad smile during greeting.
      const smile=new T.Group();smile.position.set(0,-.31,-.49);head.add(smile);
      ball(smile,0,0,0,.19,.083,.025,mat(0x663d35));
      ball(smile,0,.026,-.022,.151,.037,.009,eyeWhite);
      tube(head,[[-.19,-.225,-.484],[0,-.245,-.527],[.19,-.225,-.484]],.021,beard);
      const arms: {shoulder:import('three').Group;elbow:import('three').Group;wrist:import('three').Group}[]=[];
      for(const x of [-.57,.57]){
        const shoulder=new T.Group();shoulder.position.set(x,2.43,.05);person.add(shoulder);
        ball(shoulder,0,-.14,0,.2,.28,.2,shirt);
        ball(shoulder,0,-.38,0,.125,.22,.13,skin);
        const elbow=new T.Group();elbow.position.y=-.51;shoulder.add(elbow);
        ball(elbow,0,-.23,0,.105,.26,.11,skin);
        const wrist=new T.Group();wrist.position.y=-.49;elbow.add(wrist);
        ball(wrist,0,-.065,0,.12,.15,.066,skin);
        for(let j=0;j<4;j++)ball(wrist,-.083+j*.054,-.245+(j===0||j===3?.03:0),0,.024,.095,.029,skin);
        const thumb=ball(wrist,.145,-.09,0,.04,.085,.04,skin);thumb.rotation.z=.55;
        if(x>.0){cylinder(elbow,.12,.12,.1,0,-.41,0,dark);ball(elbow,0,-.41,-.115,.075,.065,.018,metal);}
        arms.push({shoulder,elbow,wrist});
      }
      function paint(index:number,t:number,typing:boolean){
        const {canvas,texture}=screens[index],ctx=canvas.getContext('2d')!;
        ctx.fillStyle='#14151d';ctx.fillRect(0,0,640,400);ctx.fillStyle='#30212a';ctx.fillRect(0,0,640,42);ctx.font='18px monospace';ctx.fillStyle='#f0c4c9';ctx.fillText(['WEB / vista previa','CODE / app.ts','DATA / dashboard'][index],20,28);
        if(index===0){ctx.fillStyle='#f5e9e5';ctx.fillRect(16,58,608,326);ctx.fillStyle='#883235';ctx.fillRect(35,80,130,12);ctx.font='bold 34px sans-serif';ctx.fillText('Ideas que funcionan.',35,156);ctx.fillStyle='#3b2932';ctx.font='20px sans-serif';ctx.fillText('Desarrollo + datos + IA',35,196);ctx.fillStyle='#883235';ctx.fillRect(35,222,155,34);for(let j=0;j<3;j++){ctx.fillStyle='#e2c9ca';ctx.fillRect(35+j*193,283,173,76);}}
        if(index===1){const lines=['const proyecto = {','  web: Angular,','  datos: PowerBI,','  ideas: inteligenciaArtificial','};','','async function construir() {','  const datos = await consultar();','  return transformar(datos);','}'];ctx.font='22px monospace';const count=typing?Math.floor(t*5)%30+8:30;lines.forEach((line,j)=>{ctx.fillStyle=j%2?'#ead4bc':'#e792a2';ctx.fillText(line.slice(0,Math.max(0,count-j*2)),23,78+j*29);});if(typing&&Math.sin(t*8)>0){ctx.fillStyle='#fff';ctx.fillRect(24+(count%20)*12,361,10,22);}}
        if(index===2){ctx.font='18px sans-serif';ctx.fillStyle='#e9c4ca';ctx.fillText('INDICADORES / DEMO',24,77);for(let j=0;j<3;j++){ctx.fillStyle='#382731';ctx.fillRect(24+j*205,98,183,70);ctx.fillStyle='#fff';ctx.font='bold 30px sans-serif';ctx.fillText(['95%','128','24'][j],40+j*205,143);}for(let j=0;j<8;j++){const h=45+j*15+Math.sin(t*.8+j)*14;ctx.fillStyle=j%2?'#d5a2ac':'#a34a58';ctx.fillRect(35+j*73,352-h,45,h);}}
        texture.needsUpdate=true;
      }
      const resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(w&&h){renderer.setSize(w,h);dirty=true;camera.aspect=w/h;camera.updateProjectionMatrix();}});resize.observe(host);
      const reduced=matchMedia('(prefers-reduced-motion: reduce)');this.paused=reduced.matches;
      const preference=()=>{this.zone.run(()=>{this.paused=reduced.matches;});};reduced.addEventListener('change',preference);
      let visible=true;const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});observer.observe(host);
      let frame=0,last=0,time=0,paintTime=-1;let first=true,dirty=true;
      const smooth=(a:number,b:number,x:number)=>{const v=T.MathUtils.clamp((x-a)/(b-a),0,1);return v*v*(3-2*v);};
      // Front vector is -Z. This yaw aligns the face exactly with the visitor's camera.
      const greetingYaw=Math.atan2(-camera.position.x,-(camera.position.z-person.position.z));
      const tick=(now:number)=>{
        if(this.destroyed)return;
        frame=requestAnimationFrame(tick);const dt=Math.min((now-last)/1000,.05);last=now;
        if(!visible||document.hidden)return;
        if(!this.paused)time+=dt;
        const phase=time%18;
        const greeting=smooth(6,8,phase)*(1-smooth(11.5,13.5,phase));
        const wave=smooth(7.7,8.5,phase)*(1-smooth(10.8,11.7,phase));
        const typing=phase<5||phase>13.5;
        if(!this.paused||first){
          person.rotation.y=greetingYaw*greeting;
          person.rotation.z=(1-greeting)*Math.sin(time*2)*.008;
          const inspect=smooth(5,5.4,phase)*(1-smooth(5.6,6,phase));
          head.rotation.y=inspect*-.32;
          head.rotation.x=.1*(1-greeting)+greeting*.23;
          head.rotation.z=greeting*.065;
          head.position.y=3.03+Math.sin(time*2.2)*.012;
          smile.scale.set(1+greeting*.17,.68+greeting*.32,1);
          const blink=(time%4.6)>4.43 ? .16 : 1;
          eyes.forEach((eye,i)=>eye.scale.y=[.14,.095,.073][i%3]*blink);
          arms.forEach(({shoulder,elbow,wrist},i)=>{
            const tap=typing?Math.sin(time*16+i*2)*.06:0;
            shoulder.rotation.set(1.02*(1-greeting),0,(i===0?-.08:.08)*(1-greeting));
            elbow.rotation.x=(1-greeting)*(.48+tap);
            elbow.rotation.z=0;wrist.rotation.z=0;
            if(i===0){
              shoulder.rotation.z=-2.35*wave-.08*(1-wave);
              shoulder.rotation.x=1.02*(1-greeting)-.18*wave;
              elbow.rotation.x=(1-greeting)*(.48+tap);
              elbow.rotation.z=wave*(-.25+Math.sin(time*8)*.2);
              wrist.rotation.z=Math.sin(time*8)*.2*wave;
            }
          });
          if(time-paintTime>.12||first){screens.forEach((_,i)=>paint(i,time,typing));paintTime=time;}
          dirty=true;
        }
        if(dirty){renderer.render(scene,camera);dirty=false;}first=false;

      };
      this.ready=true;
      this.zone.runOutsideAngular(()=>{frame=requestAnimationFrame(tick);});
      this.cleanup=()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();reduced.removeEventListener('change',preference);scene.traverse(o=>{const m=o as import('three').Mesh;if(m.geometry)m.geometry.dispose();if(m.material){(Array.isArray(m.material)?m.material:[m.material]).forEach(v=>v.dispose());}});screens.forEach(s=>s.texture.dispose());renderer.dispose();renderer.domElement.remove();};
    } catch { this.ready=false; this.failed=true; }
  }
}
