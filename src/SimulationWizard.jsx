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
  { key: 'subsidize_ev',     emoji: '⚡', name: 'Subsidize EVs', teaser: 'Electrify transport, drop emissions.' },
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
    <div className="flex items-center gap-2 justify-center mb-8">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className={`h-2 rounded-full transition-all duration-300 ${
          i === step ? 'w-8 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]' : 
          i < step ? 'w-2 bg-cyan-500' : 'w-2 bg-slate-700'
        }`} />
      ))}
    </div>
  );
}

/* ── Toggle pill group ───────────────────────────────────────────────────── */
function PillGroup({ options, value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(opt => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 border ${
              active 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
            }`}
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
    <div className="flex-1">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] tracking-widest uppercase text-slate-400 font-medium">{label}</span>
        <span className="text-xs font-bold" style={{ color: colour, textShadow: `0 0 10px ${colour}` }}>{value}</span>
      </div>

      <div className="relative h-1.5 rounded-full bg-slate-800 cursor-pointer flex items-center">
        <div className="absolute left-0 h-full rounded-full transition-all duration-300" 
             style={{ width: `${ratio * 100}%`, background: `linear-gradient(90deg, #10b981, ${colour})`, boxShadow: `0 0 10px ${colour}88` }} />
        {options.map((opt, i) => (
          <button key={opt} onClick={() => onChange(opt)} className="absolute w-4 h-4 rounded-full border-2 border-slate-900 transition-all duration-300"
            style={{
              left: `${(i / (options.length - 1)) * 100}%`, transform: 'translateX(-50%)',
              background: i <= idx ? colour : '#334155',
              boxShadow: i === idx ? `0 0 10px ${colour}` : 'none',
            }} />
        ))}
      </div>
    </div>
  );
}

/* ── Timeline bar ────────────────────────────────────────────────────────── */
function TimelineBar({ value, onChange }) {
  const ratio = (value - 1) / 9;
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] tracking-widest uppercase text-slate-400 font-medium">Time Horizon</span>
        <span className="text-sm font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">{value} Year{value !== 1 ? 's' : ''}</span>
      </div>
      <div className="relative h-2 rounded-full bg-slate-800">
        <div className="absolute left-0 h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-200" 
             style={{ width: `${ratio * 100}%`, boxShadow: '0 0 15px rgba(6,182,212,0.5)' }} />
        <input type="range" min={1} max={10} value={value} onChange={e => onChange(Number(e.target.value))}
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>
    </div>
  );
}

/* ── Main wizard ─────────────────────────────────────────────────────────── */
export default function SimulationWizard({
  city, setCity, population, setPopulation, trafficLevel, setTrafficLevel,
  pollutionLevel, setPollutionLevel, timeHorizon, setTimeHorizon,
  budget, setBudget, priority, setPriority, riskLevel, setRiskLevel,
  policy, setPolicy, customPolicy, setCustomPolicy, isCompareMode, setIsCompareMode,
  policyB, setPolicyB, customPolicyB, setCustomPolicyB,
  onSimulate, onDebate, loading, debateLoading, loadId, setLoadId,
  onLoad, localHistory, onLoadHistory, onGoLanding,
}) {
  const [step, setStep] = useState(0);

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
    <section className="glass-panel w-full lg:w-[380px] shrink-0 flex flex-col h-full overflow-hidden relative z-10">
      
      {/* ── Header ── */}
      <div className="p-6 shrink-0 border-b border-slate-700/50">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onGoLanding} className="text-xs font-semibold tracking-wider uppercase text-slate-300 hover:text-white flex items-center gap-2 transition-colors">
            <span className="text-slate-500">←</span> CitySimulation
          </button>
          
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-lg p-1.5 backdrop-blur-sm">
            <input type="text" placeholder="ID..." value={loadId} onChange={e => setLoadId(e.target.value.toUpperCase())}
                   className="bg-transparent border-none outline-none text-xs text-cyan-400 w-16 px-1 font-mono uppercase placeholder:text-slate-600" />
            <button onClick={onLoad} disabled={loading} className="bg-slate-700 hover:bg-slate-600 rounded text-xs px-2 py-1 transition-colors">
              🔍
            </button>
          </div>
        </div>

        <div className="text-[10px] tracking-[0.2em] uppercase text-emerald-500 font-semibold mb-1">
          Step {STEP_TITLES[step].n} of 04
        </div>
        <div className="text-xl font-outfit font-medium text-slate-100 mb-4">
          {STEP_TITLES[step].label}
        </div>
        <StepDots step={step} />
      </div>

      {/* ── Step content ── */}
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        {step === 0 && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <div className="flex items-end border-b border-slate-600/50 pb-2">
                <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Enter city name..."
                       className="flex-1 bg-transparent border-none outline-none text-3xl font-outfit font-semibold text-slate-100 placeholder:text-slate-600" />
              </div>
              {city && (
                <div className="text-[10px] uppercase tracking-widest text-emerald-400 mt-3 font-medium">
                  Population: {population.toLocaleString()}
                </div>
              )}
            </div>

            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-3 font-semibold">Quick Select</div>
            <div className="flex flex-wrap gap-2 mb-8">
              {CITY_PRESETS.map(c => (
                <button key={c.name} onClick={() => { setCity(c.name); setPopulation(c.pop); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    city === c.name ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-700'
                  }`}
                >{c.name}</button>
              ))}
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-semibold">Custom Population</div>
              <input type="number" value={population} onChange={e => setPopulation(Number(e.target.value))}
                     className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-cyan-500/50 transition-colors" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in flex flex-col gap-8">
            <LevelDial label="Traffic Baseline" options={TRAFFIC_LEVELS} value={trafficLevel} onChange={setTrafficLevel} />
            <LevelDial label="Pollution Baseline" options={POLLUTION_LEVELS} value={pollutionLevel} onChange={setPollutionLevel} />
            <div className="pt-6 border-t border-slate-700/50">
              <TimelineBar value={timeHorizon} onChange={setTimeHorizon} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in flex flex-col gap-8">
            {[
              { label: 'Fiscal Budget', options: ['Low', 'Medium', 'High'], value: budget, onChange: setBudget },
              { label: 'Primary Priority', options: ['Economy', 'Environment', 'Public Sentiment', 'Balanced'], value: priority, onChange: setPriority },
              { label: 'Risk Tolerance', options: ['Safe', 'Balanced', 'Aggressive'], value: riskLevel, onChange: setRiskLevel },
            ].map(({ label, options, value, onChange }) => (
              <div key={label}>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-3 font-semibold">{label}</div>
                <PillGroup options={options} value={value} onChange={onChange} />
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
              <span className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">A/B Compare Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isCompareMode} onChange={e => setIsCompareMode(e.target.checked)} />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all shadow-inner"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {POLICIES.map(p => (
                <button key={p.key} onClick={() => setPolicy(p.key)}
                  className={`p-4 rounded-xl text-left transition-all duration-200 border ${
                    policy === p.key 
                      ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] scale-[1.02]' 
                      : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'
                  }`}>
                  <div className="text-2xl mb-2">{p.emoji}</div>
                  <div className={`text-xs font-bold mb-1 leading-tight ${policy === p.key ? 'text-cyan-400' : 'text-slate-300'}`}>{p.name}</div>
                </button>
              ))}
            </div>

            {policy === 'custom' && (
              <textarea placeholder="Describe your custom urban policy..." value={customPolicy} onChange={e => setCustomPolicy(e.target.value)} rows={3}
                        className="w-full bg-slate-800/50 border border-cyan-500/30 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-cyan-500 mb-4" />
            )}

            {isCompareMode && (
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <div className="text-[10px] uppercase tracking-widest text-emerald-400 mb-4 font-semibold">Variant B Policy</div>
                <div className="grid grid-cols-2 gap-3">
                  {POLICIES.map(p => (
                    <button key={p.key} onClick={() => setPolicyB(p.key)}
                      className={`p-3 rounded-xl text-left transition-all duration-200 border ${
                        policyB === p.key 
                          ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.02]' 
                          : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'
                      }`}>
                      <div className="text-lg mb-1">{p.emoji}</div>
                      <div className={`text-[10px] font-bold leading-tight ${policyB === p.key ? 'text-emerald-400' : 'text-slate-400'}`}>{p.name}</div>
                    </button>
                  ))}
                </div>
                {policyB === 'custom' && (
                  <textarea placeholder="Variant B custom policy..." value={customPolicyB} onChange={e => setCustomPolicyB(e.target.value)} rows={2}
                            className="w-full bg-slate-800/50 border border-emerald-500/30 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-emerald-500 mt-3" />
                )}
              </div>
            )}

            <button onClick={onSimulate} disabled={loading || debateLoading || !canNext()}
              className={`w-full py-4 mt-6 rounded-xl font-bold text-sm tracking-widest uppercase text-white transition-all duration-300 shadow-lg flex justify-center items-center gap-2 ${
                (loading || debateLoading) ? 'bg-slate-700 opacity-50 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:scale-[1.02]'
              }`}>
              {loading ? 'Simulating...' : 'Run Simulation →'}
            </button>

            {!isCompareMode && (
              <button onClick={onDebate} disabled={loading || debateLoading}
                className="w-full py-3 mt-3 rounded-xl text-[10px] font-semibold tracking-widest uppercase text-slate-400 bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:text-slate-200 transition-colors">
                {debateLoading ? 'Connecting...' : 'Stream Stakeholder Feedback'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <div className="p-4 border-t border-slate-700/50 flex justify-between items-center shrink-0 bg-slate-900/40">
        <button onClick={() => setStep(step - 1)} disabled={step === 0}
                className={`text-[10px] font-semibold tracking-widest uppercase transition-colors ${step === 0 ? 'text-slate-700' : 'text-slate-400 hover:text-slate-200'}`}>
          ← Back
        </button>
        {step < 3 ? (
          <button onClick={() => canNext() && setStep(step + 1)}
                  className="px-5 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold tracking-widest uppercase hover:bg-emerald-500/30 transition-colors">
            Next →
          </button>
        ) : <div className="w-20" />}
      </div>
    </section>
  );
}
