import { useState, useEffect } from 'react';
import { TourProvider, useTour } from '@reactour/tour';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import CityIcon from './CityIcon';
import LivingBlueprint from './LivingBlueprint';

const POLICY_LABELS = {
  "add_metro": "Add Metro Line",
  "add_park": "Develop Green Park",
  "remove_parking": "Remove Parking Spaces",
  "increase_tax": "Increase Corporate Tax",
  "build_highway": "Build Inter-City Highway",
  "subsidize_ev": "Subsidize Electric Vehicles",
  "custom": "Custom Policy"
};

const tourSteps = [
  { selector: '.city-section', content: 'Select your city and define its conditions' },
  { selector: '.policy-section', content: 'Choose or create a policy' },
  { selector: '.simulate-button', content: 'Run the simulation' },
  { selector: '.impact-section', content: 'View impact results' },
  { selector: '.comparison-section', content: 'Compare policies' },
  { selector: '.debate-section', content: 'See stakeholder debate' },
  { selector: '.timeline-section', content: 'Explore future changes' }
];

const CustomNavigation = ({ currentStep, steps, setIsOpen, setCurrentStep }) => (
  <div className="flex justify-between items-center w-full mt-5 border-t border-[#2A2A30] pt-4">
    <button 
      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
      disabled={currentStep === 0}
      className="text-[10px] font-mono uppercase tracking-widest text-[#8A8A93] hover:text-[#E4E4E7] disabled:opacity-30 transition-colors px-2 py-1"
    >
      &larr; Prev
    </button>
    <div className="text-[10px] font-mono tracking-widest text-[#52525B]">
      <span className="text-[#E4E4E7]">{currentStep + 1}</span> / {steps.length}
    </div>
    <button 
      onClick={() => {
        if (currentStep === steps.length - 1) {
          setIsOpen(false);
        } else {
          setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
        }
      }}
      className="text-[10px] font-mono uppercase tracking-widest text-[#E4E4E7] bg-[#3b4a6b] hover:bg-[#465578] hover:shadow-[0_0_10px_rgba(79,70,229,0.5)] px-4 py-2 rounded transition-all"
    >
      {currentStep === steps.length - 1 ? 'Finish \u2713' : 'Next \u2192'}
    </button>
  </div>
);

export default function App() {
  return (
    <TourProvider 
      steps={tourSteps}
      padding={{ mask: 14 }}
      components={{
        Navigation: CustomNavigation,
        Badge: () => null
      }}
      styles={{
        popover: (base) => ({
          ...base,
          backgroundColor: '#18181B',
          color: '#E4E4E7',
          borderRadius: '8px',
          border: '1px solid #2A2A30',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8)',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: '12px',
          padding: '24px 20px 20px 20px'
        }),
        maskArea: (base) => ({ ...base, rx: 8 }),
        highlightedArea: (base) => ({
          ...base,
          display: 'block',
          stroke: '#4f46e5',
          strokeWidth: 3,
          strokeDasharray: '5 5',
          rx: 8
        }),
        close: (base) => ({ ...base, right: 16, top: 16, color: '#71717A' })
      }}
    >
      <UrbanPulseDashboard />
    </TourProvider>
  );
}

function UrbanPulseDashboard() {
  const [currentView, setCurrentView] = useState('landing'); // Controls landing vs dashboard

  // Advanced Parameters
  const [city, setCity] = useState('Mumbai');
  const [population, setPopulation] = useState(21000000);
  const [trafficLevel, setTrafficLevel] = useState('High');
  const [pollutionLevel, setPollutionLevel] = useState('High');
  const [timeHorizon, setTimeHorizon] = useState(1);
  
  // Strategic Constraints
  const [budget, setBudget] = useState('Medium');
  const [priority, setPriority] = useState('Balanced');
  const [riskLevel, setRiskLevel] = useState('Balanced');

  // Policy Config
  const [policy, setPolicy] = useState('add_metro');
  const [customPolicy, setCustomPolicy] = useState('');
  
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [policyB, setPolicyB] = useState('add_park');
  const [customPolicyB, setCustomPolicyB] = useState('');
  
  // Results State
  const [result, setResult] = useState(null);
  const [previousResult, setPreviousResult] = useState(null);
  const [savedScenarioId, setSavedScenarioId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [loadId, setLoadId] = useState('');
  
  const [localHistory, setLocalHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('UP_HISTORY');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [debateResult, setDebateResult] = useState(null);
  const [debateLoading, setDebateLoading] = useState(false);

  const { setIsOpen } = useTour();

  useEffect(() => {
    if (currentView === 'dashboard' && !localStorage.getItem('UP_TOUR_COMPLETED')) {
      setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('UP_TOUR_COMPLETED', 'true');
      }, 800);
    }
  }, [currentView, setIsOpen]);

  const startTour = () => setIsOpen(true);

  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    setSavedScenarioId(null);
    setShowSaveModal(false);
    if (!isCompareMode && result) setPreviousResult(result);
    setResult(null);
    setDebateResult(null); 

    const finalPolicyA = policy === 'custom' ? customPolicy : policy;
    const finalPolicyB = policyB === 'custom' ? customPolicyB : policyB;

    const url = isCompareMode ? 'http://localhost:8080/api/compare' : 'http://localhost:8080/api/simulate';
    const body = isCompareMode 
      ? { city, population, trafficLevel, pollutionLevel, timeHorizon, budget, priority, riskLevel, policyA: finalPolicyA, policyB: finalPolicyB }
      : { city, population, trafficLevel, pollutionLevel, timeHorizon, budget, priority, riskLevel, policy: finalPolicyA };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Simulation failed. Check API limits.');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDebate = async () => {
    setDebateLoading(true);
    setError(null);
    setDebateResult(null);
    setResult(null); 

    const finalPolicyA = policy === 'custom' ? customPolicy : policy;

    try {
      const response = await fetch('http://localhost:8080/api/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, population, trafficLevel, pollutionLevel, timeHorizon, budget, priority, riskLevel, policy: finalPolicyA }),
      });
      if (!response.ok) throw new Error('Debate simulation failed.');
      const data = await response.json();
      setDebateResult(data.debate);
    } catch (err) {
      setError(err.message);
    } finally {
      setDebateLoading(false);
    }
  };

  const handleSaveScenario = async () => {
    setSaveLoading(true);
    try {
      const payload = isCompareMode 
        ? { config: { city, population, timeHorizon, budget, priority, riskLevel, policyA: policy, policyB }, result }
        : { config: { city, population, timeHorizon, budget, priority, riskLevel, policy }, result };
        
      const response = await fetch('http://localhost:8080/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Save failed');
      const data = await response.json();
      setSavedScenarioId(data.scenarioId);
      
      const score = result ? (isCompareMode ? 0 : Math.round((result.impact?.traffic + result.impact?.economy + result.impact?.environment + result.impact?.sentiment) / 4)) : 0;
      const historyItem = { id: data.scenarioId, city, policy: isCompareMode ? 'Variant Comparison' : (POLICY_LABELS[policy] || policy), score };
      const newHistory = [historyItem, ...localHistory.filter(h => h.id !== data.scenarioId)].slice(0, 5);
      setLocalHistory(newHistory);
      localStorage.setItem('UP_HISTORY', JSON.stringify(newHistory));
      
      setShowSaveModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLoadScenario = () => {
     if (loadId) executeLoad(loadId);
  };

  const executeExportJSON = () => {
    if (!result) return;
    const exportData = {
      matrix_signature: `URBANPULSE_SYSTEM_EXPORT_${Date.now()}`,
      timestamp: new Date().toISOString(),
      configuration: { city, population, timeHorizon, budget, priority, riskLevel, policyA: policy, policyB: isCompareMode ? policyB : null },
      metrics: isCompareMode ? null : result.impact,
      ai_analysis: result.tradeoffSummary || result.recommendationSummary,
      chronological_phases: result.evolution,
      stakeholder_feedback: isCompareMode ? { variantA: result.policyA?.stakeholders, variantB: result.policyB?.stakeholders } : result.stakeholders
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UP_Analysis_${city.replace(/\s+/g, '_')}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const executeLoad = async (targetId) => {
    setLoading(true);
    setError(null);
    try {
      const formattedId = targetId.toUpperCase().trim();
      if (!formattedId.startsWith('UP-')) throw new Error('Invalid Matrix ID Format (Expected UP-XXXXX)');
      
      setLoadId(formattedId);
      const response = await fetch(`http://localhost:8080/api/scenario/${formattedId}`);
      if (!response.ok) throw new Error('Scenario Network Failure');
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      // Hydrate all configuration vectors
      if (data.config) {
         setCity(data.config.city);
         setPopulation(data.config.population);
         setTimeHorizon(data.config.timeHorizon);
         setBudget(data.config.budget);
         setPriority(data.config.priority);
         setRiskLevel(data.config.riskLevel);
         setPolicy(data.config.policyA || data.config.policy);
         
         if (data.config.policyB) {
            setIsCompareMode(true);
            setPolicyB(data.config.policyB);
         } else {
            setIsCompareMode(false);
         }
      }
      
      // Inject Simulation Results bypass
      setResult(data.result);
      setDebateResult(null);
      setPreviousResult(null);
      setSavedScenarioId(formattedId);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (currentView === 'landing') {
     return <LandingPage onLaunch={() => setCurrentView('dashboard')} />;
  }

  const titleA = policy === 'custom' ? (customPolicy || "Custom Policy") : POLICY_LABELS[policy];
  const titleB = policyB === 'custom' ? (customPolicyB || "Custom Policy") : POLICY_LABELS[policyB];

  return (
    <>
      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2A2A30; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #3b4a6b; }
        @keyframes scan {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div className="h-screen w-full bg-[#0A0A0B] text-[#E4E4E7] font-sans selection:bg-[#3b4a6b]/30 p-4 lg:p-6 flex flex-col lg:flex-row gap-6 overflow-hidden animate-fade-in">
        
        {/* PANEL 1: CONFIGURATION */}
        <section className="w-full lg:w-[340px] shrink-0 bg-[#131316] border border-[#222226] rounded-xl flex flex-col h-full overflow-y-auto shadow-2xl relative">
          <div className="p-8 flex flex-col h-full">
            
            <header className="mb-10 flex flex-col gap-6 relative z-20">
              <div className="flex justify-between items-start">
                 <div className="cursor-pointer group shrink-0" onClick={() => setCurrentView('landing')}>
                    <div className="flex items-center gap-4 mb-4 pointer-events-none -mt-4">
                       <div className="scale-75 origin-left"><CityIcon /></div>
                       <h1 className="text-2xl font-medium tracking-wide text-slate-100 group-hover:text-[#3b4a6b] transition-colors">UrbanPulse</h1>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="w-2 h-2 rounded-full bg-[#3b4a6b]"></span>
                       <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8A8A93]">System Interface</p>
                    </div>
                 </div>
                 {/* Tour Trigger */}
                 <button onClick={startTour} className="hidden lg:flex font-mono text-[9px] tracking-widest text-[#A1A1AA] hover:text-[#E4E4E7] border border-[#2A2A30] hover:border-[#465578] bg-[#1C1C20] hover:bg-[#2A2A30] px-3 py-1.5 rounded uppercase transition-colors shrink-0">
                    Tour UI
                 </button>
              </div>

              {/* Load Scenario Search Module positioned safely below */}
              <div className="w-full flex items-stretch animate-fade-in bg-[#1C1C20] border border-[#2A2A30] focus-within:border-indigo-500/50 rounded-lg p-1 transition-colors overflow-hidden">
                 <input 
                    type="text" 
                    placeholder="Load Context UP-ID..." 
                    value={loadId} 
                    onChange={e => setLoadId(e.target.value.toUpperCase())}
                    className="w-full bg-transparent text-[11px] font-mono text-indigo-100 px-3 py-1.5 focus:outline-none placeholder-[#52525B] tracking-wider"
                 />
                 <button onClick={handleLoadScenario} disabled={loading} className="text-[#8A8A93] hover:text-indigo-400 bg-[#2A2A30] hover:bg-[#3b4a6b] px-3 py-1.5 rounded transition-all disabled:opacity-50">
                    🔍
                 </button>
              </div>
            </header>

            <div className="space-y-10 flex-grow">
              
              {/* Context Block */}
              <div className="city-section">
                <h3 className="font-mono text-[10px] tracking-[0.15em] text-[#8A8A93] uppercase mb-5">Environmental Context</h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] text-[#71717A] tracking-widest uppercase">City</label>
                    <input type="text" value={city} onChange={e=>setCity(e.target.value)} className="bg-[#1C1C20] border border-[#2A2A30] text-[13px] text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#465578] transition-colors" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] text-[#71717A] tracking-widest uppercase">Population Base</label>
                    <input type="number" value={population} onChange={e=>setPopulation(Number(e.target.value))} className="bg-[#1C1C20] border border-[#2A2A30] text-[13px] text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#465578] transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[10px] text-[#71717A] tracking-widest uppercase">Traffic</label>
                      <select value={trafficLevel} onChange={e=>setTrafficLevel(e.target.value)} className="appearance-none bg-[#1C1C20] border border-[#2A2A30] text-[13px] text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#465578] transition-colors cursor-pointer">
                        <option>Low</option><option>Medium</option><option>High</option><option>Severe</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[10px] text-[#71717A] tracking-widest uppercase">Pollution</label>
                      <select value={pollutionLevel} onChange={e=>setPollutionLevel(e.target.value)} className="appearance-none bg-[#1C1C20] border border-[#2A2A30] text-[13px] text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#465578] transition-colors cursor-pointer">
                        <option>Low</option><option>Medium</option><option>High</option><option>Severe</option>
                      </select>
                    </div>
                  </div>
                  <div className="timeline-section flex flex-col gap-2 pt-2 border-t border-[#2A2A30]">
                    <div className="flex justify-between items-end mt-2">
                      <label className="font-mono text-[10px] text-[#71717A] tracking-widest uppercase">Time Horizon</label>
                      <span className="font-mono text-[10px] text-[#E4E4E7] tracking-widest bg-[#1C1C20] border border-[#2A2A30] px-2 py-0.5 rounded">{timeHorizon} Year{timeHorizon !== 1 ? 's' : ''}</span>
                    </div>
                    <input 
                       type="range" min="1" max="10" 
                       value={timeHorizon} onChange={e=>setTimeHorizon(Number(e.target.value))} 
                       className="w-full h-1 bg-[#2A2A30] rounded-lg appearance-none cursor-pointer accent-[#3b4a6b] mt-1" 
                    />
                    <div className="flex justify-between font-mono text-[9px] text-[#52525B] uppercase tracking-widest">
                       <span>Immediate (1Y)</span>
                       <span>Structural (10Y)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategic Constraints */}
              <div className="pt-2">
                <h3 className="font-mono text-[10px] tracking-[0.15em] text-[#8A8A93] uppercase mb-4">Strategic Directives</h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] text-[#71717A] tracking-widest uppercase flex justify-between">
                       Budget Base <span className="text-[#3b4a6b]">{budget}</span>
                    </label>
                    <div className="relative">
                       <select value={budget} onChange={e=>setBudget(e.target.value)} className="w-full appearance-none bg-[#1C1C20] border border-[#2A2A30] text-[13px] text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#465578] transition-colors cursor-pointer">
                         <option>Low</option><option>Medium</option><option>High</option>
                       </select>
                       <span className="absolute right-4 top-3 text-[#71717A] pointer-events-none text-xs">▼</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] text-[#71717A] tracking-widest uppercase flex justify-between">
                       Optimization Target <span className="text-[#3b4a6b]">{priority}</span>
                    </label>
                    <div className="relative">
                       <select value={priority} onChange={e=>setPriority(e.target.value)} className="w-full appearance-none bg-[#1C1C20] border border-[#2A2A30] text-[13px] text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#465578] transition-colors cursor-pointer">
                         <option>Economy</option><option>Environment</option><option>Public Sentiment</option><option>Balanced</option>
                       </select>
                       <span className="absolute right-4 top-3 text-[#71717A] pointer-events-none text-xs">▼</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] text-[#71717A] tracking-widest uppercase flex justify-between">
                       Risk Authorization <span className="text-[#3b4a6b]">{riskLevel}</span>
                    </label>
                    <div className="relative">
                       <select value={riskLevel} onChange={e=>setRiskLevel(e.target.value)} className="w-full appearance-none bg-[#1C1C20] border border-[#2A2A30] text-[13px] text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#465578] transition-colors cursor-pointer">
                         <option>Safe</option><option>Balanced</option><option>Aggressive</option>
                       </select>
                       <span className="absolute right-4 top-3 text-[#71717A] pointer-events-none text-xs">▼</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Policy Block */}
              <div className="policy-section pt-2 border-t border-[#222226]">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-mono text-[10px] tracking-[0.15em] text-[#8A8A93] uppercase">Primary Directive</h3>
                  <label className="comparison-section flex items-center gap-2 cursor-pointer group">
                    <span className="font-mono text-[9px] text-[#71717A] tracking-widest uppercase group-hover:text-slate-300 transition-colors">Compare</span>
                    <div className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors duration-300 ${isCompareMode ? 'bg-[#3b4a6b]' : 'bg-[#2A2A30]'}`}>
                      <div className={`bg-[#E4E4E7] w-3 h-3 rounded-full shadow-sm transform transition-transform duration-300 ${isCompareMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                    <input type="checkbox" checked={isCompareMode} onChange={e=>{
                      setIsCompareMode(e.target.checked);
                      setResult(null);
                      setDebateResult(null);
                      setError(null);
                    }} className="hidden" />
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] text-[#71717A] tracking-widest uppercase">Base Policy (A)</label>
                    <div className="relative">
                      <select value={policy} onChange={e=>{setPolicy(e.target.value); if(e.target.value!=='custom')setCustomPolicy('');}} className="w-full appearance-none bg-[#1C1C20] border border-[#2A2A30] text-[13px] text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#465578] transition-colors cursor-pointer pr-10">
                        {Object.entries(POLICY_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <span className="absolute right-4 top-3 text-[#71717A] pointer-events-none text-xs">▼</span>
                    </div>
                    {policy === 'custom' && (
                      <input type="text" value={customPolicy} onChange={e=>setCustomPolicy(e.target.value)} placeholder="Type custom directive..." className="bg-[#1C1C20] border border-[#465578]/50 text-[13px] text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#465578] transition-colors mt-2" />
                    )}
                  </div>

                  {isCompareMode && (
                    <div className="flex flex-col gap-2 animate-fade-in pt-3 border-t border-[#222226]">
                      <label className="font-mono text-[10px] text-[#71717A] tracking-widest uppercase">Variant Policy (B)</label>
                      <div className="relative">
                        <select value={policyB} onChange={e=>{setPolicyB(e.target.value); if(e.target.value!=='custom')setCustomPolicyB('');}} className="w-full appearance-none bg-[#1C1C20] border border-[#2A2A30] text-[13px] text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#465578] transition-colors cursor-pointer pr-10">
                          {Object.entries(POLICY_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <span className="absolute right-4 top-3 text-[#71717A] pointer-events-none text-xs">▼</span>
                      </div>
                      {policyB === 'custom' && (
                        <input type="text" value={customPolicyB} onChange={e=>setCustomPolicyB(e.target.value)} placeholder="Type variant directive..." className="bg-[#1C1C20] border border-[#465578]/50 text-[13px] text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#465578] transition-colors mt-2" />
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="mt-8 pt-8 border-t border-[#222226] flex flex-col gap-3">
              <button onClick={handleSimulate} disabled={loading || debateLoading} className="simulate-button w-full bg-[#3b4a6b] hover:bg-[#465578] text-[#E4E4E7] py-3.5 rounded-lg text-[11px] font-mono tracking-widest uppercase transition-colors disabled:opacity-50 flex justify-center items-center h-12 shadow-lg">
                {loading ? <div className="w-4 h-4 rounded-full border-2 border-t-white border-white/20 animate-spin"></div> : (isCompareMode ? 'Execute Comparison' : 'Execute Simulation')}
              </button>
              
              {!isCompareMode && (
                <button onClick={handleDebate} disabled={loading || debateLoading} className="debate-section w-full bg-[#1C1C20] hover:bg-[#25252A] border border-[#2A2A30] text-[#A1A1AA] py-3 rounded-lg text-[11px] font-mono tracking-widest uppercase transition-colors disabled:opacity-50 h-12 shadow-inner">
                  {debateLoading ? 'Connecting...' : 'Stream Stakeholder Feedback'}
                </button>
              )}
            </div>
            
            {/* Historical Matrix Vault */}
            {localHistory.length > 0 && (
              <div className="mt-8 pt-8 border-t border-[#222226] animate-fade-in-up">
                 <h3 className="font-mono text-[10px] tracking-[0.15em] text-[#8A8A93] uppercase mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#465578] rounded-full"></span> Recent Matrices
                 </h3>
                 <div className="space-y-2">
                    {localHistory.map((item, idx) => (
                       <button 
                          key={idx}
                          onClick={() => executeLoad(item.id)}
                          className="w-full flex items-center justify-between bg-[#1C1C20] hover:bg-[#2A2A30] border border-[#2A2A30] hover:border-[#3b4a6b] px-4 py-3 rounded-lg transition-all duration-300 group text-left cursor-pointer shadow-sm hover:shadow-md"
                       >
                          <div className="overflow-hidden">
                             <div className="font-mono text-[10px] tracking-wider text-indigo-400 mb-1 drop-shadow-sm group-hover:text-indigo-300 transition-colors">{item.id}</div>
                             <div className="text-[11px] text-[#A1A1AA] truncate tracking-wide">{item.city} • <span className="opacity-75">{item.policy}</span></div>
                          </div>
                          {!isCompareMode && item.score > 0 && (
                             <div className={`font-mono text-[10px] px-2 py-1 rounded shadow-inner ${item.score >= 70 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : item.score >= 40 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                {item.score}
                             </div>
                          )}
                       </button>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </section>

        {/* PANEL 2: MACRO ANALYTICS */}
        <section className="impact-section flex-1 bg-[#131316] border border-[#222226] rounded-xl flex flex-col h-full overflow-y-auto shadow-2xl">
          <div className="p-8 lg:p-12 h-full flex flex-col">
            
            <header className="mb-12 border-b border-[#222226] pb-6 flex justify-between items-end">
              <div>
                <h2 className="font-mono text-[10px] tracking-[0.2em] text-[#8A8A93] uppercase mb-3">Macro Architecture</h2>
                <div className="flex items-center gap-4">
                   <h3 className="text-2xl font-light tracking-tight text-[#E4E4E7]">{isCompareMode ? 'Variant Comparison' : titleA}</h3>
                   {result && !loading && (
                      <div className="flex gap-2 animate-fade-in z-20">
                         <button onClick={handleSaveScenario} disabled={saveLoading} className="font-mono text-[10px] tracking-widest text-[#10b981] border border-[#10b981]/40 hover:bg-[#10b981]/15 px-4 py-1.5 rounded-full uppercase transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2">
                            <span className="text-[13px]">{saveLoading ? '⏳' : '💾'}</span> {saveLoading ? 'Saving...' : 'Save City'}
                         </button>
                         <button onClick={executeExportJSON} className="font-mono text-[10px] tracking-widest text-indigo-400 border border-indigo-500/40 hover:bg-indigo-500/15 px-4 py-1.5 rounded-full uppercase transition-all shadow-[0_0_10px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center gap-2">
                            <span className="text-[13px]">📥</span> Export JSON
                         </button>
                      </div>
                   )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] text-[#52525B] tracking-widest uppercase">Target Locale</p>
                <p className="font-medium text-[15px]">{city}</p>
              </div>
            </header>

            {error && (
               <div className="mb-8 p-4 bg-rose-950/20 border border-rose-900/50 rounded-lg font-mono text-xs text-rose-400">
                  <span className="uppercase tracking-widest font-bold mr-2">Error:</span> {error}
               </div>
            )}

            {!result && !loading && (
              <div className="flex-grow flex flex-col items-center justify-center opacity-40">
                <div className="font-mono text-[10px] tracking-widest text-[#71717A] uppercase mb-4">Architecture Idle</div>
                <div className="w-16 h-px bg-[#3F3F46]"></div>
              </div>
            )}

            {loading && (
              <ProfessionalLoader />
            )}

            {result && !result.policyA && !loading && (
              <div className="flex-grow flex flex-col animate-fade-in">
                
                {/* AI Trade-Off Summary */}
                {result.tradeoffSummary && (
                   <div className="mb-8 bg-[#18181B] border border-[#3b4a6b]/30 p-5 rounded-xl animate-fade-in-up relative overflow-hidden shadow-lg">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3b4a6b]"></div>
                      <h4 className="font-mono text-[10px] tracking-widest text-[#8A8A93] uppercase mb-2">AI Trade-off Analysis</h4>
                      <p className="text-[14px] text-[#E4E4E7] leading-relaxed font-light">{result.tradeoffSummary}</p>
                   </div>
                )}
                
                {/* City Evolution Timeline */}
                {result.evolution && result.evolution.length > 0 && (
                   <div className="mb-10 p-7 bg-[#050505] border border-[#1C1C20] rounded-xl shadow-inner relative overflow-hidden">
                      <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                      <h4 className="font-mono text-[10px] tracking-widest text-[#52525B] uppercase mb-8 flex items-center gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                         10-Year Evolution Pathway
                      </h4>
                      <div className="relative pl-6 space-y-8 before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-gradient-to-b before:from-indigo-500/50 before:via-[#10b981]/30 before:to-transparent">
                         {result.evolution.map((ev, i) => (
                            <div key={i} className="relative animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
                               <div className="absolute -left-[29px] w-3.5 h-3.5 bg-[#050505] border-2 border-indigo-400 rounded-full top-1 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                               <div className="flex items-baseline gap-3 mb-1.5">
                                  <span className="font-mono text-[11px] text-indigo-400 tracking-wider">YEAR {ev.year}</span>
                                  <span className="text-[14px] text-slate-200 tracking-wide font-medium">{ev.phase}</span>
                               </div>
                               <p className="text-[13px] text-[#8A8A93] leading-relaxed font-light">{ev.description}</p>
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                {/* Macro Cards */}
                <h4 className="font-mono text-[10px] tracking-[0.15em] text-[#8A8A93] uppercase mb-4">Core Metrics</h4>
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <ImpactCard title="Traffic Index" value={result.impact.traffic} prevValue={previousResult?.impact?.traffic} />
                  <ImpactCard title="Economic Index" value={result.impact.economy} prevValue={previousResult?.impact?.economy} />
                  <ImpactCard title="Ecology Index" value={result.impact.environment} prevValue={previousResult?.impact?.environment} />
                  <ImpactCard title="Public Sentiment" value={result.impact.sentiment} prevValue={previousResult?.impact?.sentiment} />
                </div>

                {/* Recharts Radar Component & Health Score */}
                <div className="mb-4 px-4 bg-[#0A0A0B] py-8 rounded-xl border border-[#1C1C20] shadow-inner relative overflow-hidden group animate-fade-in-up">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                   <div className="absolute top-4 right-6 flex flex-col items-end z-10">
                      <span className="font-mono text-[9px] tracking-widest text-[#8A8A93] uppercase mb-1">City Health</span>
                      <div className="text-3xl font-light tracking-tighter text-[#10b981] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                         {Math.round((result.impact.traffic + result.impact.economy + result.impact.environment + result.impact.sentiment) / 4)}
                         <span className="text-sm text-[#52525B] drop-shadow-none">/100</span>
                      </div>
                   </div>
                   <h4 className="font-mono text-[10px] tracking-widest text-[#52525B] uppercase mb-8 text-center pt-2 relative z-10">Structural Analysis Vector</h4>
                   <div className="relative z-0 transition-transform duration-1000 ease-in-out">
                     <ArchitecturalRadar data={[
                        { label: 'TRAFFIC', value: result.impact.traffic },
                        { label: 'ECONOMY', value: result.impact.economy },
                        { label: 'ECOLOGY', value: result.impact.environment },
                        { label: 'SENTIMENT', value: result.impact.sentiment }
                     ]} />
                   </div>
                </div>
              </div>
            )}

            {result && result.policyA && !loading && (
               <div className="flex-grow flex flex-col animate-fade-in">
                  
                  {/* Recommended Decision Block */}
                  {result.recommendationSummary && (
                     <div className="mb-8 bg-gradient-to-r from-[#18181B] to-[#121214] border border-[#10b981]/30 p-6 rounded-xl animate-fade-in-up relative overflow-hidden shadow-xl">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981]"></div>
                        <div className="flex items-center gap-3 mb-3">
                           <span className="text-xl">🏆</span>
                           <h4 className="font-mono text-[11px] tracking-widest text-[#10b981] uppercase font-semibold">AI Recommended Decision</h4>
                        </div>
                        <p className="text-[15px] text-[#E4E4E7] leading-relaxed font-light">{result.recommendationSummary}</p>
                     </div>
                  )}

                  <div className="mb-10 px-4 bg-[#0A0A0B] py-8 rounded-xl border border-[#1C1C20] shadow-inner">
                     <div className="flex justify-center gap-8 mb-4 font-mono text-[10px] tracking-widest uppercase">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[#3b4a6b]"></div> Variant A</span>
                        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[#52525B]"></div> Variant B</span>
                     </div>
                     <CompareRadar dataA={[
                        { label: 'TRAFFIC', value: result.policyA.impact.traffic },
                        { label: 'ECONOMY', value: result.policyA.impact.economy },
                        { label: 'ECOLOGY', value: result.policyA.impact.environment },
                        { label: 'SENTIMENT', value: result.policyA.impact.sentiment }
                     ]} dataB={[
                        { value: result.policyB.impact.traffic },
                        { value: result.policyB.impact.economy },
                        { value: result.policyB.impact.environment },
                        { value: result.policyB.impact.sentiment }
                     ]} />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                     <div>
                        <h4 className="font-mono text-[10px] tracking-[0.15em] text-[#8A8A93] uppercase mb-4 border-b border-[#222226] pb-2 truncate">{titleA}</h4>
                        <div className="space-y-3">
                           <ImpactCard title="Traffic" value={result.policyA.impact.traffic} compact />
                           <ImpactCard title="Economy" value={result.policyA.impact.economy} compact />
                           <ImpactCard title="Ecology" value={result.policyA.impact.environment} compact />
                        </div>
                     </div>
                     <div>
                        <h4 className="font-mono text-[10px] tracking-[0.15em] text-[#8A8A93] uppercase mb-4 border-b border-[#222226] pb-2 truncate">{titleB}</h4>
                        <div className="space-y-3">
                           <ImpactCard title="Traffic" value={result.policyB.impact.traffic} compact />
                           <ImpactCard title="Economy" value={result.policyB.impact.economy} compact />
                           <ImpactCard title="Ecology" value={result.policyB.impact.environment} compact />
                        </div>
                     </div>
                  </div>
               </div>
            )}
          </div>
        </section>

        {/* PANEL 3: MICRO FEEDBACK */}
        <section className="w-full lg:w-[420px] shrink-0 bg-[#131316] border border-[#222226] rounded-xl flex flex-col h-full overflow-shadow-2xl shadow-2xl">
          <div className="p-8 h-full flex flex-col">
            
            <header className="mb-8 border-b border-[#222226] pb-6">
              <h2 className="font-mono text-[10px] tracking-[0.2em] text-[#8A8A93] uppercase mb-3">Micro Architecture</h2>
              <h3 className="text-xl font-light tracking-tight text-[#E4E4E7]">Stakeholder Output</h3>
            </header>

            <div className="flex-1 overflow-y-auto pr-2 pb-6 flex flex-col">
               {!result && !debateResult && !debateLoading && (
                  <div className="flex-grow flex flex-col items-center justify-center opacity-40">
                     <div className="font-mono text-[10px] tracking-widest text-[#71717A] uppercase mb-4">Stream Offline</div>
                     <div className="w-16 h-px bg-[#3F3F46]"></div>
                  </div>
               )}

               {debateLoading && (
                  <div className="flex-grow flex flex-col items-center justify-center">
                     <p className="font-mono text-[10px] text-[#71717A] tracking-widest uppercase animate-pulse">Compiling Node Responses...</p>
                  </div>
               )}

               {/* Render Standard Simulation Feedback */}
               {result && !result.policyA && (
                  <div className="space-y-4 animate-fade-in">
                     {result.stakeholders.map((sh, idx) => (
                        <StakeholderCard key={idx} role={sh.role} message={sh.reaction} />
                     ))}
                  </div>
               )}

               {/* Render Compare Feedback */}
               {result && result.policyA && (
                  <div className="flex flex-col gap-8 animate-fade-in">
                     <div>
                        <span className="font-mono text-[9px] bg-[#1C1C20] px-2 py-1 rounded text-[#8A8A93] uppercase tracking-widest border border-[#2A2A30] mb-3 inline-block">Variant A Context</span>
                        <div className="space-y-3">
                           {result.policyA.stakeholders.map((sh, idx) => (
                              <StakeholderCard key={`A-${idx}`} role={sh.role} message={sh.reaction} compact />
                           ))}
                        </div>
                     </div>
                     <div>
                        <span className="font-mono text-[9px] bg-[#1C1C20] px-2 py-1 rounded text-[#8A8A93] uppercase tracking-widest border border-[#2A2A30] mb-3 inline-block">Variant B Context</span>
                        <div className="space-y-3">
                           {result.policyB.stakeholders.map((sh, idx) => (
                              <StakeholderCard key={`B-${idx}`} role={sh.role} message={sh.reaction} compact />
                           ))}
                        </div>
                     </div>
                  </div>
               )}

                {/* Render Live Debate Feedback */}
               {debateResult && !debateLoading && (
                  <LiveDebateStream debate={debateResult} />
               )}
            </div>
          </div>
        </section>

      </div>
      
      {/* 5. Save & Share Viral Modal Overlay */}
      {showSaveModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in text-[#E4E4E7]">
            <div className="bg-[#131316] border border-[#222226] p-8 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(59,74,107,0.3)] relative">
               <button onClick={() => setShowSaveModal(false)} className="absolute top-4 right-5 text-2xl text-[#71717A] hover:text-white transition-colors">&times;</button>
               <h3 className="font-mono text-[10px] tracking-widest text-[#8A8A93] uppercase mb-4 text-center">Protocol Achieved</h3>
               <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-4 bg-[#1C1C20] border border-indigo-500/50 pl-6 pr-2 py-2 rounded-xl mb-4 group hover:border-indigo-400 transition-colors">
                     <span className="text-3xl font-light tracking-widest text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                        {savedScenarioId}
                     </span>
                     <button 
                        onClick={() => {
                           navigator.clipboard.writeText(savedScenarioId);
                           setCopiedId(true);
                           setTimeout(() => setCopiedId(false), 2000);
                        }}
                        className={`px-4 py-2 rounded-lg font-mono text-[10px] tracking-widest uppercase transition-all ${copiedId ? 'bg-indigo-500 text-white' : 'bg-[#2A2A30] text-[#A1A1AA] hover:bg-[#3b4a6b] hover:text-white'}`}
                     >
                        {copiedId ? 'Copied ✓' : 'Copy ID'}
                     </button>
                  </div>
                  <h4 className="text-xl font-light">Simulation Matrix Captured.</h4>
               </div>
               
               <div className="bg-[#0A0A0B] p-5 rounded-lg border border-[#2A2A30] mb-6 font-mono text-[11px] text-[#A1A1AA] leading-relaxed relative hover:border-[#3b4a6b] transition-colors cursor-text selection:bg-[#3b4a6b]/30 break-words whitespace-pre-wrap">
{`🌍 UrbanPulse Scenario: [${savedScenarioId}]
🏙️ City: ${city}
📜 Policy: ${isCompareMode ? 'Variant Comparison' : (POLICY_LABELS[policy] || policy)}
📊 Health Score: ${result ? (isCompareMode ? 'N/A' : Math.round((result.impact?.traffic + result.impact?.economy + result.impact?.environment + result.impact?.sentiment) / 4)) : 0}/100

Outcome:
🚗 Traffic: ${isCompareMode ? 'Computed' : result?.impact?.traffic}/100
💰 Economy: ${isCompareMode ? 'Computed' : result?.impact?.economy}/100
🌱 Ecology: ${isCompareMode ? 'Computed' : result?.impact?.environment}/100
😊 Sentiment: ${isCompareMode ? 'Computed' : result?.impact?.sentiment}/100

🧠 Run your own simulation map at UrbanPulse.ai!`}
               </div>

               <button 
                  onClick={() => {
                     const isComp = isCompareMode; 
                     const text = `🌍 UrbanPulse Scenario: [${savedScenarioId}]\n🏙️ City: ${city}\n📜 Policy: ${isComp ? 'Variant Comparison' : (POLICY_LABELS[policy] || policy)}\n📊 Health Score: ${result ? (isComp ? 'N/A' : Math.round((result.impact?.traffic + result.impact?.economy + result.impact?.environment + result.impact?.sentiment) / 4)) : 0}/100\n\nOutcome:\n🚗 Traffic: ${isComp ? 'Computed' : result?.impact?.traffic}/100\n💰 Economy: ${isComp ? 'Computed' : result?.impact?.economy}/100\n🌱 Ecology: ${isComp ? 'Computed' : result?.impact?.environment}/100\n😊 Sentiment: ${isComp ? 'Computed' : result?.impact?.sentiment}/100\n\n🧠 Run your own simulation map at UrbanPulse.ai!`;
                     navigator.clipboard.writeText(text);
                     setCopiedFull(true);
                     setTimeout(() => setCopiedFull(false), 2000);
                  }} 
                  className={`w-full py-3.5 rounded-xl font-mono text-[12px] tracking-widest uppercase transition-all flex justify-center items-center gap-3 ${copiedFull ? 'bg-[#10b981] text-white shadow-[0_0_25px_rgba(16,185,129,0.6)]' : 'bg-[#10b981]/10 hover:bg-[#10b981]/20 border border-[#10b981]/50 text-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]'}`}
               >
                  <span className="text-sm">{copiedFull ? '✓' : '🚀'}</span> {copiedFull ? 'Matrix Copied!' : 'Share Complete Analysis'}
               </button>
            </div>
         </div>
      )}

    </>
  );
}

// ----- LANDING PAGE COMPONENT -----

function LandingPage({ onLaunch }) {
  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#E4E4E7] font-sans selection:bg-[#3b4a6b]/30 flex flex-col relative overflow-y-auto overflow-x-hidden">
      
      {/* 1. Mesmerizing Background Animation Suite */}
      <div className="fixed inset-0 z-0">
        <LivingBlueprint />
      </div>

      {/* 2. Sleek Navigation */}
      <nav className="w-full max-w-7xl mx-auto flex items-center justify-between p-6 lg:p-8 relative z-10 border-b border-white/5 animate-fade-in-up" style={{ animation: 'fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1)', animationFillMode: 'both' }}>
         <div className="flex items-center gap-4">
           <CityIcon />
           <span className="text-2xl font-medium tracking-widest text-[#E4E4E7] uppercase ml-2 pointer-events-none">UrbanPulse</span>
         </div>
         <div className="flex items-center gap-6">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#8A8A93] uppercase hidden md:block">Status <span className="text-emerald-500 ml-1">Online</span></span>
            <button onClick={onLaunch} className="font-mono text-[10px] tracking-widest uppercase bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded text-slate-300 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] shadow-lg hover:-translate-y-0.5">
               Terminal →
            </button>
         </div>
      </nav>

      {/* 3. Hero Typography */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 w-full max-w-5xl mx-auto text-center relative z-10 my-20 lg:my-32">
          <div className="font-mono text-[10px] tracking-[0.3em] text-indigo-300/80 uppercase mb-8 border border-indigo-500/20 bg-indigo-500/5 px-5 py-2 rounded-full inline-flex items-center gap-3 backdrop-blur-sm" style={{ animation: 'fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1)', animationFillMode: 'both' }}>
             <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
             Make smarter decisions before they shape your city.
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-[#8A8A93] max-w-4xl leading-[1.05] mb-8" style={{ animation: 'fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) 100ms', animationFillMode: 'both' }}>
             Architect the Future <br className="hidden md:block"/> of Your City.
          </h1>
          <p className="text-lg md:text-xl text-[#8A8A93] max-w-2xl font-light leading-relaxed mb-14" style={{ animation: 'fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) 200ms', animationFillMode: 'both' }}>
             Harness neural networking to structurally predict the exact outcome of civic policies. Watch traffic, economy, and citizen sentiment adapt to your inputs in <span className="text-slate-300 font-medium tracking-wide">real-time</span>.
          </p>
          <button onClick={onLaunch} className="group relative bg-[#0A0A0B] border border-indigo-500/30 hover:border-indigo-400/60 rounded-xl px-12 py-5 overflow-hidden transition-all duration-500 shadow-[0_0_30px_rgba(59,74,107,0.2)] hover:shadow-[0_0_50px_rgba(99,102,241,0.4)]" style={{ animation: 'fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) 300ms', animationFillMode: 'both' }}>
             <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-transparent group-hover:from-indigo-600/20 transition-all duration-500"></div>
             <span className="relative flex items-center gap-4 font-mono text-[11px] tracking-[0.2em] text-[#E4E4E7] uppercase font-semibold">
                Initialize System
                <span className="w-5 h-px bg-indigo-400 group-hover:w-8 transition-all duration-300 relative"><span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-r border-t border-indigo-400 rotate-45"></span></span>
             </span>
          </button>
      </main>

      {/* NEW: Intro & How it Works Sequence */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-24 relative z-10" style={{ animation: 'fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) 400ms', animationFillMode: 'both' }}>
          
          {/* What is UrbanPulse */}
          <div className="mb-20 text-center flex flex-col items-center">
             <h2 className="font-mono text-[12px] tracking-[0.3em] text-[#E4E4E7] uppercase mb-6 flex items-center gap-3">
                <span className="hidden md:block w-12 h-px bg-indigo-500/50"></span>
                What is UrbanPulse?
                <span className="hidden md:block w-12 h-px bg-indigo-500/50"></span>
             </h2>
             <p className="text-xl md:text-2xl text-[#A1A1AA] max-w-3xl font-light leading-relaxed">
                UrbanPulse is an AI-powered decision simulator that helps you explore how city policies impact traffic, economy, environment, and people. <br/><br/>
                <span className="text-[#E4E4E7]">Instead of guessing outcomes, you can simulate, compare, and understand decisions before they are implemented.</span>
             </p>
          </div>

          {/* Grid Layout for How it Works & Why Useful */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
             
             {/* How it works */}
             <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 hover:border-indigo-500/30 rounded-3xl p-8 lg:p-10 shadow-2xl transition-colors duration-500">
                 <h3 className="font-mono text-[11px] tracking-[0.2em] text-[#8A8A93] uppercase mb-8 flex items-center gap-3">
                    <span className="text-indigo-400 text-lg">⚡</span> How it Works
                 </h3>
                 <div className="space-y-6">
                    {[
                       "Select your city and conditions",
                       "Choose or create a policy",
                       "Run the simulation",
                       "Explore impact, debate, and future outcomes"
                    ].map((step, i) => (
                       <div key={i} className="flex items-start gap-4 group">
                          <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5 group-hover:bg-indigo-500 group-hover:text-white transition-colors">{i+1}</div>
                          <p className="text-[15px] text-slate-300 font-light group-hover:text-white transition-colors">{step}</p>
                       </div>
                    ))}
                 </div>
             </div>

             {/* Why it's useful */}
             <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 hover:border-emerald-500/30 rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden transition-colors duration-500">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none"></div>
                 <h3 className="font-mono text-[11px] tracking-[0.2em] text-[#8A8A93] uppercase mb-8 flex items-center gap-3">
                    <span className="text-emerald-400 text-lg">🎯</span> Why use this?
                 </h3>
                 <div className="space-y-5">
                    {[
                       "Understand trade-offs between different decisions",
                       "See how policies affect real people",
                       "Compare multiple strategies",
                       "Explore long-term impact before acting"
                    ].map((item, i) => (
                       <div key={i} className="flex items-start gap-4 group">
                          <div className="text-emerald-500/70 mt-0.5 group-hover:text-emerald-400 transition-colors">✔️</div>
                          <p className="text-[15px] text-slate-300 font-light leading-snug group-hover:text-white transition-colors">{item}</p>
                       </div>
                    ))}
                 </div>
             </div>

          </div>
      </section>

      {/* 4. Bento Box UX */}
      <section className="w-full max-w-6xl mx-auto px-6 pb-32 relative z-10" style={{ animation: 'fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) 450ms', animationFillMode: 'both' }}>
         <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto md:auto-rows-[1fr]">
            
            {/* Box 1 (Wide) */}
            <div className="md:col-span-8 bg-gradient-to-br from-[#121214] to-[#0A0A0B] border border-white/5 hover:border-white/10 rounded-3xl p-8 lg:p-12 relative overflow-hidden group transition-all duration-500 shadow-xl flex flex-col justify-end min-h-[250px] hover:-translate-y-1">
               <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none bg-[radial-gradient(circle_at_right_center,rgba(99,102,241,0.5),transparent_70%)]"></div>
               <div className="font-mono text-3xl mb-6 opacity-60">📊</div>
               <h3 className="text-xl font-light tracking-wide text-slate-200 mb-3">Macro Analytics Vector</h3>
               <p className="text-[#8A8A93] text-[15px] leading-relaxed max-w-sm font-light">Generate structural charts instantly. Watch traffic efficiency, ecological health, and economy react dynamically to every policy change.</p>
            </div>

            {/* Box 2 (Square) */}
            <div className="md:col-span-4 bg-[#121214] border border-white/5 hover:border-white/10 rounded-3xl p-8 lg:p-10 relative overflow-hidden group transition-all duration-500 shadow-xl flex flex-col min-h-[250px] hover:-translate-y-1">
               <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 pointer-events-none">🧠</div>
               <div className="font-mono text-3xl mb-6 opacity-60">🧠</div>
               <h3 className="text-xl font-light tracking-wide text-slate-200 mb-3">Neural Feedback</h3>
               <p className="text-[#8A8A93] text-[15px] leading-relaxed font-light mt-auto">Watch virtual citizens and businesses fiercely debate your proposed policies in real-time.</p>
            </div>

            {/* Box 3 (Square) */}
            <div className="md:col-span-4 bg-[#121214] border border-white/5 hover:border-white/10 rounded-3xl p-8 lg:p-10 relative overflow-hidden group transition-all duration-500 shadow-xl flex flex-col min-h-[250px] hover:-translate-y-1">
               <div className="font-mono text-3xl mb-6 opacity-60">⏳</div>
               <h3 className="text-xl font-light tracking-wide text-slate-200 mb-3">Temporal Constraint</h3>
               <p className="text-[#8A8A93] text-[15px] leading-relaxed font-light mt-auto">Slide the temporal bounds from 1 to 10 years to extrapolate compounding structural outcomes.</p>
            </div>

            {/* Box 4 (Wide) */}
            <div className="md:col-span-8 bg-[#121214] border border-white/5 hover:border-white/10 hover:bg-[#151518] rounded-3xl p-8 lg:p-12 relative flex items-center gap-8 overflow-hidden group transition-all duration-500 shadow-xl min-h-[250px] hover:-translate-y-1">
               <div className="flex-1">
                  <div className="font-mono text-3xl mb-6 opacity-60">🌍</div>
                  <h3 className="text-xl font-light tracking-wide text-slate-200 mb-3">Global Matrix Integration</h3>
                  <p className="text-[#8A8A93] text-[15px] leading-relaxed font-light">Custom parametric injection allows you to dictate structural inputs like baseline density, smog levels, and total vehicular traffic prior to simulation execution.</p>
               </div>
               <div className="hidden md:flex flex-col gap-3 w-1/3 opacity-30 group-hover:opacity-70 transition-opacity">
                  <div className="h-1.5 bg-white/20 rounded w-full"></div>
                  <div className="h-1.5 bg-white/20 rounded w-4/5"></div>
                  <div className="h-1.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] rounded w-3/4"></div>
                  <div className="h-1.5 bg-white/20 rounded w-5/6"></div>
               </div>
            </div>

         </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-10 text-center relative z-10" style={{ animation: 'fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) 600ms', animationFillMode: 'both' }}>
         <p className="font-mono text-[9px] tracking-[0.2em] text-[#52525B] uppercase">© 2026 UrbanPulse Systems Framework. All rights reserved.</p>
      </footer>
    </div>
  );
}

// ----- ARCHITECTURAL COMPONENTS -----

function ArchitecturalRadar({ data }) {
  const chartData = data.map(d => ({ subject: d.label, A: d.value, fullMark: 100 }));
  
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
        <defs>
          <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <PolarGrid stroke="#222226" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717A', fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.15em' }} />
        <Radar 
           name="Impact Vector" 
           dataKey="A" 
           stroke="#4f46e5" 
           fill="#4f46e5" 
           fillOpacity={0.35} 
           strokeWidth={2} 
           filter="url(#radarGlow)"
           animationBegin={100}
           animationDuration={1500}
           animationEasing="ease-out"
        />
        <Tooltip 
           contentStyle={{ backgroundColor: '#18181B', border: '1px solid #2A2A30', borderRadius: '8px' }}
           itemStyle={{ color: '#E4E4E7', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.1em' }}
           labelStyle={{ display: 'none' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function CompareRadar({ dataA, dataB }) {
  const chartData = dataA.map((d, i) => ({ 
    subject: d.label, 
    A: d.value, 
    B: dataB[i].value, 
    fullMark: 100 
  }));
  
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
        <PolarGrid stroke="#222226" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717A', fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.15em' }} />
        <Radar name="Variant A" dataKey="A" stroke="#3b4a6b" fill="#3b4a6b" fillOpacity={0.6} strokeWidth={2} />
        <Radar name="Variant B" dataKey="B" stroke="#52525B" fill="#52525B" fillOpacity={0.5} strokeWidth={2} />
        <Tooltip 
           contentStyle={{ backgroundColor: '#18181B', border: '1px solid #2A2A30', borderRadius: '8px' }}
           itemStyle={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.1em' }}
           labelStyle={{ display: 'none' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function LiveDebateStream({ debate }) {
  const [visibleCount, setVisibleCount] = useState(0);

  const handleTypingComplete = () => {
     if (visibleCount < debate.length - 1) {
       setTimeout(() => setVisibleCount(v => v + 1), 1000); 
     }
  };

  useEffect(() => { setVisibleCount(0); }, [debate]);

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in pb-4">
       <div className="mb-2 font-mono text-[9px] tracking-[0.2em] text-center text-[#3b4a6b] uppercase border border-[#3b4a6b]/30 bg-[#3b4a6b]/5 py-2 rounded">
          Stream Sequence Initialized
       </div>
       
       {debate.slice(0, visibleCount + 1).map((msg, idx) => (
          <ArchitecturalDebateBubble 
            key={idx} 
            msg={msg} 
            isLast={idx === visibleCount}
            onTypingComplete={handleTypingComplete} 
          />
       ))}

       {visibleCount < debate.length - 1 && (
          <div className="self-center mt-4 flex items-center gap-3 bg-[#18181B] border border-[#222226] px-5 py-2.5 rounded-lg shadow-inner">
             <span className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#71717A] rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-[#71717A] rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></span>
                <span className="w-1.5 h-1.5 bg-[#71717A] rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
             </span>
             <span className="font-mono text-[9px] text-[#71717A] uppercase tracking-widest">Incoming Data...</span>
          </div>
       )}
    </div>
  );
}

function ArchitecturalDebateBubble({ msg, isLast, onTypingComplete }) {
  const isCitizen = msg.role === 'Citizen';
  const isBusiness = msg.role === 'Business Owner';
  
  const alignmentClass = isCitizen ? "self-start w-[90%]" : isBusiness ? "self-end w-[90%]" : "self-center w-[95%]";
  const textAlignment = isCitizen ? "text-left" : isBusiness ? "text-right" : "text-left lg:text-center";
  const flexDir = isBusiness ? "flex-row-reverse" : "flex-row";

  return (
    <div className={`flex flex-col gap-2 ${alignmentClass} animate-fade-in group`}>
       <div className={`flex items-center gap-3 mb-1 ${flexDir}`}>
          <div className="w-6 h-6 rounded border border-[#2A2A30] flex justify-center items-center bg-[#1C1C20] text-[10px]">
             {isCitizen ? '👤' : isBusiness ? '🏢' : '🌱'}
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A8A93] group-hover:text-slate-300 transition-colors">
             {msg.role}
          </span>
       </div>
       <div className={`bg-[#18181B] border border-[#222226] p-5 rounded-xl ${isCitizen ? 'rounded-tl-sm border-l-[#3b4a6b]/60' : isBusiness ? 'rounded-tr-sm border-r-[#52525B]/60' : 'border-t-[#10b981]/30'}`}>
          <p className={`text-[#A1A1AA] font-normal leading-relaxed text-[13px] ${textAlignment}`}>
             {isLast ? (
                <TypewriterText text={msg.message} onComplete={onTypingComplete} />
             ) : (
                msg.message
             )}
          </p>
       </div>
    </div>
  );
}

function TypewriterText({ text, onComplete }) {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let index = 0;
    setDisplayedText(""); 
    const interval = setInterval(() => {
      setDisplayedText((prev) => text.substring(0, index + 1));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 20); 
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}</span>;
}

function ImpactCard({ title, value, prevValue, compact = false }) {
  let colorClass = "text-[#E4E4E7]";
  let borderClass = "border-[#222226]";
  let shadowClass = "";
  
  if (value < 40) {
     colorClass = "text-rose-500";
     borderClass = "border-rose-500/40";
     shadowClass = "shadow-[0_0_15px_rgba(244,63,94,0.15)]";
  } else if (value < 70) {
     colorClass = "text-amber-400";
     borderClass = "border-amber-400/40";
     shadowClass = "shadow-[0_0_15px_rgba(251,191,36,0.1)]";
  } else {
     colorClass = "text-emerald-400";
     borderClass = "border-emerald-400/40";
     shadowClass = "shadow-[0_0_15px_rgba(52,211,153,0.15)]";
  }

  let trendIndicator = null;
  if (prevValue !== undefined && prevValue !== null) {
     if (value > prevValue) {
        trendIndicator = <span className="text-sm font-bold text-emerald-400 ml-1">↑</span>;
     } else if (value < prevValue) {
        trendIndicator = <span className="text-sm font-bold text-rose-500 ml-1">↓</span>;
     } else {
        trendIndicator = <span className="text-sm font-bold text-[#71717A] ml-1">—</span>;
     }
  }

  return (
    <div className={`bg-[#18181B] border ${borderClass} rounded-xl flex flex-col justify-between transition-all duration-500 ${shadowClass} hover:brightness-110 ${compact ? 'p-4' : 'p-6 h-32'}`}>
      <div className="font-mono text-[9px] tracking-widest text-[#71717A] uppercase mb-4">{title}</div>
      <div className="flex items-center gap-1">
        <span className={`${compact ? 'text-2xl' : 'text-3xl'} font-medium tracking-tight ${colorClass}`}>{value}</span>
        {trendIndicator}
      </div>
    </div>
  );
}

function StakeholderCard({ role, message, compact = false }) {
  return (
    <div className={`bg-[#18181B] border border-[#222226] ${compact ? 'p-4 rounded-lg' : 'p-5 rounded-xl'} hover:border-[#2A2A30] transition-colors relative overflow-hidden group`}>
      <div className="flex justify-between items-center mb-3">
         <span className={`font-mono ${compact ? 'text-[9px]' : 'text-[10px]'} bg-[#242428] text-[#8A8A93] px-2 py-0.5 rounded uppercase tracking-widest group-hover:text-slate-300 transition-colors`}>
            {role}
         </span>
         {!compact && <span className="font-mono text-[10px] text-[#3F3F46]">OUTPUT</span>}
      </div>
      <p className={`text-[#A1A1AA] font-normal leading-relaxed ${compact ? 'text-[13px]' : 'text-[14px]'}`}>
         {message}
      </p>
    </div>
  );
}

const LOADING_PHASES = [
  "Establishing secure neural handshake...",
  "Parsing parametric constraints...",
  "Running predictive regression models...",
  "Calculating ecological impact vectors...",
  "Compiling chronological matrix...",
  "Finalizing executive summary..."
];

function ProfessionalLoader() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev < LOADING_PHASES.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex-grow flex flex-col items-center justify-center animate-fade-in relative z-10 my-16">
       
       {/* High-Trust Concentric Ring Core */}
       <div className="relative w-16 h-16 flex items-center justify-center mb-8">
          <div className="absolute inset-0 rounded-full border border-[#2A2A30]"></div>
          <div className="absolute inset-0 rounded-full border-t border-r border-[#4f46e5] animate-spin drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]" style={{ animationDuration: '2s', animationTimingFunction: 'linear' }}></div>
          
          <div className="absolute inset-1.5 rounded-full border border-[#2A2A30]"></div>
          <div className="absolute inset-1.5 rounded-full border-b border-l border-[#10b981] animate-spin drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" style={{ animationDuration: '3s', animationDirection: 'reverse', animationTimingFunction: 'linear' }}></div>
          
          <div className="absolute w-1.5 h-1.5 bg-[#E4E4E7] rounded-full drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>
       </div>

       {/* Title */}
       <h3 className="font-mono text-[11px] tracking-[0.2em] text-[#E4E4E7] uppercase mb-5 font-semibold text-center drop-shadow-sm">
          Processing Matrix
       </h3>

       {/* Sweeping Linear Bar */}
       <div className="w-full max-w-[240px] h-px bg-[#222226] relative overflow-hidden mb-6">
          <div className="absolute left-0 top-0 h-full w-2/3 bg-gradient-to-r from-transparent via-[#4f46e5] to-transparent animate-[sweep_1.8s_ease-in-out_infinite]"></div>
       </div>

       <style>{`
          @keyframes sweep {
            0% { transform: translateX(-150%); }
            100% { transform: translateX(200%); }
          }
       `}</style>

       {/* Phase Text */}
       <div className="h-5 relative w-full overflow-hidden flex justify-center items-center">
          <p 
            key={phase} 
            className="font-mono text-[9px] text-[#A1A1AA] tracking-widest uppercase animate-fade-in-up absolute text-center w-full"
          >
            {LOADING_PHASES[phase]}
          </p>
       </div>
    </div>
  );
}
