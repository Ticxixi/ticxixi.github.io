import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset } from 'postprocessing';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './Hyperspeed.css';

const DEFAULT_COLORS = {
  roadColor: 0x080808, islandColor: 0x0a0a0a, background: 0x000000,
  shoulderLines: 0xA78BFA, brokenLines: 0xA78BFA,
  leftCars: [0xA78BFA, 0x7C3AED, 0x6366F1],
  rightCars: [0xA78BFA, 0x8B5CF6, 0x7C3AED],
  sticks: 0xA78BFA,
};

const nsin = val => Math.sin(val) * 0.5 + 0.5;

const Hyperspeed = ({ effectOptions = {} }) => {
  const hyperspeed = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    if (appRef.current) {
      appRef.current.dispose();
      appRef.current = null;
      const c = hyperspeed.current;
      if (c) while (c.firstChild) c.removeChild(c.firstChild);
    }

    const options = {
      distortion: 'turbulentDistortion', length: 400, roadWidth: 10, islandWidth: 2,
      lanesPerRoad: 3, fov: 90, fovSpeedUp: 150, speedUp: 2, carLightsFade: 0.4,
      totalSideLightSticks: 20, lightPairsPerRoadWay: 40,
      shoulderLinesWidthPercentage: 0.05, brokenLinesWidthPercentage: 0.1,
      brokenLinesLengthPercentage: 0.5, lightStickWidth: [0.12, 0.5],
      lightStickHeight: [1.3, 1.7], movingAwaySpeed: [60, 80],
      movingCloserSpeed: [-120, -160], carLightsLength: [12, 80],
      carLightsRadius: [0.05, 0.14], carWidthPercentage: [0.3, 0.5],
      carShiftX: [-0.8, 0.8], carFloorSeparation: [0, 5],
      colors: { ...DEFAULT_COLORS, ...((effectOptions.colors)) },
      onSpeedUp: () => {}, onSlowDown: () => {},
      ...effectOptions,
    };

    const random = base => Array.isArray(base) ? Math.random() * (base[1] - base[0]) + base[0] : Math.random() * base;
    const pickRandom = arr => Array.isArray(arr) ? arr[Math.floor(Math.random() * arr.length)] : arr;
    const lerp = (current, target, speed = 0.1, limit = 0.001) => {
      let change = (target - current) * speed;
      if (Math.abs(change) < limit) change = target - current;
      return change;
    };

    const mountainUniforms = { uFreq: { value: new THREE.Vector3(3, 6, 10) }, uAmp: { value: new THREE.Vector3(30, 30, 20) } };
    const xyUniforms = { uFreq: { value: new THREE.Vector2(5, 2) }, uAmp: { value: new THREE.Vector2(25, 15) } };
    const LongRaceUniforms = { uFreq: { value: new THREE.Vector2(2, 3) }, uAmp: { value: new THREE.Vector2(35, 10) } };
    const turbulentUniforms = { uFreq: { value: new THREE.Vector4(4, 8, 8, 1) }, uAmp: { value: new THREE.Vector4(25, 5, 10, 10) } };
    const deepUniforms = { uFreq: { value: new THREE.Vector2(4, 8) }, uAmp: { value: new THREE.Vector2(10, 20) }, uPowY: { value: new THREE.Vector2(20, 2) } };

    const distortions = {
      turbulentDistortion: {
        uniforms: turbulentUniforms,
        getDistortion: `uniform vec4 uFreq; uniform vec4 uAmp; float nsin(float val){return sin(val)*0.5+0.5;} #define PI 3.14159265358979
          float getX(float p){return cos(PI*p*uFreq.r+uTime)*uAmp.r+pow(cos(PI*p*uFreq.g+uTime*(uFreq.g/uFreq.r)),2.)*uAmp.g;}
          float getY(float p){return -nsin(PI*p*uFreq.b+uTime)*uAmp.b-pow(nsin(PI*p*uFreq.a+uTime/(uFreq.b/uFreq.a)),5.)*uAmp.a;}
          vec3 getDistortion(float p){return vec3(getX(p)-getX(0.0125),getY(p)-getY(0.0125),0.);}`,
        getJS: (progress, time) => {
          const uF = turbulentUniforms.uFreq.value, uA = turbulentUniforms.uAmp.value;
          const getX = p => Math.cos(Math.PI * p * uF.x + time) * uA.x + Math.pow(Math.cos(Math.PI * p * uF.y + time * (uF.y / uF.x)), 2) * uA.y;
          const getY = p => -nsin(Math.PI * p * uF.z + time) * uA.z - Math.pow(nsin(Math.PI * p * uF.w + time / (uF.z / uF.w)), 5) * uA.w;
          return new THREE.Vector3(getX(progress) - getX(progress + 0.007), getY(progress) - getY(progress + 0.007), 0).multiply(new THREE.Vector3(-2, -5, 0)).add(new THREE.Vector3(0, 0, -10));
        }
      }
    };

    const fogUniformsRef = { fogColor: { value: new THREE.Color(0x000000) }, fogNear: { value: 80 }, fogFar: { value: 200000 } };

    class CarLights {
      constructor(webgl, options, colors, speed, fade) { this.webgl = webgl; this.options = options; this.colors = colors; this.speed = speed; this.fade = fade; }
      init() {
        const opts = this.options;
        const curve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1));
        const geom = new THREE.TubeGeometry(curve, 40, 1, 8, false);
        const inst = new THREE.InstancedBufferGeometry().copy(geom);
        inst.instanceCount = opts.lightPairsPerRoadWay * 2;
        const laneW = opts.roadWidth / opts.lanesPerRoad;
        let aOff = [], aMet = [], aCol = [];
        let cols = Array.isArray(this.colors) ? this.colors.map(c => new THREE.Color(c)) : new THREE.Color(this.colors);
        for (let i = 0; i < opts.lightPairsPerRoadWay; i++) {
          let r = random(opts.carLightsRadius), l = random(opts.carLightsLength), s = random(this.speed);
          let cl = i % opts.lanesPerRoad, lx = cl * laneW - opts.roadWidth / 2 + laneW / 2;
          let cw = random(opts.carWidthPercentage) * laneW;
          lx += random(opts.carShiftX) * laneW;
          let oy = random(opts.carFloorSeparation) + r * 1.3, oz = -random(opts.length);
          aOff.push(lx - cw / 2, oy, oz); aOff.push(lx + cw / 2, oy, oz);
          aMet.push(r, l, s); aMet.push(r, l, s);
          let col = pickRandom(cols);
          aCol.push(col.r, col.g, col.b); aCol.push(col.r, col.g, col.b);
        }
        inst.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(aOff), 3, false));
        inst.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(new Float32Array(aMet), 3, false));
        inst.setAttribute('aColor', new THREE.InstancedBufferAttribute(new Float32Array(aCol), 3, false));
        const mat = new THREE.ShaderMaterial({
          fragmentShader: `#define USE_FOG;${THREE.ShaderChunk['fog_pars_fragment']}varying vec3 vColor;varying vec2 vUv;uniform vec2 uFade;void main(){vec3 color=vec3(vColor);float alpha=smoothstep(uFade.x,uFade.y,vUv.x);gl_FragColor=vec4(color,alpha);if(gl_FragColor.a<0.0001)discard;${THREE.ShaderChunk['fog_fragment']}}`,
          vertexShader: `#define USE_FOG;${THREE.ShaderChunk['fog_pars_vertex']}attribute vec3 aOffset,aMetrics,aColor;uniform float uTravelLength,uTime;varying vec2 vUv;varying vec3 vColor;#include <getDistortion_vertex>void main(){vec3 t=position.xyz;float r=aMetrics.r,l=aMetrics.g,s=aMetrics.b;t.xy*=r;t.z*=l;t.z+=l-mod(uTime*s+aOffset.z,uTravelLength);t.xy+=aOffset.xy;float p=abs(t.z/uTravelLength);t.xyz+=getDistortion(p);vec4 mv=modelViewMatrix*vec4(t,1.);gl_Position=projectionMatrix*mv;vUv=uv;vColor=aColor;${THREE.ShaderChunk['fog_vertex']}}`,
          transparent: true,
          uniforms: Object.assign({ uTime: { value: 0 }, uTravelLength: { value: opts.length }, uFade: { value: this.fade } }, fogUniformsRef, opts.distortion?.uniforms || {})
        });
        mat.onBeforeCompile = s => { s.vertexShader = s.vertexShader.replace('#include <getDistortion_vertex>', opts.distortion.getDistortion); };
        this.mesh = new THREE.Mesh(inst, mat);
        this.mesh.frustumCulled = false;
        this.webgl.scene.add(this.mesh);
      }
      update(time) { this.mesh.material.uniforms.uTime.value = time; }
    }

    class LightsSticks {
      constructor(webgl, options) { this.webgl = webgl; this.options = options; }
      init() {
        const opts = this.options;
        const geom = new THREE.PlaneGeometry(1, 1);
        const inst = new THREE.InstancedBufferGeometry().copy(geom);
        const total = opts.totalSideLightSticks;
        inst.instanceCount = total;
        const step = opts.length / (total - 1);
        let aOff = [], aCol = [], aMet = [];
        let cols = Array.isArray(opts.colors.sticks) ? opts.colors.sticks.map(c => new THREE.Color(c)) : new THREE.Color(opts.colors.sticks);
        for (let i = 0; i < total; i++) {
          let w = random(opts.lightStickWidth), h = random(opts.lightStickHeight);
          aOff.push((i - 1) * step * 2 + step * Math.random());
          let c = pickRandom(cols);
          aCol.push(c.r, c.g, c.b);
          aMet.push(w, h);
        }
        inst.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(aOff), 1, false));
        inst.setAttribute('aColor', new THREE.InstancedBufferAttribute(new Float32Array(aCol), 3, false));
        inst.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(new Float32Array(aMet), 2, false));
        const mat = new THREE.ShaderMaterial({
          fragmentShader: `#define USE_FOG;${THREE.ShaderChunk['fog_pars_fragment']}varying vec3 vColor;void main(){gl_FragColor=vec4(vColor,1.);${THREE.ShaderChunk['fog_fragment']}}`,
          vertexShader: `#define USE_FOG;${THREE.ShaderChunk['fog_pars_vertex']}attribute float aOffset;attribute vec3 aColor;attribute vec2 aMetrics;uniform float uTravelLength,uTime;varying vec3 vColor;mat4 rotationY(in float a){return mat4(cos(a),0,sin(a),0,0,1,0,0,-sin(a),0,cos(a),0,0,0,0,1);}#include <getDistortion_vertex>void main(){vec3 t=position.xyz;float w=aMetrics.x,h=aMetrics.y;t.xy*=vec2(w,h);float time=mod(uTime*60.*2.+aOffset,uTravelLength);t=(rotationY(3.14/2.)*vec4(t,1.)).xyz;t.z+=-uTravelLength+time;float p=abs(t.z/uTravelLength);t.xyz+=getDistortion(p);t.y+=h/2.;t.x+=-w/2.;vec4 mv=modelViewMatrix*vec4(t,1.);gl_Position=projectionMatrix*mv;vColor=aColor;${THREE.ShaderChunk['fog_vertex']}}`,
          side: THREE.DoubleSide,
          uniforms: Object.assign({ uTravelLength: { value: opts.length }, uTime: { value: 0 } }, fogUniformsRef, opts.distortion?.uniforms || {})
        });
        mat.onBeforeCompile = s => { s.vertexShader = s.vertexShader.replace('#include <getDistortion_vertex>', opts.distortion.getDistortion); };
        this.mesh = new THREE.Mesh(inst, mat);
        this.mesh.frustumCulled = false;
        this.webgl.scene.add(this.mesh);
      }
      update(time) { this.mesh.material.uniforms.uTime.value = time; }
    }

    class Road {
      constructor(webgl, options) { this.webgl = webgl; this.options = options; this.uTime = { value: 0 }; }
      createPlane(side, width, isRoad) {
        const opts = this.options;
        const geom = new THREE.PlaneGeometry(isRoad ? opts.roadWidth : opts.islandWidth, opts.length, 20, 100);
        let unis = { uTravelLength: { value: opts.length }, uColor: { value: new THREE.Color(isRoad ? opts.colors.roadColor : opts.colors.islandColor) }, uTime: this.uTime };
        if (isRoad) unis = Object.assign(unis, { uLanes: { value: opts.lanesPerRoad }, uBrokenLinesColor: { value: new THREE.Color(opts.colors.brokenLines) }, uShoulderLinesColor: { value: new THREE.Color(opts.colors.shoulderLines) }, uShoulderLinesWidthPercentage: { value: opts.shoulderLinesWidthPercentage }, uBrokenLinesLengthPercentage: { value: opts.brokenLinesLengthPercentage }, uBrokenLinesWidthPercentage: { value: opts.brokenLinesWidthPercentage } });
        const mat = new THREE.ShaderMaterial({
          fragmentShader: isRoad ? `#define USE_FOG;varying vec2 vUv;uniform vec3 uColor;uniform float uTime,uLanes;uniform vec3 uBrokenLinesColor,uShoulderLinesColor;uniform float uShoulderLinesWidthPercentage,uBrokenLinesWidthPercentage,uBrokenLinesLengthPercentage;highp float r(vec2 c){highp float a=12.9898,b=78.233,d=43758.5453,dt=dot(c.xy,vec2(a,b)),sn=mod(dt,3.14);return fract(sin(sn)*d);}${THREE.ShaderChunk['fog_pars_fragment']}void main(){vec2 uv=vUv;vec3 color=vec3(uColor);uv.y=mod(uv.y+uTime*0.05,1.);float lw=1.0/uLanes,blw=lw*uBrokenLinesWidthPercentage,le=1.-uBrokenLinesLengthPercentage;float bl=step(1.0-blw,fract(uv.x*2.0))*step(le,fract(uv.y*10.0));float sl=step(1.0-blw,fract((uv.x-lw*(uLanes-1.0))*2.0))+step(blw,uv.x);bl=mix(bl,sl,uv.x);if(bl>0.5)color=uBrokenLinesColor;gl_FragColor=vec4(color,1.);${THREE.ShaderChunk['fog_fragment']}}` : `#define USE_FOG;varying vec2 vUv;uniform vec3 uColor;${THREE.ShaderChunk['fog_pars_fragment']}void main(){gl_FragColor=vec4(uColor,1.);${THREE.ShaderChunk['fog_fragment']}}`,
          vertexShader: `#define USE_FOG;uniform float uTime,uTravelLength;${THREE.ShaderChunk['fog_pars_vertex']}varying vec2 vUv;#include <getDistortion_vertex>void main(){vec3 t=position.xyz;vec3 d=getDistortion((t.y+uTravelLength/2.)/uTravelLength);t.x+=d.x;t.z+=d.y;t.y+=-1.*d.z;vec4 mv=modelViewMatrix*vec4(t,1.);gl_Position=projectionMatrix*mv;vUv=uv;${THREE.ShaderChunk['fog_vertex']}}`,
          side: THREE.DoubleSide,
          uniforms: Object.assign(unis, fogUniformsRef, opts.distortion?.uniforms || {})
        });
        mat.onBeforeCompile = s => { s.vertexShader = s.vertexShader.replace('#include <getDistortion_vertex>', opts.distortion.getDistortion); };
        const mesh = new THREE.Mesh(geom, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.z = -opts.length / 2;
        mesh.position.x += (opts.islandWidth / 2 + opts.roadWidth / 2) * side;
        this.webgl.scene.add(mesh);
        return mesh;
      }
      init() { this.leftRoadWay = this.createPlane(-1, this.options.roadWidth, true); this.rightRoadWay = this.createPlane(1, this.options.roadWidth, true); this.island = this.createPlane(0, this.options.islandWidth, false); }
      update(time) { this.uTime.value = time; }
    }

    function resizeRendererToDisplaySize(renderer, setSize) {
      const canvas = renderer.domElement;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (w <= 0 || h <= 0) return false;
      if (canvas.width !== w || canvas.height !== h) setSize(w, h, false);
      return canvas.width !== w || canvas.height !== h;
    }

    const container = hyperspeed.current;
    if (!container) return;

    options.distortion = distortions[options.distortion] || distortions.turbulentDistortion;

    class App {
      constructor(container, opt) {
        this.opt = opt; this.container = container; this.hasValidSize = false;
        const w = Math.max(1, container.offsetWidth), h = Math.max(1, container.offsetHeight);
        this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        this.renderer.setSize(w, h, false);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.composer = new EffectComposer(this.renderer);
        container.append(this.renderer.domElement);
        this.camera = new THREE.PerspectiveCamera(opt.fov, w / h, 0.1, 10000);
        this.camera.position.set(0, 8, -5);
        this.scene = new THREE.Scene();
        this.scene.background = null;
        const fog = new THREE.Fog(opt.colors.background, opt.length * 0.2, opt.length * 500);
        this.scene.fog = fog;
        fogUniformsRef.fogColor.value = fog.color;
        fogUniformsRef.fogNear.value = fog.near;
        fogUniformsRef.fogFar.value = fog.far;
        this.clock = new THREE.Clock();
        this.disposed = false;
        this.road = new Road(this, opt);
        this.leftCarLights = new CarLights(this, opt, opt.colors.leftCars, opt.movingAwaySpeed, new THREE.Vector2(0, 1 - opt.carLightsFade));
        this.rightCarLights = new CarLights(this, opt, opt.colors.rightCars, opt.movingCloserSpeed, new THREE.Vector2(1, opt.carLightsFade));
        this.leftSticks = new LightsSticks(this, opt);
        this.fovTarget = opt.fov; this.speedUpTarget = 0; this.speedUp = 0; this.timeOffset = 0;
        this.onMD = () => { this.fovTarget = opt.fovSpeedUp; this.speedUpTarget = opt.speedUp; };
        this.onMU = () => { this.fovTarget = opt.fov; this.speedUpTarget = 0; };
        this.onTS = () => { this.fovTarget = opt.fovSpeedUp; this.speedUpTarget = opt.speedUp; };
        this.onTE = () => { this.fovTarget = opt.fov; this.speedUpTarget = 0; };
        this.handleResize = () => {
          const w2 = this.container.offsetWidth, h2 = this.container.offsetHeight;
          if (w2 <= 0 || h2 <= 0) { this.hasValidSize = false; return; }
          this.renderer.setSize(w2, h2); this.camera.aspect = w2 / h2; this.camera.updateProjectionMatrix();
          this.composer.setSize(w2, h2); this.hasValidSize = true;
        };
      }
      initPasses() {
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.bloomPass = new EffectPass(this.camera, new BloomEffect({ luminanceThreshold: 0.2, luminanceSmoothing: 0, resolutionScale: 1 }));
        const smaa = new EffectPass(this.camera, new SMAAEffect({ preset: SMAAPreset.MEDIUM }));
        this.renderPass.renderToScreen = false;
        this.bloomPass.renderToScreen = false;
        smaa.renderToScreen = true;
        this.composer.addPass(this.renderPass);
        this.composer.addPass(this.bloomPass);
        this.composer.addPass(smaa);
      }
      loadAssets() {
        return new Promise(resolve => {
          const mgr = new THREE.LoadingManager(resolve);
          const si = new Image(), ai = new Image();
          si.addEventListener('load', () => mgr.itemEnd('s'));
          ai.addEventListener('load', () => mgr.itemEnd('a'));
          mgr.itemStart('s'); mgr.itemStart('a');
          si.src = SMAAEffect.searchImageDataURL;
          ai.src = SMAAEffect.areaImageDataURL;
        });
      }
      init() {
        this.initPasses();
        this.road.init();
        this.leftCarLights.init(); this.leftCarLights.mesh.position.setX(-this.opt.roadWidth / 2 - this.opt.islandWidth / 2);
        this.rightCarLights.init(); this.rightCarLights.mesh.position.setX(this.opt.roadWidth / 2 + this.opt.islandWidth / 2);
        this.leftSticks.init(); this.leftSticks.mesh.position.setX(-(this.opt.roadWidth + this.opt.islandWidth / 2));
        this.container.addEventListener('mousedown', this.onMD);
        this.container.addEventListener('mouseup', this.onMU);
        this.container.addEventListener('touchstart', this.onTS, { passive: true });
        this.container.addEventListener('touchend', this.onTE);
        this.tick();
      }
      update(delta) {
        const lp = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);
        this.speedUp += lerp(this.speedUp, this.speedUpTarget, lp, 0.00001);
        this.timeOffset += this.speedUp * delta;
        const time = this.clock.elapsedTime + this.timeOffset;
        this.rightCarLights.update(time); this.leftCarLights.update(time); this.leftSticks.update(time); this.road.update(time);
        const fc = lerp(this.camera.fov, this.fovTarget, lp);
        if (Math.abs(fc) > 0.001) { this.camera.fov += fc * delta * 6; this.camera.updateProjectionMatrix(); }
        if (this.opt.distortion?.getJS) {
          const d = this.opt.distortion.getJS(0.025, time);
          this.camera.lookAt(new THREE.Vector3(this.camera.position.x + d.x, this.camera.position.y + d.y, this.camera.position.z + d.z));
          this.camera.updateProjectionMatrix();
        }
      }
      render(delta) { this.composer.render(delta); }
      dispose() {
        this.disposed = true;
        if (this.scene) { this.scene.traverse(o => { if (o.isMesh) { o.geometry?.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose()); } }); this.scene.clear(); }
        this.renderer?.dispose(); this.renderer?.forceContextLoss();
        if (this.renderer?.domElement?.parentNode) this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        this.composer?.dispose();
        this.container.removeEventListener('mousedown', this.onMD); this.container.removeEventListener('mouseup', this.onMU);
        this.container.removeEventListener('touchstart', this.onTS); this.container.removeEventListener('touchend', this.onTE);
      }
      tick() {
        if (this.disposed) return;
        if (!this.hasValidSize) {
          const w = this.container.offsetWidth, h = this.container.offsetHeight;
          if (w > 0 && h > 0) { this.renderer.setSize(w, h); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.composer.setSize(w, h); this.hasValidSize = true; }
          else { requestAnimationFrame(() => this.tick()); return; }
        }
        resizeRendererToDisplaySize(this.renderer, (w, h) => { this.composer.setSize(w, h); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); });
        if (this.hasValidSize) { const dt = this.clock.getDelta(); this.render(dt); this.update(dt); }
        requestAnimationFrame(() => this.tick());
      }
    }

    const myApp = new App(container, options);
    appRef.current = myApp;
    myApp.loadAssets().then(() => myApp.init());

    return () => { if (appRef.current) { appRef.current.dispose(); appRef.current = null; } };
  }, []);

  return <div id="lights" ref={hyperspeed} />;
};

export default Hyperspeed;
