import './GlitchText.css';

const GlitchText = ({ children, speed = 1, enableShadows = true, enableOnHover = true, className = '' }) => {
  const inlineStyles = {
    '--after-duration': `${speed * 3}s`,
    '--before-duration': `${speed * 2}s`,
    '--after-shadow': enableShadows ? '-4px 0 #A78BFA' : 'none',
    '--before-shadow': enableShadows ? '4px 0 #ff6b9d' : 'none',
  };
  const hoverClass = enableOnHover ? 'enable-on-hover' : '';
  return (
    <div className={`glitch ${hoverClass} ${className}`} style={inlineStyles} data-text={children}>
      {children}
    </div>
  );
};

export default GlitchText;
