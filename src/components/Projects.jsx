import React from 'react'
import ChromaGrid from './ChromaGrid'

const PROJECTS = [
  {
    image: '/photo.png',
    title: 'AI Portfolio Website',
    subtitle: 'Design & Development · React + Vite',
    handle: 'Live Demo',
    borderColor: '#A78BFA',
    gradient: 'linear-gradient(145deg, #1a1a2e, #0A0A0A)',
  },
  {
    image: '/photo.png',
    title: 'Dola Global Market Research',
    subtitle: 'Industry Analysis · B-end Strategy',
    handle: 'Research Report',
    borderColor: '#7dd3fc',
    gradient: 'linear-gradient(145deg, #16213e, #0A0A0A)',
  },
  {
    image: '/photo.png',
    title: 'AI Product Copywriting',
    subtitle: 'Marketing Content · English + CN',
    handle: 'Copywriting Samples',
    borderColor: '#c4b5fd',
    gradient: 'linear-gradient(145deg, #1a1a2e, #0A0A0A)',
  },
]

export default function Projects() {
  return (
    <section id="projects" className="projects">
      <p className="section-eyebrow">Selected Work</p>
      <h2 className="section-title">Featured Projects</h2>

      <div className="chroma-reveal reveal">
        <ChromaGrid
          items={PROJECTS}
          radius={260}
          columns={3}
          rows={1}
          damping={0.4}
          fadeOut={0.5}
          ease="power3.out"
        />
      </div>
    </section>
  )
}
