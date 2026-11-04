"use client";
import React, { useState } from "react";
import { audioManager } from "../utils/audio"; // IMPORT AUDIO MANAGER

export default function Stage4({ onWin, onBackToMap }: { onWin: () => void, onBackToMap: () => void }) {
  const [showClue, setShowClue] = useState(false);
  const maxLives = 3;
  
  const phases = [
    { targetAngle: 30, labelX: "90 m", labelY: "30√3 m", w: 180, h: 180 * Math.tan(30 * (Math.PI / 180)) },
    { targetAngle: 60, labelX: "42 m", labelY: "42√3 m", w: 120, h: 120 * Math.tan(60 * (Math.PI / 180)) }
  ];

  const [currentPhase, setCurrentPhase] = useState(0);
  const [lives, setLives] = useState(maxLives);
  const [angleInput, setAngleInput] = useState(0);
  
  const [firingState, setFiringState] = useState<'idle' | 'firing' | 'success' | 'fail'>('idle');
  const [isCleared, setIsCleared] = useState(false);

  const phaseData = phases[currentPhase];

  const handleTembak = () => {
    if (firingState !== 'idle') return;
    
    setFiringState('firing');
    audioManager?.playSfx('cannon-fire'); // SFX MERIAM DITEMBAKKAN
    setTimeout(() => { audioManager?.playSfx('rope-zip'); }, 200); // SFX TALI MELUNCUR

    setTimeout(() => {
      // EVALUASI JAWABAN
      if (angleInput === phaseData.targetAngle) {
        audioManager?.playSfx('metal-clang'); // SFX JANGKAR MENANCAP
        setFiringState('success');
        
        setTimeout(() => {
          if (currentPhase === 0) {
            setCurrentPhase(1);
            setAngleInput(0);
            setFiringState('idle');
          } else {
            setIsCleared(true);
            onWin();
          }
        }, 2000);

      } else {
        audioManager?.playSfx('error-buzz'); // SFX TALI JATUH/SALAH
        setFiringState('fail');
        const newLives = lives - 1;
        setLives(newLives);
        
        setTimeout(() => {
          if (newLives <= 0) {
            setCurrentPhase(0);
            setLives(maxLives);
          }
          setAngleInput(0);
          setFiringState('idle');
        }, 2000);
      }
    }, 800); 
  };

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center z-10 overflow-hidden transition-colors duration-700 
      ${firingState === 'fail' ? 'bg-red-950' : 'bg-transparent'}`
    }>
      <img src="/lembah-angin.png" className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 pointer-events-none 
        ${firingState === 'fail' ? 'opacity-30 mix-blend-multiply' : 'opacity-80'}`} 
        alt="Lembah" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-orange-950 via-orange-950/80 to-black/60 pointer-events-none"></div>

      {/* UI TOMBOL NAVIGASI & PETUNJUK */}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <button onMouseEnter={() => audioManager?.playSfx('ui-hover', 0.5)} onClick={() => { audioManager?.playSfx('ui-click'); onBackToMap(); }} className="bg-stone-800/80 hover:bg-red-700 text-stone-200 text-xs md:text-sm font-bold px-3 py-2 rounded-lg border-2 border-stone-600 hover:border-red-500 backdrop-blur-sm transition-all shadow-lg flex items-center gap-2">
          <span>◀</span> <span className="hidden md:inline">Peta</span>
        </button>
        <button onMouseEnter={() => audioManager?.playSfx('ui-hover', 0.5)} onClick={() => { audioManager?.playSfx('ui-click'); setShowClue(true); }} className="bg-stone-800/80 hover:bg-amber-600 text-stone-200 hover:text-white text-xs md:text-sm font-bold px-3 py-2 rounded-lg border-2 border-stone-600 hover:border-amber-400 backdrop-blur-sm transition-all shadow-lg flex items-center gap-2">
          <span>💡</span> <span className="hidden md:inline">Petunjuk</span>
        </button>
      </div>
      {/* MODAL PETUNJUK */}
      {showClue && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-stone-900 border-4 border-amber-600 rounded-2xl max-w-lg w-full p-6 shadow-[0_0_40px_rgba(245,158,11,0.4)] relative">
            <button onClick={() => { audioManager?.playSfx('ui-click'); setShowClue(false); }} className="absolute top-4 right-4 text-stone-400 hover:text-red-500 font-black text-xl">✕</button>
            <h2 className="text-2xl font-black text-amber-500 mb-4 flex items-center gap-2"><span>💡</span> Misi Alkemis</h2>
            <div className="text-stone-300 text-sm md:text-base space-y-3 font-medium">
              <p>Lembah Angin memisahkan tebing. Tembakkan jangkar ke seberang!</p>
              <ul className="list-disc pl-5 space-y-2 text-orange-300">
                <li><strong>Trigonometri:</strong> tan(θ) = Depan (y) ÷ Samping (x)</li>
                <li>Panduan Sudut:<br />tan(30°) = 1 / √3<br />tan(45°) = 1<br />tan(60°) = √3</li>
                <li>Sederhanakan rasio y/x milikmu untuk mendapatkan sudut yang tepat.</li>
              </ul>
            </div>
            <button onClick={() => { audioManager?.playSfx('ui-click'); setShowClue(false); }} className="mt-8 w-full bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 rounded-xl border-b-4 border-amber-900 active:border-b-0 active:translate-y-1 transition-all">Tutup &amp; Lanjutkan</button>
          </div>
        </div>
      )}

      <div className="relative z-20 flex flex-col items-center max-w-6xl w-full pt-4 h-full justify-center pb-8 px-4">
        
        {isCleared ? (
          <div className="bg-orange-900/90 p-10 border-4 border-orange-500 text-center rounded-xl animate-in zoom-in-150 duration-1000 shadow-[0_0_80px_rgba(249,115,22,0.8)] backdrop-blur-md">
            <h1 className="text-5xl md:text-6xl text-white font-black mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">ZIPLINE TERPASANG!</h1>
            <p className="text-xl md:text-2xl text-orange-200 mb-8 font-bold">
              Sudut Elevasi Tepat Sasaran! <br/>
              <span className="text-white bg-black/50 px-4 py-2 rounded-lg mt-2 inline-block">Jurang telah berhasil diseberangi.</span>
            </p>
            <button onClick={() => { audioManager?.playSfx('ui-click'); onBackToMap(); }} className="bg-orange-600 text-white font-black text-2xl px-12 py-4 rounded-full border-b-4 border-orange-800 hover:bg-orange-500 active:translate-y-1 active:border-b-0 transition-all shadow-[0_0_20px_rgba(249,115,22,0.6)] uppercase tracking-wider">
              Lanjut ke Peta ▶
            </button>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className={`p-4 rounded-xl border-2 text-center shadow-lg backdrop-blur-md w-full max-w-5xl transition-colors mb-6 z-30
              ${firingState === 'fail' ? 'bg-red-900/80 border-red-500' : 'bg-stone-900/90 border-orange-500'}`
            }>
              <div className="flex justify-between items-center px-4">
                <span className="text-white font-bold bg-black/50 px-3 py-1 rounded-full border border-orange-800">
                  FASE {currentPhase + 1} / 2
                </span>
                <h1 className="text-amber-500 font-black text-lg md:text-xl tracking-widest uppercase">Stage 4: Elevasi Kait</h1>
                <span className="text-white font-bold bg-black/50 px-3 py-1 rounded-full border border-orange-800 flex gap-1 items-center">
                  KABEL: {Array.from({length: maxLives}).map((_, i) => (
                    <span key={i} className={`text-lg ${i < lives ? "text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]" : "text-stone-700 opacity-30"}`}>⚡</span>
                  ))}
                </span>
              </div>
            </div>

            {/* ERROR NOTIFICATION */}
            <div className="h-8 mb-4 z-30 flex justify-center w-full">
              {firingState === 'fail' && (
                <div className="bg-red-900/90 border-2 border-red-400 text-red-100 px-6 py-1 rounded-full text-sm md:text-base font-black animate-in slide-in-from-top-2 shadow-[0_0_20px_rgba(239,68,68,0.8)]">
                  ❌ Meleset! Sudut salah, tali jatuh ke dasar jurang!
                </div>
              )}
              {firingState === 'success' && (
                <div className="bg-emerald-900/90 border-2 border-emerald-400 text-emerald-100 px-6 py-1 rounded-full text-sm md:text-base font-black animate-in slide-in-from-top-2 shadow-[0_0_20px_rgba(34,197,94,0.8)]">
                  ✅ Tepat Sasaran! Jangkar mengunci.
                </div>
              )}
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 w-full max-w-5xl">
              
              <div className="relative w-full max-w-[400px] aspect-square bg-sky-950/40 border-4 border-stone-800 rounded-3xl overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-md">
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(#38bdf8_1px,transparent_1px),linear-gradient(90deg,#38bdf8_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                
                <svg viewBox="0 0 350 350" className="w-full h-full drop-shadow-2xl z-10 relative">
                  <polygon points="0,350 50,350 50,300 0,300" fill="#292524" stroke="#57534e" strokeWidth="2"/>
                  <polygon points={`${50 + phaseData.w},350 350,350 350,${300 - phaseData.h} ${50 + phaseData.w},${300 - phaseData.h}`} fill="#292524" stroke="#57534e" strokeWidth="2"/>
                  
                  <line x1="50" y1="300" x2={50 + phaseData.w} y2="300" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 5" />
                  <line x1={50 + phaseData.w} y1="300" x2={50 + phaseData.w} y2={300 - phaseData.h} stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 5" />
                  
                  <polyline points={`${50 + phaseData.w - 15},300 ${50 + phaseData.w - 15},285 ${50 + phaseData.w},285`} fill="none" stroke="#38bdf8" strokeWidth="2"/>

                  <rect x={50 + phaseData.w/2 - 25} y="305" width="50" height="20" fill="rgba(0,0,0,0.6)" rx="4" />
                  <text x={50 + phaseData.w/2} y="319" fill="#bae6fd" fontSize="14" fontWeight="bold" textAnchor="middle">{phaseData.labelX}</text>
                  
                  <rect x={50 + phaseData.w + 8} y={300 - phaseData.h/2 - 10} width="65" height="20" fill="rgba(0,0,0,0.6)" rx="4" />
                  <text x={50 + phaseData.w + 12} y={300 - phaseData.h/2 + 4} fill="#bae6fd" fontSize="14" fontWeight="bold" textAnchor="start">{phaseData.labelY}</text>

                  <circle cx={50 + phaseData.w} cy={300 - phaseData.h} r="8" fill="#ef4444" className="animate-pulse shadow-xl"/>
                  <circle cx={50 + phaseData.w} cy={300 - phaseData.h} r="14" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-ping"/>

                  {(firingState !== 'idle') && (
                    <line 
                      x1="50" y1="300" 
                      x2="600" y2="300"
                      stroke={firingState === 'success' ? '#22c55e' : firingState === 'fail' ? '#ef4444' : '#fb923c'}
                      strokeWidth="4"
                      className="transition-all ease-out"
                      style={{
                        transformOrigin: '50px 300px',
                        transform: `rotate(-${angleInput}deg)`,
                        transitionDuration: '0.8s'
                      }}
                    />
                  )}

                  <circle cx="50" cy="300" r="10" fill="#f97316" />
                  <circle cx="50" cy="300" r="4" fill="#fff" />
                </svg>

                <div className="absolute top-4 left-4 bg-black/80 px-3 py-1 rounded-md text-xs text-cyan-300 font-bold border border-cyan-800 uppercase tracking-widest shadow-lg">
                  Radar Geometris
                </div>
              </div>

              <div className="w-full max-w-[400px] bg-stone-900/90 p-8 rounded-3xl border-4 border-stone-700 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-30 flex flex-col items-center">
                <h2 className="text-center text-orange-500 font-black text-xl uppercase tracking-widest mb-2">Panel Elevasi</h2>
                <p className="text-stone-400 text-xs text-center mb-6">Pilih sudut presisi untuk meluncurkan tali.</p>
                
                <div className="w-full bg-black/90 border-4 border-stone-600 rounded-2xl p-6 flex flex-col items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] mb-8">
                  <span className="text-stone-400 text-xs font-bold tracking-widest uppercase mb-2">Sudut Laras (θ)</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="0" max="90" 
                      value={angleInput}
                      onChange={(e) => setAngleInput(Number(e.target.value))}
                      disabled={firingState !== 'idle'}
                      className="bg-transparent text-6xl md:text-7xl font-black text-orange-500 text-center w-32 focus:outline-none drop-shadow-[0_0_10px_rgba(249,115,22,0.8)] disabled:opacity-80"
                    />
                    <span className="text-4xl font-black text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]">°</span>
                  </div>
                </div>

                <div className="w-full flex flex-col items-center mb-8">
                  <div className="w-full flex justify-between px-2 mb-2">
                    <span className="text-xs font-bold text-stone-500">0° (Datar)</span>
                    <span className="text-xs font-bold text-stone-500">90° (Tegak)</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="90" step="1" 
                    value={angleInput} 
                    onChange={(e) => setAngleInput(parseInt(e.target.value))} 
                    disabled={firingState !== 'idle'}
                    className="w-full h-4 bg-stone-800 rounded-full appearance-none cursor-pointer accent-orange-500 border-2 border-stone-600 disabled:opacity-50" 
                  />
                </div>

                <button 
                  onClick={handleTembak} 
                  disabled={firingState !== 'idle'}
                  className="w-full h-16 md:h-20 rounded-2xl font-black text-xl transition-all duration-200 bg-red-700 text-white border-b-8 border-red-900 hover:bg-red-600 active:border-b-0 active:translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(220,38,38,0.5)] flex items-center justify-center gap-3 uppercase tracking-widest"
                >
                  <span className="text-3xl">🚀</span>
                  <span>Luncurkan Kait</span>
                </button>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
