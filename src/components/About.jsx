import React from 'react'

const STATS = [
  { value: '10K+', label: 'Followers' },
  { value: '300K+', label: 'Content Views' },
  { value: '3+', label: 'Projects' },
  { value: '2', label: 'Internships' },
]

export default function About() {
  return (
    <section id="about" className="about">
      <div className="about-grid">
        <div className="about-avatar-wrap">
          <div className="about-avatar">
            <span className="about-avatar-emoji">🍉</span>
            <div className="about-ring" />
          </div>
        </div>
        <div>
          <p className="about-eyebrow">About Me</p>
          <h2 className="about-title">
            AI Designer with<br />a builder's mindset
          </h2>
          <p className="about-text">
            I'm Ticxixi — an AI-native designer and developer. I track global generative-AI trends,
            build product demos, and create compelling content at the intersection of design and
            large-model technology. From crafting UX to deploying working prototypes, I turn AI
            concepts into tangible results.
          </p>
          <a href="mailto:1279514571@qq.com" className="about-mail">
            1279514571@qq.com →
          </a>
        </div>
      </div>

      <div className="about-stats">
        {STATS.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
