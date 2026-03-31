import React, { useState, useEffect, useRef, Fragment } from 'react';
import {
  LineChart, Line, AreaChart, Area,
  BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts';

/* ─────────────────────────────────────────────────────────────────────────
   DEMO CONSTANTS  (hardcoded reference data)
───────────────────────────────────────────────────────────────────────── */
const BUDGET_TOTAL = { Low: 300, Medium: 500, High: 700 };

const POLICY_PALETTE = [
  { key: 'add_metro',      icon: '🚇', label: 'Metro Line',       cost: 200, color: '#6366f1' },
  { key: 'add_park',       icon: '🌳', label: 'Green Park',       cost: 80,  color: '#10b981' },
  { key: 'subsidize_ev',   icon: '⚡', label: 'Subsidize EV',     cost: 120, color: '#f59e0b' },
  { key: 'remove_parking', icon: '🚫', label: 'Remove Parking',   cost: 60,  color: '#ef4444' },
  { key: 'increase_tax',   icon: '💼', label: 'Corporate Tax',    cost: 100, color: '#8b5cf6' },
  { key: 'build_highway',  icon: '🛣️', label: 'Highway',          cost: 150, color: '#f97316' },
];

/* No demo constants — using live API data */

const POLICY_YEARS = Array.from({ length: 11 }, (_, i) => 2026 + i);

/* ─────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────── */
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    prev.current = target;
    let start = null;
    const tick = (ts) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      setVal(Math.round(from + easeOut(t) * (target - from)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

function MetricDelta({ label, before, after, color }) {
  const delta = after - before;
  const sign = delta >= 0 ? '+' : '';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#52525b', width: 64 }}>{label}</span>
      <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11, color: '#71717a' }}>{before}</span>
      <span style={{ fontSize: 9, color: '#3f3f46' }}>→</span>
      <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11, color: after > before ? '#10b981' : '#ef4444', fontWeight: 500 }}>{after}</span>
      <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 9, color: after >= before ? '#10b981' : '#ef4444', marginLeft: 2 }}>
        {sign}{delta}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   STEP 1 — PLAN SETUP
───────────────────────────────────────────────────────────────────────── */
function PlanSetupStep({ planName, setPlanName, city, setCity, budget, setBudget, onNext }) {
  const total = BUDGET_TOTAL[budget];
  const pct = budget === 'Low' ? 33 : budget === 'Medium' ? 66 : 100;
  const animatedTotal = useCountUp(total, 500);
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', padding: '48px 24px', position: 'relative', zIndex: 1 }}>
      {/* Decorative ghost text */}
      <div style={{
        position: 'absolute', bottom: -20, right: -10, fontSize: 120, fontWeight: 900,
        color: 'rgba(99,102,241,0.04)', fontFamily: 'ui-monospace,monospace',
        letterSpacing: '-0.05em', pointerEvents: 'none', userSelect: 'none', lineHeight: 1,
      }}>PLAN</div>

      <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#52525b', marginBottom: 10 }}>
        Step 1 of 4 · Plan Identity
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 200, color: '#e4e4e7', margin: '0 0 8px', letterSpacing: '-0.01em', animation: 'mpFadeIn 0.6s cubic-bezier(0.16,1,0.3,1)' }}>Name Your Vision</h2>
      <p style={{ fontSize: 13, color: '#52525b', margin: '0 0 40px', lineHeight: 1.6, animation: 'mpFadeIn 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both' }}>Define what city you're transforming and your overall resource commitment.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Plan name + blinking cursor */}
        <div>
          <label style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#52525b', display: 'block', marginBottom: 10 }}>City Vision Title</label>
          <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(99,102,241,0.5)', paddingBottom: 0 }}>
            <input
              value={planName}
              onChange={e => setPlanName(e.target.value)}
              style={{
                flex: 1, background: 'transparent', border: 'none',
                fontSize: 20, fontWeight: 200, color: '#e4e4e7', padding: '8px 0',
                fontFamily: 'ui-monospace,monospace', outline: 'none', letterSpacing: '0.02em',
                boxSizing: 'border-box',
              }}
            />
            <div style={{
              width: 2, height: 22, background: '#6366f1', marginLeft: 2, flexShrink: 0,
              animation: 'mpBlink 1s step-end infinite',
            }} />
          </div>
        </div>

        {/* City + Budget row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <label style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#52525b', display: 'block', marginBottom: 10 }}>City</label>
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, fontSize: 14, color: '#e4e4e7', padding: '10px 14px',
                outline: 'none', fontFamily: 'ui-monospace,monospace', boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#52525b', display: 'block', marginBottom: 10 }}>Budget Level</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Low', 'Medium', 'High'].map(b => (
                <button key={b} onClick={() => setBudget(b)} style={{
                  flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer',
                  border: `1px solid ${budget === b ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
                  background: budget === b ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                  color: budget === b ? '#818cf8' : '#71717a',
                  fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
                  transition: 'all 0.2s',
                }}>{b}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Budget preview card with corner brackets */}
        <div style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 22px', position: 'relative' }}>
          {/* Corner brackets */}
          <div style={{ position: 'absolute', top: 10, left: 10, width: 12, height: 12, borderTop: '1px solid rgba(99,102,241,0.4)', borderLeft: '1px solid rgba(99,102,241,0.4)' }} />
          <div style={{ position: 'absolute', bottom: 10, right: 10, width: 12, height: 12, borderBottom: '1px solid rgba(99,102,241,0.4)', borderRight: '1px solid rgba(99,102,241,0.4)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#52525b' }}>Budget Available</span>
            <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12, color: '#6366f1' }}>{animatedTotal} pts</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#4f46e5,#818cf8)', borderRadius: 3, boxShadow: '0 0 20px rgba(99,102,241,0.6)', transition: 'width 0.4s ease' }} />
          </div>
          <p style={{ fontFamily: 'ui-monospace,monospace', fontSize: 9, color: '#3f3f46', marginTop: 10, letterSpacing: '0.1em' }}>
            Each policy costs budget points. High budget = more flexibility to stack policies.
          </p>
        </div>

        <button
          onClick={onNext}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            background: 'linear-gradient(135deg,#4f46e5,#6366f1)', border: 'none', borderRadius: 10,
            color: 'white', fontSize: 12, fontFamily: 'ui-monospace,monospace', letterSpacing: '0.14em',
            textTransform: 'uppercase', padding: '14px 0', cursor: 'pointer', width: '100%',
            boxShadow: btnHovered ? '0 0 36px rgba(99,102,241,0.55)' : '0 0 24px rgba(99,102,241,0.3)',
            transition: 'box-shadow 0.2s',
          }}
        >
          Design Strategy Canvas{' '}
          <span style={{ display: 'inline-block', transition: 'transform 0.2s', transform: btnHovered ? 'translateX(4px)' : 'none' }}>→</span>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   STEP 2 — STRATEGY CANVAS
───────────────────────────────────────────────────────────────────────── */
function StrategyCanvas({ budget, placements, setPlacements, onNext }) {
  const [selected, setSelected] = useState(null);
  const total = BUDGET_TOTAL[budget];
  const spent = placements.reduce((s, p) => {
    const pol = POLICY_PALETTE.find(x => x.key === p.policy);
    return s + (pol?.cost ?? 0);
  }, 0);
  const remaining = total - spent;
  const pct = Math.max(0, (remaining / total) * 100);
  const animatedRemaining = useCountUp(remaining, 400);

  const selectedPol = POLICY_PALETTE.find(p => p.key === selected);
  const getPlacement = (year) => placements.find(p => p.year === year);

  const handleYearClick = (year) => {
    if (!selected) return;
    const pol = POLICY_PALETTE.find(x => x.key === selected);
    const existing = getPlacement(year);
    const existingCost = existing ? (POLICY_PALETTE.find(x => x.key === existing.policy)?.cost ?? 0) : 0;
    const netCost = pol.cost - existingCost;
    if (netCost > remaining) return;
    setPlacements(prev => {
      const next = prev.filter(p => p.year !== year);
      return [...next, { year, policy: selected }].sort((a, b) => a.year - b.year);
    });
    setSelected(null);
  };

  const removeFromYear = (year, e) => {
    e.stopPropagation();
    setPlacements(prev => prev.filter(p => p.year !== year));
  };

  return (
    <div style={{ padding: '32px 28px', height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`
        @keyframes pulseRing { 0%{box-shadow:0 0 0 0 rgba(99,102,241,0.5)} 100%{box-shadow:0 0 0 10px transparent} }
        @keyframes borderPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      {/* Header */}
      <div>
        <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#52525b', marginBottom: 4 }}>Step 2 of 4 · Strategy Canvas</div>
        <h2 style={{ fontSize: 22, fontWeight: 200, color: '#e4e4e7', margin: 0 }}>Design Your 10-Year Roadmap</h2>
      </div>

      {/* Budget bar */}
      <div style={{
        background: '#0f1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 18px',
        boxShadow: pct < 20 ? '0 0 12px rgba(239,68,68,0.5)' : 'none', transition: 'box-shadow 0.4s',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#52525b' }}>Budget Remaining</span>
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 13, color: pct < 20 ? '#ef4444' : '#10b981', transition: 'color 0.3s' }}>{animatedRemaining} / {total} pts</span>
        </div>
        <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: pct < 20 ? '#ef4444' : 'linear-gradient(90deg,#4f46e5,#10b981)', borderRadius: 3, transition: 'width 0.3s, background 0.3s' }} />
        </div>
      </div>

      {/* Policy palette — tall visual cards */}
      <div>
        <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#52525b', marginBottom: 10 }}>
          Policy Palette — select one, then click a year
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {POLICY_PALETTE.map(pol => {
            const isSelected = selected === pol.key;
            const canAfford = pol.cost <= remaining;
            return (
              <button key={pol.key} onClick={() => setSelected(isSelected ? null : pol.key)}
                disabled={!canAfford && !isSelected}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 4, padding: '10px 14px', height: 64, minWidth: 88,
                  borderRadius: 10, cursor: canAfford || isSelected ? 'pointer' : 'not-allowed',
                  border: `1px solid ${isSelected ? pol.color : 'rgba(255,255,255,0.08)'}`,
                  background: isSelected ? `${pol.color}1a` : 'rgba(255,255,255,0.03)',
                  opacity: !canAfford && !isSelected ? 0.38 : 1,
                  transition: 'all 0.2s',
                  transform: isSelected ? 'scale(1.06) translateY(-2px)' : 'scale(1)',
                  boxShadow: isSelected ? `0 8px 24px ${pol.color}44, 0 0 0 1px ${pol.color}` : 'none',
                  animation: isSelected ? 'pulseRing 1.5s ease-out infinite' : 'none',
                  position: 'relative',
                }}>
                <span style={{ fontSize: 20, lineHeight: 1 }}>{pol.icon}</span>
                <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, color: isSelected ? pol.color : '#a1a1aa', letterSpacing: '0.06em', textAlign: 'center', lineHeight: 1.2 }}>{pol.label}</span>
                <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, color: pol.color, opacity: 0.7 }}>−{pol.cost}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {/* Floating sticky banner when policy selected */}
        {selectedPol && (
          <div style={{
            position: 'sticky', top: 0, zIndex: 10, marginBottom: 8,
            background: `${selectedPol.color}18`,
            border: `1px solid ${selectedPol.color}44`,
            borderRadius: 8, padding: '8px 14px',
            display: 'flex', alignItems: 'center', gap: 8,
            animation: 'borderPulse 2s ease-in-out infinite',
          }}>
            <span style={{ fontSize: 14 }}>{selectedPol.icon}</span>
            <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 9, color: selectedPol.color, letterSpacing: '0.1em' }}>
              Click any year below to deploy {selectedPol.label}
            </span>
          </div>
        )}

        {/* Vertical connecting line */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 29, top: 16, bottom: 16, width: 1,
            background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.2) 20%, rgba(99,102,241,0.2) 80%, transparent)',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {POLICY_YEARS.map(year => {
              const placed = getPlacement(year);
              const pol = placed ? POLICY_PALETTE.find(p => p.key === placed.policy) : null;
              const isTarget = !!selected;
              return (
                <div key={year} onClick={() => handleYearClick(year)}
                  style={{
                    display: 'grid', gridTemplateColumns: '60px 1fr', gap: 12, alignItems: 'center',
                    padding: '10px 14px 10px 0', borderRadius: 8,
                    cursor: isTarget ? 'crosshair' : 'default',
                    borderLeft: pol ? `2px solid ${pol.color}` : '2px solid transparent',
                    background: pol
                      ? `linear-gradient(90deg, ${pol.color}15 0%, transparent 100%)`
                      : isTarget ? 'rgba(99,102,241,0.04)' : 'transparent',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { if (isTarget) e.currentTarget.style.background = `rgba(99,102,241,0.08)`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = pol ? `linear-gradient(90deg, ${pol?.color}15 0%, transparent 100%)` : isTarget ? 'rgba(99,102,241,0.04)' : 'transparent'; }}
                >
                  {/* Year + dot */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 14 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: pol ? pol.color : '#2a2a30',
                      boxShadow: pol ? `0 0 8px ${pol.color}` : 'none',
                      transition: 'all 0.3s',
                    }} />
                    <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11, color: pol ? '#a1a1aa' : '#52525b', letterSpacing: '0.04em' }}>{year}</span>
                  </div>

                  {pol ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14 }}>{pol.icon}</span>
                        <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 10, color: pol.color }}>{pol.label}</span>
                        <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, color: '#52525b' }}>−{pol.cost} pts</span>
                      </div>
                      <button onClick={(e) => removeFromYear(year, e)} style={{
                        background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 6, color: '#ef4444', cursor: 'pointer', fontSize: 9,
                        padding: '2px 7px', fontFamily: 'ui-monospace,monospace', letterSpacing: '0.08em',
                      }}>remove</button>
                    </div>
                  ) : (
                    <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 9, color: '#2a2a30', letterSpacing: '0.1em' }}>
                      {isTarget ? '← deploy here' : '—'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => setPlacements([])} style={{
          flex: 1, padding: '12px 0', borderRadius: 10, cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
          color: '#a1a1aa', fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>Clear Plan</button>
        <button onClick={onNext} disabled={placements.length === 0} style={{
          flex: 2, padding: '12px 0', borderRadius: 10, cursor: placements.length ? 'pointer' : 'not-allowed',
          border: 'none', background: placements.length ? 'linear-gradient(135deg,#4f46e5,#6366f1)' : '#1c1c20',
          color: placements.length ? 'white' : '#52525b',
          fontFamily: 'ui-monospace,monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
          boxShadow: placements.length ? '0 0 24px rgba(99,102,241,0.3)' : 'none', transition: 'all 0.2s',
        }}>Execute Master Plan →</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   STEP 3 — EXECUTION ANIMATION
───────────────────────────────────────────────────────────────────────── */
function AnimatedDelta({ value }) {
  const display = useCountUp(Math.abs(value), 700);
  const sign = value >= 0 ? '+' : '-';
  return <span style={{ color: value >= 0 ? '#10b981' : '#ef4444' }}>{sign}{display}</span>;
}

function ExecutionStep({ placements, city, budget, planName, onComplete }) {
  const [stage, setStage] = useState('fetching'); // fetching -> baseline -> phase -> done
  const [phaseIdx, setPhaseIdx] = useState(-1);
  const [phaseDone, setPhaseDone] = useState([]);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [data, setData] = useState(null);

  // Elapsed time counter
  useEffect(() => {
    const id = setInterval(() => setElapsed(e => +(e + 0.1).toFixed(1)), 100);
    return () => clearInterval(id);
  }, []);

  // Fetch from live API
  useEffect(() => {
    const payload = {
      city, budget, planName,
      phases: placements.map(p => {
        const pol = POLICY_PALETTE.find(x => x.key === p.policy);
        return { year: String(p.year), policy: p.policy, label: pol.label, icon: pol.icon };
      })
    };
    const API_URL = import.meta.env.VITE_MASTERPLAN_API_URL || 'https://urbanpulse-backend-2.onrender.com';
    fetch(`${API_URL}/api/masterplan/simulate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(res => res.json()).then(resData => {
      setData(resData);
      setStage('baseline');
    }).catch(err => console.error('Simulation Failed:', err));
  }, [city, budget, planName, placements]);

  useEffect(() => {
    if (stage === 'baseline') {
      const t1 = setTimeout(() => { setPhaseIdx(0); setStage('phase'); }, 1100);
      return () => clearTimeout(t1);
    }
  }, [stage]);

  useEffect(() => {
    if (!data || phaseIdx < 0 || phaseIdx >= data.phases.length) return;
    setProgress(0);
    const duration = 1200; // Fixed animation speed
    const steps = 40;
    const interval = duration / steps;
    let count = 0;
    const id = setInterval(() => {
      count++;
      setProgress(Math.round((count / steps) * 100));
      if (count >= steps) {
        clearInterval(id);
        setPhaseDone(prev => [...prev, phaseIdx]);
        const next = phaseIdx + 1;
        if (next < data.phases.length) {
          setTimeout(() => setPhaseIdx(next), 400);
        } else {
          setTimeout(() => { setStage('done'); onComplete(data); }, 1200);
        }
      }
    }, interval);
    return () => clearInterval(id);
  }, [phaseIdx, data, onComplete]);

  const displayPhases = data ? data.phases : placements.map(p => ({
    year: p.year, policy: p.policy,
    label: POLICY_PALETTE.find(x => x.key === p.policy)?.label,
    icon: POLICY_PALETTE.find(x => x.key === p.policy)?.icon,
    color: POLICY_PALETTE.find(x => x.key === p.policy)?.color || '#52525b'
  }));

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px', position: 'relative' }}>
      <style>{`
        @keyframes scanCard { 0%{left:'-60%'} 100%{left:'110%'} }
        @keyframes checkDraw { from{stroke-dashoffset:60} to{stroke-dashoffset:0} }
        @keyframes circleDraw { from{stroke-dashoffset:160} to{stroke-dashoffset:0} }
      `}</style>

      {/* City skyline watermark */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 0 }}>
        <svg width={800} height={200} viewBox="0 0 800 200" fill="#6366f1" opacity={0.04}>
          <rect x={0}   y={120} width={60}  height={80} />
          <rect x={70}  y={80}  width={50}  height={120} />
          <rect x={130} y={100} width={40}  height={100} />
          <rect x={180} y={50}  width={70}  height={150} />
          <rect x={260} y={90}  width={45}  height={110} />
          <rect x={315} y={30}  width={80}  height={170} />
          <rect x={405} y={70}  width={55}  height={130} />
          <rect x={470} y={110} width={40}  height={90} />
          <rect x={520} y={55}  width={65}  height={145} />
          <rect x={595} y={85}  width={50}  height={115} />
          <rect x={655} y={40}  width={75}  height={160} />
          <rect x={740} y={95}  width={60}  height={105} />
        </svg>
      </div>

      {/* Header with elapsed timer */}
      <div style={{ position: 'relative', zIndex: 1, marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#52525b' }}>
            Step 3 of 4 · Sequential Simulation
          </div>
          <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 9, color: '#52525b' }}>
            Elapsed: {elapsed.toFixed(1)}s
          </div>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 200, color: '#e4e4e7', margin: 0 }}>Executing Master Plan</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1 }}>
        {/* Baseline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 10, background: '#0f1117', border: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontSize: 14 }}>{stage === 'fetching' ? '🔮' : '✅'}</span>
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 10, color: stage === 'fetching' ? '#6366f1' : '#10b981', letterSpacing: '0.08em', animation: stage === 'fetching' ? 'borderPulse 1.5s infinite' : 'none' }}>
            {stage === 'fetching' ? 'AI Engine Synthesizing 10-Year Trajectory...' : 'Baseline city conditions acquired.'}
          </span>
        </div>

        {/* Phases */}
        {displayPhases.map((phase, idx) => {
          const isDone = phaseDone.includes(idx);
          const isRunning = phaseIdx === idx && !isDone;
          const isPendingRender = stage === 'fetching' || (!isDone && !isRunning);

          return (
            <div key={idx} style={{
              padding: '16px 18px', borderRadius: 10,
              background: isDone ? `${phase.color}0d` : '#0f1117',
              border: `1px solid ${isDone ? phase.color + '33' : isRunning ? phase.color + '55' : 'rgba(255,255,255,0.06)'}`,
              transition: 'all 0.4s ease',
              position: 'relative', overflow: 'hidden',
              opacity: stage === 'fetching' ? 0.6 : 1,
            }}>
              {/* Scanning light when running */}
              {isRunning && (
                <div style={{
                  position: 'absolute', top: 0, left: '-60%', width: '60%', height: '100%',
                  background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)',
                  animation: 'scanCard 1.5s ease-in-out infinite',
                  pointerEvents: 'none',
                }} />
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: isDone ? 12 : 0 }}>
                <span style={{ fontSize: 16 }}>
                  {stage === 'fetching' ? '⏳' : isDone ? '✅' : isRunning ? '⚙️' : '⏳'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontFamily: 'ui-monospace,monospace', fontSize: 10,
                      color: isDone ? phase.color : isRunning ? '#e4e4e7' : '#52525b',
                      letterSpacing: '0.08em',
                    }}>
                      Phase {idx + 1}: {phase.label} ({phase.year})
                    </span>
                    {isRunning && (
                      <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 9, color: phase.color }}>{progress}%</span>
                    )}
                  </div>
                  {isRunning && (
                    <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, marginTop: 8, overflow: 'visible', position: 'relative' }}>
                      <div style={{
                        height: '100%', width: `${progress}%`,
                        background: phase.color,
                        boxShadow: `4px 0 10px ${phase.color}, 0 0 6px ${phase.color}`,
                        transition: 'width 0.1s linear',
                        borderRadius: 1,
                      }} />
                    </div>
                  )}
                </div>
              </div>

              {isDone && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, borderTop: `1px solid ${phase.color}22`, paddingTop: 12 }}>
                  {['traffic','economy','ecology','sentiment'].map(m => {
                    const delta = phase.after[m] - phase.before[m];
                    return (
                      <div key={m} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#52525b', marginBottom: 4 }}>{m}</div>
                        <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12, marginBottom: 6 }}>
                          <AnimatedDelta value={delta} />
                        </div>
                        {/* Mini score bar */}
                        <div style={{ height: 2, width: 44, margin: '0 auto', background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 1,
                            width: `${(phase.after[m] / 100) * 100}%`,
                            background: delta >= 0 ? '#10b981' : '#ef4444',
                            transition: 'width 0.8s ease-out',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion state — animated SVG checkmark */}
      {stage === 'done' && (
        <div style={{ marginTop: 32, textAlign: 'center', position: 'relative', zIndex: 1, animation: 'mpFadeIn 0.5s ease' }}>
          <svg width={60} height={60} viewBox="0 0 60 60" style={{ display: 'block', margin: '0 auto 16px' }}>
            <circle cx={30} cy={30} r={24}
              fill="none" stroke="#10b981" strokeWidth={1.5}
              strokeDasharray={160} strokeDashoffset={160}
              style={{ animation: 'circleDraw 0.6s ease forwards' }}
            />
            <path d="M18 30 L26 38 L42 22"
              fill="none" stroke="#10b981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={60} strokeDashoffset={60}
              style={{ animation: 'checkDraw 0.5s 0.4s ease forwards' }}
            />
          </svg>
          <div style={{
            fontFamily: 'ui-monospace,monospace', fontSize: 18, fontWeight: 300,
            color: '#10b981', letterSpacing: '0.04em',
            textShadow: '0 0 30px rgba(16,185,129,0.5)',
          }}>Master Plan Executed</div>
          <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 9, color: '#52525b', marginTop: 8, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Loading results...
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   STEP 4 — RESULTS DASHBOARD
───────────────────────────────────────────────────────────────────────── */
const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, color: '#52525b', marginBottom: 6, letterSpacing: '0.12em' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 9, color: '#a1a1aa', textTransform: 'uppercase', width: 60 }}>{p.name}</span>
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11, color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function BeforeAfterScore({ data }) {
  const before = useCountUp(data.cityHealthBefore, 1200);
  const after  = useCountUp(data.cityHealthAfter, 1800);
  const diff   = data.cityHealthAfter - data.cityHealthBefore;
  const delta  = useCountUp(Math.abs(diff), 2000);
  const sign   = diff >= 0 ? '+' : '-';

  const particles = [14, 28, 46, 62, 78]; // % x positions

  return (
    <div style={{ textAlign: 'center', padding: '32px 20px', background: '#0f1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes floatParticle {
          0%  { transform:translateY(0);   opacity:0.6 }
          100%{ transform:translateY(-60px); opacity:0 }
        }
        @keyframes reportPulse {
          0%,100%{ box-shadow:0 0 0 0 rgba(99,102,241,0.35) }
          50%    { box-shadow:0 0 0 9px rgba(99,102,241,0) }
        }
      `}</style>

      <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#52525b', marginBottom: 20 }}>City Health Score</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        {/* Before */}
        <div>
          <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#52525b', marginBottom: 6 }}>Before</div>
          <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 52, fontWeight: 200, color: '#ef4444', lineHeight: 1 }}>{before}</div>
        </div>

        {/* Arrow + delta */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 22, color: '#3f3f46' }}>→</div>
          <div style={{
            fontFamily: 'ui-monospace,monospace', fontSize: 20, color: '#10b981', fontWeight: 300,
            textShadow: diff >= 0 ? '0 0 20px rgba(16,185,129,0.8)' : '0 0 20px rgba(239,68,68,0.8)',
            animation: 'mpFadeIn 0.5s 1.5s both',
            color: diff >= 0 ? '#10b981' : '#ef4444',
          }}>{sign}{delta}</div>
        </div>

        {/* After — with floating particles */}
        <div style={{ position: 'relative' }}>
          {particles.map((x, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${x}%`, bottom: 4,
              width: 2, height: 2, borderRadius: '50%',
              background: '#10b981',
              animation: `floatParticle ${1.8 + i * 0.3}s ease-in ${i * 0.4}s infinite`,
              pointerEvents: 'none',
            }} />
          ))}
          <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#52525b', marginBottom: 6 }}>After</div>
          <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 52, fontWeight: 200, color: '#10b981', lineHeight: 1, textShadow: '0 0 32px rgba(16,185,129,0.5)' }}>{after}</div>
        </div>
      </div>
      <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6366f1', marginTop: 14 }}>Major Structural Transformation</div>
    </div>
  );
}

function CompoundTypewriter({ text }) {
  const [shown, setShown] = useState('');
  useEffect(() => {
    let i = 0;
    setShown('');
    let intervalId;
    const timerId = setTimeout(() => {
      intervalId = setInterval(() => {
        i++;
        setShown(text.slice(0, i));
        if (i >= text.length) clearInterval(intervalId);
      }, 12);
    }, 1500);
    return () => {
      clearTimeout(timerId);
      clearInterval(intervalId);
    };
  }, [text]);
  return <span>{shown}</span>;
}

/* ─────────────────────────────────────────────────────────────────────────
   EXTRA CHARTS
───────────────────────────────────────────────────────────────────────── */

/* ─ ① Filled area trajectory ─────────────────────────────────────────────────────────── */
const AREA_METRICS = [
  { key: 'traffic',   color: '#6366f1', name: 'Traffic'   },
  { key: 'economy',   color: '#f59e0b', name: 'Economy'   },
  { key: 'ecology',   color: '#10b981', name: 'Ecology'   },
  { key: 'sentiment', color: '#818cf8', name: 'Sentiment' },
];

function FilledAreaChart({ trajectory }) {
  return (
    <div style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '22px 18px 12px', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 14, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at 80% 0%, rgba(16,185,129,0.06), transparent 55%)' }} />
      <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#52525b', marginBottom: 18 }}>
        ①b City Trajectory — Filled View
      </div>
      <defs>
        {AREA_METRICS.map(m => (
          <linearGradient key={m.key} id={`grad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={m.color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={m.color} stopOpacity={0.01} />
          </linearGradient>
        ))}
      </defs>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={trajectory} margin={{ top: 8, right: 16, bottom: 0, left: -10 }}>
          <defs>
            {AREA_METRICS.map(m => (
              <linearGradient key={m.key} id={`agrad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={m.color} stopOpacity={0.22} />
                <stop offset="95%" stopColor={m.color} stopOpacity={0.01} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="year" tick={{ fill: '#52525b', fontSize: 8, fontFamily: 'ui-monospace,monospace' }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#52525b', fontSize: 8, fontFamily: 'ui-monospace,monospace' }} />
          <Tooltip content={<CUSTOM_TOOLTIP />} />
          {AREA_METRICS.map(m => (
            <Area key={m.key} type="monotone" dataKey={m.key} name={m.name}
              stroke={m.color} strokeWidth={2}
              fill={`url(#agrad-${m.key})`}
              dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: m.color }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginTop: 10 }}>
        {AREA_METRICS.map(m => (
          <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 20, height: 2, background: m.color, borderRadius: 1, boxShadow: `0 0 6px ${m.color}88` }} />
            <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, color: '#52525b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{m.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─ ② Donut gauge arcs (pure SVG) ─────────────────────────────────────────────────── */
function ArcGauge({ value, color, label, size = 90, delay = 0 }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const filled = (value / 100) * circ * 0.75; // 270° arc
  const [drawn, setDrawn] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let start = null;
      const tick = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 900, 1);
        setDrawn(filled * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [filled, delay]);

  const angleOffset = -225; // start bottom-left
  const track = circ * 0.75;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} viewBox="0 0 90 90" style={{ transform: 'rotate(-225deg)' }}>
        {/* track */}
        <circle cx={45} cy={45} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={6}
          strokeDasharray={`${track} ${circ}`} strokeLinecap="round" />
        {/* fill */}
        <circle cx={45} cy={45} r={r} fill="none"
          stroke={color} strokeWidth={6}
          strokeDasharray={`${drawn} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}99)` }}
        />
      </svg>
      <div style={{ marginTop: -size * 0.28, fontFamily: 'ui-monospace,monospace', fontSize: 22, fontWeight: 200, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 7, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#52525b' }}>{label}</div>
    </div>
  );
}

function DonutGauges({ trajectory }) {
  const final = trajectory[trajectory.length - 1];
  const scores = [
    { label: 'Traffic',   value: final.traffic, color: '#6366f1' },
    { label: 'Economy',   value: final.economy, color: '#f59e0b' },
    { label: 'Ecology',   value: final.ecology, color: '#10b981' },
    { label: 'Sentiment', value: final.sentiment, color: '#818cf8' },
  ];

  return (
    <div style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '22px 18px' }}>
      <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#52525b', marginBottom: 22 }}>
        ②b {final.year} End-State Scores
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
        {scores.map((g, i) => (
          <ArcGauge key={g.label} value={g.value} color={g.color} label={g.label} delay={i * 180} />
        ))}
      </div>
    </div>
  );
}

/* ─ ③ Radar chart ────────────────────────────────────────────────────────────────── */
function BeforeAfterRadar({ trajectory }) {
  const baseline = trajectory[0];
  const final = trajectory[trajectory.length - 1];
  const radarData = [
    { metric: 'Traffic',   baseline: baseline.traffic, final: final.traffic },
    { metric: 'Economy',   baseline: baseline.economy, final: final.economy },
    { metric: 'Ecology',   baseline: baseline.ecology, final: final.ecology },
    { metric: 'Sentiment', baseline: baseline.sentiment, final: final.sentiment },
  ];

  return (
    <div style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '22px 18px' }}>
      <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#52525b', marginBottom: 4 }}>
        ③ Transformation Radar
      </div>
      <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 1, background: '#ef4444', borderRadius: 1, borderTop: '1px dashed #ef4444' }} />
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, color: '#52525b' }}>{baseline.year} Baseline</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 2, background: '#6366f1', borderRadius: 1 }} />
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, color: '#52525b' }}>{final.year} Final</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis dataKey="metric"
            tick={{ fill: '#71717a', fontSize: 9, fontFamily: 'ui-monospace,monospace' }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="Baseline" dataKey="baseline"
            stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 3"
            fill="#ef4444" fillOpacity={0.06}
          />
          <Radar name="Final" dataKey="final"
            stroke="#6366f1" strokeWidth={2}
            fill="#6366f1" fillOpacity={0.15}
            style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.4))' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function PhaseBarChart({ phases }) {
  const barData = phases.map(p => ({
    phase: `${p.icon} ${p.year}`,
    Traffic:   p.after.traffic   - p.before.traffic,
    Economy:   p.after.economy   - p.before.economy,
    Ecology:   p.after.ecology   - p.before.ecology,
    Sentiment: p.after.sentiment - p.before.sentiment,
  }));

  return (
    <div style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '22px 18px 12px' }}>
      <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#52525b', marginBottom: 18 }}>
        ④ Phase Impact Comparison — Delta per Metric
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={barData} margin={{ top: 4, right: 16, bottom: 0, left: -10 }} barGap={2} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="phase" tick={{ fill: '#71717a', fontSize: 9, fontFamily: 'ui-monospace,monospace' }} />
          <YAxis tick={{ fill: '#52525b', fontSize: 8, fontFamily: 'ui-monospace,monospace' }} />
          <Tooltip content={<CUSTOM_BAR_TOOLTIP />} />
          <Bar dataKey="Traffic"   name="Traffic"   fill="#6366f1" radius={[3,3,0,0]} opacity={0.85} />
          <Bar dataKey="Economy"   name="Economy"   fill="#f59e0b" radius={[3,3,0,0]} opacity={0.85} />
          <Bar dataKey="Ecology"   name="Ecology"   fill="#10b981" radius={[3,3,0,0]} opacity={0.85} />
          <Bar dataKey="Sentiment" name="Sentiment" fill="#818cf8" radius={[3,3,0,0]} opacity={0.85} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginTop: 10 }}>
        {[{l:'Traffic',c:'#6366f1'},{l:'Economy',c:'#f59e0b'},{l:'Ecology',c:'#10b981'},{l:'Sentiment',c:'#818cf8'}].map(x => (
          <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: x.c }} />
            <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, color: '#52525b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{x.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const CUSTOM_BAR_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, color: '#52525b', marginBottom: 6, letterSpacing: '0.12em' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.fill, display: 'inline-block' }} />
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 9, color: '#a1a1aa', width: 60 }}>{p.name}</span>
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11, color: p.value >= 0 ? '#10b981' : '#ef4444' }}>
            {p.value >= 0 ? '+' : ''}{p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

function ResultsDashboard({ planName, city, data, onReport }) {
  return (
    <div style={{ padding: '28px 28px 60px', display: 'flex', flexDirection: 'column', gap: 28, overflowY: 'auto', height: '100%' }}>
      <style>{`
        @keyframes mpFadeIn      { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes gradientShift { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(30deg)} }
        @keyframes reportPulse   { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.35)} 50%{box-shadow:0 0 0 9px rgba(99,102,241,0)} }
        @keyframes floatParticle { 0%{transform:translateY(0);opacity:0.6} 100%{transform:translateY(-60px);opacity:0} }
      `}</style>

      {/* Header */}
      <div style={{ animation: 'mpFadeIn 0.4s ease' }}>
        <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#52525b', marginBottom: 4 }}>Step 4 of 4 · Results</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 200, color: '#e4e4e7', margin: '0 0 4px' }}>{planName}</h2>
            <p style={{ fontSize: 12, color: '#52525b', margin: 0 }}>{city} · {data.trajectory[0].year}–{data.trajectory[data.trajectory.length - 1].year} · {data.phases.length} phases</p>
          </div>
          {/* Generate Report — pulsing button */}
          <button onClick={onReport} style={{
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 8, color: '#818cf8', fontFamily: 'ui-monospace,monospace',
            fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
            padding: '8px 14px', cursor: 'pointer',
            animation: 'reportPulse 2.5s ease-in-out infinite',
            transition: 'background 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.22)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; }}
          >📋 Generate Report</button>
        </div>
      </div>

      {/* ① City Trajectory Graph */}
      <div style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '22px 18px 12px', animation: 'mpFadeIn 0.5s 0.1s ease both', position: 'relative' }}>
        {/* Ambient glow — zIndex:0 so it stays behind the chart */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 14, pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.08), transparent 60%)',
        }} />
        <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#52525b', marginBottom: 18 }}>① City Trajectory — All Metrics</div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data.trajectory} margin={{ top: 8, right: 16, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="year" tick={{ fill: '#52525b', fontSize: 8, fontFamily: 'ui-monospace,monospace' }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#52525b', fontSize: 8, fontFamily: 'ui-monospace,monospace' }} />
            <Tooltip content={<CUSTOM_TOOLTIP />} />
            {[{y:'2025',l:'Metro'},{y:'2027',l:'Park'},{y:'2029',l:'Parking'},{y:'2032',l:'EV'}].map(v => (
              <ReferenceLine key={v.y} x={v.y} stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3"
                label={{ value: `↑${v.l}`, position: 'insideTopRight', fill: '#52525b', fontSize: 7, fontFamily: 'ui-monospace,monospace' }} />
            ))}
            <Line type="monotone" dataKey="traffic"   name="traffic"   stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: '#6366f1' }} />
            <Line type="monotone" dataKey="economy"   name="economy"   stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: '#f59e0b' }} />
            <Line type="monotone" dataKey="ecology"   name="ecology"   stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: '#10b981' }} />
            <Line type="monotone" dataKey="sentiment" name="sentiment" stroke="#818cf8" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: '#818cf8' }} />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginTop: 10 }}>
          {[{l:'Traffic',c:'#6366f1'},{l:'Economy',c:'#f59e0b'},{l:'Ecology',c:'#10b981'},{l:'Sentiment',c:'#818cf8'}].map(item => (
            <div key={item.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 20, height: 2, background: item.c, borderRadius: 1 }} />
              <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, color: '#52525b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{item.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ①b Filled Area trajectory — right after the line chart */}
      <div style={{ animation: 'mpFadeIn 0.5s 0.15s ease both' }}>
        <FilledAreaChart trajectory={data.trajectory} />
      </div>

      {/* ③ Before / After City Health */}
      <div style={{ animation: 'mpFadeIn 0.5s 0.2s ease both' }}>
        <BeforeAfterScore data={data} />
      </div>

      {/* ②b Donut gauges — 2035 end-state */}
      <div style={{ animation: 'mpFadeIn 0.5s 0.25s ease both' }}>
        <DonutGauges trajectory={data.trajectory} />
      </div>

      {/* ③ Radar — before vs after shape */}
      <div style={{ animation: 'mpFadeIn 0.5s 0.3s ease both' }}>
        <BeforeAfterRadar trajectory={data.trajectory} />
      </div>

      {/* ② Phase Breakdown */}
      <div style={{ animation: 'mpFadeIn 0.5s 0.35s ease both' }}>
        <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#52525b', marginBottom: 14 }}>② Phase Breakdown</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
          {data.phases.map((phase, i) => (
            <div key={i} style={{
              background: `linear-gradient(135deg, ${phase.color}0a, #0f1117)`,
              border: `1px solid ${phase.color}28`,
              borderTop: `2px solid ${phase.color}`,
              borderRadius: 12, padding: '16px 18px',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Decorative quote mark */}
              <div style={{
                position: 'absolute', top: -8, right: 12,
                fontSize: 56, color: `${phase.color}15`,
                fontFamily: 'Georgia,serif', lineHeight: 1,
                pointerEvents: 'none', userSelect: 'none',
              }}>“</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 16 }}>{phase.icon}</span>
                <div>
                  <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 10, color: phase.color }}>{phase.label}</div>
                  <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, color: '#52525b', letterSpacing: '0.1em' }}>{phase.year}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
                {['traffic','economy','ecology','sentiment'].map(m => (
                  <MetricDelta key={m} label={m} before={phase.before[m]} after={phase.after[m]} color={phase.color} />
                ))}
              </div>
              <p style={{ fontSize: 11, color: '#71717a', lineHeight: 1.6, margin: 0, borderTop: `1px solid ${phase.color}18`, paddingTop: 10, fontStyle: 'italic' }}>
                "{phase.insight}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ④ Phase bar chart */}
      <div style={{ animation: 'mpFadeIn 0.5s 0.4s ease both' }}>
        <PhaseBarChart phases={data.phases} />
      </div>

      {/* ④ Compound Effect — animated gradient border + typewriter */}
      <div style={{
        borderRadius: 14, padding: '24px 22px',
        animation: 'mpFadeIn 0.5s 0.45s ease both, gradientShift 4s linear infinite',
        background: 'linear-gradient(#0d0f16,#0d0f16) padding-box, linear-gradient(135deg,#4f46e5,#10b981,#4f46e5) border-box',
        border: '1px solid transparent',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 18 }}>🧠</span>
          <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6366f1', fontWeight: 500 }}>④ Compound Effect · AI Insight</div>
        </div>
        <p style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>
          <CompoundTypewriter text={data.compoundInsight} />
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   REPORT MODAL
───────────────────────────────────────────────────────────────────────── */
const PLAN_ID = 'PLAN-' + Math.random().toString(36).slice(2,7).toUpperCase();
function ReportModal({ planName, city, data, onClose }) {
  const planIdRef = useRef(PLAN_ID);
  const [copied, setCopied] = useState(false);
  const [printHovered, setPrintHovered] = useState(false);
  const id = planIdRef.current;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <style>{`
        @keyframes modalSlideUp   { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:none} }
        @keyframes printerBounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes reportPulse    { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.35)} 50%{box-shadow:0 0 0 9px rgba(99,102,241,0)} }
      `}</style>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
        animation: 'modalSlideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'ui-monospace,monospace', fontSize: 13, color: '#e4e4e7', margin: 0 }}>Shareable Report</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <div id="mp-report" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Plan name block */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 200, color: '#e4e4e7', margin: '0 0 4px' }}>{planName}</h2>
            <p style={{ fontSize: 12, color: '#52525b', margin: '0 0 14px' }}>{city} · {data.trajectory[0].year}–{data.trajectory[data.trajectory.length - 1].year} · {data.phases.length} phases</p>

            {/* Hero PLAN ID */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 8, padding: '8px 16px',
                boxShadow: '0 0 20px rgba(99,102,241,0.15)',
              }}>
                <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 9, color: '#52525b' }}>[ </span>
                <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 13, color: '#6366f1', letterSpacing: '0.08em' }}>{id}</span>
                <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 9, color: '#52525b' }}> ]</span>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(id); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                style={{
                  background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 6, color: copied ? '#10b981' : '#71717a', cursor: 'pointer',
                  fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.12em',
                  padding: '5px 10px', textTransform: 'uppercase', transition: 'all 0.2s',
                }}
              >{copied ? '✓ Copied' : 'Copy'}</button>
            </div>
          </div>

          {/* Horizontal mini timeline */}
          <div>
            <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#52525b', marginBottom: 12 }}>Policy Timeline</div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
              {data.phases.map((p, i) => (
                <Fragment key={p.year}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: `${p.color}15`, border: `1px solid ${p.color}30`,
                    borderRadius: 100, padding: '4px 10px',
                  }}>
                    <span style={{ fontSize: 12 }}>{p.icon}</span>
                    <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 8, color: p.color }}>{p.year}</span>
                  </div>
                  {i < data.phases.length - 1 && (
                    <div key={`line-${i}`} style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
                  )}
                </Fragment>
              ))}
            </div>
          </div>

          {/* Before / After with SVG arrow */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '18px 16px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 7, color: '#52525b', marginBottom: 4, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Before</div>
              <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 28, color: '#ef4444', textShadow: '0 0 16px rgba(239,68,68,0.4)' }}>{data.cityHealthBefore}</div>
            </div>
            {/* SVG arrow */}
            <svg width={40} height={16} viewBox="0 0 40 16" fill="none">
              <path d="M0 8 H32 M26 2 L36 8 L26 14" stroke="#52525b" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 7, color: '#52525b', marginBottom: 4, letterSpacing: '0.14em', textTransform: 'uppercase' }}>After</div>
              <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 28, color: '#10b981', textShadow: '0 0 16px rgba(16,185,129,0.5)' }}>{data.cityHealthAfter}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 7, color: '#52525b', marginBottom: 4, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Delta</div>
              <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 28, color: data.cityHealthAfter >= data.cityHealthBefore ? '#6366f1' : '#ef4444', textShadow: '0 0 16px rgba(99,102,241,0.5)' }}>
                {data.cityHealthAfter >= data.cityHealthBefore ? '+' : ''}{data.cityHealthAfter - data.cityHealthBefore}
              </div>
            </div>
          </div>

          <p style={{ fontSize: 12, color: '#71717a', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>{data.compoundInsight}</p>
        </div>

        {/* Print button with bouncing printer emoji */}
        <button
          onMouseEnter={() => setPrintHovered(true)}
          onMouseLeave={() => setPrintHovered(false)}
          onClick={() => window.print()}
          style={{
            width: '100%', marginTop: 24, padding: '12px 0', borderRadius: 10,
            background: 'linear-gradient(135deg,#4f46e5,#6366f1)', border: 'none',
            color: 'white', fontFamily: 'ui-monospace,monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer', boxShadow: '0 0 20px rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <span style={{ display: 'inline-block', animation: printHovered ? 'printerBounce 0.4s ease' : 'none' }}>🖨️</span>
          Print / Save PDF
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN — MASTER PLAN MODE ORCHESTRATOR
───────────────────────────────────────────────────────────────────────── */
const STEPS = ['Setup', 'Canvas', 'Execute', 'Results'];

export default function MasterPlanMode({ onClose }) {
  const [step, setStep]           = useState(0);
  const [planName, setPlanName]   = useState('Mumbai 2036 Transformation Plan');
  const [city, setCity]           = useState('Mumbai');
  const [budget, setBudget]       = useState('High');
  const [placements, setPlacements] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [simulationData, setSimulationData] = useState(null);

  // Close on Escape
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 55,
      background: `radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.06) 0%, transparent 50%),
                   radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.04) 0%, transparent 50%),
                   #080a0f`,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <style>{`
        @keyframes mpFadeIn  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        @keyframes mpBlink   { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes mpShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      {/* Noise grain overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.025,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat', backgroundSize: '128px 128px',
      }} />

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 56,
        borderBottom: '1px solid rgba(99,102,241,0.15)',
        boxShadow: '0 1px 0 rgba(99,102,241,0.08)',
        background: 'rgba(8,10,15,0.85)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        flexShrink: 0, position: 'relative', zIndex: 1,
      }}>
        {/* Left — logo + step pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🗺️</span>
            <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6366f1' }}>Master Plan Mode</span>
            <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 7, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#fff', background: '#6366f1', borderRadius: 4, padding: '2px 5px' }}>PREVIEW</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{
                fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase',
                padding: '3px 10px', borderRadius: 100,
                background: i === step ? 'rgba(99,102,241,0.2)' : 'transparent',
                color: i === step ? '#818cf8' : i < step ? '#10b981' : '#3f3f46',
                border: `1px solid ${i === step ? 'rgba(99,102,241,0.4)' : 'transparent'}`,
                transition: 'all 0.2s',
              }}>
                {i < step ? '✓ ' : ''}{s}
              </div>
            ))}
          </div>
        </div>

        {/* Right — close */}
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8, color: '#71717a', cursor: 'pointer',
          padding: '6px 14px', fontFamily: 'ui-monospace,monospace',
          fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#e4e4e7'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#71717a'; }}
        >✕ Exit</button>
      </div>

      {/* Page content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        {step === 0 && (
          <div style={{ height: '100%', overflowY: 'auto', animation: 'mpFadeIn 0.35s ease' }}>
            <PlanSetupStep planName={planName} setPlanName={setPlanName} city={city} setCity={setCity} budget={budget} setBudget={setBudget} onNext={() => setStep(1)} />
          </div>
        )}
        {step === 1 && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', animation: 'mpFadeIn 0.35s ease' }}>
            <StrategyCanvas budget={budget} placements={placements} setPlacements={setPlacements} onNext={() => setStep(2)} />
          </div>
        )}
        {step === 2 && (
          <div style={{ height: '100%', overflowY: 'auto', animation: 'mpFadeIn 0.35s ease' }}>
            <ExecutionStep placements={placements} city={city} budget={budget} planName={planName} onComplete={(data) => { setSimulationData(data); setStep(3); }} />
          </div>
        )}
        {step === 3 && simulationData && (
          <div style={{ height: '100%', animation: 'mpFadeIn 0.35s ease' }}>
            <ResultsDashboard planName={planName} city={city} data={simulationData} onReport={() => setShowReport(true)} />
          </div>
        )}
      </div>

      {/* Progress bar — 3px with shimmer sweep */}
      <div style={{ height: 3, background: '#0f1117', flexShrink: 0, position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <div style={{
          position: 'relative', height: '100%',
          background: 'linear-gradient(90deg,#4f46e5,#10b981)',
          transition: 'width 0.5s ease',
          width: `${((step + 1) / 4) * 100}%`,
          boxShadow: '0 0 10px rgba(99,102,241,0.7)',
          overflow: 'hidden',
        }}>
          {/* Shimmer sweep */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)',
            backgroundSize: '200% 100%',
            animation: 'mpShimmer 2s ease-in-out infinite',
          }} />
        </div>
      </div>

      {showReport && <ReportModal planName={planName} city={city} data={simulationData} onClose={() => setShowReport(false)} />}
    </div>
  );
}
