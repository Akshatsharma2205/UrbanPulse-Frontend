import { useState, useEffect, useRef } from 'react';
import { TourProvider, useTour } from '@reactour/tour';
import CityIcon from './CityIcon';
import LivingBlueprint from './LivingBlueprint';
import LandingPage from './LandingPage';
import SimulationWizard from './SimulationWizard';
import MasterPlanMode from './MasterPlanMode';
import {
  ImpactCard, ArchitecturalRadar, CompareRadar,
  AnimatedTimeline, TypewriterSummary,
  ProfessionalLoader, StakeholderCard, LiveDebateStream,
  CityVitalsPanel, PolicyHeatMatrix,
} from './AnalyticsComponents';

const POLICY_LABELS = {
  "add_metro": "Add Metro Line",
  "add_park": "Develop Green Park",
  "remove_parking": "Remove Parking Spaces",
  "increase_tax": "Increase Corporate Tax",
  "build_highway": "Build Inter-City Highway",
  "subsidize_ev": "Subsidize Electric Vehicles",
  "custom": "Custom Policy"
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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
  const [showHeatMatrix, setShowHeatMatrix] = useState(false);
  const [showMasterPlan, setShowMasterPlan] = useState(false);

  const [loadId, setLoadId] = useState('');
  
  const [localHistory, setLocalHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('UP_HISTORY');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [debateResult, setDebateResult] = useState(null);
  const [debateLoading, setDebateLoading] = useState(false);

  // Mobile tab navigation
  const [activeTab, setActiveTab] = useState('config');

  // Auto-switch to analytics tab when results arrive
  useEffect(() => {
    if (result && !loading) setActiveTab('analytics');
  }, [result, loading]);

  // Auto-switch to stakeholders tab when debate arrives
  useEffect(() => {
    if (debateResult && !debateLoading) setActiveTab('stakeholders');
  }, [debateResult, debateLoading]);

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

    const url = isCompareMode ? `${API_BASE_URL}/api/compare` : `${API_BASE_URL}/api/simulate`;
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
      const response = await fetch(`${API_BASE_URL}/api/debate`, {
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
        
      const response = await fetch(`${API_BASE_URL}/api/save`, {
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
      const response = await fetch(`${API_BASE_URL}/api/scenario/${formattedId}`);
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
        @keyframes tabSlideUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
      
      <div className="min-h-screen lg:h-screen w-full bg-[#0A0A0B] text-[#E4E4E7] font-sans selection:bg-[#3b4a6b]/30 p-4 lg:p-6 flex flex-col lg:flex-row gap-6 overflow-y-auto lg:overflow-hidden animate-fade-in pb-20 lg:pb-6">
        
        {/* ════ PANEL 1: SIMULATION WIZARD ════ */}
        <div className={activeTab === 'config' ? 'contents lg:contents' : 'hidden lg:contents'}>
        <SimulationWizard
          city={city} setCity={setCity}
          population={population} setPopulation={setPopulation}
          trafficLevel={trafficLevel} setTrafficLevel={setTrafficLevel}
          pollutionLevel={pollutionLevel} setPollutionLevel={setPollutionLevel}
          timeHorizon={timeHorizon} setTimeHorizon={setTimeHorizon}
          budget={budget} setBudget={setBudget}
          priority={priority} setPriority={setPriority}
          riskLevel={riskLevel} setRiskLevel={setRiskLevel}
          policy={policy} setPolicy={setPolicy}
          customPolicy={customPolicy} setCustomPolicy={setCustomPolicy}
          isCompareMode={isCompareMode} setIsCompareMode={(v) => { setIsCompareMode(v); setResult(null); setDebateResult(null); setError(null); }}
          policyB={policyB} setPolicyB={setPolicyB}
          customPolicyB={customPolicyB} setCustomPolicyB={setCustomPolicyB}
          onSimulate={handleSimulate}
          onDebate={handleDebate}
          loading={loading}
          debateLoading={debateLoading}
          loadId={loadId} setLoadId={setLoadId}
          onLoad={handleLoadScenario}
          localHistory={localHistory}
          onLoadHistory={executeLoad}
          onGoLanding={() => setCurrentView('landing')}
        />
        </div>

        {/* ════ PANEL 2: MACRO ANALYTICS ════ */}
        <section className={`impact-section flex-1 bg-[#131316] border border-[#222226] rounded-xl flex flex-col lg:h-full lg:overflow-y-auto shadow-2xl ${
          activeTab === 'analytics' ? 'flex' : 'hidden'
        } lg:flex`}>
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
                 <div className="text-right flex flex-col items-end gap-3">
                   <div>
                     <p className="font-mono text-[10px] text-[#52525B] tracking-widest uppercase">Target Locale</p>
                     <p className="font-medium text-[15px]">{city}</p>
                   </div>
                   {/* Policy Matrix button */}
                   <button
                     onClick={() => setShowHeatMatrix(true)}
                     className="font-mono text-[10px] tracking-widest text-amber-400 border border-amber-500/40 hover:bg-amber-500/15 px-3 py-1.5 rounded-full uppercase transition-all flex items-center gap-2 shadow-[0_0_10px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                   >
                     <span className="text-[13px]">🗺️</span> Policy Matrix
                   </button>
                   {/* Master Plan Mode — Preview */}
                   <button
                     onClick={() => setShowMasterPlan(true)}
                     className="font-mono text-[10px] tracking-widest text-violet-400 border border-violet-500/40 hover:bg-violet-500/15 px-3 py-1.5 rounded-full uppercase transition-all flex items-center gap-2 shadow-[0_0_10px_rgba(139,92,246,0.15)] hover:shadow-[0_0_24px_rgba(139,92,246,0.4)]"
                   >
                     <span className="text-[13px]">🗺️</span> Master Plan
                     <span className="text-[7px] bg-violet-500 text-white px-1.5 py-0.5 rounded tracking-widest">PREVIEW</span>
                   </button>
                 </div>
            </header>

            {error && (
               <div className="mb-8 p-4 bg-rose-950/20 border border-rose-900/50 rounded-lg font-mono text-xs text-rose-400">
                  <span className="uppercase tracking-widest font-bold mr-2">Error:</span> {error}
               </div>
            )}

            {!result && !loading && (
              <CityVitalsPanel
                city={city}
                population={population}
                trafficLevel={trafficLevel}
                pollutionLevel={pollutionLevel}
                timeHorizon={timeHorizon}
              />
            )}

            {loading && <ProfessionalLoader />}

            {result && !result.policyA && !loading && (
              <div className="flex-grow flex flex-col animate-fade-in">
                
                {/* AI Trade-Off Summary — typewriter */}
                {result.tradeoffSummary && (
                  <TypewriterSummary text={result.tradeoffSummary} label="AI Trade-off Analysis" accent="#3b4a6b" />
                )}
                
                {/* City Evolution Timeline — staggered animation */}
                {result.evolution && result.evolution.length > 0 && (
                  <AnimatedTimeline evolution={result.evolution} />
                )}

                {/* Macro Cards — count-up + stagger + progress bar */}
                <h4 className="font-mono text-[10px] tracking-[0.15em] text-[#8A8A93] uppercase mb-4">Core Metrics</h4>
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <ImpactCard index={0} title="Traffic Index" value={result.impact.traffic} prevValue={previousResult?.impact?.traffic} />
                  <ImpactCard index={1} title="Economic Index" value={result.impact.economy} prevValue={previousResult?.impact?.economy} />
                  <ImpactCard index={2} title="Ecology Index" value={result.impact.environment} prevValue={previousResult?.impact?.environment} />
                  <ImpactCard index={3} title="Public Sentiment" value={result.impact.sentiment} prevValue={previousResult?.impact?.sentiment} />
                </div>

                {/* Radar — draw from centre + rotating ring + pulsing score */}
                <div className="mb-4 px-4 bg-[#0A0A0B] py-6 rounded-xl border border-[#1C1C20] shadow-inner">
                   <ArchitecturalRadar data={[
                     { label: 'TRAFFIC',   value: result.impact.traffic },
                     { label: 'ECONOMY',   value: result.impact.economy },
                     { label: 'ECOLOGY',   value: result.impact.environment },
                     { label: 'SENTIMENT', value: result.impact.sentiment },
                   ]} />
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

                  <div className="mb-10 px-4 bg-[#0A0A0B] py-6 rounded-xl border border-[#1C1C20] shadow-inner">
                     <div className="flex justify-center gap-8 mb-4 font-mono text-[10px] tracking-widest uppercase">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[#3b4a6b]"></div> Variant A</span>
                        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[#52525B]"></div> Variant B</span>
                     </div>
                     <CompareRadar dataA={[
                        { label: 'TRAFFIC',   value: result.policyA.impact.traffic },
                        { label: 'ECONOMY',   value: result.policyA.impact.economy },
                        { label: 'ECOLOGY',   value: result.policyA.impact.environment },
                        { label: 'SENTIMENT', value: result.policyA.impact.sentiment },
                     ]} dataB={[
                        { value: result.policyB.impact.traffic },
                        { value: result.policyB.impact.economy },
                        { value: result.policyB.impact.environment },
                        { value: result.policyB.impact.sentiment },
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

        {/* ════ PANEL 3: MICRO FEEDBACK ════ */}
        <section className={`w-full lg:w-[420px] shrink-0 bg-[#131316] border border-[#222226] rounded-xl flex flex-col lg:h-full overflow-hidden shadow-2xl ${
          activeTab === 'stakeholders' ? 'flex' : 'hidden'
        } lg:flex`}>
          <div className="p-8 flex flex-col min-h-0 h-full">
            
            <header className="mb-8 border-b border-[#222226] pb-6">
              <h2 className="font-mono text-[10px] tracking-[0.2em] text-[#8A8A93] uppercase mb-3">Micro Architecture</h2>
              <h3 className="text-xl font-light tracking-tight text-[#E4E4E7]">Stakeholder Output</h3>
            </header>

            <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-6 flex flex-col">
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

      {/* ════ MOBILE BOTTOM TAB BAR (hidden on desktop) ════ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex"
        style={{
          background: 'rgba(10,10,11,0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}>
        {[
          { id: 'config',       label: 'Config',      icon: '⚙️',  accent: '#6366f1', badge: false },
          { id: 'analytics',    label: 'Analytics',   icon: '📊',  accent: '#10b981', badge: !!(result && !loading) },
          { id: 'stakeholders', label: 'Stakeholders',icon: '🗣️',  accent: '#3b82f6', badge: !!(debateResult && !debateLoading) },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, paddingTop: 10, paddingBottom: 14,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer',
              position: 'relative',
              borderTop: activeTab === tab.id ? `2px solid ${tab.accent}` : '2px solid transparent',
              transition: 'border-color 0.2s',
            }}
          >
            {/* Badge dot */}
            {tab.badge && (
              <span style={{
                position: 'absolute', top: 6, right: 'calc(50% - 18px)',
                width: 6, height: 6, borderRadius: '50%',
                background: tab.accent,
                boxShadow: `0 0 6px ${tab.accent}`,
              }} />
            )}
            <span style={{ fontSize: 18, lineHeight: 1 }}>{tab.icon}</span>
            <span style={{
              fontFamily: 'ui-monospace,monospace', fontSize: 9,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: activeTab === tab.id ? tab.accent : '#52525b',
              transition: 'color 0.2s',
            }}>{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* Master Plan Mode — full screen overlay */}
      {showMasterPlan && (
        <MasterPlanMode onClose={() => setShowMasterPlan(false)} />
      )}

      {/* Heat Matrix Modal */}
      {showHeatMatrix && (
        <PolicyHeatMatrix
          onClose={() => setShowHeatMatrix(false)}
          onSimulate={(policyKey) => {
            setPolicy(policyKey);
            setShowHeatMatrix(false);
            // Small delay so state settles before simulation fires
            setTimeout(() => handleSimulate(), 50);
          }}
        />
      )}

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
                        {copiedId ? 'Copied âœ“' : 'Copy ID'}
                     </button>
                  </div>
                  <h4 className="text-xl font-light">Simulation Matrix Captured.</h4>
               </div>
               
               <div className="bg-[#0A0A0B] p-5 rounded-lg border border-[#2A2A30] mb-6 font-mono text-[11px] text-[#A1A1AA] leading-relaxed relative hover:border-[#3b4a6b] transition-colors cursor-text selection:bg-[#3b4a6b]/30 break-words whitespace-pre-wrap">
{`ðŸŒ UrbanPulse Scenario: [${savedScenarioId}]
ðŸ™ï¸ City: ${city}
ðŸ“œ Policy: ${isCompareMode ? 'Variant Comparison' : (POLICY_LABELS[policy] || policy)}
ðŸ“Š Health Score: ${result ? (isCompareMode ? 'N/A' : Math.round((result.impact?.traffic + result.impact?.economy + result.impact?.environment + result.impact?.sentiment) / 4)) : 0}/100

Outcome:
ðŸš— Traffic: ${isCompareMode ? 'Computed' : result?.impact?.traffic}/100
ðŸ’° Economy: ${isCompareMode ? 'Computed' : result?.impact?.economy}/100
ðŸŒ± Ecology: ${isCompareMode ? 'Computed' : result?.impact?.environment}/100
ðŸ˜Š Sentiment: ${isCompareMode ? 'Computed' : result?.impact?.sentiment}/100

ðŸ§  Run your own simulation map at UrbanPulse.ai!`}
               </div>

               <button 
                  onClick={() => {
                     const isComp = isCompareMode; 
                     const text = `ðŸŒ UrbanPulse Scenario: [${savedScenarioId}]\nðŸ™ï¸ City: ${city}\nðŸ“œ Policy: ${isComp ? 'Variant Comparison' : (POLICY_LABELS[policy] || policy)}\nðŸ“Š Health Score: ${result ? (isComp ? 'N/A' : Math.round((result.impact?.traffic + result.impact?.economy + result.impact?.environment + result.impact?.sentiment) / 4)) : 0}/100\n\nOutcome:\nðŸš— Traffic: ${isComp ? 'Computed' : result?.impact?.traffic}/100\nðŸ’° Economy: ${isComp ? 'Computed' : result?.impact?.economy}/100\nðŸŒ± Ecology: ${isComp ? 'Computed' : result?.impact?.environment}/100\nðŸ˜Š Sentiment: ${isComp ? 'Computed' : result?.impact?.sentiment}/100\n\nðŸ§  Run your own simulation map at UrbanPulse.ai!`;
                     navigator.clipboard.writeText(text);
                     setCopiedFull(true);
                     setTimeout(() => setCopiedFull(false), 2000);
                  }} 
                  className={`w-full py-3.5 rounded-xl font-mono text-[12px] tracking-widest uppercase transition-all flex justify-center items-center gap-3 ${copiedFull ? 'bg-[#10b981] text-white shadow-[0_0_25px_rgba(16,185,129,0.6)]' : 'bg-[#10b981]/10 hover:bg-[#10b981]/20 border border-[#10b981]/50 text-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]'}`}
               >
                  <span className="text-sm">{copiedFull ? 'âœ“' : 'ðŸš€'}</span> {copiedFull ? 'Matrix Copied!' : 'Share Complete Analysis'}
               </button>
            </div>
         </div>
      )}

    </>
  );
}

