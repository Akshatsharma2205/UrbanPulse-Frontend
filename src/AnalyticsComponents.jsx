import { useState, useEffect, useRef, useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

/* ─── Shared ease-out cubic ───────────────────────────────────────────────── */
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

/* ─── useCountUp: animates a number from 0 → target over `duration`ms ────── */
function useCountUp(target, duration = 1200, delay = 0) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let timeout;
    let raf;
    let start;
    const run = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(elapsed / duration, 1);
      setDisplay(Math.round(easeOutCubic(t) * target));
      if (t < 1) raf = requestAnimationFrame(run);
    };
    timeout = setTimeout(() => { raf = requestAnimationFrame(run); }, delay);
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf); };
  }, [target, duration, delay]);
  return display;
}

/* ─── healthColour: green / amber / red based on score ───────────────────── */
function healthColour(value) {
  if (value >= 65) return '#10b981';
  if (value >= 35) return '#f59e0b';
  return '#ef4444';
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. IMPACT CARD
   ════════════════════════════════════════════════════════════════════════ */
export function ImpactCard({ title, value, prevValue, compact = false, index = 0 }) {
  const displayed = useCountUp(value, 1200, index * 100);
  const colour    = healthColour(value);
  const delta     = prevValue != null ? value - prevValue : null;

  return (
    <div className="glass-card" style={{
      padding: compact ? '12px 14px' : '20px 22px',
      position: 'relative', overflow: 'hidden',
      /* staggered slide-up */
      animation: `impactSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 100}ms both`,
    }}>
      <style>{`
        @keyframes impactSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* accent glow */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
        background: `radial-gradient(ellipse at 90% 10%, ${colour}18, transparent 60%)`,
      }} />

      <div style={{
        fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: '#52525b', marginBottom: compact ? 6 : 10,
      }}>{title}</div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: compact ? 8 : 12 }}>
        <span style={{
          fontFamily: 'ui-monospace,monospace',
          fontSize: compact ? 22 : 32,
          fontWeight: 300,
          color: colour,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          textShadow: `0 0 12px ${colour}88`,
          transition: 'color 0.4s',
        }}>{displayed}</span>
        <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 10, color: '#334155' }}>/100</span>
        {delta != null && (
          <span style={{
            fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.1em',
            color: delta > 0 ? '#10b981' : delta < 0 ? '#ef4444' : '#52525b',
            marginLeft: 4,
          }}>
            {delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '—'}
          </span>
        )}
      </div>

      {/* Animated progress bar */}
      <div style={{
        height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${displayed}%`,
          background: `linear-gradient(90deg, ${colour}88, ${colour})`,
          boxShadow: `0 0 6px ${colour}`,
          borderRadius: 2,
          transition: 'width 0.05s linear',
        }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. ARCHITECTURAL RADAR  (draws from centre, rotating ring, pulsing score)
   ════════════════════════════════════════════════════════════════════════ */
export function ArchitecturalRadar({ data }) {
  const [revealed, setRevealed] = useState(false);
  const [pulse, setPulse] = useState(false);
  const healthScore = Math.round(data.reduce((s, d) => s + d.value, 0) / data.length);
  const scoreColour = healthScore >= 65 ? '#10b981' : healthScore >= 35 ? '#f59e0b' : '#ef4444';

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 700);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const chartData = data.map(d => ({ subject: d.label, value: d.value, fullMark: 100 }));

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <style>{`
        @keyframes radarRingSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes healthScorePulse {
          0%,100% { transform: scale(1); }
          50%     { transform: scale(1.14); }
        }
      `}</style>

      {/* ── Health score — sits ABOVE the chart, no position:absolute overlap ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        paddingBottom: 16,
      }}>
        <span style={{
          fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: '#52525b',
          alignSelf: 'center',
        }}>Structural Analysis Vector</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{
            fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#52525b', marginBottom: 2,
          }}>City Health</span>
          <span style={{
            fontFamily: 'ui-monospace,monospace', fontSize: 32, fontWeight: 300,
            color: scoreColour, letterSpacing: '-0.04em', lineHeight: 1,
            textShadow: `0 0 16px ${scoreColour}88`,
            display: 'inline-block',
            animation: pulse ? 'healthScorePulse 0.7s ease' : 'none',
          }}>
            {healthScore}
            <span style={{ fontSize: 13, color: '#334155' }}>/100</span>
          </span>
        </div>
      </div>

      {/* ── Chart + decorative ring ── */}
      <div style={{ position: 'relative', height: 240, overflow: 'hidden', borderRadius: 8 }}>
        {/* Rotating outer ring — clipped inside the container */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 200, height: 200,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, transparent 0%, rgba(99,102,241,0.18) 12%, transparent 28%, rgba(16,185,129,0.08) 58%, transparent 78%)',
          animation: 'radarRingSpin 8s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} margin={{ top: 12, right: 36, bottom: 12, left: 36 }}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'ui-monospace,monospace', letterSpacing: '0.12em' }}
              />
              <Radar
                name="Impact"
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={revealed ? 0.2 : 0}
                strokeWidth={1.5}
                dot={{ fill: '#818cf8', r: 3.5, strokeWidth: 0 }}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. COMPARE RADAR
   ════════════════════════════════════════════════════════════════════════ */
export function CompareRadar({ dataA, dataB }) {
  const chartData = dataA.map((d, i) => ({
    subject: d.label,
    A: d.value,
    B: dataB[i]?.value ?? 0,
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="rgba(255,255,255,0.06)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#52525b', fontSize: 9, fontFamily: 'ui-monospace,monospace', letterSpacing: '0.15em' }}
        />
        <Radar name="A" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15}
          strokeWidth={1.5} isAnimationActive animationDuration={1200} animationEasing="ease-out" />
        <Radar name="B" dataKey="B" stroke="#52525b" fill="#52525b" fillOpacity={0.10}
          strokeWidth={1.5} isAnimationActive animationDuration={1200} animationEasing="ease-out" />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. ANIMATED TIMELINE
   ════════════════════════════════════════════════════════════════════════ */
export function AnimatedTimeline({ evolution }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    evolution.forEach((_, i) => {
      setTimeout(() => setVisibleCount(i + 1), i * 400 + 200);
    });
  }, [evolution]);

  // Line height grows as nodes appear
  const lineHeightPct = evolution.length > 1
    ? `${((visibleCount - 1) / (evolution.length - 1)) * 100}%`
    : '0%';

  return (
    <div className="glass-card" style={{
      padding: '28px',
      marginBottom: 32, position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes timelineNodeIn {
          from { opacity:0; transform:translateX(-16px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes timelineLineGrow {
          from { height: 0; }
        }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', right: -40, top: -40, width: 200, height: 200,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <h4 style={{
        fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.28em',
        textTransform: 'uppercase', color: '#52525b', marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%', background: '#6366f1',
          boxShadow: '0 0 8px rgba(99,102,241,0.8)',
          display: 'inline-block',
          animation: 'pulse 2s ease-in-out infinite',
        }} />
        10-Year Evolution Pathway
      </h4>

      <div style={{ position: 'relative', paddingLeft: 28 }}>
        {/* Animated vertical connector line */}
        <div style={{
          position: 'absolute', left: 11, top: 6,
          width: 2, overflow: 'hidden',
          height: lineHeightPct,
          transition: `height ${400}ms cubic-bezier(0.16,1,0.3,1)`,
          background: 'linear-gradient(to bottom, rgba(99,102,241,0.6), rgba(16,185,129,0.2))',
          borderRadius: 2,
        }} />
        {/* Full-height dim track */}
        <div style={{
          position: 'absolute', left: 11, top: 6, bottom: 4, width: 2,
          background: 'rgba(255,255,255,0.04)', borderRadius: 2,
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {evolution.map((ev, i) => {
            const visible = i < visibleCount;
            return (
              <div key={i} style={{
                position: 'relative',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(-16px)',
                transition: `opacity 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)`,
              }}>
                {/* Node dot */}
                <div style={{
                  position: 'absolute', left: -22, top: 4,
                  width: 12, height: 12, borderRadius: '50%',
                  background: '#050505',
                  border: `2px solid ${visible ? '#6366f1' : '#2a2a30'}`,
                  boxShadow: visible ? '0 0 10px rgba(99,102,241,0.5)' : 'none',
                  transition: 'border-color 0.4s, box-shadow 0.4s',
                }} />

                {/* Year label */}
                <div style={{
                  display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4,
                }}>
                  <span
                    style={{
                      fontFamily: 'ui-monospace,monospace', fontSize: 10,
                      color: '#6366f1', letterSpacing: '0.15em',
                      cursor: 'default',
                      transition: 'color 0.2s, text-shadow 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = '#f59e0b';
                      e.currentTarget.style.textShadow = '0 0 10px rgba(245,158,11,0.7)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = '#6366f1';
                      e.currentTarget.style.textShadow = 'none';
                    }}
                  >YEAR {ev.year}</span>
                  <span style={{
                    fontSize: 13, color: '#e2e8f0', fontWeight: 500, letterSpacing: '0.02em',
                  }}>{ev.phase}</span>
                </div>
                <p style={{
                  fontSize: 12, color: '#64748b', lineHeight: 1.65, fontWeight: 300, margin: 0,
                }}>{ev.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. TYPEWRITER AI SUMMARY
   ════════════════════════════════════════════════════════════════════════ */
export function TypewriterSummary({ text, label = 'AI Trade-off Analysis', accent = '#3b4a6b' }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(interval); setDone(true); }
    }, 18);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="glass-card" style={{
      marginBottom: 24,
      padding: 20,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 3, background: accent, borderRadius: '3px 0 0 3px',
      }} />
      <div style={{
        fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: '#52525b', marginBottom: 10,
      }}>{label}</div>
      <p style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.72, fontWeight: 300, margin: 0, minHeight: 20 }}>
        {displayed}
        {!done && (
          <span style={{
            display: 'inline-block', width: 1.5, height: 14,
            background: '#818cf8', marginLeft: 2, verticalAlign: 'middle',
            animation: 'twCursor 1s step-end infinite',
          }} />
        )}
      </p>
      <style>{`
        @keyframes twCursor { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   6. CITY SKYLINE LOADER  (SVG stroke-dashoffset assembly)
   ════════════════════════════════════════════════════════════════════════ */
export function ProfessionalLoader() {
  const buildings = [
    // [x, y, w, h] — each building is a rect
    { x: 10,  y: 120, w: 18, h: 80  },
    { x: 32,  y: 90,  w: 14, h: 110 },
    { x: 50,  y: 60,  w: 22, h: 140 },
    { x: 76,  y: 100, w: 16, h: 100 },
    { x: 96,  y: 40,  w: 26, h: 160 },
    { x: 126, y: 80,  w: 18, h: 120 },
    { x: 148, y: 110, w: 20, h: 90  },
    { x: 172, y: 50,  w: 30, h: 150 },
    { x: 206, y: 85,  w: 16, h: 115 },
    { x: 226, y: 115, w: 18, h: 85  },
    { x: 248, y: 70,  w: 22, h: 130 },
    { x: 274, y: 95,  w: 14, h: 105 },
    { x: 292, y: 55,  w: 28, h: 145 },
    { x: 324, y: 105, w: 16, h: 95  },
    { x: 344, y: 130, w: 20, h: 70  },
  ];

  // Each building path perimeter for stroke-dasharray
  const perimeter = (w, h) => 2 * (w + h);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 2200;
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      setProgress(easeOutCubic(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', minHeight: 380,
    }}>
      <style>{`
        @keyframes loaderFlicker {
          0%,18%,20%,100% { opacity:1; }
          19%              { opacity:0.4; }
        }
        @keyframes scanLine {
          from { transform:translateY(-100%); }
          to   { transform:translateY(200%); }
        }
      `}</style>

      {/* SVG skyline */}
      <div style={{ position: 'relative', width: 380, height: 210 }}>
        {/* Scan line overlay */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 2,
        }}>
          <div style={{
            width: '100%', height: 3,
            background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.6), transparent)',
            animation: 'scanLine 1.8s linear infinite',
          }} />
        </div>

        <svg viewBox="0 0 370 210" width="370" height="210" style={{ display: 'block' }}>
          {/* Ground line */}
          <line x1="0" y1="200" x2="370" y2="200" stroke="rgba(99,102,241,0.2)" strokeWidth="1" />

          {/* Window dots glow */}
          {buildings.map((b, bi) => {
            const delay = bi / buildings.length;
            if (progress < delay) return null;
            return (
              <g key={`windows-${bi}`}>
                {[...Array(Math.floor((b.h - 16) / 18))].map((_, wi) =>
                  [...Array(Math.floor((b.w - 8) / 10))].map((_, wj) => (
                    <rect
                      key={`w-${bi}-${wi}-${wj}`}
                      x={b.x + 4 + wj * 10}
                      y={b.y + 6 + wi * 18}
                      width={5} height={7}
                      fill={Math.random() > 0.3 ? 'rgba(251,191,36,0.55)' : 'rgba(99,102,241,0.3)'}
                      rx={1}
                      style={{ animation: `loaderFlicker ${2 + Math.random()}s ease-in-out ${Math.random()}s infinite` }}
                    />
                  ))
                )}
              </g>
            );
          })}

          {/* Building outlines — animate with stroke-dashoffset */}
          {buildings.map((b, bi) => {
            const delay = bi / buildings.length;
            const localProgress = Math.max(0, Math.min(1, (progress - delay) / (1 / buildings.length + 0.15)));
            const perim = perimeter(b.w, b.h);
            const drawn = perim * localProgress;
            return (
              <rect
                key={`b-${bi}`}
                x={b.x} y={b.y} width={b.w} height={b.h}
                fill="rgba(13,17,27,0.85)"
                stroke={localProgress > 0.5 ? '#6366f1' : '#2a2a30'}
                strokeWidth={1}
                strokeDasharray={perim}
                strokeDashoffset={perim - drawn}
                style={{ transition: 'stroke 0.5s', filter: localProgress > 0.9 ? 'drop-shadow(0 0 4px rgba(99,102,241,0.5))' : 'none' }}
              />
            );
          })}
        </svg>
      </div>

      {/* Status text */}
      <div className="glass-card" style={{
        marginTop: 24,
        padding: '14px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#10b981',
            boxShadow: '0 0 10px rgba(16,185,129,0.9)',
            animation: 'pulse 1.4s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: 'ui-monospace,monospace', fontSize: 10, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: '#a1a1aa',
          }}>Synthesizing Neural Dimensions…</span>
        </div>
        {/* Mini progress bar */}
        <div style={{ width: 220, height: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, #4f46e5, #818cf8)',
            boxShadow: '0 0 8px rgba(99,102,241,0.7)',
            transition: 'width 0.05s linear',
          }} />
        </div>
        <span style={{
          fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: '#475569',
        }}>Generating geographic structural models</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   7. STAKEHOLDER CARD
   ════════════════════════════════════════════════════════════════════════ */
const ROLE_CONFIG = {
  'Citizen':          { colour: '#3b82f6', icon: '👤' },
  'Business Owner':   { colour: '#f59e0b', icon: '💼' },
  'Environmentalist': { colour: '#10b981', icon: '🌱' },
};

export function StakeholderCard({ role, message, compact = false }) {
  const cfg = ROLE_CONFIG[role] || { colour: '#818cf8', icon: '🗣️' };
  return (
    <div className="glass-card" style={{
      padding: compact ? '12px 14px' : '16px 18px',
      position: 'relative', overflow: 'hidden',
      borderColor: `${cfg.colour}44`
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 3, background: cfg.colour, borderRadius: '3px 0 0 3px',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: compact ? 14 : 16 }}>{cfg.icon}</span>
        <span style={{
          fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: cfg.colour, fontWeight: 600,
        }}>{role}</span>
      </div>
      <p style={{
        fontSize: compact ? 12 : 13, color: '#94a3b8', lineHeight: 1.65, fontWeight: 300, margin: 0,
      }}>{message}</p>
    </div>
  );
}

/* ─── Role config ─────────────────────────────────────────────────────────── */
const DEBATE_ROLES = {
  'Citizen':          { colour: '#3b82f6', glow: 'rgba(59,130,246,0.55)',  icon: '\uD83D\uDC64', side: 'left'   },
  'Business Owner':   { colour: '#f59e0b', glow: 'rgba(245,158,11,0.55)',  icon: '\uD83D\uDCBC', side: 'right'  },
  'Environmentalist': { colour: '#10b981', glow: 'rgba(16,185,129,0.55)',  icon: '\uD83C\uDF31', side: 'center' },
};
const DEFAULT_ROLE = { colour: '#818cf8', glow: 'rgba(129,140,248,0.45)', icon: '\uD83D\uDDE3\uFE0F', side: 'left' };

/* ─── Parse debate data into per-speaker turns ───────────────────────────── */
function parseDebate(debate) {
  // Case 1: already an array of {role, message} objects (backend format)
  if (Array.isArray(debate)) {
    return debate.map(item => ({ role: item.role ?? null, text: item.message ?? '' }));
  }

  // Case 2: JSON string that might be an array
  if (typeof debate === 'string') {
    try {
      const parsed = JSON.parse(debate);
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({ role: item.role ?? null, text: item.message ?? '' }));
      }
    } catch (_) { /* not JSON — fall through to text parsing */ }
  }

  // Case 3: plain text with "Role: message" format
  const raw = typeof debate === 'string' ? debate : JSON.stringify(debate, null, 2);
  // Try to split on known role names
  const roleNames = Object.keys(DEBATE_ROLES);
  const pattern = new RegExp(`(${roleNames.join('|')}):`, 'g');
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(raw)) !== null) {
    if (lastIndex > 0 && parts.length > 0) {
      parts[parts.length - 1].text = raw.slice(lastIndex, match.index).trim();
    }
    parts.push({ role: match[1], text: '' });
    lastIndex = match.index + match[0].length;
  }
  if (parts.length > 0) {
    parts[parts.length - 1].text = raw.slice(lastIndex).trim();
    return parts;
  }
  // Fallback: one blob
  return [{ role: null, text: raw }];
}

export function LiveDebateStream({ debate }) {
  // Memoize turns so parseDebate doesn't return a new array reference on every render
  const turns = useMemo(() => parseDebate(debate), [debate]);

  // Sequential typewriter: one turn at a time
  const [activeTurn, setActiveTurn] = useState(0);
  const [charCount,  setCharCount]  = useState(0);
  const [revealed,   setRevealed]   = useState([]);
  const [done,       setDone]       = useState(false);

  // Reset everything when debate data changes
  useEffect(() => {
    setActiveTurn(0);
    setCharCount(0);
    setRevealed([]);
    setDone(false);
  }, [debate]);

  // Typewriter engine — runs whenever activeTurn or charCount changes
  useEffect(() => {
    if (done || !turns.length) return;
    if (activeTurn >= turns.length) { setDone(true); return; }

    const currentText = turns[activeTurn]?.text ?? '';

    if (charCount >= currentText.length) {
      // This turn is fully typed — commit it to revealed
      setRevealed(prev => {
        const next = [...prev];
        next[activeTurn] = currentText;
        return next;
      });
      const nextTurn = activeTurn + 1;
      if (nextTurn >= turns.length) {
        setDone(true);
        return;
      }
      // Pause between speakers — cleanup prevents double-fire on re-render
      const pauseId = setTimeout(() => {
        setActiveTurn(nextTurn);
        setCharCount(0);
      }, 320);
      return () => clearTimeout(pauseId);
    }

    // Advance one character
    const id = setTimeout(() => setCharCount(c => c + 1), 18);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTurn, charCount, done]);
  // NOTE: `turns` intentionally excluded — it's stable via useMemo and
  // debate changes are handled by the reset effect above.

  return (
    <div style={{ position: 'relative', borderRadius: 12 }}>
      <style>{`
        @keyframes dbcSlideLeft   { from { opacity:0; transform:translateX(-28px); } to { opacity:1; transform:none; } }
        @keyframes dbcSlideRight  { from { opacity:0; transform:translateX( 28px); } to { opacity:1; transform:none; } }
        @keyframes dbcSlideUp     { from { opacity:0; transform:translateY( 20px);  } to { opacity:1; transform:none; } }
        @keyframes avatarPulse    { 0%,100%{transform:scale(1);} 50%{transform:scale(1.12);} }
        @keyframes debateBg       {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
        @keyframes twCursor2      { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>

      {/* Animated gradient background — overflow:hidden here so bubbles can scroll freely */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, borderRadius: 12,
        background: 'linear-gradient(135deg, #060812, #0a0714, #06080f, #0d0a18)',
        backgroundSize: '400% 400%',
        animation: 'debateBg 8s ease infinite',
        overflow: 'hidden',
        pointerEvents: 'none',
      }} />


      {/* Live indicator header */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 16px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%', background: '#10b981',
          boxShadow: '0 0 8px rgba(16,185,129,0.9)', display: 'inline-block',
          animation: done ? 'none' : 'avatarPulse 1.2s ease-in-out infinite',
        }} />
        <span style={{
          fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.24em',
          textTransform: 'uppercase', color: '#52525b',
        }}>Live Stakeholder Debate</span>
        {/* Role legend */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          {Object.entries(DEBATE_ROLES).map(([role, cfg]) => (
            <span key={role} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: 'ui-monospace,monospace', fontSize: 8,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: cfg.colour, opacity: 0.7,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.colour, display: 'inline-block' }} />
              {role.split(' ')[0]}
            </span>
          ))}
        </div>
      </div>

      {/* Bubbles */}
      <div style={{
        position: 'relative', zIndex: 1, padding: '16px 14px',
        display: 'flex', flexDirection: 'column', gap: 18,
      }}>
        {turns.map((turn, idx) => {
          // Only render turns that have started
          if (idx > activeTurn && !(revealed[idx] !== undefined)) return null;
          if (idx > activeTurn) return null;

          const isActive  = idx === activeTurn;
          const turnText  = isActive ? turn.text.slice(0, charCount) : (revealed[idx] ?? turn.text);
          const cfg       = (turn.role && DEBATE_ROLES[turn.role]) || DEFAULT_ROLE;
          const isLeft    = cfg.side === 'left';
          const isRight   = cfg.side === 'right';
          const slideAnim = isLeft ? 'dbcSlideLeft' : isRight ? 'dbcSlideRight' : 'dbcSlideUp';

          return (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: isRight ? 'row-reverse' : 'row',
              alignItems: 'flex-start', gap: 10,
              justifyContent: cfg.side === 'center' ? 'center' : 'flex-start',
              animation: `${slideAnim} 0.38s cubic-bezier(0.16,1,0.3,1) both`,
            }}>
              {/* Avatar */}
              <div style={{
                flexShrink: 0, width: 34, height: 34, borderRadius: '50%',
                background: `${cfg.colour}18`,
                border: `1.5px solid ${cfg.colour}`,
                boxShadow: isActive
                  ? `0 0 16px ${cfg.glow}, 0 0 32px ${cfg.glow}`
                  : `0 0 6px ${cfg.glow}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
                animation: isActive ? 'avatarPulse 0.9s ease-in-out infinite' : 'none',
                transition: 'box-shadow 0.4s',
              }}>
                {cfg.icon}
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth: '78%',
                background: `linear-gradient(135deg, ${cfg.colour}0e, rgba(8,8,12,0.95))`,
                border: `1px solid ${cfg.colour}${isActive ? '44' : '22'}`,
                borderRadius: isRight ? '12px 4px 12px 12px' : cfg.side === 'center' ? '12px' : '4px 12px 12px 12px',
                padding: '10px 14px',
                boxShadow: isActive ? `0 4px 24px ${cfg.colour}20` : 'none',
                transition: 'box-shadow 0.3s, border-color 0.3s',
              }}>
                {/* Speaker label */}
                {turn.role && (
                  <div style={{
                    fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.22em',
                    textTransform: 'uppercase', color: cfg.colour, marginBottom: 6,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <span style={{
                      width: 4, height: 4, borderRadius: '50%',
                      background: cfg.colour, display: 'inline-block',
                      boxShadow: `0 0 4px ${cfg.colour}`,
                    }} />
                    {turn.role}
                  </div>
                )}
                <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.68, fontWeight: 300, margin: 0 }}>
                  {turnText}
                  {isActive && (
                    <span style={{
                      display: 'inline-block', width: 1.5, height: 12,
                      background: cfg.colour, marginLeft: 2, verticalAlign: 'middle',
                      animation: 'twCursor2 0.9s step-end infinite',
                    }} />
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   9. CITY VITALS PANEL  — live pre-simulation state
   ════════════════════════════════════════════════════════════════════════ */
const VITALS_LEVELS = {
  'Low':       { fraction: 0.25, colour: '#10b981', label: 'LOW'       },
  'Medium':    { fraction: 0.50, colour: '#f59e0b', label: 'MEDIUM'    },
  'High':      { fraction: 0.75, colour: '#ef4444', label: 'HIGH'      },
  'Severe':    { fraction: 1.00, colour: '#991b1b', label: 'SEVERE'    },
  'Very High': { fraction: 0.90, colour: '#dc2626', label: 'VERY HIGH' },
  'Low-Medium':{ fraction: 0.38, colour: '#84cc16', label: 'LOW-MED'   },
};
const defaultVital = { fraction: 0.5, colour: '#f59e0b', label: '—' };

/* SemiGauge — SVG arc speedometer dial */
function SemiGauge({ level, label }) {
  const cfg = VITALS_LEVELS[level] || defaultVital;
  const R = 40; const CX = 50; const CY = 50;
  const circum = Math.PI * R; // semicircle arc

  const [animated, setAnimated] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const target = cfg.fraction;
    let startTime = null;
    const tick = (ts) => {
      if (!startTime) startTime = ts;
      const t = Math.min((ts - startTime) / 600, 1);
      setAnimated(easeOutCubic(t) * target);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [level]); // eslint-disable-line

  const offset = circum * (1 - animated);
  const d = `M ${CX - R},${CY} A ${R},${R} 0 0 1 ${CX + R},${CY}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg viewBox="0 0 100 56" width={130} height={80}>
        {/* Background track */}
        <path d={d} fill="none" stroke="rgba(255,255,255,0.06)"
          strokeWidth={8} strokeLinecap="round" />
        {/* Animated fill arc */}
        <path d={d} fill="none"
          stroke={cfg.colour} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={circum} strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 5px ${cfg.colour}aa)`, transition: 'stroke 0.4s' }}
        />
        {/* Level text centered inside arc */}
        <text x={CX} y={CY - 4}
          textAnchor="middle" fontSize={9}
          fontFamily="ui-monospace,monospace"
          fill={cfg.colour} letterSpacing="0.08em"
          style={{ transition: 'fill 0.4s' }}
        >{cfg.label}</text>
      </svg>
      <span style={{
        fontFamily: 'ui-monospace,monospace', fontSize: 8,
        letterSpacing: '0.22em', textTransform: 'uppercase', color: '#52525b',
      }}>{label}</span>
    </div>
  );
}

export function CityVitalsPanel({ city, population, trafficLevel, pollutionLevel, timeHorizon }) {
  const displayPop = useCountUp(population, 900, 0);
  const TOTAL_SEGS = 10;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', gap: 28,
    }}>
      <style>{`
        @keyframes vitalsPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.85)} }
        @keyframes vitalsGlow  { 0%,100%{box-shadow:0 0 8px rgba(16,185,129,0.6)} 50%{box-shadow:0 0 16px rgba(16,185,129,1)} }
        @keyframes vitalsSlide { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
      `}</style>

      {/* City name header */}
      <div style={{ textAlign: 'center', animation: 'vitalsSlide 0.5s ease both' }}>
        <div style={{
          fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.32em',
          textTransform: 'uppercase', color: '#52525b', marginBottom: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block',
            animation: 'vitalsGlow 2s ease-in-out infinite',
          }} />
          Live City Profile
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block',
            animation: 'vitalsGlow 2s ease-in-out infinite',
          }} />
        </div>

        <h2 style={{
          fontSize: 38, fontWeight: 200, letterSpacing: '-0.02em',
          color: '#e4e4e7', margin: 0, lineHeight: 1.1,
          textShadow: '0 0 40px rgba(129,140,248,0.15)',
          transition: 'all 0.4s ease',
        }}>{city || '—'}</h2>

        {/* Divider */}
        <div style={{
          width: 72, height: 1, margin: '12px auto 0',
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)',
        }} />
      </div>

      {/* Two gauges side by side */}
      <div style={{
        display: 'flex', gap: 40, alignItems: 'flex-start',
        animation: 'vitalsSlide 0.5s 0.08s ease both',
      }}>
        <SemiGauge level={trafficLevel}   label="Traffic"   />
        <SemiGauge level={pollutionLevel} label="Pollution"  />
      </div>

      {/* Population */}
      <div style={{
        textAlign: 'center', animation: 'vitalsSlide 0.5s 0.16s ease both',
      }}>
        <div style={{
          fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.24em',
          textTransform: 'uppercase', color: '#52525b', marginBottom: 6,
        }}>Population Base</div>
        <div style={{
          fontFamily: 'ui-monospace,monospace', fontSize: 30, fontWeight: 300,
          color: '#818cf8', letterSpacing: '-0.02em',
          textShadow: '0 0 18px rgba(129,140,248,0.35)',
          transition: 'color 0.3s',
        }}>
          {displayPop.toLocaleString()}
        </div>
      </div>

      {/* Time horizon segmented bar */}
      <div style={{
        width: '100%', maxWidth: 300,
        animation: 'vitalsSlide 0.5s 0.24s ease both',
      }}>
        <div style={{
          fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.2em',
          textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between',
          color: '#52525b', marginBottom: 8,
        }}>
          <span>Time Horizon</span>
          <span style={{ color: '#6366f1' }}>
            {timeHorizon} {timeHorizon === 1 ? 'Year' : 'Years'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4, height: 7 }}>
          {Array.from({ length: TOTAL_SEGS }).map((_, i) => {
            const active = i < timeHorizon;
            return (
              <div key={i} style={{
                flex: 1, borderRadius: 2,
                background: active ? '#6366f1' : 'rgba(255,255,255,0.05)',
                boxShadow: active ? '0 0 6px rgba(99,102,241,0.55)' : 'none',
                transition: 'background 0.25s, box-shadow 0.25s',
              }} />
            );
          })}
        </div>
      </div>

      {/* CTA hint */}
      <div style={{
        fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: '#3f3f46', textAlign: 'center',
        maxWidth: 240, lineHeight: 1.8,
        animation: 'vitalsSlide 0.5s 0.32s ease both',
      }}>
        Configure a policy in the wizard<br />then run simulation to begin analysis
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   10. POLICY HEAT MATRIX
   ════════════════════════════════════════════════════════════════════════ */
const HEAT_POLICIES = [
  { key: 'add_metro',      icon: '\uD83D\uDE87', label: 'Metro Line',          traffic: 82, economy: 65, ecology: 72, sentiment: 88 },
  { key: 'add_park',       icon: '\uD83C\uDF33', label: 'Green Park',          traffic: 40, economy: 50, ecology: 95, sentiment: 90 },
  { key: 'remove_parking', icon: '\uD83D\uDEAB', label: 'Remove Parking',      traffic: 70, economy: 35, ecology: 65, sentiment: 55 },
  { key: 'increase_tax',   icon: '\uD83D\uDCBC', label: 'Corporate Tax',       traffic: 45, economy: 78, ecology: 50, sentiment: 48 },
  { key: 'build_highway',  icon: '\uD83D\uDEE3\uFE0F', label: 'Highway Expansion', traffic: 60, economy: 72, ecology: 22, sentiment: 50 },
  { key: 'subsidize_ev',   icon: '\u26A1',        label: 'Subsidize EV',       traffic: 65, economy: 55, ecology: 88, sentiment: 75 },
];
const HEAT_METRICS = [
  { key: 'traffic',   label: 'Traffic'   },
  { key: 'economy',   label: 'Economy'   },
  { key: 'ecology',   label: 'Ecology'   },
  { key: 'sentiment', label: 'Sentiment' },
];

function heatColour(score) {
  if (score >= 70) return { bg: 'rgba(16,185,129,0.18)',  text: '#10b981', glow: 'rgba(16,185,129,0.35)' };
  if (score >= 45) return { bg: 'rgba(245,158,11,0.16)',  text: '#f59e0b', glow: 'rgba(245,158,11,0.30)' };
  return              { bg: 'rgba(239,68,68,0.16)',    text: '#ef4444', glow: 'rgba(239,68,68,0.30)'  };
}

export function PolicyHeatMatrix({ onClose, onSimulate }) {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [visible,    setVisible]    = useState(0);

  // Stagger 6×4 = 24 cells, 30ms apart
  useEffect(() => {
    setVisible(0);
    const total = HEAT_POLICIES.length * HEAT_METRICS.length;
    let i = 0;
    const id = setInterval(() => { i++; setVisible(i); if (i >= total) clearInterval(id); }, 30);
    return () => clearInterval(id);
  }, []);

  // Escape to close
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <style>{`
        @keyframes hmSlideUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
      `}</style>

      <div onClick={e => e.stopPropagation()} style={{
        background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18, padding: '32px 28px',
        width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 0 80px rgba(99,102,241,0.15), 0 40px 80px rgba(0,0,0,0.6)',
        animation: 'hmSlideUp 0.28s cubic-bezier(0.16,1,0.3,1) both',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#52525b', marginBottom: 6 }}>
              Reference averages · Not AI-generated
            </div>
            <h2 style={{ fontFamily: 'ui-monospace,monospace', fontSize: 16, fontWeight: 400, color: '#e4e4e7', margin: 0, letterSpacing: '0.04em' }}>
              Policy Impact Reference Matrix
            </h2>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer',
            width: 32, height: 32, borderRadius: '50%', color: '#71717a',
            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.2s, background 0.2s', flexShrink: 0,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#e4e4e7'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#71717a'; }}
          >✕</button>
        </div>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '170px repeat(4, 1fr)', gap: 6, marginBottom: 6 }}>
          <div />
          {HEAT_METRICS.map(m => (
            <div key={m.key} style={{
              fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: '#52525b', textAlign: 'center', paddingBottom: 4,
            }}>{m.label}</div>
          ))}
        </div>

        {/* Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {HEAT_POLICIES.map((pol, rowIdx) => {
            const isHovered = hoveredRow === rowIdx;
            return (
              <div key={pol.key}
                onMouseEnter={() => setHoveredRow(rowIdx)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => { onSimulate(pol.key); onClose(); }}
                style={{
                  display: 'grid', gridTemplateColumns: '170px repeat(4, 1fr)', gap: 6,
                  borderRadius: 10, cursor: 'pointer', padding: 2,
                  border: `1px solid ${isHovered ? 'rgba(99,102,241,0.35)' : 'transparent'}`,
                  background: isHovered ? 'rgba(99,102,241,0.05)' : 'transparent',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
              >
                {/* Policy label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8 }}>
                  <span style={{ fontSize: 17, flexShrink: 0 }}>{pol.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 10, color: isHovered ? '#e4e4e7' : '#a1a1aa', letterSpacing: '0.04em', transition: 'color 0.2s' }}>
                      {pol.label}
                    </div>
                    <div style={{
                      fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.14em',
                      textTransform: 'uppercase', color: '#6366f1', marginTop: 3,
                      opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s',
                    }}>Simulate This →</div>
                  </div>
                </div>

                {/* Score cells */}
                {HEAT_METRICS.map((m, colIdx) => {
                  const score = pol[m.key];
                  const c = heatColour(score);
                  const cellIdx = rowIdx * HEAT_METRICS.length + colIdx;
                  const show = cellIdx < visible;
                  return (
                    <div key={m.key} style={{
                      background: c.bg, borderRadius: 8,
                      border: `1px solid ${c.text}22`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: '10px 4px',
                      boxShadow: isHovered ? `inset 0 0 14px ${c.glow}` : 'none',
                      opacity: show ? 1 : 0,
                      transform: show ? 'scale(1)' : 'scale(0.82)',
                      transition: `opacity 0.22s ${cellIdx * 10}ms, transform 0.22s ${cellIdx * 10}ms, box-shadow 0.2s`,
                    }}>
                      <span style={{
                        fontFamily: 'ui-monospace,monospace', fontSize: 17, fontWeight: 400, lineHeight: 1,
                        color: c.text,
                        textShadow: isHovered ? `0 0 10px ${c.text}` : 'none',
                        transition: 'text-shadow 0.2s',
                      }}>{score}</span>
                      {/* Mini score bar */}
                      <div style={{ width: 28, height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.08)', marginTop: 5, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: show ? `${score}%` : '0%', borderRadius: 2, background: c.text, transition: `width 0.6s ${cellIdx * 30}ms ease-out` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Legend + hint */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12 }}>
            {[
              { label: '70–100 · Strong',   bg: 'rgba(16,185,129,0.18)', text: '#10b981' },
              { label: '45–69 · Moderate',  bg: 'rgba(245,158,11,0.16)', text: '#f59e0b' },
              { label: '0–44 · Weak',       bg: 'rgba(239,68,68,0.16)',  text: '#ef4444' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: l.bg, border: `1px solid ${l.text}44` }} />
                <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#52525b' }}>{l.label}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#3f3f46' }}>
              Hover any row → click to instantly simulate that policy
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
