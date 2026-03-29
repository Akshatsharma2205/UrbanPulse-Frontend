import { useState, useRef, useEffect } from 'react';

/* ── City presets ────────────────────────────────────────────────────────── */
const CITY_PRESETS = [
  { name: 'Mumbai',    pop: 21_000_000 },
  { name: 'Tokyo',     pop: 13_960_000 },
  { name: 'New York',  pop: 8_336_000  },
  { name: 'Lagos',     pop: 15_400_000 },
  { name: 'Berlin',    pop: 3_769_000  },
  { name: 'São Paulo', pop: 12_330_000 },
];

/* ── Policy cards ────────────────────────────────────────────────────────── */
const POLICIES = [
  { key: 'add_metro',        emoji: '🚇', name: 'Add Metro Line',           teaser: 'Expand mass transit, cut gridlock.' },
  { key: 'add_park',         emoji: '🌳', name: 'Develop Green Park',        teaser: 'Inject ecology & public wellbeing.' },
  { key: 'remove_parking',   emoji: '🚫', name: 'Remove Parking Spaces',     teaser: 'Reclaim streets for people & bikes.' },
  { key: 'increase_tax',     emoji: '💼', name: 'Increase Corporate Tax',     teaser: 'Redistribute wealth into public infra.' },
  { key: 'build_highway',    emoji: '🛣️', name: 'Build Inter-City Highway',   teaser: 'Accelerate freight & commuter flow.' },
  { key: 'subsidize_ev',     emoji: '⚡', name: 'Subsidize Electric Vehicles', teaser: 'Electrify transport, drop emissions.' },
  { key: 'custom',           emoji: '✏️', name: 'Custom Policy',              teaser: 'Write your own urban directive.' },
];

const TRAFFIC_LEVELS   = ['Low', 'Medium', 'High', 'Severe'];
const POLLUTION_LEVELS = ['Low', 'Medium', 'High', 'Severe'];

/* ── Colour helpers ──────────────────────────────────────────────────────── */
const levelColour = (val, opts) => {
  const idx = opts.indexOf(val);
  const ratio = idx / (opts.length - 1);
  if (ratio <= 0.33) return '#10b981';
  if (ratio <= 0.66) return '#f59e0b';
  return '#ef4444';
};

/* ── Step progress dots ──────────────────────────────────────────────────── */
function StepDots({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{
          width: i === step ? 28 : 8,
          height: 8,
          borderRadius: 4,
          background: i < step ? '#10b981' : i === step ? '#6366f1' : '#2a2a30',
          boxShadow: i === step ? '0 0 10px rgba(99,102,241,0.7)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        }} />
      ))}
    </div>
  );
}

/* ── Toggle pill group ───────────────────────────────────────────────────── */
function PillGroup({ options, value, onChange }) {
  const [shaking, setShaking] = useState(null);
  const handleClick = (opt) => {
    onChange(opt);
    setShaking(opt);
    setTimeout(() => setShaking(null), 200);
  };
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(opt => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => handleClick(opt)}
            style={{
              padding: '8px 18px', borderRadius: 100, border: 'none', cursor: 'pointer',
              fontFamily: 'ui-monospace,monospace', fontSize: 11, letterSpacing: '0.12em',
              textTransform: 'uppercase',
              background: active ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)',
              color: active ? '#818cf8' : '#64748b',
              boxShadow: active ? '0 0 0 1px #6366f1, 0 0 14px rgba(99,102,241,0.25)' : '0 0 0 1px rgba(255,255,255,0.07)',
              transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
              animation: shaking === opt ? 'wizShake 150ms ease' : 'none',
            }}
          >{opt}</button>
        );
      })}
    </div>
  );
}

/* ── Level slider (dial-style) ───────────────────────────────────────────── */
function LevelDial({ label, options, value, onChange }) {
  const idx   = options.indexOf(value);
  const ratio = idx / (options.length - 1);
  const colour = levelColour(value, options);
  return (
    <div style={{ flex: 1 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 10,
      }}>
        <span style={{
          fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: '#64748b',
        }}>{label}</span>
        <span style={{
          fontFamily: 'ui-monospace,monospace', fontSize: 11, color: colour,
          fontWeight: 600, letterSpacing: '0.08em',
          textShadow: `0 0 8px ${colour}`,
        }}>{value}</span>
      </div>

      {/* Track */}
      <div style={{
        position: 'relative', height: 4, borderRadius: 4,
        background: 'rgba(255,255,255,0.05)',
        cursor: 'pointer',
      }}>
        {/* Fill */}
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${ratio * 100}%`,
          background: `linear-gradient(90deg, #10b981, ${colour})`,
          borderRadius: 4,
          transition: 'width 0.3s ease, background 0.3s ease',
          boxShadow: `0 0 8px ${colour}88`,
        }} />
        {/* Segments */}
        {options.map((opt, i) => (
          <button key={opt} onClick={() => onChange(opt)} style={{
            position: 'absolute',
            left: `${(i / (options.length - 1)) * 100}%`,
            top: '50%', transform: 'translate(-50%, -50%)',
            width: 16, height: 16, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: i <= idx ? colour : '#2a2a30',
            boxShadow: i === idx ? `0 0 10px ${colour}` : 'none',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* Labels */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: 8,
        fontFamily: 'ui-monospace,monospace', fontSize: 8, color: '#334155',
        letterSpacing: '0.12em', textTransform: 'uppercase',
      }}>
        {options.map(o => <span key={o}>{o}</span>)}
      </div>
    </div>
  );
}

/* ── Timeline bar ────────────────────────────────────────────────────────── */
function TimelineBar({ value, onChange }) {
  const ratio = (value - 1) / 9;
  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12,
      }}>
        <span style={{
          fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: '#64748b',
        }}>Time Horizon</span>
        <span style={{
          fontFamily: 'ui-monospace,monospace', fontSize: 12, color: '#818cf8',
          fontWeight: 600, letterSpacing: '-0.02em',
          textShadow: '0 0 10px rgba(99,102,241,0.7)',
        }}>{value} Year{value !== 1 ? 's' : ''}</span>
      </div>

      {/* Bar track */}
      <div style={{ position: 'relative', height: 6, borderRadius: 6, background: 'rgba(255,255,255,0.05)' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${ratio * 100}%`,
          background: 'linear-gradient(90deg, #4f46e5, #818cf8)',
          borderRadius: 6,
          boxShadow: '0 0 12px rgba(99,102,241,0.6)',
          transition: 'width 0.2s ease',
        }} />
        <input
          type="range" min={1} max={10} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            opacity: 0, cursor: 'pointer', margin: 0,
          }}
        />
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: 8,
        fontFamily: 'ui-monospace,monospace', fontSize: 8, color: '#334155',
        letterSpacing: '0.12em', textTransform: 'uppercase',
      }}>
        <span>Immediate (1Y)</span>
        <span>Structural (10Y)</span>
      </div>
    </div>
  );
}

/* ── Main wizard ─────────────────────────────────────────────────────────── */
export default function SimulationWizard({
  // state props
  city, setCity,
  population, setPopulation,
  trafficLevel, setTrafficLevel,
  pollutionLevel, setPollutionLevel,
  timeHorizon, setTimeHorizon,
  budget, setBudget,
  priority, setPriority,
  riskLevel, setRiskLevel,
  policy, setPolicy,
  customPolicy, setCustomPolicy,
  isCompareMode, setIsCompareMode,
  policyB, setPolicyB,
  customPolicyB, setCustomPolicyB,
  // actions
  onSimulate,
  onDebate,
  loading,
  debateLoading,
  loadId, setLoadId,
  onLoad,
  localHistory,
  onLoadHistory,
  onGoLanding,
}) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1); // 1=forward, -1=backward
  const [animating, setAnimating] = useState(false);

  const goTo = (next) => {
    if (animating) return;
    setDir(next > step ? 1 : -1);
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 260);
  };

  const inputRef = useRef(null);
  useEffect(() => { if (step === 0 && inputRef.current) inputRef.current.focus(); }, [step]);

  const STEP_TITLES = [
    { n: '01', label: 'Select Your City' },
    { n: '02', label: 'Set Urban Conditions' },
    { n: '03', label: 'Define Strategy' },
    { n: '04', label: 'Choose Your Policy' },
  ];

  const canNext = () => {
    if (step === 3 && policy === 'custom' && !customPolicy.trim()) return false;
    return true;
  };

  return (
    <section style={{
      width: '100%', maxWidth: 340, flexShrink: 0,
      background: '#131316', border: '1px solid #222226',
      borderRadius: 14, display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      position: 'relative',
    }}>
      <style>{`
        @keyframes wizShake {
          0%,100% { transform:translateX(0); }
          25%     { transform:translateX(-2px); }
          75%     { transform:translateX(2px); }
        }
        @keyframes wizSlideInRight {
          from { opacity:0; transform:translateX(32px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes wizSlideInLeft {
          from { opacity:0; transform:translateX(-32px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes wizSlideOutRight {
          from { opacity:1; transform:translateX(0); }
          to   { opacity:0; transform:translateX(32px); }
        }
        @keyframes wizSlideOutLeft {
          from { opacity:1; transform:translateX(0); }
          to   { opacity:0; transform:translateX(-32px); }
        }
        @keyframes wizRunPulse {
          0%,100% { box-shadow:0 0 20px rgba(99,102,241,0.4); }
          50%     { box-shadow:0 0 40px rgba(99,102,241,0.9); }
        }
        @keyframes wizCursor {
          0%,100% { opacity:1; } 50% { opacity:0; }
        }
        .wiz-cursor { animation: wizCursor 1.1s step-end infinite; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
        {/* Logo / back */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button onClick={onGoLanding} style={{
            fontFamily: 'ui-monospace,monospace', fontSize: 11, letterSpacing: '0.16em',
            textTransform: 'uppercase', fontWeight: 600, color: '#e2e8f0',
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 9, color: '#475569' }}>←</span> UrbanPulse
          </button>
          {/* Load scenario */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: '#1c1c20', border: '1px solid #2a2a30',
            borderRadius: 8, padding: '4px 4px 4px 10px', overflow: 'hidden',
          }}>
            <input
              type="text" placeholder="UP-ID…" value={loadId}
              onChange={e => setLoadId(e.target.value.toUpperCase())}
              style={{
                background: 'none', border: 'none', outline: 'none',
                fontFamily: 'ui-monospace,monospace', fontSize: 10,
                color: '#818cf8', width: 72, letterSpacing: '0.1em',
              }}
            />
            <button onClick={onLoad} disabled={loading} style={{
              background: '#2a2a30', border: 'none', borderRadius: 6,
              padding: '4px 8px', cursor: 'pointer', color: '#818cf8', fontSize: 12,
            }}>🔍</button>
          </div>
        </div>

        {/* Step label */}
        <div style={{
          fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.3em',
          textTransform: 'uppercase', color: '#6366f1', marginBottom: 4,
        }}>
          Step {STEP_TITLES[step].n} of 04
        </div>
        <div style={{
          fontFamily: 'ui-monospace,monospace', fontSize: 15, fontWeight: 500,
          color: '#e2e8f0', marginBottom: 16, letterSpacing: '-0.01em',
        }}>
          {STEP_TITLES[step].label}
        </div>

        <StepDots step={step} />
      </div>

      {/* ── Step content ── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '0 24px 24px',
        animation: animating
          ? (dir > 0 ? 'wizSlideOutLeft 0.26s ease forwards' : 'wizSlideOutRight 0.26s ease forwards')
          : (dir > 0 ? 'wizSlideInRight 0.26s ease both' : 'wizSlideInLeft 0.26s ease both'),
      }}>

        {/* ── STEP 1: City ── */}
        {step === 0 && (
          <div>
            {/* Terminal city input */}
            <div style={{ marginBottom: 28, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{
                  fontFamily: 'ui-monospace,monospace', fontSize: 12, color: '#4f46e5', marginRight: 8,
                }}>$</span>
                <input
                  ref={inputRef}
                  type="text" value={city} onChange={e => setCity(e.target.value)}
                  placeholder="city_name"
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    borderBottom: '1px solid rgba(99,102,241,0.4)',
                    fontFamily: 'ui-monospace,monospace', fontSize: 22,
                    color: '#f1f5f9', letterSpacing: '-0.02em', padding: '4px 0 8px',
                  }}
                />
                <span className="wiz-cursor" style={{
                  display: 'inline-block', width: 2, height: 24,
                  background: '#6366f1', marginLeft: 2, flexShrink: 0,
                }} />
              </div>
              {/* Population sub-label */}
              {city && (
                <div style={{
                  fontFamily: 'ui-monospace,monospace', fontSize: 10, color: '#f59e0b',
                  letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 8,
                  opacity: 0.85,
                }}>
                  population: {population.toLocaleString()}
                </div>
              )}
            </div>

            {/* Quick-select chips */}
            <div style={{
              fontFamily: 'ui-monospace,monospace', fontSize: 9, color: '#475569',
              letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12,
            }}>Quick select</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CITY_PRESETS.map(c => (
                <button key={c.name} onClick={() => { setCity(c.name); setPopulation(c.pop); }}
                  style={{
                    padding: '8px 14px', borderRadius: 8,
                    border: city === c.name ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.07)',
                    background: city === c.name ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                    color: city === c.name ? '#818cf8' : '#64748b',
                    fontFamily: 'ui-monospace,monospace', fontSize: 11,
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    boxShadow: city === c.name ? '0 0 10px rgba(99,102,241,0.2)' : 'none',
                  }}
                >{c.name}</button>
              ))}
            </div>

            {/* Population input */}
            <div style={{ marginTop: 24 }}>
              <div style={{
                fontFamily: 'ui-monospace,monospace', fontSize: 9, color: '#475569',
                letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8,
              }}>Population</div>
              <input
                type="number" value={population} onChange={e => setPopulation(Number(e.target.value))}
                style={{
                  width: '100%', background: '#1c1c20', border: '1px solid #2a2a30',
                  borderRadius: 8, padding: '10px 14px', outline: 'none',
                  fontFamily: 'ui-monospace,monospace', fontSize: 13, color: '#e2e8f0',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        )}

        {/* ── STEP 2: Urban Conditions ── */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 36 }}>
              <LevelDial label="Traffic" options={TRAFFIC_LEVELS} value={trafficLevel} onChange={setTrafficLevel} />
              <LevelDial label="Pollution" options={POLLUTION_LEVELS} value={pollutionLevel} onChange={setPollutionLevel} />
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24 }}>
              <TimelineBar value={timeHorizon} onChange={setTimeHorizon} />
            </div>
          </div>
        )}

        {/* ── STEP 3: Strategy ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {[
              { label: 'Budget', options: ['Low', 'Medium', 'High'], value: budget, onChange: setBudget },
              { label: 'Priority', options: ['Economy', 'Environment', 'Public Sentiment', 'Balanced'], value: priority, onChange: setPriority },
              { label: 'Risk Level', options: ['Safe', 'Balanced', 'Aggressive'], value: riskLevel, onChange: setRiskLevel },
            ].map(({ label, options, value, onChange }) => (
              <div key={label}>
                <div style={{
                  fontFamily: 'ui-monospace,monospace', fontSize: 9, color: '#475569',
                  letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12,
                }}>{label}</div>
                <PillGroup options={options} value={value} onChange={onChange} />
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 4: Policy ── */}
        {step === 3 && (
          <div>
            {/* Compare mode toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{
                fontFamily: 'ui-monospace,monospace', fontSize: 9, color: '#475569',
                letterSpacing: '0.22em', textTransform: 'uppercase',
              }}>Compare Mode (A vs B)</span>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: 36, height: 20, borderRadius: 10,
                  background: isCompareMode ? '#4f46e5' : '#2a2a30',
                  position: 'relative', transition: 'background 0.3s',
                }}>
                  <div style={{
                    position: 'absolute', top: 3, left: isCompareMode ? 19 : 3,
                    width: 14, height: 14, borderRadius: '50%', background: '#e2e8f0',
                    transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  }} />
                </div>
                <input type="checkbox" checked={isCompareMode} onChange={e => setIsCompareMode(e.target.checked)} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Policy grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: isCompareMode ? 16 : 0 }}>
              {POLICIES.map(p => (
                <button key={p.key} onClick={() => setPolicy(p.key)} style={{
                  background: policy === p.key ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
                  border: policy === p.key ? '1px solid rgba(99,102,241,0.55)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12, padding: '14px 12px', cursor: 'pointer', textAlign: 'left',
                  transform: policy === p.key ? 'scale(1.03)' : 'scale(1)',
                  boxShadow: policy === p.key ? '0 0 16px rgba(99,102,241,0.25)' : 'none',
                  transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{p.emoji}</div>
                  <div style={{
                    fontFamily: 'ui-monospace,monospace', fontSize: 10, fontWeight: 600,
                    color: policy === p.key ? '#818cf8' : '#94a3b8',
                    letterSpacing: '0.04em', marginBottom: 4, lineHeight: 1.3,
                  }}>{p.name}</div>
                  <div style={{
                    fontFamily: 'system-ui,sans-serif', fontSize: 10, color: '#475569',
                    lineHeight: 1.45,
                  }}>{p.teaser}</div>
                </button>
              ))}
            </div>

            {/* Custom policy inline input */}
            {policy === 'custom' && (
              <textarea
                placeholder="Describe your custom urban policy…"
                value={customPolicy} onChange={e => setCustomPolicy(e.target.value)}
                rows={3}
                style={{
                  width: '100%', background: '#1c1c20',
                  border: '1px solid rgba(99,102,241,0.4)', borderRadius: 10,
                  padding: '12px 14px', fontFamily: 'ui-monospace,monospace',
                  fontSize: 12, color: '#e2e8f0', outline: 'none', resize: 'vertical',
                  boxSizing: 'border-box', marginTop: 8,
                }}
              />
            )}

            {/* Compare Policy B */}
            {isCompareMode && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{
                  fontFamily: 'ui-monospace,monospace', fontSize: 9, color: '#f59e0b',
                  letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12,
                }}>Variant B Policy</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {POLICIES.map(p => (
                    <button key={p.key} onClick={() => setPolicyB(p.key)} style={{
                      background: policyB === p.key ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.02)',
                      border: policyB === p.key ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 10, padding: '12px 10px', cursor: 'pointer', textAlign: 'left',
                      transform: policyB === p.key ? 'scale(1.03)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                    }}>
                      <div style={{ fontSize: 16, marginBottom: 4 }}>{p.emoji}</div>
                      <div style={{
                        fontFamily: 'ui-monospace,monospace', fontSize: 9,
                        color: policyB === p.key ? '#fbbf24' : '#64748b',
                        letterSpacing: '0.04em',
                      }}>{p.name}</div>
                    </button>
                  ))}
                </div>
                {policyB === 'custom' && (
                  <textarea
                    placeholder="Variant B custom policy…"
                    value={customPolicyB} onChange={e => setCustomPolicyB(e.target.value)}
                    rows={2}
                    style={{
                      width: '100%', background: '#1c1c20',
                      border: '1px solid rgba(245,158,11,0.4)', borderRadius: 10,
                      padding: '10px 12px', fontFamily: 'ui-monospace,monospace',
                      fontSize: 12, color: '#e2e8f0', outline: 'none', resize: 'vertical',
                      boxSizing: 'border-box', marginTop: 8,
                    }}
                  />
                )}
              </div>
            )}

            {/* RUN SIMULATION button — only on step 4 */}
            <button
              onClick={onSimulate}
              disabled={loading || debateLoading || !canNext()}
              style={{
                width: '100%', height: 56, marginTop: 20,
                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                border: 'none', borderRadius: 12, cursor: 'pointer',
                fontFamily: 'ui-monospace,monospace', fontSize: 12,
                letterSpacing: '0.28em', textTransform: 'uppercase',
                color: '#e2e8f0', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                animation: 'wizRunPulse 2.2s ease-in-out infinite',
                opacity: (loading || debateLoading) ? 0.5 : 1,
                transition: 'opacity 0.3s',
              }}
            >
              {loading
                ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Simulating…</>
                : 'Run Simulation →'
              }
            </button>

            {!isCompareMode && (
              <button
                onClick={onDebate}
                disabled={loading || debateLoading}
                style={{
                  width: '100%', height: 42, marginTop: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                  cursor: 'pointer', fontFamily: 'ui-monospace,monospace',
                  fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: '#64748b', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#94a3b8'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#64748b'; }}
              >
                {debateLoading ? 'Connecting…' : 'Stream Stakeholder Feedback'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <div style={{
        padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <button
          onClick={() => goTo(step - 1)} disabled={step === 0}
          style={{
            fontFamily: 'ui-monospace,monospace', fontSize: 10, letterSpacing: '0.2em',
            textTransform: 'uppercase', background: 'none', border: 'none',
            color: step === 0 ? '#2a2a30' : '#64748b', cursor: step === 0 ? 'default' : 'pointer',
            transition: 'color 0.2s',
          }}
        >← Back</button>

        {/* step indicator */}
        <span style={{
          fontFamily: 'ui-monospace,monospace', fontSize: 9, letterSpacing: '0.2em',
          color: '#334155', textTransform: 'uppercase',
        }}>{step + 1} / 4</span>

        {step < 3 ? (
          <button
            onClick={() => canNext() && goTo(step + 1)}
            style={{
              fontFamily: 'ui-monospace,monospace', fontSize: 10, letterSpacing: '0.2em',
              textTransform: 'uppercase', background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.35)', borderRadius: 8,
              padding: '8px 20px', color: '#818cf8', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; }}
          >Next →</button>
        ) : (
          /* placeholder to keep layout balanced on step 4 */
          <span style={{ width: 80 }} />
        )}
      </div>

      {/* ── Recent matrices ── */}
      {localHistory.length > 0 && (
        <div style={{ padding: '0 24px 20px', flexShrink: 0 }}>
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16,
          }}>
            <div style={{
              fontFamily: 'ui-monospace,monospace', fontSize: 8, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: '#334155', marginBottom: 10,
            }}>Recent Matrices</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {localHistory.slice(0, 3).map((item, idx) => (
                <button key={idx} onClick={() => onLoadHistory(item.id)} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#1c1c20', border: '1px solid #2a2a30',
                  borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
                  transition: 'all 0.2s', textAlign: 'left',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a30'; }}
                >
                  <div>
                    <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 9, color: '#6366f1', marginBottom: 2 }}>{item.id}</div>
                    <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 9, color: '#475569' }}>{item.city}</div>
                  </div>
                  {item.score > 0 && (
                    <div style={{
                      fontFamily: 'ui-monospace,monospace', fontSize: 9, padding: '3px 8px', borderRadius: 6,
                      background: item.score >= 70 ? 'rgba(16,185,129,0.1)' : item.score >= 40 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                      color: item.score >= 70 ? '#10b981' : item.score >= 40 ? '#f59e0b' : '#ef4444',
                      border: `1px solid ${item.score >= 70 ? 'rgba(16,185,129,0.3)' : item.score >= 40 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    }}>{item.score}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
