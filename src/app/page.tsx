"use client";

import React, { useState, useEffect, useRef } from "react";
import Map from "../components/Map";
import Stage1 from "../components/Stage1";
import Stage2 from "../components/Stage2";
import Stage3 from "../components/Stage3";
import Stage4 from "../components/Stage4";
import Stage5 from "../components/Stage5";
// IMPORT AUDIO MANAGER
import { audioManager } from "../utils/audio";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [screen, setScreen] = useState<'landing' | 'map' | 'story' | 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'stage5'>('landing');
  const [unlockedStage, setUnlockedStage] = useState<number>(1);
  const [activeStage, setActiveStage] = useState<number>(1);
  
  const [isParchmentOpen, setIsParchmentOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => { 
    setIsMounted(true); 
  }, []);

  // ==========================================
  // 1. PENGATUR BGM (BACKGROUND MUSIC) OTOMATIS
  // ==========================================
  useEffect(() => {
    if (!audioManager) return;
    switch(screen) {
      case 'landing': audioManager.playBgm('bgm-landing'); break;
      case 'map':
      case 'story':   audioManager.playBgm('bgm-map'); break;
      case 'stage1':  audioManager.playBgm('bgm-stage1'); break;
      case 'stage2':  audioManager.playBgm('bgm-stage2'); break;
      case 'stage3':  audioManager.playBgm('bgm-stage3'); break;
      case 'stage4':  audioManager.playBgm('bgm-stage4'); break;
      case 'stage5':  audioManager.playBgm('bgm-boss'); break;
    }
  }, [screen]);

  // ==========================================
  // 2. BYPASS BROWSER AUTOPLAY POLICY
  // ==========================================
  useEffect(() => {
    const unlockAudio = () => {
      if (audioManager?.bgm && audioManager.bgm.paused) {
        audioManager.bgm.play().catch(() => {});
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // ==========================================
  // SHORTCUT BUKA BUKU & KANVAS ALKEMIS
  // ==========================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'c') {
        toggleParchment();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isParchmentOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      if (canvas.width !== canvas.offsetWidth) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 3;
        }
      }
    }
  }, [isParchmentOpen]);

  const toggleParchment = () => {
    setIsParchmentOpen(prev => {
      const newState = !prev;
      if (newState) audioManager?.playSfx('parchment-open');
      return newState;
    });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawing.current = true;
    audioManager?.startScribble(); 

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    audioManager?.stopScribble(); 
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const navClick = (action: () => void) => {
    audioManager?.playSfx('ui-click');
    action();
  };
  
  const playHover = () => audioManager?.playSfx('ui-hover', 0.5);

  if (!isMounted) return <main className="min-h-screen bg-black"></main>;

  const handleWin = (stageNum: number) => {
    audioManager?.playSfx('stage-clear'); 
    if (unlockedStage === stageNum && stageNum <= 5) {
      setUnlockedStage(stageNum + 1);
    }
  };

  const isGameScreen = screen !== 'landing';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-stone-200 select-none relative font-sans overflow-hidden">
      
      {screen === 'landing' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-800 via-stone-950 to-black z-10 animate-in fade-in duration-1000">
          <div className="text-center flex flex-col items-center animate-in fade-in zoom-in duration-1000 delay-300">
            <h2 className="text-xl md:text-2xl text-emerald-500 tracking-[0.5em] mb-4 font-bold">EDU-PUZZLE RPG</h2>
            <h1 className="text-7xl md:text-9xl text-amber-500 font-extrabold tracking-widest drop-shadow-[0_0_20px_rgba(245,158,11,0.5)] mb-12">ELEMENTA</h1>
            <button 
              onMouseEnter={playHover}
              onClick={() => navClick(() => setScreen('map'))} 
              className="bg-transparent border-2 border-amber-600 text-amber-500 px-10 py-4 text-2xl font-bold hover:bg-amber-600 hover:text-stone-950 transition-all duration-300 animate-pulse rounded-sm"
            >
              Mulai Petualangan ▶
            </button>
          </div>
        </div>
      )}

      {screen === 'map' && (
        <div className="absolute inset-0 animate-in fade-in duration-1000 z-10">
          <Map unlockedStage={unlockedStage} onSelectStage={(stageId) => navClick(() => { setActiveStage(stageId); setScreen('story'); })} />
        </div>
      )}

      {screen === 'story' && (
        <div className="absolute inset-0 flex items-center justify-center z-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="absolute inset-0 bg-black/90"></div>
          <div className="relative z-30 w-11/12 max-w-4xl h-auto min-h-[400px] bg-[#e6cc98] rounded-md shadow-2xl border-8 border-stone-900 flex flex-col md:flex-row">
            
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-center text-stone-900">
              <h2 className="text-4xl font-extrabold mb-4 border-b-4 border-stone-900/30 pb-2">Pengarahan Misi</h2>
              <p className="text-xl md:text-2xl font-bold leading-relaxed text-stone-800">
                {activeStage === 1 && "Sungai kehidupan tercemar akar mematikan. Susun 5 angka dan 4 operator dengan Hukum KABATAKU untuk menetralkan racun."}
                {activeStage === 2 && "Gerbang Reruntuhan Kuno terkunci oleh segel Aljabar. Terapkan hukum keseimbangan pada kedua ruas untuk membebaskan nilai 'x'."}
                {activeStage === 3 && "Monolit Es Abadi menghalangi jalan. Hitung total volume gabungan (Balok + Limas) untuk menakar Dosis Magma dengan presisi sempurna."}
                {activeStage === 4 && "Lembah Angin memisahkan tebing. Tembakkan Ballista Tali ke jangkar di seberang dengan menghitung sudut elevasi yang presisi."}
                {activeStage === 5 && "Kawah Inti Magma bergejolak! Sang Behemoth menanti. Cari turunan pertama E'(t)=0 untuk menyerang tepat di Titik Puncak energinya!"}
              </p>
            </div>
            
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center text-stone-900 border-t-4 md:border-t-0 md:border-l-4 border-stone-900/20">
              <div className="bg-stone-900/10 p-6 rounded border-2 border-dashed border-stone-900/30 text-center mb-8 w-full">
                <p className="text-lg font-bold mb-2">Misi Matematika:</p>
                <div className="text-2xl md:text-3xl font-black text-indigo-900 break-words">
                  {activeStage === 1 && "Target Energi: 61 (Gunakan Semua 9 Slot)"}
                  {activeStage === 2 && (
                    <div className="text-left text-indigo-900 text-base md:text-xl px-4 mt-2 font-bold space-y-2">
                      <p>⚖️ <strong>Batas:</strong> 5 Langkah</p>
                      <p>🚫 <strong>Aturan:</strong> Tidak bisa mengali/membagi menggunakan variabel 'x'.</p>
                      <p>💡 <strong>Tips:</strong> Gabungkan suku sejenis terlebih dahulu!</p>
                    </div>
                  )}
                  {activeStage === 3 && (
                    <div className="text-left text-indigo-900 text-sm md:text-lg px-4 mt-2 font-bold space-y-2">
                      <p>🧊 <strong>Bentuk:</strong> Balok + Limas Segi Empat</p>
                      <p>📐 <strong>V. Balok:</strong> p × l × t</p>
                      <p>🔺 <strong>V. Limas:</strong> ⅓ × Luas Alas × t</p>
                      <p className="text-red-600">⚠️ <strong>Awas:</strong> Volume magma harus 100% akurat!</p>
                    </div>
                  )}
                  {activeStage === 4 && (
                    <div className="text-left text-indigo-900 text-sm md:text-lg px-4 mt-2 font-bold space-y-2">
                      <p>🎯 <strong>Target:</strong> Tembak jangkar di seberang.</p>
                      <p>📐 <strong>Tangen (tan θ)</strong> = Depan (y) ÷ Samping (x)</p>
                      <p>💡 <strong>Tips:</strong> Sederhanakan pecahannya!</p>
                      <div className="bg-white/50 p-2 rounded-lg border-2 border-indigo-200 text-sm md:text-base font-mono text-center shadow-inner my-1">
                        <p>tan(30°) = 1 / √3</p>
                        <p>tan(45°) = 1</p>
                        <p>tan(60°) = √3</p>
                      </div>
                    </div>
                  )}
                  {activeStage === 5 && (
                    <div className="text-left text-red-900 text-sm md:text-lg px-4 mt-2 font-bold space-y-2">
                      <p>👹 <strong>Target:</strong> Hancurkan Perisai Bos</p>
                      <p>📈 <strong>Titik Puncak:</strong> Turunan Pertama = 0</p>
                      <div className="bg-red-100/80 p-2 rounded-lg border-2 border-red-300 text-sm md:text-base font-mono text-center shadow-inner my-1">
                        <p>E(t) = at² + bt + c</p>
                        <p>E'(t) = 2at + b = 0</p>
                      </div>
                      <p className="text-red-600">⚠️ <strong>Awas:</strong> Meleset = Kena Damage!</p>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onMouseEnter={playHover}
                onClick={() => navClick(() => setScreen(`stage${activeStage}` as any))} 
                className="bg-amber-700 hover:bg-amber-600 text-stone-100 font-bold text-2xl px-8 py-5 rounded border-b-4 border-stone-900 active:border-b-0 active:translate-y-1 w-full uppercase"
              >
                Mulai Tantangan ▶
              </button>
              <button 
                onMouseEnter={playHover}
                onClick={() => navClick(() => setScreen('map'))} 
                className="mt-6 text-stone-600 underline font-bold hover:text-stone-900 text-xl"
              >
                Kembali ke Peta
              </button>
            </div>
          </div>
        </div> /* <--- INI ADALAH DIV PENUTUP YANG SEBELUMNYA HILANG! */
      )}

      {/* RENDER STAGES */}
      {screen === 'stage1' && <div className="absolute inset-0 animate-in fade-in duration-1000 z-10"><Stage1 onWin={() => handleWin(1)} onBackToMap={() => navClick(() => setScreen('map'))} /></div>}
      {screen === 'stage2' && <div className="absolute inset-0 animate-in fade-in duration-1000 z-10"><Stage2 onWin={() => handleWin(2)} onBackToMap={() => navClick(() => setScreen('map'))} /></div>}
      {screen === 'stage3' && <div className="absolute inset-0 animate-in fade-in duration-1000 z-10"><Stage3 onWin={() => handleWin(3)} onBackToMap={() => navClick(() => setScreen('map'))} /></div>}
      {screen === 'stage4' && <div className="absolute inset-0 animate-in fade-in duration-1000 z-10"><Stage4 onWin={() => handleWin(4)} onBackToMap={() => navClick(() => setScreen('map'))} /></div>}
      {screen === 'stage5' && <div className="absolute inset-0 animate-in fade-in duration-1000 z-10"><Stage5 onWin={() => handleWin(5)} onEndGame={() => navClick(() => setScreen('map'))} onBackToMap={() => navClick(() => setScreen('map'))} /></div>}

      {isGameScreen && (
        <>
          <button
            onMouseEnter={playHover}
            onClick={toggleParchment}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] bg-stone-900 border-2 border-amber-500 rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.6)] hover:bg-stone-800 hover:scale-110 active:scale-95 transition-all group"
          >
            <span className="text-3xl md:text-4xl drop-shadow-md">📖</span>
            <span className="absolute -top-12 right-0 bg-black/90 text-amber-400 text-xs md:text-sm font-bold px-3 py-1 rounded border border-amber-900 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {isParchmentOpen ? "Tutup Perkamen" : "Buka Perkamen (C)"}
            </span>
            {!isParchmentOpen && (
              <span className="absolute top-0 right-0 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
              </span>
            )}
          </button>

          <div className={`fixed top-10 right-4 md:right-10 z-[90] w-11/12 md:w-[450px] h-[75vh] md:h-[600px] bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] bg-[#e6cc98] border-8 border-stone-900 rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.9)] flex flex-col transition-transform duration-300 ease-out ${isParchmentOpen ? 'translate-x-0' : 'translate-x-[150%]'}`}>
            <div className="flex justify-between items-center bg-stone-900 px-6 py-4 rounded-t-sm border-b-4 border-stone-950 shadow-md">
              <h3 className="font-black text-amber-500 tracking-widest text-xl">PERKAMEN ALKEMIS</h3>
              <div className="flex gap-4">
                <button onClick={() => { audioManager?.playSfx('ui-click'); clearCanvas(); }} className="text-stone-400 hover:text-amber-400 font-bold underline text-sm transition-colors">
                  Bersihkan Tinta
                </button>
                <button onClick={toggleParchment} className="text-stone-400 hover:text-red-500 font-black text-2xl leading-none hidden md:block">
                  ✕
                </button>
              </div>
            </div>
            
            <div className="flex-1 w-full relative cursor-crosshair touch-none">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="absolute inset-0 w-full h-full opacity-80 mix-blend-multiply"
              />
              <p className="absolute bottom-24 left-0 w-full text-center text-stone-900/30 font-bold pointer-events-none select-none">
                Gunakan kursor atau stylus untuk mencakar
              </p>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
