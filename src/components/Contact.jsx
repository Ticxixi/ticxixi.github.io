import React from 'react'

export default function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="contact-glow" />
      <div className="contact-inner reveal">
        <p className="section-eyebrow">Get in Touch</p>
        <h2 className="contact-title">Let's build<br />something together</h2>
        <p className="contact-text">
          I'm open to opportunities in AI product design, content strategy,
          and overseas market expansion. Reach out and let's talk.
        </p>
        <div className="contact-btns">
          <a href="mailto:1279514571@qq.com" className="btn-white">Send Email</a>
          <a href="https://github.com/Ticxixi" target="_blank" rel="noopener" className="btn-outline">GitHub</a>
        </div>
        <div className="contact-footer">
          <p className="contact-footer-tag">Explore global AI business with Dola</p>
          <p className="contact-footer-copy">© 2026 Ticxixi</p>
        </div>
      </div>
    </section>
  )
}
