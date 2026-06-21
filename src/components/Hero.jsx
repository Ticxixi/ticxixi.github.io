import React from 'react'

export default function Hero() {
  return (
    <section id="hero" className="hero">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute', inset: 0, zIndex: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
        }}
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for text readability */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'rgba(0,0,0,0.55)',
      }} />

      {/* Ambient glows */}
      <div className="hero-glow-t" />
      <div className="hero-glow-b" />

      <div className="hero-content">
        <p className="hero-eyebrow">AI Designer &amp; Digital Nomad</p>
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
