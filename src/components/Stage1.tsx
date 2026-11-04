"use client";
import React, { useState } from "react";
import { audioManager } from "../utils/audio"; // IMPORT AUDIO MANAGER

export default function Stage1({ onWin, onBackToMap }: { onWin: () => void, onBackToMap: () => void }) {
  const [showClue, setShowClue] = useState(false);
  // TARGET BARU: 61
  // Butuh 9 Slot (5 Angka + 4 Operator)
  const targetEnergy = 61;
  const maxSlots = 9;

  // Hanya 6 Opsi Angka (Sangat Sempit & Menantang)
  const availableNumbers = ["2", "3", "4", "5", "8", "12"];
  const availableOperators = ["+", "-", "×", "÷"];

  const [equation, setEquation] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);
  const [isCleared, setIsCleared] = useState(false);

  let currentEnergy = 0;
  if (equation.length > 0) {
    let validEq = [...equation];
    if (validEq.length % 2 === 0) validEq.pop(); 
    
    const str = validEq.join(" ").replace(/×/g, "*").replace(/÷/g, "/");
    try {
      const res = eval(str);
      currentEnergy = Math.round(res * 100) / 100; 
    } catch {
      currentEnergy = 0;
    }
  }

  const handleNumClick = (num: string) => {
    if (equation.length % 2 === 0 && equation.length < maxSlots && !equation.includes(num)) {
      audioManager?.playSfx('rock-drag'); // SFX MENGGESER BATU ANGKA
      const newEq = [...equation, num];
      setEquation(newEq);
      checkWinCondition(newEq);
    }
  };

  const handleOpClick = (op: string) => {
    if (equation.length % 2 !== 0 && equation.length < maxSlots && !equation.includes(op)) {
      audioManager?.playSfx('magic-poof'); // SFX MEMASANG OPERATOR SIHIR
      setEquation([...equation, op]);
    }
  };

  const handleUndo = () => {
    if (equation.length > 0 && !isError) {
      audioManager?.playSfx('ui-click'); // SFX KLIK BIASA
      setEquation(equation.slice(0, -1));
    }
  };

  const checkWinCondition = (eq: string[]) => {
    if (eq.length === maxSlots) {
      const str = eq.join(" ").replace(/×/g, "*").replace(/÷/g, "/");
      const res = Math.round(eval(str) * 100) / 100;
      
      if (res === targetEnergy) {
        setIsCleared(true);
        onWin(); // SUARA STAGE CLEAR SUDAH DI-HANDLE DI page.tsx
      } else {
        setIsError(true);
        audioManager?.playSfx('error-buzz'); // SFX ERROR KARENA SALAH RUMUS
        setTimeout(() => { 
          setIsError(false); 
          setEquation([]); 
        }, 1500);
      }
    }
  };

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center z-10 p-4 transition-colors duration-500 ${isError ? 'bg-red-950' : 'bg-transparent'}`}>
      <img src="/hutan-tercemar.png" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 pointer-events-none ${isError ? 'opacity-30 mix-blend-multiply' : 'opacity-60'}`} alt="Hutan" />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/80 to-black/70 pointer-events-none"></div>

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
              <p>Sungai kehidupan tercemar akar mematikan.</p>
              <ul className="list-disc pl-5 space-y-2 text-emerald-300">
                <li><strong>Target Energi:</strong> 61</li>
                <li>Susun 5 angka dan 4 operator menggunakan semua slot (Tiap elemen 1x pakai).</li>
                <li><strong>Hukum KABATAKU</strong> (Kali, Bagi, Tambah, Kurang) berlaku secara otomatis!</li>
              </ul>
            </div>
            <button onClick={() => { audioManager?.playSfx('ui-click'); setShowClue(false); }} className="mt-8 w-full bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 rounded-xl border-b-4 border-amber-900 active:border-b-0 active:translate-y-1 transition-all">Tutup &amp; Lanjutkan</button>
          </div>
        </div>
      )}

      <div className="relative z-20 flex flex-col items-center max-w-4xl w-full pt-2">
        {isCleared ? (
          <div className="bg-emerald-900/95 p-10 border-4 border-emerald-400 text-center rounded-xl animate-in zoom-in-150 duration-700 shadow-[0_0_50px_rgba(16,185,129,0.8)] mt-10 backdrop-blur-md">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-md">AKAR HANCUR!</h1>
            <p className="text-xl md:text-2xl text-emerald-200 mb-6">Rumusmu benar: <strong className="text-white bg-black/50 px-3 py-1 rounded">{equation.join(" ")} = {targetEnergy}</strong></p>
            <button onClick={() => { audioManager?.playSfx('ui-click'); onBackToMap(); }} className="bg-emerald-600 text-white font-bold text-2xl px-10 py-4 rounded-full border-b-4 border-emerald-800 hover:bg-emerald-500 active:translate-y-1 active:border-b-0 transition-all shadow-lg">
              Lanjut ke Peta ▶
            </button>
          </div>
        ) : (
          <>
            <div className={`p-4 rounded-xl border-2 text-center shadow-lg backdrop-blur-md w-full max-w-3xl transition-colors mb-2 ${isError ? 'bg-red-900/80 border-red-500' : 'bg-stone-900/90 border-emerald-500'}`}>
              <h1 className="text-amber-500 font-black text-lg md:text-xl tracking-widest mb-1 uppercase">Stage 1: Aritmatika</h1>
              <p className="text-stone-300 text-xs md:text-sm mt-1">
                Gunakan <span className="text-white font-bold">5 Angka</span> & <span className="text-white font-bold">4 Operator</span> untuk mencapai target.
                <br/>
                <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] md:text-xs bg-black/50 px-2 py-1 rounded mt-1 inline-block">Hukum KABATAKU Berlaku! Tiap elemen 1x pakai.</span>
              </p>
            </div>

            <div className="flex flex-row items-center justify-center gap-4 md:gap-16 my-2 w-full">
              <div className="flex flex-col items-center">
                <span className="text-emerald-400 font-bold tracking-widest text-[10px] md:text-xs mb-2 bg-black/80 px-3 py-1 rounded-full border border-emerald-800">TARGET AKHIR</span>
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-emerald-800 bg-black/60 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-sm">
                  <span className="text-4xl md:text-5xl font-black text-emerald-600/80">{targetEnergy}</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                <span className="text-3xl md:text-5xl text-emerald-900 font-black animate-pulse">▶</span>
                {isError && <span className="absolute top-1/2 -translate-y-1/2 text-2xl font-black text-red-500 animate-ping">❌</span>}
              </div>

              <div className="flex flex-col items-center">
                <span className="text-emerald-400 font-bold tracking-widest text-[10px] md:text-xs mb-2 bg-black/80 px-3 py-1 rounded-full border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]">HASIL SEMENTARA</span>
                <div className={`relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center rounded-full border-4 transition-all duration-300
                  ${isError ? 'bg-red-900 border-red-500 scale-110 shadow-[0_0_50px_rgba(220,38,38,0.8)]' : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900 to-black border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.8)]'}
                `}>
                  <div className="absolute inset-2 border-2 border-dashed border-emerald-400/50 rounded-full animate-[spin_10s_linear_infinite]"></div>
                  <span className={`text-4xl md:text-5xl font-black z-10 ${isError ? 'text-red-400 animate-pulse' : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,1)]'}`}>
                    {currentEnergy}
                  </span>
                </div>
              </div>
            </div>

            {/* 9 SLOT RUMUS */}
            <div className="flex flex-wrap justify-center items-center gap-1 md:gap-2 mb-4 bg-black/50 p-3 rounded-2xl border border-emerald-900/50 shadow-inner w-full max-w-3xl">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((slotIndex) => {
                const isOperatorSlot = slotIndex % 2 !== 0;
                const value = equation[slotIndex];
                
                return (
                  <div key={`slot-${slotIndex}`} className={`w-9 h-12 md:w-14 md:h-14 rounded-lg border-2 md:border-4 flex items-center justify-center transition-all ${value ? (isOperatorSlot ? 'bg-amber-600 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-emerald-800 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]') : 'bg-stone-900/60 border-stone-600/50 border-dashed'}`}>
                    {value ? (
                      <span className="text-lg md:text-2xl font-black text-white">{value}</span>
                    ) : (
                      <span className="text-stone-500 text-[9px] md:text-xs font-bold opacity-50 text-center leading-tight">
                        {isOperatorSlot ? 'Op' : 'Num'}
                      </span>
                    )}
                  </div>
                );
              })}
              
              <button 
                onClick={handleUndo} 
                disabled={equation.length === 0 || isError}
                className="w-12 h-12 md:w-14 md:h-14 ml-1 md:ml-2 rounded-lg bg-red-900/80 border-b-2 md:border-b-4 border-red-950 text-red-300 font-bold hover:bg-red-800 hover:text-white active:translate-y-1 active:border-b-0 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center text-[10px] md:text-xs text-center leading-tight"
              >
                Undo
              </button>
            </div>

            <div className="w-full max-w-3xl flex flex-col sm:flex-row gap-4">
              {/* OPSI 6 ANGKA */}
              <div className="flex-1 bg-stone-900/80 p-4 rounded-2xl border-2 border-emerald-800 backdrop-blur-md">
                <p className="text-center text-emerald-400 font-bold mb-3 uppercase tracking-widest text-[10px] md:text-sm">Pilih 5 Angka (1x Pakai)</p>
                <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                  {availableNumbers.map((num) => {
                    const isUsed = equation.includes(num);
                    const isTurn = equation.length % 2 === 0 && equation.length < maxSlots && !isError;

                    return (
                      <button 
                        key={`num-${num}`} 
                        disabled={isUsed || !isTurn}
                        onClick={() => handleNumClick(num)}
                        onMouseEnter={() => { if(!isUsed && isTurn) audioManager?.playSfx('ui-hover', 0.3) }}
                        className={`w-12 h-12 md:w-16 md:h-16 rounded-xl font-black text-xl md:text-2xl transition-all duration-200 
                          ${isUsed ? 'bg-stone-800 border-stone-900 text-stone-700 opacity-40 cursor-not-allowed scale-90' 
                          : !isTurn ? 'bg-stone-700 border-stone-800 text-stone-500 opacity-60 cursor-not-allowed'
                          : 'bg-stone-600 text-stone-100 border-b-4 border-stone-800 hover:bg-emerald-700 hover:border-emerald-900 hover:text-white active:border-b-0 active:translate-y-1 shadow-md cursor-pointer'}
                        `}
                      >
                        {num}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* OPSI 4 OPERATOR */}
              <div className="w-full sm:w-1/3 bg-stone-900/80 p-4 rounded-2xl border-2 border-amber-800 backdrop-blur-md">
                <p className="text-center text-amber-400 font-bold mb-3 uppercase tracking-widest text-[10px] md:text-sm">4 Operator (1x Pakai)</p>
                <div className="grid grid-cols-4 sm:grid-cols-2 gap-2">
                  {availableOperators.map((op) => {
                    const isUsed = equation.includes(op);
                    const isTurn = equation.length % 2 !== 0 && equation.length < maxSlots && !isError;

                    return (
                      <button 
                        key={`op-${op}`} 
                        disabled={isUsed || !isTurn}
                        onClick={() => handleOpClick(op)}
                        onMouseEnter={() => { if(!isUsed && isTurn) audioManager?.playSfx('ui-hover', 0.3) }}
                        className={`h-12 md:h-16 rounded-xl font-black text-2xl md:text-3xl transition-all duration-200 
                          ${isUsed ? 'bg-stone-800 border-stone-900 text-stone-700 opacity-40 cursor-not-allowed scale-90' 
                          : !isTurn ? 'bg-stone-700 border-stone-800 text-stone-500 opacity-60 cursor-not-allowed'
                          : 'bg-amber-700 text-white border-b-4 border-amber-900 hover:bg-amber-600 active:border-b-0 active:translate-y-1 shadow-md cursor-pointer'}
                        `}
                      >
                        {op}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
}
