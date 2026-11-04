"use client";
import React, { useState } from "react";
import { audioManager } from "../utils/audio"; // IMPORT AUDIO MANAGER

export default function Stage3({ onWin, onBackToMap }: { onWin: () => void, onBackToMap: () => void }) {
  const [showClue, setShowClue] = useState(false);
  // JAWABAN BENAR: Total = 448
  const targetVolume = 448;

  const [d1, setD1] = useState(0); 
  const [d2, setD2] = useState(0); 
  const [d3, setD3] = useState(0); 

  const [errorState, setErrorState] = useState<'none' | 'low' | 'high'>('none');
  const [isCleared, setIsCleared] = useState(false);

  const changeDigit = (setter: React.Dispatch<React.SetStateAction<number>>, current: number, delta: number) => {
    audioManager?.playSfx('dial-click', 0.5); // SFX BUNYI BRANKAS/DIAL
    let next = current + delta;
    if (next > 9) next = 0;
    if (next < 0) next = 9;
    setter(next);
  };

  const handleTuangMagma = () => {
    const inputVolume = (d1 * 100) + (d2 * 10) + d3;
    
    audioManager?.playSfx('lava-pour'); // SFX MAGMA DITUANG

    if (inputVolume === targetVolume) {
      setTimeout(() => {
        audioManager?.playSfx('ice-shatter'); // SFX ES HANCUR SAAT MENANG
        setIsCleared(true);
        onWin();
      }, 1000); // Jeda sedikit agar suara lava terdengar dulu
    } else if (inputVolume < targetVolume) {
      setTimeout(() => {
        audioManager?.playSfx('error-buzz');
        setErrorState('low');
        setTimeout(() => setErrorState('none'), 3000);
      }, 800);
    } else {
      setTimeout(() => {
        audioManager?.playSfx('boss-explode', 0.6); // Suara ledakan ringan karena kelebihan dosis
        setErrorState('high');
        setTimeout(() => setErrorState('none'), 3000);
      }, 800);
    }
  };

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center z-10 overflow-hidden transition-colors duration-1000 
      ${errorState === 'low' ? 'bg-cyan-950' : errorState === 'high' ? 'bg-red-950' : 'bg-transparent'}`
    }>
      <img src="/puncak-salju.png" className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 pointer-events-none
        ${errorState === 'low' ? 'opacity-30 blur-[2px] sepia-[0.5] hue-rotate-180' : errorState === 'high' ? 'opacity-40 mix-blend-color-burn' : 'opacity-60'}`} 
        alt="Puncak Salju" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-950 via-cyan-950/80 to-black/60 pointer-events-none"></div>

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
              <p>Monolit Es Abadi menghalangi jalan. Cairkan dengan tepat!</p>
              <ul className="list-disc pl-5 space-y-2 text-cyan-300">
                <li><strong>V. Balok (Bawah):</strong> Panjang × Lebar × Tinggi</li>
                <li><strong>V. Limas (Atas):</strong> ⅓ × Luas Alas × Tinggi</li>
                <li>Hitung total gabungan volumenya. Dosis magma harus 100% presisi.</li>
              </ul>
            </div>
            <button onClick={() => { audioManager?.playSfx('ui-click'); setShowClue(false); }} className="mt-8 w-full bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 rounded-xl border-b-4 border-amber-900 active:border-b-0 active:translate-y-1 transition-all">Tutup &amp; Lanjutkan</button>
          </div>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none opacity-50 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-[pulse_4s_infinite]"></div>

      <div className="relative z-20 flex flex-col items-center max-w-6xl w-full pt-4 h-full justify-center pb-8 px-4">
        
        {isCleared ? (
          <div className="bg-orange-900/90 p-10 border-4 border-orange-500 text-center rounded-xl animate-in zoom-in-150 duration-1000 shadow-[0_0_80px_rgba(249,115,22,0.8)] backdrop-blur-md">
            <h1 className="text-5xl md:text-6xl text-white font-black mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">ES MENCAIR!</h1>
            <p className="text-xl md:text-2xl text-orange-200 mb-8 font-bold">
              Kalkulasi Sempurna! <br/>
              <span className="text-white bg-black/50 px-4 py-2 rounded-lg mt-2 inline-block">Balok (320) + Limas (128) = 448 m³</span>
            </p>
            <button onClick={() => { audioManager?.playSfx('ui-click'); onBackToMap(); }} className="bg-orange-600 text-white font-black text-2xl px-12 py-4 rounded-full border-b-4 border-orange-800 hover:bg-orange-500 active:translate-y-1 active:border-b-0 transition-all shadow-[0_0_20px_rgba(249,115,22,0.6)] uppercase tracking-wider">
              Lanjut ke Peta ▶
            </button>
          </div>
        ) : (
          <>
            {/* HEADER STAGE */}
            <div className={`p-4 rounded-xl border-2 text-center shadow-lg backdrop-blur-md w-full max-w-4xl transition-colors mb-6 z-30
              ${errorState === 'low' ? 'bg-cyan-900/80 border-cyan-400' : errorState === 'high' ? 'bg-red-900/80 border-red-500' : 'bg-stone-900/90 border-cyan-500'}`
            }>
              <h1 className="text-amber-500 font-black text-lg md:text-xl tracking-widest mb-1 uppercase">Stage 3: Geometri Spasial</h1>
              <p className="text-stone-300 text-xs md:text-sm mt-1">
                Hitung total volume <strong className="text-cyan-300">Monolit Es Abadi</strong> dengan presisi sempurna.
              </p>
            </div>

            {/* ERROR NOTIFICATION - Muncul di atas jika salah */}
            <div className="h-10 mb-4 z-30 flex justify-center w-full">
              {errorState === 'low' && (
                <div className="bg-cyan-900/90 border-2 border-cyan-300 text-cyan-100 px-6 py-2 rounded-full text-sm md:text-base font-black animate-in slide-in-from-top-2 shadow-[0_0_20px_rgba(34,211,238,0.8)]">
                  ❄️ Dosis Kurang! Magma membeku termakan es abadi.
                </div>
              )}
              {errorState === 'high' && (
                <div className="bg-red-900/90 border-2 border-red-400 text-red-100 px-6 py-2 rounded-full text-sm md:text-base font-black animate-in slide-in-from-top-2 shadow-[0_0_20px_rgba(248,113,113,0.8)]">
                  💥 DOSIS BERLEBIH! Magma meledak tak terkendali!
                </div>
              )}
            </div>

            {/* LAYOUT KIRI-KANAN (SIDE-BY-SIDE) */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 lg:gap-24 w-full max-w-5xl">
              
              {/* KIRI: VISUALISASI MONOLIT ES */}
              <div className={`relative flex items-center justify-center transition-transform duration-700
                ${errorState === 'low' ? 'scale-105' : errorState === 'high' ? 'animate-[shake_0.5s_infinite]' : ''}`
              }>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-[60px] pointer-events-none"></div>
                
                <svg viewBox="0 0 240 300" className="w-[260px] h-[325px] md:w-[320px] md:h-[400px] drop-shadow-[0_0_20px_rgba(34,211,238,0.7)] z-10">
                  <polyline points="50,250 120,230 190,250" fill="none" stroke="#0891b2" strokeWidth="2" strokeDasharray="5 5" opacity="0.6" />
                  <line x1="120" y1="230" x2="120" y2="160" stroke="#0891b2" strokeWidth="2" strokeDasharray="5 5" opacity="0.6" />
                  <line x1="120" y1="160" x2="120" y2="40" stroke="#0891b2" strokeWidth="2" strokeDasharray="5 5" opacity="0.6" />
                  
                  <polygon points="50,250 120,270 190,250 190,180 120,200 50,180" fill="rgba(34,211,238,0.15)" stroke="#22d3ee" strokeWidth="3" />
                  <line x1="120" y1="270" x2="120" y2="200" stroke="#22d3ee" strokeWidth="3" />
                  <polygon points="50,180 120,200 190,180 120,160" fill="rgba(34,211,238,0.25)" stroke="#67e8f9" strokeWidth="2" />
                  
                  <polygon points="50,180 120,200 120,40" fill="rgba(34,211,238,0.3)" stroke="#a5f3fc" strokeWidth="3" />
                  <polygon points="120,200 190,180 120,40" fill="rgba(34,211,238,0.4)" stroke="#a5f3fc" strokeWidth="3" />

                  <text x="65" y="275" fill="#cffafe" fontSize="14" fontWeight="bold" className="drop-shadow-md">8m (p)</text>
                  <text x="145" y="275" fill="#cffafe" fontSize="14" fontWeight="bold" className="drop-shadow-md">8m (l)</text>
                  <text x="15" y="220" fill="#cffafe" fontSize="14" fontWeight="bold" className="drop-shadow-md">5m (t)</text>
                  
                  <line x1="120" y1="160" x2="210" y2="160" stroke="#cffafe" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="120" y1="40" x2="210" y2="40" stroke="#cffafe" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="205" y1="40" x2="205" y2="160" stroke="#fde047" strokeWidth="2" />
                  <text x="212" y="105" fill="#fde047" fontSize="14" fontWeight="bold" className="drop-shadow-md">6m</text>
                </svg>
              </div>

              {/* KANAN: MESIN TUNGKU MAGMA */}
              <div className="w-full max-w-[360px] bg-stone-900/90 p-6 md:p-8 rounded-3xl border-4 border-stone-700 shadow-[0_0_40px_rgba(0,0,0,0.8)] z-30 flex flex-col items-center gap-6">
                
                <div className="flex justify-center gap-2 items-center mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-150"></div>
                </div>

                <h2 className="text-center text-orange-500 font-black text-xl uppercase tracking-widest leading-tight">Tungku Magma</h2>
                
                <div className="flex gap-3 p-4 bg-black/80 border-4 border-stone-800 rounded-2xl shadow-inner w-full justify-center">
                  {/* Digit 1 (Ratusan) */}
                  <div className="flex flex-col items-center bg-stone-800 border-2 border-stone-600 rounded-xl overflow-hidden shadow-lg">
                    <button onClick={() => changeDigit(setD1, d1, 1)} className="w-14 h-10 bg-stone-700 hover:bg-orange-500 text-stone-300 hover:text-white text-xl flex items-center justify-center transition-colors">▲</button>
                    <div className="w-14 h-16 flex items-center justify-center text-4xl font-black text-amber-500 bg-black/90 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]">{d1}</div>
                    <button onClick={() => changeDigit(setD1, d1, -1)} className="w-14 h-10 bg-stone-700 hover:bg-orange-500 text-stone-300 hover:text-white text-xl flex items-center justify-center transition-colors">▼</button>
                  </div>
                  {/* Digit 2 (Puluhan) */}
                  <div className="flex flex-col items-center bg-stone-800 border-2 border-stone-600 rounded-xl overflow-hidden shadow-lg">
                    <button onClick={() => changeDigit(setD2, d2, 1)} className="w-14 h-10 bg-stone-700 hover:bg-orange-500 text-stone-300 hover:text-white text-xl flex items-center justify-center transition-colors">▲</button>
                    <div className="w-14 h-16 flex items-center justify-center text-4xl font-black text-amber-500 bg-black/90 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]">{d2}</div>
                    <button onClick={() => changeDigit(setD2, d2, -1)} className="w-14 h-10 bg-stone-700 hover:bg-orange-500 text-stone-300 hover:text-white text-xl flex items-center justify-center transition-colors">▼</button>
                  </div>
                  {/* Digit 3 (Satuan) */}
                  <div className="flex flex-col items-center bg-stone-800 border-2 border-stone-600 rounded-xl overflow-hidden shadow-lg">
                    <button onClick={() => changeDigit(setD3, d3, 1)} className="w-14 h-10 bg-stone-700 hover:bg-orange-500 text-stone-300 hover:text-white text-xl flex items-center justify-center transition-colors">▲</button>
                    <div className="w-14 h-16 flex items-center justify-center text-4xl font-black text-amber-500 bg-black/90 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]">{d3}</div>
                    <button onClick={() => changeDigit(setD3, d3, -1)} className="w-14 h-10 bg-stone-700 hover:bg-orange-500 text-stone-300 hover:text-white text-xl flex items-center justify-center transition-colors">▼</button>
                  </div>
                </div>

                <button 
                  onClick={handleTuangMagma}
                  disabled={errorState !== 'none'}
                  className="w-full h-16 md:h-20 rounded-2xl font-black text-2xl transition-all duration-200 bg-red-700 text-white border-b-8 border-red-900 hover:bg-red-600 active:border-b-0 active:translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2 uppercase tracking-widest mt-2"
                >
                  <span>🔥 TUANG</span>
                  <span className="text-sm opacity-80">( m³ )</span>
                </button>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
