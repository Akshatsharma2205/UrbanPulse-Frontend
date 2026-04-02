import { useState, useEffect, useRef } from 'react';
import CityIcon from './CityIcon';
import LivingBlueprint from './LivingBlueprint';

/* ─── Responsive breakpoint hook ─────────────────────────────────────────── */
function useBreakpoint() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return { isMobile: w < 640, isTablet: w < 900, w };
}

/* ─── Loading / splash screen ────────────────────────────────────────────── */
function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  const STATUSES = [
    'Initializing neural grid…',
    'Connecting to Gemini AI…',
    'Loading city simulation…',
    'Calibrating urban sensors…',
    'System ready.',
  ];

  useEffect(() => {
    const start = performance.now();
    const duration = 2000;
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased * 100);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onDone, 600);
        }, 300);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIdx(i => Math.min(i + 1, STATUSES.length - 1));
    }, 420);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#020609',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 24px',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.6s cubic-bezier(0.4,0,0.2,1)',
      pointerEvents: fadeOut ? 'none' : 'all',
    }}>
      {/* Scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg,rgba(255,255,255,0.013) 0px,rgba(255,255,255,0.013) 1px,transparent 1px,transparent 2px)',
        backgroundSize: '100% 2px',
      }} />

      {/* Corner brackets */}
      {[{top:32,left:32,borderRight:'none',borderBottom:'none'},{top:32,right:32,borderLeft:'none',borderBottom:'none'},
        {bottom:32,left:32,borderRight:'none',borderTop:'none'},{bottom:32,right:32,borderLeft:'none',borderTop:'none'}]
        .map((s, i) => (
          <div key={i} style={{
            position: 'absolute', width: 40, height: 40,
            border: '1px solid rgba(99,102,241,0.35)', ...s,
          }} />
        ))}

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo + title */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 18, marginBottom: 64,
        animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            position: 'absolute', width: 64, height: 64, borderRadius: '50%',
            border: '1px solid rgba(99,102,241,0.4)',
            animation: 'loaderRing 1.8s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: 80, height: 80, borderRadius: '50%',
            border: '1px solid rgba(99,102,241,0.15)',
            animation: 'loaderRing 1.8s ease-in-out 0.3s infinite',
          }} />
          <CityIcon />
        </div>
        <div>
          <div style={{
            fontFamily: 'ui-monospace,monospace', fontSize: 22, fontWeight: 600,
            letterSpacing: '0.22em', textTransform: 'uppercase', color: '#e2e8f0',
          }}>UrbanPulse</div>
          <div style={{
            fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.3em',
            textTransform: 'uppercase', color: '#4f46e5', marginTop: 4,
          }}>Urban Intelligence System</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 320, marginBottom: 20 }}>
        <div style={{
          width: '100%', height: 1,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 2, overflow: 'hidden', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #4f46e5, #818cf8, #c7d2fe)',
            boxShadow: '0 0 12px rgba(99,102,241,0.8)',
            borderRadius: 2,
            transition: 'width 0.05s linear',
          }} />
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 10,
          fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: '#334155',
        }}>
          <span style={{ color: '#64748b', transition: 'opacity 0.3s' }}>{STATUSES[statusIdx]}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Blinking cursor */}
      <div style={{
        fontFamily: 'ui-monospace,monospace', fontSize: 10, color: 'rgba(99,102,241,0.5)',
        letterSpacing: '0.15em', marginTop: 8,
        animation: 'loaderBlink 1s step-end infinite',
      }}>▋</div>

      <style>{`
        @keyframes loaderRing {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50%       { transform: scale(1.15); opacity: 1; }
        }
        @keyframes loaderBlink {
          0%, 100% { opacity: 1; } 50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ─── Particle Canvas ─────────────────────────────────────────────────────── */
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const N = 85, LINK = 125;
    let W = (cv.width = innerWidth), H = (cv.height = innerHeight), raf;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.38,
      vy: -(Math.random() * 0.28 + 0.07),
      r: Math.random() * 1.7 + 0.5,
      a: Math.random() * 0.45 + 0.18,
    }));
    const resize = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
    window.addEventListener('resize', resize);
    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
        if (p.x < -4) p.x = W + 4;
        if (p.x > W + 4) p.x = -4;
      }
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${(1 - d / LINK) * 0.14})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = Math.random() > 0.62
          ? `rgba(251,191,36,${p.a * 0.85})`
          : `rgba(148,151,255,${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return (
    <canvas ref={ref} style={{
      position: 'fixed', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0,
    }} />
  );
}

/* ─── Letter-by-letter headline ──────────────────────────────────────────── */
function SplitText({ lines, baseDelay = 0 }) {
  let count = 0;
  return (
    <>
      {lines.map((line, li) => (
        <span key={li} style={{ display: 'block' }} aria-label={line}>
          {line.split('').map((ch, ci) => {
            const delay = baseDelay + count++ * 40;
            return (
              <span key={ci} aria-hidden="true" style={{
                display: 'inline-block', opacity: 0,
                transform: 'translateY(22px)',
                animation: `charUp 0.58s cubic-bezier(0.16,1,0.3,1) ${delay}ms forwards`,
                whiteSpace: ch === ' ' ? 'pre' : undefined,
              }}>{ch}</span>
            );
          })}
        </span>
      ))}
    </>
  );
}

/* ─── Cycling status badge ────────────────────────────────────────────────── */
function StatusBadge() {
  const MSGS = ['Neural Grid Online', 'Gemini 2.5 Connected', 'Simulation Ready'];
  const [i, setI] = useState(0);
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setShow(false);
      setTimeout(() => { setI(n => (n + 1) % MSGS.length); setShow(true); }, 360);
    }, 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontFamily: 'ui-monospace,monospace', fontSize: 10,
      letterSpacing: '0.2em', textTransform: 'uppercase', color: '#64748b',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', background: '#34d399', flexShrink: 0,
        boxShadow: '0 0 8px rgba(52,211,153,0.9)',
        animation: 'dotPulse 1.8s ease-in-out infinite',
      }} />
      <span style={{
        display: 'inline-block', minWidth: 180,
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(-5px)',
        transition: 'opacity 0.36s ease, transform 0.36s ease',
      }}>{MSGS[i]}</span>
    </span>
  );
}

/* ─── Scroll-triggered reveal ────────────────────────────────────────────── */
function Reveal({ children, delay = 0, style: outer = {}, className = '' }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      ...outer,
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(38px)',
      transition: `opacity 0.72s ease ${delay}ms, transform 0.72s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

/* ─── CTA button ──────────────────────────────────────────────────────────── */
function CTAButton({ onClick }) {
  const btnRef = useRef(null);
  const glowRef = useRef(null);
  const onMove = (e) => {
    const r = btnRef.current.getBoundingClientRect();
    glowRef.current.style.background =
      `radial-gradient(circle 110px at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgba(99,102,241,0.28), transparent 70%)`;
  };
  const onLeave = () => { glowRef.current.style.background = 'transparent'; };
  return (
    <div style={{ position: 'relative', display: 'inline-block', padding: 1, borderRadius: 14 }}>
      <div className="cta-ring" style={{ position: 'absolute', inset: 0, borderRadius: 14 }} />
      <button ref={btnRef} onClick={onClick} onMouseMove={onMove}
        style={{
          position: 'relative', background: '#020609', borderRadius: 13,
          border: 'none', padding: '16px 36px', cursor: 'pointer',
          boxShadow: '0 0 40px rgba(59,74,107,0.12)',
          transition: 'box-shadow 0.4s',
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 60px rgba(99,102,241,0.3)'}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(59,74,107,0.12)'; onLeave(); }}
      >
        <div ref={glowRef} style={{ position: 'absolute', inset: 0, borderRadius: 13, pointerEvents: 'none', transition: 'background 0.1s' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: 13, background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, transparent 60%)' }} />
        <span style={{
          position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 16,
          fontFamily: 'ui-monospace,monospace', fontSize: 11, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: '#e2e8f0', fontWeight: 600,
        }}>
          Initialize System
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span style={{ width: 20, height: 1, background: '#818cf8', display: 'inline-block' }} />
            <span style={{ width: 6, height: 6, borderRight: '1.5px solid #818cf8', borderTop: '1.5px solid #818cf8', transform: 'rotate(45deg)', display: 'inline-block', marginLeft: -3 }} />
          </span>
        </span>
      </button>
    </div>
  );
}

/* ─── Stat chip ───────────────────────────────────────────────────────────── */
function Stat({ value, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{
        fontFamily: 'ui-monospace,monospace', fontSize: 30, fontWeight: 300,
        color: '#fbbf24', letterSpacing: '-0.03em', lineHeight: 1,
      }}>{value}</span>
      <span style={{
        fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: '#475569',
      }}>{label}</span>
    </div>
  );
}

/* ─── Feature card ────────────────────────────────────────────────────────── */
function FCard({ icon, title, body, accent = '#6366f1', wide = false }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'linear-gradient(135deg,rgba(13,17,27,0.95) 0%,rgba(8,10,18,0.95) 100%)',
        border: `1px solid ${hov ? accent + '44' : 'rgba(255,255,255,0.05)'}`,
        borderRadius: 22, padding: wide ? '40px 44px' : '36px 40px',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        minHeight: 220, position: 'relative', overflow: 'hidden', cursor: 'default',
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hov ? `0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px ${accent}22` : '0 4px 20px rgba(0,0,0,0.25)',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', pointerEvents: 'none',
        background: `radial-gradient(circle at right center, ${accent}18, transparent 70%)`,
        opacity: hov ? 1 : 0.4, transition: 'opacity 0.4s',
      }} />
      <div style={{ fontSize: 30, marginBottom: 18, opacity: 0.75, position: 'relative' }}>{icon}</div>
      <h3 style={{
        fontSize: 18, fontWeight: 400, color: '#e2e8f0', marginBottom: 10,
        letterSpacing: '-0.01em', position: 'relative',
      }}>{title}</h3>
      <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.65, fontWeight: 300, position: 'relative' }}>{body}</p>
    </div>
  );
}

/* ─── Step card ───────────────────────────────────────────────────────────── */
function Step({ num, title, body }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 20px', flex: 1 }}>
      <div style={{
        width: 54, height: 54, borderRadius: '50%', margin: '0 auto 22px',
        border: '1px solid rgba(99,102,241,0.35)',
        background: 'rgba(99,102,241,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'ui-monospace,monospace', fontSize: 11, color: '#818cf8',
        letterSpacing: '0.08em',
      }}>{num}</div>
      <h3 style={{ fontSize: 15, fontWeight: 500, color: '#e2e8f0', marginBottom: 10 }}>{title}</h3>
      <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.68, fontWeight: 300 }}>{body}</p>
    </div>
  );
}

/* ─── Main landing page ──────────────────────────────────────────────────── */
export default function LandingPage({ onLaunch, onOpenDna }) {
  const [loading, setLoading] = useState(true);
  const { isMobile, isTablet } = useBreakpoint();

  return (
    <div style={{
      minHeight: '100vh', background: '#020609', color: '#e2e8f0',
      fontFamily: 'system-ui,sans-serif', overflowX: 'hidden', position: 'relative',
    }}>
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}

      {/* ── Global keyframes + responsive CSS ── */}
      <style>{`
        @property --ca { syntax:'<angle>'; initial-value:0deg; inherits:false; }
        @keyframes conicSpin { to { --ca: 360deg; } }
        .cta-ring {
          animation: conicSpin 2.2s linear infinite;
          background: conic-gradient(
            from var(--ca),
            transparent 0%, rgba(99,102,241,0.95) 12%,
            rgba(167,139,250,0.7) 26%, transparent 44%
          );
        }
        @keyframes charUp { to { opacity:1; transform:translateY(0); } }
        @keyframes dotPulse {
          0%,100%{ box-shadow:0 0 4px rgba(52,211,153,0.6); }
          50%    { box-shadow:0 0 14px rgba(52,211,153,1); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        ::selection { background: rgba(99,102,241,0.25); }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#1a2235; border-radius:4px; }

        /* ── Tablet (≤900px) ── */
        @media(max-width:900px){
          .hero-inner{ flex-direction:column !important; }
          .hero-left{
            flex:none !important; width:100% !important;
            padding:60px 32px 32px !important;
          }
          .hero-right{
            flex:none !important; width:100% !important;
            min-height:280px !important;
          }
          .steps-row{ flex-direction:column !important; gap:40px !important; }
          .feat-grid{ grid-template-columns:1fr 1fr !important; }
          .feat-grid > *{ grid-column: span 1 !important; }
          .nav-inner{ padding:16px 24px !important; }
          .cta-banner{ flex-direction:column !important; align-items:flex-start !important; padding:40px 32px !important; }
          .section-pad{ padding-left:24px !important; padding-right:24px !important; }
          .divider-margin{ margin:0 24px !important; }
        }

        /* ── Mobile (≤640px) ── */
        @media(max-width:640px){
          .hero-left{
            padding:48px 20px 24px !important;
          }
          .hero-right{ min-height:220px !important; }
          .status-badge{ display:none !important; }
          .nav-inner{ padding:14px 16px !important; }
          .feat-grid{ grid-template-columns:1fr !important; }
          .steps-row{ gap:32px !important; }
          .cta-banner{ padding:32px 20px !important; border-radius:18px !important; }
          .footer-inner{ padding:20px 16px !important; }
          .section-pad{ padding-left:16px !important; padding-right:16px !important; }
          .divider-margin{ margin:0 16px !important; }
          .stats-row{ gap:20px !important; }
        }

        /* ── Small mobile (≤380px) ── */
        @media(max-width:380px){
          .hero-left{ padding:40px 14px 20px !important; }
          .nav-inner{ padding:12px 14px !important; }
        }
      `}</style>

      {/* ── Layer 0: particles ── */}
      <ParticleCanvas />

      {/* ── Layer 1: scanlines CRT ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg,rgba(255,255,255,0.013) 0px,rgba(255,255,255,0.013) 1px,transparent 1px,transparent 2px)',
        backgroundSize: '100% 2px',
      }} />

      {/* ─────────────────────── NAV ──────────────────────────────────────── */}
      <nav className="nav-inner" style={{
        position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '22px 48px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        animation: 'fadeIn 0.9s ease both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <CityIcon />
          <span style={{
            fontFamily: 'ui-monospace,monospace', fontSize: isMobile ? 14 : 17, fontWeight: 600,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: '#e2e8f0',
          }}>UrbanPulse</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 28 }}>
          <span className="status-badge"><StatusBadge /></span>
          
          {onOpenDna && (
            <button onClick={onOpenDna} style={{
              fontFamily: 'ui-monospace,monospace', fontSize: 10, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: '#a78bfa',
              background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)',
              padding: isMobile ? '8px 14px' : '10px 22px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.3s',
              whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.06)'; e.currentTarget.style.color = '#a78bfa'; }}
            >DNA Archive</button>
          )}

          <button onClick={onLaunch} style={{
            fontFamily: 'ui-monospace,monospace', fontSize: 10, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#94a3b8',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            padding: isMobile ? '8px 14px' : '10px 22px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.3s',
            whiteSpace: 'nowrap',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#e2e8f0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94a3b8'; }}
          >Terminal →</button>
        </div>
      </nav>

      {/* ─────────────────────── HERO ─────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 10, minHeight: isTablet ? 'auto' : 'calc(100vh - 70px)' }}>
        <div className="hero-inner" style={{ display: 'flex', alignItems: 'stretch', minHeight: isTablet ? 'auto' : 'calc(100vh - 70px)' }}>

          {/* Left — text */}
          <div className="hero-left" style={{
            flex: '0 0 54%', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', padding: '80px 56px 80px 48px',
          }}>
            {/* Eyebrow pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, alignSelf: 'flex-start',
              fontFamily: 'ui-monospace,monospace', fontSize: isMobile ? 9 : 10, letterSpacing: '0.3em',
              textTransform: 'uppercase', color: 'rgba(129,140,248,0.9)',
              border: '1px solid rgba(99,102,241,0.22)', background: 'rgba(99,102,241,0.07)',
              padding: isMobile ? '6px 14px' : '8px 18px', borderRadius: 100, marginBottom: 38,
              animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', flexShrink: 0, animation: 'dotPulse 2s ease-in-out infinite' }} />
              {isMobile ? 'AI Urban Intelligence' : 'AI-Powered Urban Intelligence'}
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: isMobile ? 'clamp(36px,10vw,56px)' : 'clamp(46px,5.8vw,90px)',
              fontWeight: 300,
              lineHeight: 1.02, letterSpacing: '-0.025em', margin: 0,
              marginBottom: 34, color: '#f1f5f9',
            }}>
              <SplitText lines={['Architect the', 'Future of', 'Your City.']} baseDelay={220} />
            </h1>

            {/* Subtext */}
            <p style={{
              fontSize: isMobile ? 15 : 17, lineHeight: 1.72, color: '#64748b', maxWidth: 500,
              marginBottom: 48, fontWeight: 300,
              animation: 'fadeUp 1s cubic-bezier(0.16,1,0.3,1) 1.1s both',
            }}>
              Harness <span style={{ color: '#94a3b8', fontWeight: 500 }}>Gemini AI</span> to predict the exact outcome of civic policies — traffic, economy, ecology, and public sentiment —{' '}
              <span style={{ color: '#e2e8f0', fontWeight: 400 }}>before they are implemented.</span>
            </p>

            {/* CTA */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
              marginBottom: 60,
              animation: 'fadeUp 1s cubic-bezier(0.16,1,0.3,1) 1.3s both',
            }}>
              <CTAButton onClick={onLaunch} />
              <button onClick={onLaunch} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: 'ui-monospace,monospace', fontSize: 10,
                letterSpacing: '0.2em', textTransform: 'uppercase', color: '#475569',
                transition: 'color 0.3s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}
              >
                <span style={{
                  width: 26, height: 26, borderRadius: '50%', border: '1px solid currentColor',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9,
                }}>▶</span>
                Watch demo
              </button>
            </div>

            {/* Inline stats */}
            <div className="stats-row" style={{
              display: 'flex', alignItems: 'center', gap: 36, flexWrap: 'wrap',
              paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.05)',
              animation: 'fadeUp 1s cubic-bezier(0.16,1,0.3,1) 1.5s both',
            }}>
              <Stat value="7" label="Policy Types" />
              <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.07)' }} />
              <Stat value="10" label="Year Forecasts" />
              <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.07)' }} />
              <Stat value="3" label="AI Stakeholders" />
            </div>
          </div>

          {/* Right — city blueprint (hidden on mobile to avoid clutter) */}
          {!isMobile && (
            <div className="hero-right" style={{ flex: '0 0 46%', position: 'relative', minHeight: 500 }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 90, zIndex: 2,
                background: 'linear-gradient(to right, #020609, transparent)', pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 120, zIndex: 2,
                background: 'linear-gradient(to bottom, #020609, transparent)', pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, zIndex: 2,
                background: 'linear-gradient(to top, #020609, transparent)', pointerEvents: 'none',
              }} />
              <LivingBlueprint />
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────── DIVIDER ──────────────────────────────────────── */}
      <div className="divider-margin" style={{
        position: 'relative', zIndex: 10, height: 1, margin: '0 48px',
        background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.28), transparent)',
      }} />

      {/* ─────────────────── HOW IT WORKS ─────────────────────────────────── */}
      <section className="section-pad" style={{ position: 'relative', zIndex: 10, padding: isTablet ? '72px 24px' : '110px 48px' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 72 }}>
          <p style={{
            fontFamily: 'ui-monospace,monospace', fontSize: 10, letterSpacing: '0.32em',
            textTransform: 'uppercase', color: '#4f46e5', marginBottom: 14,
          }}>⚡ Process</p>
          <h2 style={{
            fontSize: 'clamp(22px,3vw,40px)', fontWeight: 300,
            letterSpacing: '-0.02em', color: '#e2e8f0', margin: 0,
          }}>How UrbanPulse Works</h2>
        </Reveal>

        <div className="steps-row" style={{
          display: 'flex', gap: 8, maxWidth: 1100, margin: '0 auto', position: 'relative',
        }}>
          {/* Connector line — only meaningful on desktop */}
          {!isTablet && (
            <div style={{
              position: 'absolute', top: 27, left: '12%', right: '12%', height: 1, zIndex: 0,
              background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.25), rgba(99,102,241,0.25), transparent)',
            }} />
          )}
          {[
            { n: '01', t: 'Set the Scene', b: 'Name your city, set population, traffic & pollution baseline.' },
            { n: '02', t: 'Choose a Policy', b: 'Pick one of 7 presets — or write your own custom policy.' },
            { n: '03', t: 'Run Simulation', b: 'Gemini AI scores impact across 4 dimensions in seconds.' },
            { n: '04', t: 'Explore Outcomes', b: 'Read stakeholder views, 10-year evolution & trade-off brief.' },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 90} style={{ flex: 1 }}>
              <Step num={s.n} title={s.t} body={s.b} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─────────────────── FEATURES GRID ───────────────────────────────── */}
      <section className="section-pad" style={{ position: 'relative', zIndex: 10, padding: isTablet ? '0 24px 80px' : '0 48px 140px' }}>

        <Reveal style={{ marginBottom: 56 }}>
          <p style={{
            fontFamily: 'ui-monospace,monospace', fontSize: 10, letterSpacing: '0.32em',
            textTransform: 'uppercase', color: '#f59e0b', marginBottom: 14,
          }}>◆ Capabilities</p>
          <h2 style={{
            fontSize: 'clamp(22px,3vw,40px)', fontWeight: 300,
            letterSpacing: '-0.02em', color: '#e2e8f0', maxWidth: 560, margin: 0,
          }}>Everything you need to make smarter city decisions.</h2>
        </Reveal>

        <div className="feat-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 18, maxWidth: 1200, margin: '0 auto',
        }}>
          <Reveal delay={0} style={{ gridColumn: 'span 7' }}>
            <FCard icon="📊" title="Macro Analytics Vector" accent="#6366f1" wide
              body="Generate structural radar charts instantly. Traffic efficiency, ecological health, economy & sentiment — scored 0–100." />
          </Reveal>
          <Reveal delay={100} style={{ gridColumn: 'span 5' }}>
            <FCard icon="🧠" title="Live Stakeholder Debate" accent="#34d399"
              body="Citizen, Business Owner & Environmentalist debate your policy live — streamed character by character." />
          </Reveal>
          <Reveal delay={0} style={{ gridColumn: 'span 5' }}>
            <FCard icon="⏳" title="10-Year Forecast" accent="#f59e0b"
              body="Temporal pathway from Year 1 disruption through Year 10 structural transformation." />
          </Reveal>
          <Reveal delay={100} style={{ gridColumn: 'span 7' }}>
            <FCard icon="🔀" title="Policy A vs B Comparison" accent="#a78bfa" wide
              body="Run two policies simultaneously. Get an AI judge recommendation based on your budget, priority & risk settings." />
          </Reveal>
        </div>
      </section>

      {/* ─────────────────── CTA BANNER ──────────────────────────────────── */}
      <section className="section-pad" style={{ position: 'relative', zIndex: 10, padding: isTablet ? '0 24px 80px' : '0 48px 120px' }}>
        <Reveal>
          <div className="cta-banner" style={{
            maxWidth: 1200, margin: '0 auto', borderRadius: 28,
            border: '1px solid rgba(99,102,241,0.18)',
            background: 'linear-gradient(135deg, rgba(15,18,32,0.9) 0%, rgba(8,10,18,0.95) 100%)',
            padding: isMobile ? '36px 24px' : '64px 72px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 32, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', right: 0, top: 0, bottom: 0, width: '40%', pointerEvents: 'none',
              background: 'radial-gradient(circle at right center, rgba(99,102,241,0.12), transparent 70%)',
            }} />
            <div>
              <p style={{
                fontFamily: 'ui-monospace,monospace', fontSize: 10, letterSpacing: '0.28em',
                textTransform: 'uppercase', color: '#475569', marginBottom: 14,
              }}>Ready to simulate?</p>
              <h2 style={{
                fontSize: 'clamp(18px,2.8vw,36px)', fontWeight: 300,
                letterSpacing: '-0.02em', color: '#e2e8f0', margin: 0,
              }}>Start architecting your city's future today.</h2>
            </div>
            <CTAButton onClick={onLaunch} />
          </div>
        </Reveal>
      </section>

      {/* ─────────────────── FOOTER ──────────────────────────────────────── */}
      <footer className="footer-inner" style={{
        position: 'relative', zIndex: 10,
        borderTop: '1px solid rgba(255,255,255,0.04)',
        padding: isMobile ? '20px 16px' : '28px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CityIcon />
          <span style={{
            fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#334155',
          }}>UrbanPulse Systems</span>
        </div>
        <p style={{
          fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: '#334155', margin: 0,
        }}>© 2026 All rights reserved.</p>
      </footer>
    </div>
  );
}
