import React, { useState, useEffect } from 'react'

const LINKS = [
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <a href="#hero" className="navbar-logo">Ticxixi</a>
      <div className="navbar-links">
        {LINKS.map(l => (
          <a key={l.href} href={l.href}>{l.label}</a>
        ))}
        <a href="#contact" className="navbar-cta">Get in touch</a>
      </div>
    </nav>
  )
}
