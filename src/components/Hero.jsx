import React, { useRef } from 'react'
import CurvedLoop from './CurvedLoop'
import TextPressure from './TextPressure'
import LogoLoop from './LogoLoop'
import './Hero.css'

export default function Hero() {
  const sectionRef = useRef(null)

  return (
    <section id="hero" className="hero" ref={sectionRef}>
      <div className="hero-glow-t" />
      <div className="hero-glow-b" />

      <div className="hero-content">
        <img src="/avatar.jpg" alt="Ticxixi" className="hero-avatar" />

        <p className="hero-label">个人创作者 · 数字游牧人 · AI 产品实践者</p>

        <div className="hero-pressure-wrap">
          <TextPressure
            text="Ticxixi"
            fontFamily="Roboto Flex"
            fontUrl="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000&display=swap"
            flex={true}
            alpha={false}
            stroke={false}
            width={true}
            weight={true}
            italic={true}
            textColor="#ffffff"
            minFontSize={42}
          />
        </div>
        <span className="hero-name-cn">西瓜</span>

        <div className="hero-marquee">
          <CurvedLoop
            marqueeText="✦ Ticxixi ✦ AI Designer ✦ Digital Nomad ✦ Content Creator ✦"
            speed={1.5}
            curveAmount={200}
            direction="left"
            interactive={true}
          />
        </div>

        <div className="hero-loop">
          <LogoLoop
            logos={[
              { node: '✦ AI 内容创作' },
              { node: '✦ 数字游牧人' },
              { node: '✦ Entp' },
              { node: '✦ 天秤座' },
              { node: '✦ 乐观主义者' },
              { node: '✦ 大模型实践' },
              { node: '✦ 中英双语' },
            ]}
            speed={60}
            direction="left"
            logoHeight={20}
            gap={40}
            hoverSpeed={0}
            fadeOut={true}
            fadeOutColor="#0A0A0A"
          />
        </div>
      </div>

      <div className="hero-scroll">
        <span>SCROLL</span>
        <div className="hero-scroll-line" />
      </div>
    </section>
  )
}
