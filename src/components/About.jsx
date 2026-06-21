import React from 'react'
import TiltedCard from './TiltedCard'
import RotatingText from './RotatingText'
import SplitText from './SplitText'
import MagicBento from './MagicBento'

export default function About() {
  return (
    <section id="about" className="about">
      <div className="about-grid">
        {/* Left: Tilted Photo */}
        <div className="about-photo-wrap">
          <TiltedCard
            imageSrc="/photo.png"
            altText="Ticxixi"
            containerHeight="300px"
            containerWidth="300px"
            imageHeight="300px"
            imageWidth="300px"
            rotateAmplitude={10}
            scaleOnHover={1.05}
            showMobileWarning={false}
            showTooltip={false}
          />
        </div>

        {/* Right: Info */}
        <div className="reveal">
          <SplitText
            text="About Me"
            className="about-eyebrow"
            tag="p"
            delay={60}
            duration={0.8}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 20 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.2}
            textAlign="left"
          />
          <h2 className="about-title">
            <RotatingText
              texts={[
                'AI 内容创作者',
                '数字游牧人',
                'AI 产品实践者',
                '个人自媒体创作者',
              ]}
              splitBy="characters"
              staggerDuration={0.03}
              staggerFrom="first"
              rotationInterval={2500}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              mainClassName="about-rotating"
            />
          </h2>
          <p className="about-text">
            我是 Ticxixi——AI 时代的内容创作者与技术实践者。
            持续跟踪全球生成式 AI 趋势，从大模型产品体验到行业调研，
            从短视频内容创作到独立搭建 Demo——我擅长将复杂信息转化为
            可传播的内容，将 AI 概念落地为可用的产品原型。
          </p>
          <p className="about-text">
            I'm Ticxixi — a content creator and AI practitioner. I track global
            generative-AI trends, build product demos, and create compelling
            content at the intersection of creativity and large-model technology.
          </p>
          <a href="mailto:1279514571@qq.com" className="about-mail">
            1279514571@qq.com →
          </a>
        </div>
      </div>

      <div className="about-bento reveal">
        <MagicBento
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={false}
          enableMagnetism={true}
          clickEffect={true}
          glowColor="167,139,250"
        />
      </div>
    </section>
  )
}
