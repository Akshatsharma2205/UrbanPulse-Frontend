import { useState, useEffect, useRef } from 'react';
import CityIcon from './CityIcon';

function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const start = performance.now();
    const duration = 1500;
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

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 transition-opacity duration-700 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent_50%)]"></div>
      
      <div className="relative flex flex-col items-center mb-12 animate-fade-in">
        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
          <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-full animate-[spin_3s_linear_infinite]"></div>
          <div className="absolute inset-2 border-2 border-cyan-500/30 rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
          <CityIcon />
        </div>
        <h1 className="text-3xl font-bold font-outfit text-slate-50 tracking-wide mb-2">CitySimulation</h1>
        <p className="text-emerald-400 text-sm font-medium tracking-widest uppercase">Initializing Core Engines...</p>
      </div>

      <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
        <div 
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function LandingPage({ onLaunch }) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-inter relative overflow-hidden">
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}
      
      {/* Background Mesh Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-600/20 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-600/20 blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <CityIcon />
          <span className="font-outfit text-xl font-bold tracking-wide">CitySimulation</span>
        </div>
        <button 
          onClick={onLaunch} 
          className="px-6 py-2.5 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 backdrop-blur-md transition-all duration-300 font-medium text-sm text-slate-200 hover:text-white hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          Launch Dashboard →
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Next-Gen Urban Planning
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold font-outfit leading-tight mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          Architect the Future of <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Your City</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed font-light animate-fade-in" style={{ animationDelay: '200ms' }}>
          Harness the power of AI to predict the exact outcomes of civic policies—traffic, economy, ecology, and public sentiment—before they are ever implemented.
        </p>

        <button 
          onClick={onLaunch}
          className="group relative px-8 py-4 bg-slate-50 text-slate-900 rounded-full font-semibold text-lg hover:bg-white transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-fade-in flex items-center gap-3 overflow-hidden"
          style={{ animationDelay: '300ms' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          Initialize System
          <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
        </button>
      </section>

      {/* Features Bento Box */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-8 md:col-span-2 group">
            <div className="text-4xl mb-6">📊</div>
            <h3 className="text-2xl font-semibold font-outfit mb-3 text-slate-100">Macro Analytics Vector</h3>
            <p className="text-slate-400 font-light leading-relaxed">
              Generate structural radar charts instantly. Traffic efficiency, ecological health, economy & sentiment — scored 0–100 with predictive precision.
            </p>
          </div>
          
          <div className="glass-card p-8 group">
            <div className="text-4xl mb-6">🧠</div>
            <h3 className="text-2xl font-semibold font-outfit mb-3 text-slate-100">Live AI Debate</h3>
            <p className="text-slate-400 font-light leading-relaxed">
              Citizens, Business Owners & Environmentalists debate your policy live.
            </p>
          </div>

          <div className="glass-card p-8 group">
            <div className="text-4xl mb-6">⏳</div>
            <h3 className="text-2xl font-semibold font-outfit mb-3 text-slate-100">10-Year Forecast</h3>
            <p className="text-slate-400 font-light leading-relaxed">
              Temporal pathways from Year 1 disruption through Year 10 structural transformation.
            </p>
          </div>

          <div className="glass-card p-8 md:col-span-2 group">
            <div className="text-4xl mb-6">🔀</div>
            <h3 className="text-2xl font-semibold font-outfit mb-3 text-slate-100">Policy Comparison Matrix</h3>
            <p className="text-slate-400 font-light leading-relaxed">
              Run two policies simultaneously. Get an AI judge recommendation based on your budget, priority, and risk settings.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 py-8 text-center">
        <p className="text-slate-500 text-sm font-medium tracking-wide">
          © 2026 CitySimulation Systems. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
