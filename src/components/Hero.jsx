import React, { useEffect, useRef } from 'react'

export default function Hero() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const c = canvasRef.current
    const ctx = c.getContext('2d')
    let anim
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
    }))

    function draw() {
      ctx.clearRect(0, 0, c.width, c.height)
      pts.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > c.width) p.vx *= -1
        if (p.y < 0 || p.y > c.height) p.vy *= -1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(108,92,231,0.5)'; ctx.fill()
        pts.slice(i + 1).forEach(q => {
          const d = Math.hypot(p.x - q.x, p.y - q.y)
          if (d < 140) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(108,92,231,${0.08 * (1 - d / 140)})`
            ctx.lineWidth = 0.5; ctx.stroke()
          }
        })
      })
      anim = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <section id="hero" className="hero">
      <canvas ref={canvasRef} className="hero-canvas" />
      <div className="hero-glow-t" />
      <div className="hero-glow-b" />

      <div className="hero-content">
        <p className="hero-eyebrow">AI Designer &amp; Developer</p>
        <h1 className="hero-title">
          Design meets<br /><span>Artificial Intelligence</span>
        </h1>
        <p className="hero-desc">
          Building bridges between design thinking and AI technology.
          Crafting next-gen digital experiences with code, creativity, and large models.
        </p>
        <div className="hero-btns">
          <a href="#projects" className="btn-white">View Projects</a>
          <a href="#contact" className="btn-outline">Contact Me</a>
        </div>
      </div>

      <div className="hero-scroll">
        <span>SCROLL</span>
        <div className="hero-scroll-line" />
      </div>
    </section>
  )
}
