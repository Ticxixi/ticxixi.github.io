import React, { useEffect, useRef } from 'react'
import './AIAvatar.css'

export default function AIAvatar() {
  const containerRef = useRef(null)
  const eyeRef = useRef(null)

  useEffect(() => {
    const onMove = e => {
      if (!containerRef.current || !eyeRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / 40
      const dy = (e.clientY - cy) / 40
      eyeRef.current.style.transform = `translate(${dx}px, ${dy}px)`
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div className="ai-avatar" ref={containerRef}>
      <div className="ai-orb">
        <div className="ai-ring ring-1" />
        <div className="ai-ring ring-2" />
        <div className="ai-ring ring-3" />
        <div className="ai-face">
          <div className="ai-eye" ref={eyeRef}>
            <div className="ai-pupil" />
          </div>
        </div>
      </div>
      <div className="ai-label">AI Assistant</div>
    </div>
  )
}
