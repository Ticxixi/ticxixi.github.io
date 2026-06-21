import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import './LogoLoop.css';

const ANIMATION_CONFIG = { SMOOTH_TAU: 0.25, MIN_COPIES: 2, COPY_HEADROOM: 2 };

const useResizeObserver = (callback, elements, deps) => {
  useEffect(() => {
    if (!window.ResizeObserver) {
      window.addEventListener('resize', callback);
      callback();
      return () => window.removeEventListener('resize', callback);
    }
    const observers = elements.map(ref => {
      if (!ref.current) return null;
      const o = new ResizeObserver(callback);
      o.observe(ref.current);
      return o;
    });
    callback();
    return () => observers.forEach(o => o?.disconnect());
  }, [callback, elements, deps]);
};

const useAnimationLoop = (trackRef, targetVelocity, seqWidth, seqHeight, isHovered, hoverSpeed, isVertical) => {
  const rafRef = useRef(null);
  const lastTsRef = useRef(null);
  const offsetRef = useRef(0);
  const velRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const seqSize = isVertical ? seqHeight : seqWidth;
    if (seqSize > 0) {
      offsetRef.current = ((offsetRef.current % seqSize) + seqSize) % seqSize;
      track.style.transform = isVertical ? `translate3d(0,${-offsetRef.current}px,0)` : `translate3d(${-offsetRef.current}px,0,0)`;
    }
    const animate = ts => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = Math.max(0, ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      const target = isHovered && hoverSpeed !== undefined ? hoverSpeed : targetVelocity;
      velRef.current += (target - velRef.current) * (1 - Math.exp(-dt / ANIMATION_CONFIG.SMOOTH_TAU));
      if (seqSize > 0) {
        offsetRef.current = ((offsetRef.current + velRef.current * dt) % seqSize + seqSize) % seqSize;
        track.style.transform = isVertical ? `translate3d(0,${-offsetRef.current}px,0)` : `translate3d(${-offsetRef.current}px,0,0)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); lastTsRef.current = null; };
  }, [targetVelocity, seqWidth, seqHeight, isHovered, hoverSpeed, isVertical]);
};

const LogoLoop = memo(({ logos, speed = 120, direction = 'left', width = '100%', logoHeight = 28, gap = 32, hoverSpeed, fadeOut = false, fadeOutColor, scaleOnHover = false, className }) => {
  const containerRef = useRef(null), trackRef = useRef(null), seqRef = useRef(null);
  const [seqWidth, setSeqWidth] = useState(0), [copyCount, setCopyCount] = useState(ANIMATION_CONFIG.MIN_COPIES);
  const [isHovered, setIsHovered] = useState(false);

  const isVertical = direction === 'up' || direction === 'down';
  const targetVelocity = useMemo(() => {
    const m = Math.abs(speed) * (isVertical ? (direction === 'up' ? 1 : -1) : (direction === 'left' ? 1 : -1)) * (speed < 0 ? -1 : 1);
    return m;
  }, [speed, direction, isVertical]);

  const updateDims = useCallback(() => {
    const cw = containerRef.current?.clientWidth ?? 0;
    const sr = seqRef.current?.getBoundingClientRect?.();
    const sw = sr?.width ?? 0;
    if (sw > 0) { setSeqWidth(Math.ceil(sw)); setCopyCount(Math.max(2, Math.ceil(cw / sw) + 2)); }
  }, []);

  useResizeObserver(updateDims, [containerRef, seqRef], [logos, gap, logoHeight]);
  useAnimationLoop(trackRef, targetVelocity, seqWidth, 0, isHovered, hoverSpeed ?? 0, false);

  const logoLists = useMemo(() => Array.from({ length: copyCount }, (_, i) => (
    <ul className="logoloop__list" key={`copy-${i}`} ref={i === 0 ? seqRef : undefined} style={{ gap }}>
      {logos.map((item, j) => (
        <li className="logoloop__item" key={`${i}-${j}`} style={{ height: logoHeight, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
          {item.node ? <span>{item.node}</span> : <img src={item.src} alt={item.alt || ''} style={{ height: logoHeight, width: 'auto' }} />}
        </li>
      ))}
    </ul>
  )), [copyCount, logos, gap, logoHeight]);

  return (
    <div ref={containerRef} className={`logoloop ${fadeOut ? 'logoloop--fade' : ''} ${scaleOnHover ? 'logoloop--scale-hover' : ''} ${className || ''}`}
      style={{ width, '--logoloop-gap': `${gap}px`, '--logoloop-logoHeight': `${logoHeight}px`, ...(fadeOutColor ? { '--logoloop-fadeColor': fadeOutColor } : {}) }}
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="logoloop__track" ref={trackRef}>{logoLists}</div>
    </div>
  );
});

LogoLoop.displayName = 'LogoLoop';
export default LogoLoop;
