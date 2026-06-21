import React from 'react'

const PROJECTS = [
  {
    id: 1,
    title: 'AI Portfolio Website',
    subtitle: 'Design & Development · 2026',
    desc: 'A bilingual dark-themed portfolio built with React & Vite. Designed end-to-end — from visual identity to responsive code — to showcase AI product thinking and design craftsmanship.',
    tags: ['React', 'Vite', 'Design', 'Bilingual'],
    color: '#6c5ce7',
  },
  {
    id: 2,
    title: 'Dola Global Market Research',
    subtitle: 'Industry Analysis · 2026',
    desc: 'Compiled a comprehensive market research report on Dola (ByteDance overseas AI product), covering competitive landscape, B-end positioning, and global go-to-market strategies.',
    tags: ['Research', 'AI Market', 'B-end', 'Dola'],
    color: '#7dd3fc',
  },
  {
    id: 3,
    title: 'AI Product Copywriting',
    subtitle: 'Marketing Content · 2026',
    desc: 'A collection of English marketing copy for hypothetical AI product launches targeting overseas enterprise clients — including product one-pagers, announcements, and B-end templates.',
    tags: ['Copywriting', 'Marketing', 'English', 'B-end'],
    color: '#a78bfa',
  },
]

export default function Projects() {
  return (
    <section id="projects" className="projects">
      <p className="section-eyebrow">Selected Work</p>
      <h2 className="section-title">Featured Projects</h2>

      <div className="project-grid">
        {PROJECTS.map(p => (
          <article key={p.id} className="project-card">
            <div className="project-img" style={{ background: `linear-gradient(135deg, ${p.color}15, ${p.color}05)` }}>
              <div className="project-img-graphic" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}88)`, opacity: 0.6 }} />
              <div className="project-img-glow" style={{ background: p.color }} />
            </div>
            <div className="project-body">
              <p className="project-subtitle">{p.subtitle}</p>
              <h3 className="project-name">{p.title}</h3>
              <p className="project-desc">{p.desc}</p>
              <div className="project-tags">
                {p.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
