import { useEffect, useRef, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import './TargetCursor.css';

const getContainingBlock = element => {
  let node = element?.parentElement;
  while (node && node !== document.documentElement) {
    const style = getComputedStyle(node);
    if (style.transform !== 'none' || style.perspective !== 'none' || style.filter !== 'none' || style.willChange.includes('transform') || style.willChange.includes('perspective') || style.willChange.includes('filter') || /paint|layout|strict|content/.test(style.contain)) return node;
    node = node.parentElement;
  }
  return null;
};

const getContainingBlockOffset = block => {
  if (!block) return { x: 0, y: 0 };
  const rect = block.getBoundingClientRect();
  return { x: rect.left + block.clientLeft, y: rect.top + block.clientTop };
};

const TargetCursor = ({
  targetSelector = '.cursor-target',
  spinDuration = 2,
  hideDefaultCursor = true,
  hoverDuration = 0.2,
  parallaxOn = true,
  cursorColor = '#A78BFA',
  cursorColorOnTarget,
}) => {
  const cursorRef = useRef(null);
  const cornersRef = useRef(null);
  const spinTl = useRef(null);
  const dotRef = useRef(null);
  const containingBlockRef = useRef(null);
  const isActiveRef = useRef(false);
  const targetCornerPositionsRef = useRef(null);
  const tickerFnRef = useRef(null);
  const activeStrengthRef = useRef(0);

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const small = window.innerWidth <= 768;
    const ua = navigator.userAgent || navigator.vendor || '';
    return (hasTouch && small) || /android|iphone|ipad|ipod/i.test(ua.toLowerCase());
  }, []);

  const constants = useMemo(() => ({ borderWidth: 2, cornerSize: 10 }), []);

  const moveCursor = useCallback((x, y) => {
    if (!cursorRef.current) return;
    const { x: ox, y: oy } = getContainingBlockOffset(containingBlockRef.current);
    gsap.to(cursorRef.current, { x: x - ox, y: y - oy, duration: 0.1, ease: 'power3.out' });
  }, []);

  useEffect(() => {
    if (isMobile || !cursorRef.current) return;
    const orig = document.body.style.cursor;
    if (hideDefaultCursor) document.body.style.cursor = 'none';

    const cursor = cursorRef.current;
    cornersRef.current = cursor.querySelectorAll('.target-cursor-corner');
    containingBlockRef.current = getContainingBlock(cursor);
    const getOffset = () => getContainingBlockOffset(containingBlockRef.current);
    let activeTarget = null, currentLeaveHandler = null, resumeTimeout = null;

    const cleanupTarget = target => { if (currentLeaveHandler) { target.removeEventListener('mouseleave', currentLeaveHandler); } currentLeaveHandler = null; };

    const initOffset = getOffset();
    gsap.set(cursor, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2 - initOffset.x, y: window.innerHeight / 2 - initOffset.y });

    spinTl.current = gsap.timeline({ repeat: -1 }).to(cursor, { rotation: '+=360', duration: spinDuration, ease: 'none' });

    tickerFnRef.current = () => {
      if (!targetCornerPositionsRef.current || !cursorRef.current || !cornersRef.current) return;
      const s = activeStrengthRef.current;
      if (s === 0) return;
      const cx = gsap.getProperty(cursorRef.current, 'x'), cy = gsap.getProperty(cursorRef.current, 'y');
      Array.from(cornersRef.current).forEach((corner, i) => {
        const tx = targetCornerPositionsRef.current[i].x - cx, ty = targetCornerPositionsRef.current[i].y - cy;
        gsap.to(corner, { x: gsap.getProperty(corner, 'x') + (tx - gsap.getProperty(corner, 'x')) * s, y: gsap.getProperty(corner, 'y') + (ty - gsap.getProperty(corner, 'y')) * s, duration: s >= 0.99 ? (parallaxOn ? 0.2 : 0) : 0.05, ease: 'power1.out', overwrite: 'auto' });
      });
    };

    window.addEventListener('mousemove', e => moveCursor(e.clientX, e.clientY));
    window.addEventListener('mousedown', () => { gsap.to(dotRef.current, { scale: 0.7, duration: 0.2 }); gsap.to(cursorRef.current, { scale: 0.9, duration: 0.2 }); });
    window.addEventListener('mouseup', () => { gsap.to(dotRef.current, { scale: 1, duration: 0.2 }); gsap.to(cursorRef.current, { scale: 1, duration: 0.2 }); });

    const enterHandler = e => {
      let target = e.target;
      while (target && !target.matches(targetSelector)) target = target.parentElement;
      if (!target || !cursor) return;
      if (activeTarget === target) return;
      if (activeTarget) cleanupTarget(activeTarget);
      if (resumeTimeout) { clearTimeout(resumeTimeout); resumeTimeout = null; }
      activeTarget = target;
      const corners = Array.from(cornersRef.current);
      corners.forEach(c => gsap.killTweensOf(c, 'x,y'));
      gsap.killTweensOf(cursor, 'rotation');
      spinTl.current?.pause();
      gsap.set(cursor, { rotation: 0 });

      if (cursorColorOnTarget) {
        gsap.to(corners, { borderColor: cursorColorOnTarget, duration: 0.15, ease: 'power2.out' });
        if (dotRef.current) gsap.to(dotRef.current, { backgroundColor: cursorColorOnTarget, duration: 0.15, ease: 'power2.out' });
      }

      const rect = target.getBoundingClientRect();
      const { borderWidth, cornerSize } = constants;
      const { x: ox, y: oy } = getOffset();
      const cx = gsap.getProperty(cursor, 'x'), cy = gsap.getProperty(cursor, 'y');
      targetCornerPositionsRef.current = [
        { x: rect.left - borderWidth - ox, y: rect.top - borderWidth - oy },
        { x: rect.right + borderWidth - cornerSize - ox, y: rect.top - borderWidth - oy },
        { x: rect.right + borderWidth - cornerSize - ox, y: rect.bottom + borderWidth - cornerSize - oy },
        { x: rect.left - borderWidth - ox, y: rect.bottom + borderWidth - cornerSize - oy },
      ];
      isActiveRef.current = true;
      gsap.ticker.add(tickerFnRef.current);
      gsap.to(activeStrengthRef, { current: 1, duration: hoverDuration, ease: 'power2.out' });
      corners.forEach((corner, i) => gsap.to(corner, { x: targetCornerPositionsRef.current[i].x - cx, y: targetCornerPositionsRef.current[i].y - cy, duration: 0.2, ease: 'power2.out' }));

      const leaveHandler = () => {
        gsap.ticker.remove(tickerFnRef.current);
        isActiveRef.current = false;
        targetCornerPositionsRef.current = null;
        gsap.set(activeStrengthRef, { current: 0, overwrite: true });
        activeTarget = null;
        if (cursorColorOnTarget && cornersRef.current) {
          gsap.to(Array.from(cornersRef.current), { borderColor: cursorColor, duration: 0.15, ease: 'power2.out' });
          if (dotRef.current) gsap.to(dotRef.current, { backgroundColor: cursorColor, duration: 0.15, ease: 'power2.out' });
        }
        if (cornersRef.current) {
          const cs = Array.from(cornersRef.current);
          gsap.killTweensOf(cs, 'x,y');
          const { cornerSize: sz } = constants;
          const pos = [{ x: -sz * 1.5, y: -sz * 1.5 }, { x: sz * 0.5, y: -sz * 1.5 }, { x: sz * 0.5, y: sz * 0.5 }, { x: -sz * 1.5, y: sz * 0.5 }];
          gsap.timeline().to(cs, { x: pos[0].x, y: pos[0].y, duration: 0.3, ease: 'power3.out' }, 0)
            .to(cs[1], { x: pos[1].x, y: pos[1].y, duration: 0.3, ease: 'power3.out' }, 0)
            .to(cs[2], { x: pos[2].x, y: pos[2].y, duration: 0.3, ease: 'power3.out' }, 0)
            .to(cs[3], { x: pos[3].x, y: pos[3].y, duration: 0.3, ease: 'power3.out' }, 0);
        }
        resumeTimeout = setTimeout(() => {
          if (!activeTarget && cursorRef.current) {
            const cr = gsap.getProperty(cursorRef.current, 'rotation') % 360;
            spinTl.current?.kill();
            spinTl.current = gsap.timeline({ repeat: -1 }).to(cursorRef.current, { rotation: '+=360', duration: spinDuration, ease: 'none' });
            gsap.to(cursorRef.current, { rotation: cr + 360, duration: spinDuration * (1 - cr / 360), ease: 'none', onComplete: () => spinTl.current?.restart() });
          }
          resumeTimeout = null;
        }, 50);
        cleanupTarget(target);
      };
      currentLeaveHandler = leaveHandler;
      target.addEventListener('mouseleave', leaveHandler);
    };
    window.addEventListener('mouseover', enterHandler);

    return () => {
      if (tickerFnRef.current) gsap.ticker.remove(tickerFnRef.current);
      window.removeEventListener('mousemove', e => moveCursor(e.clientX, e.clientY));
      window.removeEventListener('mouseover', enterHandler);
      if (activeTarget) cleanupTarget(activeTarget);
      spinTl.current?.kill();
      document.body.style.cursor = orig;
    };
  }, [targetSelector, spinDuration, moveCursor, constants, hideDefaultCursor, isMobile, hoverDuration, parallaxOn, cursorColor, cursorColorOnTarget]);

  if (isMobile) return null;

  return (
    <div ref={cursorRef} className="target-cursor-wrapper">
      <div ref={dotRef} className="target-cursor-dot" style={{ backgroundColor: cursorColor }} />
      <div className="target-cursor-corner corner-tl" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-tr" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-br" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-bl" style={{ borderColor: cursorColor }} />
    </div>
  );
};

export default TargetCursor;
