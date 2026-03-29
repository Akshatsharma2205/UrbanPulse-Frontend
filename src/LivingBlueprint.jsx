import { useEffect, useRef } from 'react';

export default function LivingBlueprint() {
  const wrapperRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const svg = svgRef.current;
    if (!wrapper || !svg) return;
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)');

    const onMove = (e) => {
      if (pref.matches) return;
      const r = wrapper.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      svg.style.transform = `rotateX(${-(y / r.height) * 14}deg) rotateY(${(x / r.width) * 14}deg)`;
    };
    const onLeave = () => {
      if (pref.matches) return;
      svg.style.transition = 'transform 0.7s cubic-bezier(0.2,0.8,0.2,1)';
      svg.style.transform = 'rotateX(0deg) rotateY(0deg)';
    };
    const onEnter = () => {
      if (pref.matches) return;
      svg.style.transition = 'transform 0.1s linear';
    };

    wrapper.addEventListener('mousemove', onMove);
    wrapper.addEventListener('mouseleave', onLeave);
    wrapper.addEventListener('mouseenter', onEnter);
    return () => {
      wrapper.removeEventListener('mousemove', onMove);
      wrapper.removeEventListener('mouseleave', onLeave);
      wrapper.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  return (
    <>
      <style>{`
        .bp-wrap {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; perspective: 1000px;
        }
        /* Ambient indigo glow */
        .bp-glow {
          position: absolute; width: 55%; height: 75%;
          background: radial-gradient(circle, #3b4a6b 0%, transparent 70%);
          opacity: 0.14; filter: blur(80px); border-radius: 50%;
          pointer-events: none;
        }
        /* Amber sunrise at base */
        .bp-sunrise {
          position: absolute; bottom: 8%; left: 50%; transform: translateX(-50%);
          width: 60%; height: 38%;
          background: radial-gradient(ellipse at center bottom,
            rgba(245,158,11,0.32) 0%, rgba(234,88,12,0.14) 40%, transparent 70%);
          filter: blur(52px); border-radius: 50%; pointer-events: none;
          animation: sunrisePulse 5s ease-in-out infinite alternate;
        }
        @keyframes sunrisePulse {
          from { opacity: 0.55; transform: translateX(-50%) scaleY(0.85); }
          to   { opacity: 1;    transform: translateX(-50%) scaleY(1.18); }
        }
        .bp-svg {
          width: 100%; max-width: 1100px; height: auto;
          transform-style: preserve-3d; will-change: transform;
        }
        .g-line  { stroke: #1e2230; stroke-width: 1; vector-effect: non-scaling-stroke; }
        .g-sub   { stroke: #1e2230; stroke-width: 0.4; opacity: 0.5; vector-effect: non-scaling-stroke; }
        .g-bord  { stroke: #1e2230; stroke-width: 2; vector-effect: non-scaling-stroke; }
        .base-grid { animation: gridBreathe 12s ease-in-out infinite alternate; }
        @keyframes gridBreathe { 0%,15%{opacity:0.45} 100%{opacity:1} }
        .scanner {
          stroke: #3b4a6b; stroke-width: 2; opacity: 0.6;
          vector-effect: non-scaling-stroke;
          animation: scanLine 5s linear infinite;
        }
        @keyframes scanLine {
          0%  { transform: translateY(0);     opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100%{ transform: translateY(300px); opacity: 0; }
        }
        .layer {
          animation: floatUp 8s cubic-bezier(0.4,0,0.2,1) infinite alternate;
          animation-delay: var(--delay);
        }
        @keyframes floatUp {
          0%,15%   { transform: translateY(0); }
          85%,100% { transform: translateY(var(--ty)); }
        }
        /* Base indigo shape */
        .bshape {
          fill: #3b4a6b; fill-opacity: 0;
          stroke: #3b4a6b; stroke-width: 1.5;
          stroke-dasharray: 350; stroke-dashoffset: 350;
          vector-effect: non-scaling-stroke;
          animation: drawS 8s cubic-bezier(0.4,0,0.2,1) infinite alternate,
                     fillS 8s cubic-bezier(0.4,0,0.2,1) infinite alternate;
          animation-delay: var(--delay);
        }
        @keyframes drawS { 0%,20%{stroke-dashoffset:350} 80%,100%{stroke-dashoffset:0} }
        @keyframes fillS { 0%,65%{fill-opacity:0} 90%,100%{fill-opacity:0.15} }
        /* Amber rooftop glow */
        .rtop {
          fill: rgba(251,146,60,0); stroke: rgba(251,146,60,0.75);
          stroke-width: 1.5; stroke-dasharray: 350; stroke-dashoffset: 350;
          vector-effect: non-scaling-stroke;
          filter: drop-shadow(0 0 6px rgba(245,158,11,0.85));
          animation: drawS 8s cubic-bezier(0.4,0,0.2,1) infinite alternate,
                     amberF 8s cubic-bezier(0.4,0,0.2,1) infinite alternate,
                     amberP 3s ease-in-out infinite;
          animation-delay: var(--delay), var(--delay), 0s;
        }
        @keyframes amberF { 0%,65%{fill:rgba(251,146,60,0)} 90%,100%{fill:rgba(251,146,60,0.2)} }
        @keyframes amberP {
          0%,100%{ filter: drop-shadow(0 0 5px rgba(245,158,11,0.55)); }
          50%    { filter: drop-shadow(0 0 14px rgba(245,158,11,1)); }
        }
        @media (prefers-reduced-motion: reduce) {
          .layer,.bshape,.rtop,.scanner,.base-grid { animation: none !important; }
          .layer  { transform: translateY(var(--ty)) !important; }
          .bshape { stroke-dashoffset: 0 !important; fill-opacity: 0.12 !important; }
          .rtop   { stroke-dashoffset: 0 !important; fill: rgba(251,146,60,0.15) !important; }
          .scanner{ display: none !important; }
          .base-grid { opacity: 1 !important; }
          .bp-sunrise { animation: none !important; }
        }
      `}</style>

      <div ref={wrapperRef} className="bp-wrap">
        <div className="bp-glow" />
        <div className="bp-sunrise" />
        <svg ref={svgRef} className="bp-svg" viewBox="-250 -250 500 500" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="gp" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M30 0L0 0 0 30" fill="none" className="g-line"/>
            </pattern>
            <pattern id="gps" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M10 0L0 0 0 10" fill="none" className="g-sub"/>
            </pattern>
          </defs>

          <g className="base-grid">
            <g transform="scale(1,0.5) rotate(45)">
              <rect x="-150" y="-150" width="300" height="300" fill="url(#gps)"/>
              <rect x="-150" y="-150" width="300" height="300" fill="url(#gp)"/>
              <rect x="-150" y="-150" width="300" height="300" fill="none" className="g-bord"/>
              <line x1="-150" y1="-150" x2="150" y2="-150" className="scanner"/>
            </g>
          </g>

          {/* Building 1 */}
          <g>
            <g className="layer" style={{'--delay':'0.2s','--ty':'0px'}}>
              <g transform="scale(1,0.5) rotate(45)"><rect x="-100" y="20" width="60" height="40" className="bshape"/></g>
            </g>
            <g className="layer" style={{'--delay':'0.6s','--ty':'-20px'}}>
              <g transform="scale(1,0.5) rotate(45)"><rect x="-100" y="20" width="60" height="40" className="bshape"/></g>
            </g>
            <g className="layer" style={{'--delay':'1.0s','--ty':'-40px'}}>
              <g transform="scale(1,0.5) rotate(45)">
                <rect x="-90" y="30" width="40" height="20" className="bshape"/>
                <rect x="-90" y="30" width="40" height="20" className="rtop" style={{'--delay':'1.0s'}}/>
              </g>
            </g>
          </g>

          {/* Building 2 — tallest */}
          <g>
            <g className="layer" style={{'--delay':'0s','--ty':'0px'}}>
              <g transform="scale(1,0.5) rotate(45)"><rect x="-20" y="-20" width="60" height="60" className="bshape"/></g>
            </g>
            <g className="layer" style={{'--delay':'0.4s','--ty':'-25px'}}>
              <g transform="scale(1,0.5) rotate(45)"><rect x="-20" y="-20" width="60" height="60" className="bshape"/></g>
            </g>
            <g className="layer" style={{'--delay':'0.8s','--ty':'-50px'}}>
              <g transform="scale(1,0.5) rotate(45)"><rect x="-10" y="-10" width="40" height="40" className="bshape"/></g>
            </g>
            <g className="layer" style={{'--delay':'1.2s','--ty':'-75px'}}>
              <g transform="scale(1,0.5) rotate(45)"><rect x="-10" y="-10" width="40" height="40" className="bshape"/></g>
            </g>
            <g className="layer" style={{'--delay':'1.6s','--ty':'-100px'}}>
              <g transform="scale(1,0.5) rotate(45)">
                <rect x="0" y="0" width="20" height="20" className="bshape"/>
                <rect x="0" y="0" width="20" height="20" className="rtop" style={{'--delay':'1.6s'}}/>
              </g>
            </g>
          </g>

          {/* Building 3 */}
          <g>
            <g className="layer" style={{'--delay':'0.4s','--ty':'0px'}}>
              <g transform="scale(1,0.5) rotate(45)"><rect x="60" y="-80" width="40" height="80" className="bshape"/></g>
            </g>
            <g className="layer" style={{'--delay':'0.8s','--ty':'-30px'}}>
              <g transform="scale(1,0.5) rotate(45)"><rect x="60" y="-80" width="40" height="80" className="bshape"/></g>
            </g>
            <g className="layer" style={{'--delay':'1.2s','--ty':'-60px'}}>
              <g transform="scale(1,0.5) rotate(45)"><rect x="60" y="-80" width="40" height="80" className="bshape"/></g>
            </g>
            <g className="layer" style={{'--delay':'1.6s','--ty':'-90px'}}>
              <g transform="scale(1,0.5) rotate(45)">
                <rect x="70" y="-70" width="20" height="60" className="bshape"/>
                <rect x="70" y="-70" width="20" height="60" className="rtop" style={{'--delay':'1.6s'}}/>
              </g>
            </g>
          </g>

          {/* Building 4 */}
          <g>
            <g className="layer" style={{'--delay':'0.6s','--ty':'0px'}}>
              <g transform="scale(1,0.5) rotate(45)"><rect x="50" y="60" width="40" height="40" className="bshape"/></g>
            </g>
            <g className="layer" style={{'--delay':'1.0s','--ty':'-25px'}}>
              <g transform="scale(1,0.5) rotate(45)"><rect x="50" y="60" width="40" height="40" className="bshape"/></g>
            </g>
            <g className="layer" style={{'--delay':'1.4s','--ty':'-50px'}}>
              <g transform="scale(1,0.5) rotate(45)">
                <rect x="60" y="70" width="20" height="20" className="bshape"/>
                <rect x="60" y="70" width="20" height="20" className="rtop" style={{'--delay':'1.4s'}}/>
              </g>
            </g>
          </g>
        </svg>
      </div>
    </>
  );
}
