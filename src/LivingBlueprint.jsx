import { useEffect, useRef } from 'react';

export default function LivingBlueprint() {
  const wrapperRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const svg = svgRef.current;
    if (!wrapper || !svg) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleMouseMove = (e) => {
      if (prefersReducedMotion.matches) return;
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const rotateY = (x / rect.width) * 15;
      const rotateX = -(y / rect.height) * 15;
      
      svg.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      if (prefersReducedMotion.matches) return;
      svg.style.transform = `rotateX(0deg) rotateY(0deg)`;
      svg.style.transition = `transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)`;
    };

    const handleMouseEnter = () => {
      if (prefersReducedMotion.matches) return;
      svg.style.transition = `transform 0.1s linear`;
    };

    wrapper.addEventListener('mousemove', handleMouseMove);
    wrapper.addEventListener('mouseleave', handleMouseLeave);
    wrapper.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      wrapper.removeEventListener('mousemove', handleMouseMove);
      wrapper.removeEventListener('mouseleave', handleMouseLeave);
      wrapper.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  return (
    <>
      <style>{`
        .blueprint-wrapper {
          --primary-color: #3b4a6b;
          --grid-color: #222226;
          --bg-color: transparent;
          --anim-speed: 8s;
          --z-multiplier: 1;
          --glow-intensity: 0.5;
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background: var(--bg-color);
          overflow: hidden;
          perspective: 1000px;
          pointer-events: auto;
        }

        .blueprint-glow {
          position: absolute;
          width: 50%;
          height: 80%;
          background: radial-gradient(circle, var(--primary-color) 0%, transparent 70%);
          opacity: calc(var(--glow-intensity) * 0.3);
          pointer-events: none;
          filter: blur(80px);
          border-radius: 50%;
          transition: opacity 0.5s ease;
        }

        .living-blueprint {
          width: 100%;
          max-width: 1200px;
          height: auto;
          transform-style: preserve-3d;
          will-change: transform;
        }

        .grid-line {
          stroke: var(--grid-color);
          stroke-width: 1;
          vector-effect: non-scaling-stroke;
        }

        .grid-line-sub {
          stroke: var(--grid-color);
          stroke-width: 0.4;
          opacity: 0.5;
          vector-effect: non-scaling-stroke;
        }

        .grid-border {
          stroke: var(--grid-color);
          stroke-width: 2;
          vector-effect: non-scaling-stroke;
        }

        .base-grid {
          animation: gridBreathe calc(var(--anim-speed) * 1.5) ease-in-out infinite alternate;
        }

        @keyframes gridBreathe {
          0%, 15% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .scanner {
          stroke: var(--primary-color);
          stroke-width: 2;
          opacity: 0.6;
          vector-effect: non-scaling-stroke;
          animation: scanLine calc(var(--anim-speed) * 0.6) linear infinite;
        }

        @keyframes scanLine {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(300px); opacity: 0; }
        }

        .layer {
          animation: floatUp var(--anim-speed) cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
          animation-delay: var(--delay);
          transform: translateY(0);
        }

        @keyframes floatUp {
          0%, 15% { transform: translateY(0); }
          85%, 100% { transform: translateY(calc(var(--target-y) * var(--z-multiplier))); }
        }

        .blueprint-shape {
          fill: var(--primary-color);
          fill-opacity: 0;
          stroke: var(--primary-color);
          stroke-width: 1.5;
          stroke-dasharray: 350;
          stroke-dashoffset: 350;
          vector-effect: non-scaling-stroke;
          animation: 
            drawShape var(--anim-speed) cubic-bezier(0.4, 0, 0.2, 1) infinite alternate,
            fillShape var(--anim-speed) cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
          animation-delay: var(--delay);
          transition: fill 0.3s ease, stroke 0.3s ease;
        }

        @keyframes drawShape {
          0%, 20% { stroke-dashoffset: 350; }
          80%, 100% { stroke-dashoffset: 0; }
        }

        @keyframes fillShape {
          0%, 65% { fill-opacity: 0; }
          90%, 100% { fill-opacity: 0.15; }
        }

        @media (prefers-reduced-motion: reduce) {
          .layer, .blueprint-shape, .scanner, .base-grid { animation: none !important; }
          .layer { transform: translateY(calc(var(--target-y) * var(--z-multiplier))) !important; }
          .blueprint-shape { stroke-dashoffset: 0 !important; fill-opacity: 0.12 !important; }
          .scanner { display: none !important; }
          .base-grid { opacity: 1 !important; }
        }
      `}</style>
      <div ref={wrapperRef} className="blueprint-wrapper">
        <div className="blueprint-glow"></div>
        <svg ref={svgRef} className="living-blueprint" viewBox="-250 -250 500 500" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" className="grid-line"/>
            </pattern>
            <pattern id="grid-pattern-sub" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" className="grid-line-sub"/>
            </pattern>
          </defs>

          <g className="base-grid">
            <g transform="scale(1, 0.5) rotate(45)">
              <rect x="-150" y="-150" width="300" height="300" fill="url(#grid-pattern-sub)"/>
              <rect x="-150" y="-150" width="300" height="300" fill="url(#grid-pattern)"/>
              <rect x="-150" y="-150" width="300" height="300" fill="none" className="grid-border"/>
              <line x1="-150" y1="-150" x2="150" y2="-150" className="scanner"/>
            </g>
          </g>

          <g className="building">
            <g className="layer" style={{ '--target-y': '0px', '--delay': '0.2s' }}>
              <g transform="scale(1, 0.5) rotate(45)"><rect x="-100" y="20" width="60" height="40" className="blueprint-shape"/></g>
            </g>
            <g className="layer" style={{ '--target-y': '-20px', '--delay': '0.6s' }}>
              <g transform="scale(1, 0.5) rotate(45)"><rect x="-100" y="20" width="60" height="40" className="blueprint-shape"/></g>
            </g>
            <g className="layer" style={{ '--target-y': '-40px', '--delay': '1.0s' }}>
              <g transform="scale(1, 0.5) rotate(45)"><rect x="-90" y="30" width="40" height="20" className="blueprint-shape"/></g>
            </g>
          </g>

          <g className="building">
            <g className="layer" style={{ '--target-y': '0px', '--delay': '0s' }}>
              <g transform="scale(1, 0.5) rotate(45)"><rect x="-20" y="-20" width="60" height="60" className="blueprint-shape"/></g>
            </g>
            <g className="layer" style={{ '--target-y': '-25px', '--delay': '0.4s' }}>
              <g transform="scale(1, 0.5) rotate(45)"><rect x="-20" y="-20" width="60" height="60" className="blueprint-shape"/></g>
            </g>
            <g className="layer" style={{ '--target-y': '-50px', '--delay': '0.8s' }}>
              <g transform="scale(1, 0.5) rotate(45)"><rect x="-10" y="-10" width="40" height="40" className="blueprint-shape"/></g>
            </g>
            <g className="layer" style={{ '--target-y': '-75px', '--delay': '1.2s' }}>
              <g transform="scale(1, 0.5) rotate(45)"><rect x="-10" y="-10" width="40" height="40" className="blueprint-shape"/></g>
            </g>
            <g className="layer" style={{ '--target-y': '-100px', '--delay': '1.6s' }}>
              <g transform="scale(1, 0.5) rotate(45)"><rect x="0" y="0" width="20" height="20" className="blueprint-shape"/></g>
            </g>
          </g>

          <g className="building">
            <g className="layer" style={{ '--target-y': '0px', '--delay': '0.4s' }}>
              <g transform="scale(1, 0.5) rotate(45)"><rect x="60" y="-80" width="40" height="80" className="blueprint-shape"/></g>
            </g>
            <g className="layer" style={{ '--target-y': '-30px', '--delay': '0.8s' }}>
              <g transform="scale(1, 0.5) rotate(45)"><rect x="60" y="-80" width="40" height="80" className="blueprint-shape"/></g>
            </g>
            <g className="layer" style={{ '--target-y': '-60px', '--delay': '1.2s' }}>
              <g transform="scale(1, 0.5) rotate(45)"><rect x="60" y="-80" width="40" height="80" className="blueprint-shape"/></g>
            </g>
            <g className="layer" style={{ '--target-y': '-90px', '--delay': '1.6s' }}>
              <g transform="scale(1, 0.5) rotate(45)"><rect x="70" y="-70" width="20" height="60" className="blueprint-shape"/></g>
            </g>
          </g>
          
          <g className="building">
            <g className="layer" style={{ '--target-y': '0px', '--delay': '0.6s' }}>
              <g transform="scale(1, 0.5) rotate(45)"><rect x="50" y="60" width="40" height="40" className="blueprint-shape"/></g>
            </g>
            <g className="layer" style={{ '--target-y': '-25px', '--delay': '1.0s' }}>
              <g transform="scale(1, 0.5) rotate(45)"><rect x="50" y="60" width="40" height="40" className="blueprint-shape"/></g>
            </g>
            <g className="layer" style={{ '--target-y': '-50px', '--delay': '1.4s' }}>
              <g transform="scale(1, 0.5) rotate(45)"><rect x="60" y="70" width="20" height="20" className="blueprint-shape"/></g>
            </g>
          </g>
        </svg>
      </div>
    </>
  );
}
