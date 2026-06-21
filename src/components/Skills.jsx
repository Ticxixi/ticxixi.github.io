import React from 'react'

const ITEMS = [
  { icon: '✦', title: 'AI Product Thinking', desc: 'Deep understanding of large-model capabilities, prompt engineering, and AI-assisted workflows. Track global trends across GPT, Claude, Dola, and Gemini.' },
  { icon: '◇', title: 'Design & Content', desc: 'End-to-end content production — from strategy and copywriting to video editing. 10K+ followers with viral content (300K+ views).' },
  { icon: '⬡', title: 'Rapid Prototyping', desc: 'Build working demos and websites from scratch using React, Vue, and modern tooling. This portfolio is self-designed and self-coded.' },
  { icon: '◎', title: 'Market Research', desc: 'Experienced in industry analysis, competitive benchmarking, and structured information synthesis for investment and product decisions.' },
  { icon: '◈', title: 'Bilingual Communication', desc: 'Business English proficiency (reading, writing, conversation). Capable of polished marketing materials and client-facing content in English.' },
  { icon: '▣', title: 'Cross-functional', desc: 'Bridge technical, creative, and business teams. Understand developer logic, designer language, and client needs — reducing communication overhead.' },
]

export default function Skills() {
  return (
    <section id="skills" className="skills">
      <p className="section-eyebrow">Advantages</p>
      <h2 className="section-title">What I Bring</h2>
      <div className="skills-grid">
        {ITEMS.map((s, i) => (
          <div key={i} className="skill-card reveal">
            <div className="skill-icon">{s.icon}</div>
            <h3 className="skill-title">{s.title}</h3>
            <p className="skill-desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
