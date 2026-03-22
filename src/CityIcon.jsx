import { useEffect, useRef } from 'react';

export default function CityIcon() {
  const containerRef = useRef(null);
  const backWrapperRef = useRef(null);
  const frontWrapperRef = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const backWrapper = backWrapperRef.current;
    const frontWrapper = frontWrapperRef.current;
    if (!container || !backWrapper || !frontWrapper) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let isHovering = false;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      targetX = (e.clientX - rect.left - rect.width / 2) * 0.08;
      targetY = (e.clientY - rect.top - rect.height / 2) * 0.08;
      isHovering = true;
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
      isHovering = false;
    };

    const animate = () => {
      mouseX += (targetX - mouseX) * 0.1;
      mouseY += (targetY - mouseY) * 0.1;
      
      backWrapper.style.transform = `translate(${mouseX * 0.4}px, ${mouseY * 0.4}px)`;
      frontWrapper.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      
      if (isHovering || Math.abs(mouseX) > 0.05 || Math.abs(mouseY) > 0.05) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        backWrapper.style.transform = 'translate(0px, 0px)';
        frontWrapper.style.transform = 'translate(0px, 0px)';
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };

    const handleMouseEnter = () => {
      if (!rafId.current) rafId.current = requestAnimationFrame(animate);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mouseenter', handleMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      <style>{`
        .city-icon-container {
          --window-color: #3b4a6b;
          --traffic-color: #f43f5e;
          --icon-size: 32px;
          --hover-growth: 0.15;
          --anim-speed: 1;
          width: var(--icon-size);
          height: var(--icon-size);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
          background: #050505;
        }

        .city-icon-container:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 15px rgba(59, 74, 107, 0.4);
        }

        .layer-back, .layer-front {
          transform-origin: 50% 80px;
          transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .city-icon-container:hover .layer-back {
          transform: scaleY(calc(1 + (var(--hover-growth) * 0.5)));
        }

        .city-icon-container:hover .layer-front {
          transform: scaleY(calc(1 + var(--hover-growth)));
        }

        .win {
          opacity: 0.1;
          animation: flicker calc(var(--anim-speed) * 2s) infinite alternate ease-in-out;
        }

        .win-1 { animation-delay: 0.1s; }
        .win-2 { animation-delay: 0.4s; }
        .win-3 { animation-delay: 0.7s; }
        .win-4 { animation-delay: 1.1s; }

        @keyframes flicker {
          0%, 40% {
            opacity: 0.1;
            filter: none;
          }
          60%, 100% {
            opacity: 0.8;
            filter: drop-shadow(0 0 2px var(--window-color));
          }
        }

        .car {
          opacity: 0.8;
          animation: drive calc(var(--anim-speed) * 3s) linear infinite;
        }

        .car-1 { animation-delay: 0s; }
        .car-2 { animation-delay: calc(var(--anim-speed) * 1.5s); animation-direction: reverse; }
        .car-3 { animation-delay: calc(var(--anim-speed) * 2.1s); }
        .car-4 { animation-delay: calc(var(--anim-speed) * 0.8s); animation-direction: reverse; }

        @keyframes drive {
          0% { transform: translateX(-5px); }
          100% { transform: translateX(105px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .city-icon-container { transition: none; }
          .city-icon-container:hover { transform: none; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
          .city-icon-container:hover .layer-back, .city-icon-container:hover .layer-front { transform: none; }
          .win { animation: none; opacity: 0.8; }
          .car { animation: none; display: none; }
        }
      `}</style>

      <div ref={containerRef} className="city-icon-container">
        <svg viewBox="0 0 100 100" className="city-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#121214" />
              <stop offset="100%" stopColor="#0a0a10" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="100" height="100" fill="url(#skyGradient)" rx="15" />
          
          {/* Back Layer */}
          <g ref={backWrapperRef} className="layer-back-wrapper">
            <g className="layer-back" fill="#1c1c20">
              <rect x="12" y="45" width="14" height="35" rx="1" />
              <rect x="35" y="35" width="18" height="45" rx="1" />
              <rect x="65" y="48" width="20" height="32" rx="1" />
            </g>
          </g>

          {/* Front Layer */}
          <g ref={frontWrapperRef} className="layer-front-wrapper">
            <g className="layer-front" fill="#222226">
              <rect x="8" y="58" width="18" height="22" rx="1" />
              <rect x="28" y="42" width="15" height="38" rx="1" />
              <rect x="48" y="52" width="22" height="28" rx="1" />
              <rect x="72" y="38" width="16" height="42" rx="1" />
            </g>
            
            {/* Windows */}
            <g className="windows" fill="var(--window-color)">
              <rect x="31" y="48" width="2" height="2" className="win win-1" />
              <rect x="38" y="48" width="2" height="2" className="win win-2" />
              <rect x="31" y="55" width="2" height="2" className="win win-3" />
              <rect x="38" y="55" width="2" height="2" className="win win-4" />
              <rect x="31" y="62" width="2" height="2" className="win win-1" />
              <rect x="38" y="62" width="2" height="2" className="win win-2" />
              
              <rect x="52" y="57" width="3" height="2" className="win win-3" />
              <rect x="59" y="57" width="3" height="2" className="win win-4" />
              <rect x="66" y="57" width="3" height="2" className="win win-1" />
              
              <rect x="76" y="45" width="2" height="3" className="win win-2" />
              <rect x="82" y="45" width="2" height="3" className="win win-3" />
              <rect x="76" y="55" width="2" height="3" className="win win-4" />
              <rect x="82" y="55" width="2" height="3" className="win win-1" />
            </g>
          </g>

          {/* Ground */}
          <rect x="0" y="80" width="100" height="20" fill="#0A0A0B" />
          
          {/* Traffic */}
          <g className="traffic">
            <circle cx="0" cy="84" r="1.5" fill="var(--traffic-color)" className="car car-1" />
            <circle cx="100" cy="88" r="1.5" fill="var(--window-color)" className="car car-2" />
            <circle cx="0" cy="84" r="1.5" fill="var(--traffic-color)" className="car car-3" />
            <circle cx="100" cy="88" r="1.5" fill="var(--window-color)" className="car car-4" />
          </g>
        </svg>
      </div>
    </>
  );
}
