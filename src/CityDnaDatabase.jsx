import React, { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

export default function CityDnaDatabase({ initialCity = null, onClose }) {
  const [profiles, setProfiles] = useState([]);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle Esc key
    const h = e => { if(e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_MASTERPLAN_API_URL || 'https://urbanpulse-backend-2.onrender.com';
      const res = await fetch(`${API_URL}/api/masterplan/city-profile/all`);
      if(res.ok) {
        const data = await res.json();
        setProfiles(data);
        if(data.length > 0 && !selectedCity) {
          setSelectedCity(data[data.length - 1].city);
        }
      }
    } catch(err) {
      console.error("Failed to fetch DNA history:", err);
    } finally {
      setLoading(false);
    }
  };

  const activeProfile = profiles.find(p => p.city?.toLowerCase() === selectedCity?.toLowerCase()) || (profiles.length > 0 ? profiles[0] : null);

  const radarData = activeProfile ? [
    { subject: 'Liveability', A: activeProfile.characterScores?.liveability || 0 },
    { subject: 'Infrastructure', A: activeProfile.characterScores?.infrastructure || 0 },
    { subject: 'Governance', A: activeProfile.characterScores?.governance || 0 },
    { subject: 'Resilience', A: activeProfile.characterScores?.resilience || 0 },
  ] : [];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: '#0a0a0c', color: '#e4e4e7',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
      animation: 'mpFadeIn 0.3s ease'
    }}>
      <style>{`
        @keyframes mpFadeIn { from { opacity:0; transform:translateY(10px) scale(0.99); } to { opacity:1; transform:none; } }
      `}</style>
      
      {/* Top Navigation */}
      <div style={{
        height: 64, borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 24,
        background: 'rgba(0,0,0,0.5)', padding: '0 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🧬</span>
          <div>
            <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8b5cf6' }}>City DNA Database</div>
            <div style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Intelligence Archive</div>
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#e4e4e7', padding: '6px 16px', borderRadius: 8, cursor: 'pointer',
          fontFamily: 'ui-monospace,monospace', fontSize: 11, letterSpacing: '0.1em', transition: 'all 0.2s'
        }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
          ✕ Close Archive
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Sidebar History */}
        <div style={{
          width: 300, borderRight: '1px solid rgba(255,255,255,0.08)', background: '#0f1117',
          display: 'flex', flexDirection: 'column', overflowY: 'auto'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>Cached Profiles</div>
            <button onClick={fetchProfiles} style={{
              width: '100%', background: 'transparent', border: '1px solid #3b82f6', color: '#60a5fa',
              padding: '6px', borderRadius: 6, cursor: 'pointer', fontSize: 11, transition: 'all 0.2s'
            }}>⟳ Refresh DB</button>
          </div>
          
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#52525b', fontSize: 12 }}>Loading archive...</div>
            ) : profiles.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#52525b', fontSize: 12 }}>No models cached. Run a Master Plan simulation first.</div>
            ) : (
              profiles.map((p, idx) => {
                const isSelected = activeProfile && activeProfile.city === p.city;
                return (
                  <div key={idx} onClick={() => setSelectedCity(p.city)} style={{
                    padding: '14px 16px', background: isSelected ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isSelected ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.05)'}`,
                    borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: isSelected ? '#a78bfa' : '#e4e4e7', marginBottom: 4 }}>{p.city}</div>
                    <div style={{ display: 'flex', gap: 6, fontSize: 10, textTransform: 'uppercase', color: '#71717a' }}>
                      <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>{p.densityCategory}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Main Interface */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px', background: 'radial-gradient(ellipse at 50% -20%, rgba(139,92,246,0.05), transparent 60%)' }}>
          {!activeProfile ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52525b' }}>
               Select a city profile from the archive to view detailed DNA.
            </div>
          ) : (
            <div style={{ maxWidth: 900, margin: '0 auto', animation: 'mpFadeIn 0.4s ease' }}>
              
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 24, marginBottom: 32 }}>
                <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8b5cf6', marginBottom: 8 }}>Isolated Extract</div>
                <h1 style={{ fontSize: 42, fontWeight: 300, tracking: '-0.02em', margin: '0 0 16px 0', color: '#fff' }}>{activeProfile.city}</h1>
                <div style={{ fontSize: 18, color: '#e4e4e7', fontStyle: 'italic', position: 'relative', paddingLeft: 16, borderLeft: '3px solid #8b5cf6', lineHeight: 1.6 }}>
                  "{activeProfile.cityVerdict}"
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 32, marginBottom: 32 }}>
                
                {/* Attributes Box */}
                <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
                  <h3 style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#a1a1aa', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 12, marginBottom: 16 }}>Macro Classifications</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Density Topology</div>
                      <div style={{ fontSize: 16, color: '#6366f1', textTransform: 'capitalize' }}>{activeProfile.densityCategory}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Economic Driver</div>
                      <div style={{ fontSize: 16, color: '#10b981', textTransform: 'capitalize' }}>{activeProfile.economicProfile}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Geographic Hazard</div>
                      <div style={{ fontSize: 16, color: '#ef4444', textTransform: 'capitalize' }}>{activeProfile.geographicRisk}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Ext. Transit Quality</div>
                      <div style={{ fontSize: 16, color: '#f59e0b' }}>{activeProfile.existingTransitQuality} <span style={{fontSize:12, color:'#71717a'}}>/100</span></div>
                    </div>
                  </div>
                </div>

                {/* Radar Box */}
                <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#a1a1aa', alignSelf: 'flex-start', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 12, marginBottom: 16 }}>Character Signature</h3>
                  <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 9, fontFamily: 'monospace' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name={activeProfile.city} dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Policy Intelligence */}
              <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
                 <h3 style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#a1a1aa', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 12, marginBottom: 20 }}>Policy Interference Vectors</h3>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)', gap: 24 }}>
                   
                   <div>
                     <div style={{ fontSize: 11, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{fontSize: 16}}>⇈</span> High Return (Quick Wins)</div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                       {activeProfile.quickWins?.map(p => (
                         <div key={p} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '8px 12px', borderRadius: 6, fontSize: 13, color: '#d1fae5' }}>{p.replace(/_/g, ' ').toUpperCase()}</div>
                       ))}
                     </div>
                   </div>

                   <div>
                     <div style={{ fontSize: 11, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{fontSize: 16}}>⇊</span> Friction Surfaces (Resistance)</div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                       {activeProfile.politicalResistance?.map(p => (
                         <div key={p} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 12px', borderRadius: 6, fontSize: 13, color: '#fee2e2' }}>{p.replace(/_/g, ' ').toUpperCase()}</div>
                       ))}
                     </div>
                   </div>

                   <div>
                     <div style={{ fontSize: 11, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{fontSize: 16}}>⚠</span> Toxicity Flags (Warning)</div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                       {activeProfile.warningFlags?.map(p => (
                         <div key={p} style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '8px 12px', borderRadius: 6, fontSize: 13, color: '#fef3c7' }}>{p.replace(/_/g, ' ').toUpperCase()}</div>
                       ))}
                     </div>
                   </div>

                 </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
