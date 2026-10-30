// V27 · three.js world: a winding flesh tunnel, glass sperm-pods with a pilot, acid blobs, golden buffer fluid,
// a mucus sea, white blood cells and the egg. Everything is a pure function of time (direct.ts sets it per frame).
import * as THREE from "three";

export const R = 3.2; // tunnel radius
export const cx = (z: number) => 1.4 * Math.sin(z * 0.05) + 0.6 * Math.sin(z * 0.13 + 1.0);
export const cy = (z: number) => 0.9 * Math.sin(z * 0.07 + 2.0) + 0.3 * Math.sin(z * 0.17);
export const center = (z: number, o = new THREE.Vector3()) => o.set(cx(z), cy(z), z);

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){float a=0.5,s=0.0;for(int i=0;i<4;i++){s+=a*snoise(p);p*=2.03;a*=0.5;}return s;}
`;

const BEND = /* glsl */ `
float bx(float z){return 1.4*sin(z*0.05)+0.6*sin(z*0.13+1.0);}
float by(float z){return 0.9*sin(z*0.07+2.0)+0.3*sin(z*0.17);}
float ridge(float z,float a){float w=z*4.18879+1.6*sin(z*0.53)+0.9*sin(a*3.0+z*0.21)+0.6*sin(a*5.0-z*0.13);return pow(0.5+0.5*sin(w),4.0)*(0.45+0.55*(0.5+0.5*sin(z*0.71+2.0*sin(z*0.23)+a)));}
float rad(float z,float a){return ${R.toFixed(2)}*(1.0-0.13*ridge(z,a));}
`;

// ───────────────────────── tunnel
const tunnelMat = () =>
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      uCam: { value: new THREE.Vector3() },
      uGlow: { value: new THREE.Vector3() },
      uGlowAmt: { value: 1 },
      uGlowCol: { value: new THREE.Color(0.55, 0.85, 1.0) },
      uTint: { value: new THREE.Color(1, 1, 1) },
      uFog: { value: 0.022 },
      uExp: { value: 1 },
      uAcid: { value: 0 },
    },
    vertexShader: /* glsl */ `
      ${BEND}
      varying vec3 vW; varying vec2 vLoc; varying float vZ;
      void main(){
        vec4 w=modelMatrix*vec4(position,1.0);
        float a=atan(position.y,position.x);
        float z=w.z;
        float r=rad(z,a);
        w.xy=vec2(bx(z),by(z))+vec2(cos(a),sin(a))*r;
        vW=w.xyz; vLoc=position.xy; vZ=z;
        gl_Position=projectionMatrix*viewMatrix*w;
      }`,
    fragmentShader: /* glsl */ `
      ${NOISE}
      ${BEND}
      uniform vec3 uCam,uGlow,uGlowCol,uTint; uniform float uGlowAmt,uFog,uExp,uAcid;
      varying vec3 vW; varying vec2 vLoc; varying float vZ;
      void main(){
        float a=atan(vLoc.y,vLoc.x),z=vZ;
        vec2 ca=vec2(cos(a),sin(a));
        float drdz=(rad(z+0.01,a)-rad(z-0.01,a))/0.02;
        vec2 dc=vec2(bx(z+0.01)-bx(z-0.01),by(z+0.01)-by(z-0.01))/0.02;
        vec3 nOut=normalize(vec3(ca,-(drdz+dot(ca,dc))));
        vec3 p=vec3(ca*3.0,z*0.9);
        float n1=fbm(p*0.9);
        float n2=snoise(p*3.1);
        float bump=snoise(p*6.0)*0.5+snoise(p*13.0)*0.25;
        vec3 N=-normalize(nOut+0.22*vec3(ca.y,-ca.x,0.0)*n2+0.12*vec3(bump,-bump,bump));
        float rg=ridge(z,a);
        // flesh
        vec3 deep=vec3(0.36,0.06,0.08), mid=vec3(0.66,0.22,0.25), pale=vec3(0.86,0.52,0.54);
        vec3 col=mix(deep,mid,smoothstep(-0.6,0.6,n1));
        col=mix(col,pale,smoothstep(0.35,0.95,n1+0.35*rg)*0.55);
        float vein=pow(1.0-abs(snoise(p*1.7+vec3(7.0))),14.0);
        col=mix(col,vec3(0.32,0.02,0.10),vein*0.55);
        float spot=smoothstep(0.62,0.72,snoise(p*4.5+vec3(3.0)));
        col=mix(col,vec3(0.92,0.62,0.6),spot*0.35);
        col*=uTint;
        // light: headlamp at the camera + the bright opening ahead
        vec3 V=normalize(uCam-vW);
        vec3 L=normalize(uCam+vec3(0.0,0.35,0.0)-vW);
        float d=length(uCam-vW);
        float att=1.0/(1.0+0.006*d*d);
        float dif=max(dot(N,L),0.0)*0.8+0.38;
        vec3 H=normalize(L+V);
        float sp=pow(max(dot(N,H),0.0),70.0)*1.6+pow(max(dot(N,H),0.0),9.0)*0.18;
        sp*=0.55+0.9*rg;
        vec3 Lg=uGlow-vW; float dg=length(Lg); Lg/=dg;
        float gl=uGlowAmt*max(dot(N,Lg),0.0)*14.0/(1.0+0.02*dg*dg);
        float spg=uGlowAmt*pow(max(dot(N,normalize(Lg+V)),0.0),40.0)*3.0/(1.0+0.01*dg*dg);
        vec3 c=col*(dif*att*1.25)+vec3(1.0,0.93,0.92)*sp*att+col*uGlowCol*gl*0.35+uGlowCol*spg;
        c=mix(c,c*vec3(0.55,1.15,0.35),uAcid);
        float fog=1.0-exp(-uFog*d);
        c=mix(c,vec3(0.30,0.07,0.08),fog);
        gl_FragColor=vec4(c*uExp,1.0);
      }`,
  });

// ───────────────────────── glass, slime, cells, egg
const glassMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uCoat: { value: 0 }, uDead: { value: 0 }, uCam: { value: new THREE.Vector3() } },
    vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vW; varying vec3 vL;
      void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; vL=position; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: /* glsl */ `${NOISE}
      uniform vec3 uCam; uniform float uCoat,uDead; varying vec3 vN; varying vec3 vW; varying vec3 vL;
      void main(){
        vec3 V=normalize(uCam-vW); vec3 N=normalize(vN);
        float f=pow(1.0-abs(dot(N,V)),2.2);
        vec3 L=normalize(uCam+vec3(0.3,0.6,0.0)-vW);
        float sp=pow(max(dot(N,normalize(L+V)),0.0),120.0)*2.0;
        vec3 refl=mix(vec3(1.0,0.82,0.82),vec3(1.0,0.98,0.98),smoothstep(0.2,0.9,f));
        vec3 c=refl+sp; float al=0.03+0.62*f*f+sp;
        // acid coat: lumpy lime slime over the glass
        float n=snoise(vL*9.0)*0.5+0.5;
        float coat=smoothstep(0.55,0.35,n-uCoat*0.9)*uCoat;
        vec3 lime=vec3(0.55,0.95,0.12)*(0.7+0.5*f)+sp*0.8;
        c=mix(c,lime,coat); al=mix(al,0.96,coat);
        c=mix(c,c*vec3(0.55,0.6,0.45),uDead*0.7); al=mix(al,max(al,0.55),uDead);
        gl_FragColor=vec4(c,min(al,1.0));
      }`,
  });

const blobMat = (base: THREE.Color) =>
  new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uSeed: { value: 0 }, uCam: { value: new THREE.Vector3() }, uCol: { value: base.clone() }, uAmp: { value: 0.28 }, uFreq: { value: 1.4 }, uSss: { value: 0 } },
    vertexShader: /* glsl */ `${NOISE}
      uniform float uT,uSeed,uAmp,uFreq; varying vec3 vN; varying vec3 vW; varying vec3 vP;
      void main(){
        vec3 p=position; float n=snoise(p*uFreq+vec3(uSeed,uSeed*1.7,uT*0.6));
        vec3 q=p*(1.0+uAmp*n);
        float e=0.02; vec3 t1=normalize(cross(normal,vec3(0.0,1.0,0.1))); vec3 t2=cross(normal,t1);
        vec3 a=(p+t1*e)*(1.0+uAmp*snoise((p+t1*e)*uFreq+vec3(uSeed,uSeed*1.7,uT*0.6)));
        vec3 b=(p+t2*e)*(1.0+uAmp*snoise((p+t2*e)*uFreq+vec3(uSeed,uSeed*1.7,uT*0.6)));
        vec3 nn=normalize(cross(a-q,b-q)); if(dot(nn,normal)<0.0) nn=-nn;
        vN=normalize(mat3(modelMatrix)*nn); vec4 w=modelMatrix*vec4(q,1.0); vW=w.xyz; vP=p;
        gl_Position=projectionMatrix*viewMatrix*w;
      }`,
    fragmentShader: /* glsl */ `${NOISE}
      uniform vec3 uCam,uCol; uniform float uSss; varying vec3 vN; varying vec3 vW; varying vec3 vP;
      void main(){
        vec3 V=normalize(uCam-vW); vec3 N=normalize(vN);
        vec3 L=normalize(uCam+vec3(0.6,1.2,0.4)-vW);
        float dif=max(dot(N,L),0.0)*0.7+0.35;
        float sp=pow(max(dot(N,normalize(L+V)),0.0),90.0)*1.4+pow(max(dot(N,normalize(L+V)),0.0),12.0)*0.15;
        float f=pow(1.0-max(dot(N,V),0.0),2.0);
        vec3 c=uCol*dif+sp;
        c=mix(c,uCol*1.25+0.12,f*0.45);
        // mottled interior (white cells: lobed nucleus shadow)
        float m=snoise(vP*2.2+vec3(4.0));
        c=mix(c,c*vec3(0.62,0.5,0.78),uSss*smoothstep(0.1,0.6,m)*(1.0-f));
        gl_FragColor=vec4(c,1.0);
      }`,
  });

const eggMat = () =>
  new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uCam: { value: new THREE.Vector3() }, uGlow: { value: 0 }, uRip: { value: -10 }, uRipP: { value: new THREE.Vector3(0, 0, 1) } },
    vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vW; varying vec3 vP;
      void main(){ vN=normalize(mat3(modelMatrix)*normal); vP=normalize(position); vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: /* glsl */ `${NOISE}
      uniform vec3 uCam,uRipP; uniform float uT,uGlow,uRip; varying vec3 vN; varying vec3 vW; varying vec3 vP;
      void main(){
        vec3 V=normalize(uCam-vW); vec3 N=normalize(vN);
        float n=fbm(vP*3.0+vec3(0.0,0.0,uT*0.08));
        float g=snoise(vP*28.0)*0.5+0.5;
        vec3 col=mix(vec3(0.85,0.45,0.48),vec3(0.98,0.74,0.7),smoothstep(-0.4,0.6,n));
        col*=0.86+0.2*g;
        vec3 L=normalize(uCam+vec3(0.8,1.4,0.5)-vW);
        float dif=max(dot(N,L),0.0)*0.65+0.4;
        float sp=pow(max(dot(N,normalize(L+V)),0.0),60.0)*0.9;
        float f=pow(1.0-max(dot(N,V),0.0),2.5);
        vec3 c=col*dif+sp+vec3(1.0,0.85,0.8)*f*0.9;
        float d=acos(clamp(dot(vP,normalize(uRipP)),-1.0,1.0));
        float rip=exp(-pow((d-uRip)*9.0,2.0))*smoothstep(2.6,0.0,uRip);
        c+=vec3(1.0,0.9,0.75)*(uGlow*0.55+rip*0.9);
        gl_FragColor=vec4(c,1.0);
      }`,
  });

const zonaMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uCam: { value: new THREE.Vector3() }, uA: { value: 1 } },
    vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vW;
      void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: /* glsl */ `uniform vec3 uCam; uniform float uA; varying vec3 vN; varying vec3 vW;
      void main(){ vec3 V=normalize(uCam-vW); float f=pow(1.0-abs(dot(normalize(vN),V)),3.0);
        gl_FragColor=vec4(vec3(1.0,0.86,0.84),(0.05+0.8*f)*uA); }`,
  });

const seaMat = () =>
  new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uCam: { value: new THREE.Vector3() }, uY: { value: -2 } },
    vertexShader: /* glsl */ `${BEND} ${NOISE}
      uniform float uT,uY; varying vec3 vW; varying float vH;
      void main(){
        vec4 w=modelMatrix*vec4(position,1.0);
        float h=0.10*sin(w.x*1.3+uT*1.1+w.z*0.4)+0.07*snoise(vec3(w.x*0.6,w.z*0.6,uT*0.25));
        w.y=by(w.z)+uY+h; w.x+=bx(w.z);
        vW=w.xyz; vH=h; gl_Position=projectionMatrix*viewMatrix*w;
      }`,
    fragmentShader: /* glsl */ `${NOISE}
      uniform vec3 uCam; uniform float uT; varying vec3 vW; varying float vH;
      vec2 hash2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
      float vor(vec2 x){vec2 n=floor(x),f=fract(x);float m1=8.0,m2=8.0;
        for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j));vec2 o=hash2(n+g);o=0.5+0.5*sin(uT*0.4+6.2831*o);
          float d=length(g+o-f);if(d<m1){m2=m1;m1=d;}else if(d<m2)m2=d;}
        return m2-m1;}
      void main(){
        vec2 q=vec2(vW.x,vW.z)*1.6+vec2(snoise(vec3(vW.xz*0.5,uT*0.1)))*0.5;
        float e=vor(q);
        float rim=smoothstep(0.0,0.18,e);
        vec3 col=mix(vec3(0.62,0.95,0.22),vec3(0.28,0.62,0.06),rim);
        col=mix(col,vec3(0.78,1.0,0.4),smoothstep(0.55,0.9,e)*0.4);
        vec3 N=normalize(vec3(-0.25*cos(vW.x*1.3+uT*1.1),1.0,-0.1*cos(vW.z*0.4))+vec3((rim-0.5)*0.25,0.0,0.0));
        vec3 V=normalize(uCam-vW); vec3 L=normalize(uCam+vec3(0.0,2.0,-1.0)-vW);
        float d=length(uCam-vW);
        float sp=pow(max(dot(N,normalize(L+V)),0.0),80.0)*1.5;
        float f=pow(1.0-max(dot(N,V),0.0),4.0);
        vec3 c=col*(0.55+0.55*max(dot(N,L),0.0))+sp+vec3(0.7,1.0,0.5)*f*0.3;
        c*=1.0/(1.0+0.004*d*d);
        c=mix(c,vec3(0.16,0.05,0.04),1.0-exp(-0.02*d));
        gl_FragColor=vec4(c,1.0);
      }`,
  });

const tailMat = () =>
  new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uPh: { value: 0 }, uAmp: { value: 0.14 }, uDead: { value: 0 } },
    vertexShader: /* glsl */ `uniform float uT,uPh,uAmp; varying float vS; varying vec3 vN;
      void main(){ vec3 p=position; float s=clamp(p.y/1.1+0.5,0.0,1.0); vS=s;
        p.x+=sin(s*5.0-uT*16.0+uPh)*uAmp*s; p.z+=cos(s*4.0-uT*12.0+uPh)*uAmp*0.3*s; p.xz*=(1.0-0.75*s)+0.25;
        vN=normal; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0); }`,
    fragmentShader: /* glsl */ `uniform float uDead; varying float vS; varying vec3 vN;
      void main(){ float l=0.55+0.45*abs(vN.x); vec3 c=mix(vec3(0.92,0.92,0.95),vec3(0.55,0.56,0.6),vS)*l; c=mix(c,c*0.55,uDead); gl_FragColor=vec4(c,1.0); }`,
  });

// ───────────────────────── pod (glass capsule with a tiny pilot)
export type Pod = { g: THREE.Group; glass: THREE.ShaderMaterial; tail: THREE.ShaderMaterial; pilot: THREE.Group; inner: THREE.Group };

const std = (hex: number, r = 0.5, m = 0, e = 0) => new THREE.MeshStandardMaterial({ color: hex, roughness: r, metalness: m, emissive: e ? hex : 0, emissiveIntensity: e });
const M = {
  shell: new THREE.MeshStandardMaterial({ color: 0xf4f4f6, roughness: 0.25, emissive: 0x3a3a3c }),
  band: std(0x1a1c20, 0.35, 0.6),
  seat: std(0x2a2d33, 0.5, 0.2),
  cyan: std(0x22e6d8, 0.4, 0, 1.6),
  shirt: std(0xc8452f, 0.75),
  jeans: std(0x3d5f8c, 0.8),
  skin: std(0xd9a07e, 0.6),
  helmet: std(0xf4f4f6, 0.2),
  visor: std(0x101418, 0.1, 0.5),
  hair: std(0x2b1c14, 0.8),
  shoe: std(0xd23a2a, 0.6),
};

const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number) => {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  o.position.set(x, y, z);
  return o;
};
const cap = (r: number, l: number, m: THREE.Material, x: number, y: number, z: number, rx = 0) => {
  const o = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 6, 14), m);
  o.position.set(x, y, z);
  o.rotation.x = rx;
  return o;
};
const ball = (r: number, m: THREE.Material, x: number, y: number, z: number, seg = 20) => {
  const o = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7)), m);
  o.position.set(x, y, z);
  return o;
};

export const makePod = (): Pod => {
  const g = new THREE.Group();
  const inner = new THREE.Group();
  g.add(inner);
  // back half: white shell (tail side = +z)
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.305, 40, 20, 0, Math.PI * 2, Math.PI * 0.6, Math.PI * 0.4), M.shell); // bottom bowl
  inner.add(shell);
  // bands: equator + meridian
  const t1 = new THREE.Mesh(new THREE.TorusGeometry(0.306, 0.009, 8, 64), M.band);
  t1.rotation.x = Math.PI / 2;
  const t2 = new THREE.Mesh(new THREE.TorusGeometry(0.306, 0.009, 8, 64), M.band);
  t2.rotation.y = Math.PI / 2;
  const t3 = new THREE.Mesh(new THREE.TorusGeometry(0.306, 0.012, 8, 64), M.band);
  inner.add(t1, t2, t3);
  // seat + cyan strips
  const pilot = new THREE.Group();
  pilot.add(box(0.15, 0.12, 0.03, M.seat, 0, -0.07, 0.1), box(0.16, 0.03, 0.13, M.seat, 0, -0.12, 0.04));
  pilot.add(box(0.008, 0.12, 0.01, M.cyan, -0.078, -0.07, 0.085), box(0.008, 0.12, 0.01, M.cyan, 0.078, -0.07, 0.085));
  // pilot
  pilot.add(cap(0.042, 0.05, M.shirt, 0, -0.04, 0.05), cap(0.03, 0.04, M.shirt, 0, -0.005, 0.05, Math.PI / 2));
  pilot.add(ball(0.05, M.helmet, 0, 0.065, 0.045), ball(0.036, M.skin, 0, 0.058, 0.02), ball(0.03, M.hair, 0, 0.078, 0.034, 12));
  pilot.add(box(0.062, 0.025, 0.012, M.visor, 0, 0.08, 0.003));
  pilot.add(cap(0.017, 0.09, M.jeans, -0.024, -0.1, -0.01, Math.PI / 2), cap(0.017, 0.09, M.jeans, 0.024, -0.1, -0.01, Math.PI / 2));
  pilot.add(box(0.034, 0.03, 0.03, M.shoe, -0.026, -0.12, -0.07), box(0.034, 0.03, 0.03, M.shoe, 0.026, -0.12, -0.07));
  const armL = cap(0.014, 0.07, M.shirt, -0.058, -0.04, 0.0, Math.PI / 2 + 0.35);
  const armR = cap(0.014, 0.07, M.shirt, 0.058, -0.04, 0.0, Math.PI / 2 + 0.35);
  pilot.add(armL, armR, box(0.014, 0.05, 0.014, M.band, -0.064, -0.06, -0.05), box(0.014, 0.05, 0.014, M.band, 0.064, -0.06, -0.05));
  pilot.scale.setScalar(1.3);
  pilot.position.set(0, 0.035, -0.01);
  inner.add(pilot);
  // glass dome (whole sphere, drawn last)
  const glass = glassMat();
  const gm = new THREE.Mesh(new THREE.SphereGeometry(0.31, 40, 28), glass);
  gm.renderOrder = 10;
  inner.add(gm);
  // tail
  const tail = tailMat();
  const tm = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 1.1, 8, 48), tail);
  tm.rotation.x = Math.PI / 2; // +y → +z
  tm.position.z = 0.29 + 0.55;
  g.add(tm);
  return { g, glass, tail, pilot, inner };
};

// ───────────────────────── golden buffer fluid
const goldMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uT: { value: 0 }, uA: { value: 0 }, uSize: { value: 30 } },
    vertexShader: /* glsl */ `uniform float uT,uSize; attribute vec4 seed; varying float vF;
      void main(){
        float age=fract(uT*0.55+seed.w);
        vec3 dir=normalize(vec3(seed.x-0.5,seed.y-0.5,-1.6+seed.z*0.4));
        vec3 p=position+dir*age*2.6+vec3(sin(seed.z*40.0+uT*3.0),cos(seed.x*30.0+uT*2.5),0.0)*0.08*age;
        vF=(1.0-age)*smoothstep(0.0,0.08,age);
        vec4 mv=modelViewMatrix*vec4(p,1.0); gl_Position=projectionMatrix*mv; gl_PointSize=uSize*(0.5+seed.y)*(1.0+age)/-mv.z; }`,
    fragmentShader: /* glsl */ `uniform float uA; varying float vF;
      void main(){ vec2 d=gl_PointCoord-0.5; float r=length(d); if(r>0.5) discard;
        vec3 c=mix(vec3(1.0,0.82,0.25),vec3(0.95,0.55,0.05),smoothstep(0.0,0.5,r));
        c+=pow(max(0.0,1.0-r*2.6),3.0)*0.6;
        gl_FragColor=vec4(c,smoothstep(0.5,0.3,r)*vF*uA); }`,
  });

export const buildWorld = (scene: THREE.Scene) => {
  scene.background = new THREE.Color(0x200406);
  // tunnel: an open cylinder along z that travels with the camera (shape comes from world z in the shader)
  const tg = new THREE.CylinderGeometry(R, R, 120, 160, 900, true);
  tg.rotateX(Math.PI / 2);
  const tunnelM = tunnelMat();
  const tunnel = new THREE.Mesh(tg, tunnelM);
  tunnel.frustumCulled = false;
  scene.add(tunnel);

  // lights for the standard materials
  const head = new THREE.PointLight(0xfff1ea, 7, 0, 1.2);
  const fill = new THREE.PointLight(0xffb0a0, 2.5, 0, 1.2);
  const glowL = new THREE.PointLight(0x9fd8ff, 0, 0, 1.0);
  scene.add(head, fill, glowL, new THREE.AmbientLight(0xff8f86, 0.9), new THREE.HemisphereLight(0xffe2dc, 0x501010, 0.7));

  // opening glow
  const glowTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const x = c.getContext("2d")!;
    const gr = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, "rgba(215,242,255,1)");
    gr.addColorStop(0.3, "rgba(110,200,255,0.95)");
    gr.addColorStop(0.7, "rgba(80,170,255,0.35)");
    gr.addColorStop(1, "rgba(60,140,255,0)");
    x.fillStyle = gr;
    x.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  })();
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(glow);

  const pods: Pod[] = Array.from({ length: 44 }, () => {
    const p = makePod();
    scene.add(p.g);
    return p;
  });

  const icoHi = new THREE.IcosahedronGeometry(1, 5);
  const blobs = Array.from({ length: 30 }, (_, i) => {
    const m = blobMat(new THREE.Color(0.55, 0.95, 0.12));
    m.uniforms.uSeed.value = i * 3.7;
    const o = new THREE.Mesh(icoHi, m);
    scene.add(o);
    return o;
  });

  const cells = Array.from({ length: 6 }, (_, i) => {
    const m = blobMat(new THREE.Color(0.93, 0.91, 0.96));
    m.uniforms.uSeed.value = 50 + i * 5.1;
    m.uniforms.uAmp.value = 0.16;
    m.uniforms.uFreq.value = 2.2;
    m.uniforms.uSss.value = 1;
    const o = new THREE.Mesh(icoHi, m);
    scene.add(o);
    return o;
  });

  const sea = new THREE.Mesh(new THREE.PlaneGeometry(12, 160, 120, 700).rotateX(-Math.PI / 2), seaMat());
  sea.frustumCulled = false;
  scene.add(sea);

  // egg: body + zona + corona cells; morula (dividing embryo) inside a zona
  const egg = new THREE.Group();
  const eggBody = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), eggMat());
  const zona = new THREE.Mesh(new THREE.SphereGeometry(1.12, 64, 48), zonaMat());
  zona.renderOrder = 11;
  const corona = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 9), std(0xf0a9a2, 0.55), 220);
  const dm = new THREE.Object3D();
  for (let i = 0; i < 220; i++) {
    const u = Math.sin(i * 12.9898) * 43758.5453, v = Math.sin(i * 78.233) * 12345.678;
    const th = 2 * Math.PI * (u - Math.floor(u)), ph = Math.acos(2 * (v - Math.floor(v)) - 1);
    const rr = 1.2 + 0.08 * Math.sin(i * 3.1);
    dm.position.set(rr * Math.sin(ph) * Math.cos(th), rr * Math.sin(ph) * Math.sin(th), rr * Math.cos(ph));
    dm.scale.setScalar(0.045 + 0.03 * Math.abs(Math.sin(i * 1.7)));
    dm.updateMatrix();
    corona.setMatrixAt(i, dm.matrix);
  }
  egg.add(eggBody, corona, zona);
  scene.add(egg);

  const morula = new THREE.Group();
  const cellsM = Array.from({ length: 8 }, () => {
    const o = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), eggMat());
    morula.add(o);
    return o;
  });
  const mZona = new THREE.Mesh(new THREE.SphereGeometry(1.12, 64, 48), zonaMat());
  mZona.renderOrder = 11;
  morula.add(mZona);
  scene.add(morula);

  // golden fluid particles
  const N = 2600;
  const gg = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3), sd = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    const h = (k: number) => { const x = Math.sin(i * 91.7 + k * 17.3) * 43758.5453; return x - Math.floor(x); };
    pos.set([(h(1) - 0.5) * 3.2, (h(2) - 0.5) * 2.4, (h(3) - 0.5) * 1.5], i * 3);
    sd.set([h(4), h(5), h(6), h(7)], i * 4);
  }
  gg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  gg.setAttribute("seed", new THREE.BufferAttribute(sd, 4));
  const goldM = goldMat();
  const gold = new THREE.Points(gg, goldM);
  gold.frustumCulled = false;
  scene.add(gold);

  return { tunnel, tunnelM, head, fill, glowL, glow, pods, blobs, cells, sea, egg, eggBody, zona, corona, morula, cellsM, mZona, gold, goldM };
};
export type World = ReturnType<typeof buildWorld>;
