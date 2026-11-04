"use client";
import React, { useState } from "react";
import { audioManager } from "../utils/audio"; // IMPORT AUDIO MANAGER

export default function Stage5({ onWin, onEndGame, onBackToMap }: { onWin: () => void, onEndGame: () => void, onBackToMap: () => void }) {
  const [showClue, setShowClue] = useState(false);
  const maxHP = 3;
  
  const phases = [
    { eq: "E(t) = -2t² + 16t", target: 4 },
    { eq: "E(t) = -5t² + 50t - 100", target: 5 },
    { eq: "E(t) = -2t² + 10t + 20", target: 2.5 }
  ];

  const [currentPhase, setCurrentPhase] = useState(0);
  const [playerHP, setPlayerHP] = useState(maxHP);
  const [bossHP, setBossHP] = useState(maxHP);
  const [inputT, setInputT] = useState<number | ''>('');
  
  const [battleState, setBattleState] = useState<'idle' | 'playerShoot' | 'bossHit' | 'reflect' | 'playerHit' | 'gameOver' | 'victory'>('idle');
  const [actionText, setActionText] = useState("");

  const phaseData = phases[currentPhase];

  const handleAttack = () => {
    if (battleState !== 'idle' || inputT === '') return;
    
    setBattleState('playerShoot');
    setActionText("MEMBIDIK TITIK PUNCAK...");
    audioManager?.playSfx('laser-shoot'); // SFX TEMBAKAN PEMAIN

    setTimeout(() => {
      // EVALUASI JAWABAN
      if (Number(inputT) === phaseData.target) {
        setBattleState('bossHit');
        setActionText("TEPAT SASARAN! PERISAI HANCUR!");
        audioManager?.playSfx('damage-hit'); // SFX BOS TERKENA DAMAGE
        
        setTimeout(() => {
          const newBossHP = bossHP - 1;
          setBossHP(newBossHP);
          
          if (newBossHP <= 0) {
            setBattleState('victory');
            setActionText("");
            audioManager?.playSfx('boss-explode'); // SFX BOS HANCUR!
          } else {
            setCurrentPhase(prev => prev + 1);
            setBattleState('idle');
            setInputT('');
            setActionText("");
          }
        }, 2000);

      } else {
        setBattleState('reflect');
        setActionText("SALAH! PERISAI BOS MEMANTULKANNYA!");
        audioManager?.playSfx('shield-deflect'); // SFX BOS MENANGKIS SERANGAN
        
        setTimeout(() => {
          setBattleState('playerHit');
          setActionText("TERKENA SERANGAN BALIK!");
          audioManager?.playSfx('damage-hit'); // SFX PEMAIN TERKENA DAMAGE
          
          const newPlayerHP = playerHP - 1;
          setPlayerHP(newPlayerHP);
          
          setTimeout(() => {
            if (newPlayerHP <= 0) {
              setBattleState('gameOver');
              setActionText("");
            } else {
              setBattleState('idle');
              setActionText("");
            }
          }, 2000);
        }, 1200);
      }
    }, 1200); 
  };

  const handleRetry = () => {
    audioManager?.playSfx('ui-click');
    setPlayerHP(maxHP);
    setBossHP(maxHP);
    setCurrentPhase(0);
    setInputT('');
    setBattleState('idle');
    setActionText("");
  };

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center z-10 overflow-hidden transition-colors duration-700 
      ${battleState === 'playerHit' || battleState === 'gameOver' ? 'bg-red-950' : battleState === 'victory' ? 'bg-amber-900' : 'bg-transparent'}`
    }>
      <img src="/sarang-magma.png" className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 pointer-events-none 
        ${(battleState === 'playerHit' || battleState === 'gameOver') ? 'opacity-30 mix-blend-multiply hue-rotate-30' : 'opacity-70'}`} 
        alt="Kawah Magma" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-red-950 via-red-950/80 to-black/80 pointer-events-none"></div>

      {/* UI TOMBOL NAVIGASI & PETUNJUK */}
      {battleState !== 'gameOver' && battleState !== 'victory' && (
        <div className="absolute top-4 left-4 z-50 flex gap-2">
          <button onMouseEnter={() => audioManager?.playSfx('ui-hover', 0.5)} onClick={() => { audioManager?.playSfx('ui-click'); onBackToMap(); }} className="bg-stone-800/80 hover:bg-red-700 text-stone-200 text-xs md:text-sm font-bold px-3 py-2 rounded-lg border-2 border-stone-600 hover:border-red-500 backdrop-blur-sm transition-all shadow-lg flex items-center gap-2">
            <span>◀</span> <span className="hidden md:inline">Peta</span>
          </button>
          <button onMouseEnter={() => audioManager?.playSfx('ui-hover', 0.5)} onClick={() => { audioManager?.playSfx('ui-click'); setShowClue(true); }} className="bg-stone-800/80 hover:bg-amber-600 text-stone-200 hover:text-white text-xs md:text-sm font-bold px-3 py-2 rounded-lg border-2 border-stone-600 hover:border-amber-400 backdrop-blur-sm transition-all shadow-lg flex items-center gap-2">
            <span>💡</span> <span className="hidden md:inline">Petunjuk</span>
          </button>
        </div>
      )}
      {/* MODAL PETUNJUK */}
      {showClue && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-stone-900 border-4 border-amber-600 rounded-2xl max-w-lg w-full p-6 shadow-[0_0_40px_rgba(245,158,11,0.4)] relative">
            <button onClick={() => { audioManager?.playSfx('ui-click'); setShowClue(false); }} className="absolute top-4 right-4 text-stone-400 hover:text-red-500 font-black text-xl">✕</button>
            <h2 className="text-2xl font-black text-amber-500 mb-4 flex items-center gap-2"><span>💡</span> Misi Alkemis</h2>
            <div className="text-stone-300 text-sm md:text-base space-y-3 font-medium">
              <p>Sang Magma Behemoth menanti. Hancurkan perisainya!</p>
              <ul className="list-disc pl-5 space-y-2 text-red-300">
                <li>Cari <strong>turunan pertama E'(t) = 0</strong> untuk menyerang tepat di Titik Puncak energinya.</li>
                <li>Jika E(t) = at² + bt + c</li>
                <li>Maka <strong>E'(t) = 2at + b = 0</strong></li>
                <li>Pindahkan ruas untuk mencari nilai t (waktu/detik).</li>
              </ul>
            </div>
            <button onClick={() => { audioManager?.playSfx('ui-click'); setShowClue(false); }} className="mt-8 w-full bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 rounded-xl border-b-4 border-amber-900 active:border-b-0 active:translate-y-1 transition-all">Tutup &amp; Lanjutkan</button>
          </div>
        </div>
      )}
      
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-[pulse_2s_infinite]"></div>

      <div className="relative z-20 flex flex-col items-center max-w-6xl w-full pt-4 h-full justify-between pb-8 px-4">
        
        {battleState === 'gameOver' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md flex-col">
            <h1 className="text-6xl md:text-8xl text-red-600 font-black mb-4 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse">KAU TERBAKAR!</h1>
            <p className="text-xl md:text-2xl text-stone-400 mb-8 font-bold text-center px-4">
              Perisai Magma terlalu kuat. Turunan pertamamu tidak presisi!
            </p>
            <button onClick={handleRetry} className="bg-red-700 text-white font-black text-2xl px-12 py-4 rounded-full border-b-4 border-red-900 hover:bg-red-600 active:translate-y-1 active:border-b-0 transition-all shadow-[0_0_20px_rgba(220,38,38,0.6)] uppercase tracking-wider">
              🔁 Bangkit & Coba Lagi
            </button>
          </div>
        )}

        {battleState === 'victory' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-amber-900/90 backdrop-blur-md flex-col">
            <h1 className="text-5xl md:text-7xl text-amber-400 font-black mb-4 drop-shadow-[0_0_30px_rgba(251,191,36,0.8)] animate-bounce">BEHEMOTH HANCUR!</h1>
            <p className="text-xl md:text-2xl text-amber-100 mb-8 font-bold text-center px-4">
              Kalkulus berhasil menaklukkan kekuatan alam!<br/>
              Kau telah membuktikan kecerdasanmu, Alkemis.
            </p>
            <button 
              onClick={() => {
                audioManager?.playSfx('ui-click');
                onWin(); 
                onEndGame(); 
              }} 
              className="bg-amber-600 text-white font-black text-2xl px-12 py-4 rounded-full border-b-4 border-amber-800 hover:bg-amber-500 active:translate-y-1 active:border-b-0 transition-all shadow-[0_0_30px_rgba(251,191,36,0.6)] uppercase tracking-widest mt-4"
            >
              Kembali ke Peta ▶
            </button>
          </div>
        )}

        {actionText && (
          <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-center animate-in zoom-in fade-in duration-300 pointer-events-none w-full px-4">
            <span className={`inline-block text-2xl md:text-4xl font-black uppercase tracking-widest px-8 py-3 rounded-2xl border-4 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-md
              ${battleState === 'bossHit' ? 'text-cyan-300 bg-cyan-950/90 border-cyan-400' 
              : battleState === 'reflect' || battleState === 'playerHit' ? 'text-red-300 bg-red-950/90 border-red-500' 
              : 'text-amber-400 bg-black/90 border-amber-600'}`}
            >
              {actionText}
            </span>
          </div>
        )}

        {battleState !== 'gameOver' && battleState !== 'victory' && (
          <>
            <div className="w-full flex justify-between items-center px-4 md:px-10 z-30 mb-4 bg-black/60 py-3 rounded-2xl border border-stone-800 backdrop-blur-sm">
              <div className="flex flex-col items-start">
                <span className="text-cyan-400 font-bold tracking-widest text-[10px] md:text-xs mb-1 uppercase">HP Pemain</span>
                <div className="flex gap-1 md:gap-2">
                  {[1, 2, 3].map((hp) => (
                    <span key={hp} className={`text-xl md:text-3xl transition-all ${hp <= playerHP ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-stone-700 opacity-50 grayscale'}`}>💙</span>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <span className="text-amber-500 font-black text-base md:text-2xl tracking-widest uppercase bg-black/80 px-4 py-1 rounded-full border border-stone-700 shadow-inner">
                  Fase {currentPhase + 1} / 3
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-red-500 font-bold tracking-widest text-[10px] md:text-xs mb-1 uppercase">HP Bos Magma</span>
                <div className="flex gap-1 md:gap-2">
                  {[1, 2, 3].map((hp) => (
                    <span key={hp} className={`text-xl md:text-3xl transition-all ${hp <= bossHP ? 'text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)] animate-pulse' : 'text-stone-700 opacity-50 grayscale'}`}>💎</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative flex-1 w-full max-w-5xl flex items-center justify-between px-2 md:px-10 z-10 mb-4">
              
              <div className={`relative w-24 h-32 md:w-32 md:h-40 flex flex-col justify-end transition-transform duration-100 z-30
                ${battleState === 'playerShoot' ? '-translate-x-2' : ''} 
                ${battleState === 'playerHit' ? 'animate-[shake_0.3s_infinite] brightness-50' : ''}`}
              >
                <div className="w-full h-1/2 bg-stone-800 rounded-t-xl border-t-4 border-x-4 border-cyan-600 shadow-[inset_0_0_15px_rgba(34,211,238,0.4)] relative overflow-hidden">
                  <div className={`absolute inset-0 bg-cyan-400 transition-opacity duration-300 ${battleState === 'playerShoot' ? 'opacity-50' : 'opacity-0'}`}></div>
                </div>
                <div className="absolute top-8 right-0 w-20 md:w-28 h-8 md:h-10 bg-cyan-950 border-y-2 border-r-2 border-cyan-400 rounded-r-lg flex items-center">
                  <div className="w-full h-2 bg-cyan-300/80 animate-pulse ml-2 rounded"></div>
                </div>
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-20 pointer-events-none z-20 flex items-center">
                {battleState === 'playerShoot' && (
                  <div className="absolute left-[15%] h-6 md:h-8 w-24 md:w-32 bg-cyan-300 rounded-full shadow-[0_0_30px_rgba(34,211,238,1)] animate-in fade-in slide-in-from-left-[0%] slide-out-to-right-[50vw] duration-[1200ms] fill-mode-forwards flex items-center justify-end">
                    <div className="w-8 h-full bg-white rounded-full"></div>
                  </div>
                )}
                {battleState === 'bossHit' && (
                  <div className="absolute right-[15%] w-32 h-32 bg-cyan-200 rounded-full blur-xl animate-ping opacity-80"></div>
                )}
                {(battleState === 'reflect' || battleState === 'playerHit') && (
                  <div className="absolute right-[20%] h-8 md:h-12 w-32 md:w-48 bg-red-500 rounded-full shadow-[0_0_40px_rgba(239,68,68,1)] animate-in fade-in slide-in-from-right-[0%] slide-out-to-left-[50vw] duration-[1200ms] fill-mode-forwards flex items-center justify-start z-40">
                    <div className="w-10 h-full bg-yellow-300 rounded-full"></div>
                  </div>
                )}
              </div>

              <div className={`relative w-40 h-48 md:w-64 md:h-64 flex items-center justify-center transition-all duration-300 z-10
                ${battleState === 'bossHit' ? 'brightness-[2] animate-[shake_0.5s_infinite] drop-shadow-[0_0_50px_rgba(34,211,238,1)]' : 'drop-shadow-[0_0_30px_rgba(220,38,38,0.8)]'}`}
              >
                <div className={`absolute inset-0 border-4 rounded-full transition-all duration-500 
                  ${battleState === 'bossHit' ? 'border-cyan-300 scale-125 opacity-0' 
                  : battleState === 'reflect' ? 'border-yellow-400 bg-yellow-500/40 scale-110 opacity-100 shadow-[0_0_50px_rgba(234,179,8,1)]'
                  : 'border-red-500 animate-[ping_3s_ease-in-out_infinite] opacity-60 bg-red-900/30'}`}>
                </div>
                
                <svg viewBox="0 0 200 200" className="w-full h-full z-10">
                  <polygon points="100,20 160,80 180,160 100,190 20,160 40,80" fill="#7f1d1d" stroke="#ef4444" strokeWidth="4" />
                  <polygon points="100,50 140,90 150,150 100,170 50,150 60,90" fill="#450a0a" />
                  <circle cx="70" cy="100" r="8" fill="#fef08a" className={battleState === 'reflect' ? 'fill-red-500' : 'animate-pulse'} />
                  <circle cx="130" cy="100" r="8" fill="#fef08a" className={battleState === 'reflect' ? 'fill-red-500' : 'animate-pulse'} />
                  <polygon points="100,130 120,160 80,160" fill="#fb923c" />
                </svg>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-16 bg-black/90 px-4 py-2 rounded-lg border-2 border-red-500 z-20 whitespace-nowrap shadow-[0_0_15px_rgba(220,38,38,0.8)]">
                  <span className="text-red-400 font-mono font-bold text-sm md:text-lg">{phaseData.eq}</span>
                </div>
              </div>

            </div>

            <div className="w-full max-w-3xl bg-stone-900/95 p-6 md:p-8 rounded-3xl border-4 border-red-900 shadow-[0_-10px_40px_rgba(0,0,0,0.9)] z-30 flex flex-col items-center">
              <h2 className="text-center text-red-500 font-black text-lg md:text-xl uppercase tracking-widest mb-2">Targetkan Waktu Puncak ( t )</h2>
              <p className="text-stone-300 text-xs text-center mb-6 max-w-md bg-black/40 px-4 py-2 rounded-lg border border-stone-700">
                Turunkan persamaan energi milik bos. Masukkan nilai <strong>t</strong> saat <strong>E'(t) = 0</strong> untuk menghancurkan perisainya!
              </p>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full">
                
                <div className="w-full md:w-1/2 bg-black/80 border-2 border-stone-600 rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-stone-400 text-xs font-bold tracking-widest uppercase mb-2">Waktu (detik)</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      step="0.5"
                      value={inputT}
                      onChange={(e) => setInputT(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={battleState !== 'idle'}
                      className="bg-stone-800 text-4xl md:text-6xl font-black text-cyan-400 text-center w-32 focus:outline-none drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] border-2 border-stone-500 rounded-xl py-2 disabled:opacity-50"
                      placeholder="0"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleAttack} 
                  disabled={battleState !== 'idle' || inputT === ''}
                  className="w-full md:w-1/2 h-24 rounded-2xl font-black text-xl transition-all duration-200 bg-cyan-700 text-white border-b-8 border-cyan-900 hover:bg-cyan-600 active:border-b-0 active:translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(8,145,178,0.5)] flex flex-col items-center justify-center uppercase tracking-widest"
                >
                  <span className="text-3xl mb-1">❄️</span>
                  <span>Tembakkan Es!</span>
                </button>
                
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
