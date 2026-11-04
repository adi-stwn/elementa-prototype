"use client";

import React, { useRef, useState, useEffect } from "react";

interface MapProps {
  unlockedStage: number;
  onSelectStage: (stageNum: number) => void;
}

export default function Map({ unlockedStage, onSelectStage }: MapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Menambahkan Stage 6 (Coming Soon)
  const stages = [
    { id: 1, name: "Hutan Tercemar", img: "/pulau-1.png", theme: { border: "border-emerald-500", text: "text-emerald-400", shadow: "shadow-[0_0_15px_rgba(16,185,129,0.5)]" } },
    { id: 2, name: "Reruntuhan Kuno", img: "/pulau-2.png", theme: { border: "border-indigo-500", text: "text-indigo-400", shadow: "shadow-[0_0_15px_rgba(99,102,241,0.5)]" } },
    { id: 3, name: "Puncak Salju", img: "/pulau-3.png", theme: { border: "border-cyan-500", text: "text-cyan-400", shadow: "shadow-[0_0_15px_rgba(6,182,212,0.5)]" } },
    { id: 4, name: "Lembah Angin", img: "/pulau-4.png", theme: { border: "border-orange-500", text: "text-orange-400", shadow: "shadow-[0_0_15px_rgba(249,115,22,0.5)]" } },
    { id: 5, name: "Sarang Magma", img: "/pulau-5.png", theme: { border: "border-red-600", text: "text-red-500", shadow: "shadow-[0_0_30px_rgba(220,38,38,0.8)]" } },
    { id: 6, name: "Area Misterius", img: "/portal-misterius.png", theme: { border: "border-fuchsia-500", text: "text-fuchsia-400", shadow: "shadow-[0_0_20px_rgba(217,70,239,0.8)]" } },
  ];

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsMouseDown(false);
      setTimeout(() => setIsDragging(false), 50);
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  // Otomatis menggeser layar (scroll) ke stage yang sedang aktif saat map dibuka
  useEffect(() => {
    if (scrollRef.current) {
      // Perkiraan jarak scroll berdasarkan stage aktif (agar stage baru selalu di tengah)
      const targetScroll = (unlockedStage - 1) * 300; 
      scrollRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  }, [unlockedStage]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsMouseDown(true);
    setIsDragging(false); 
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
    setIsDragging(false);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollRef.current) return;
    e.preventDefault();
    
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX;
    
    if (Math.abs(walk) > 5) {
      setIsDragging(true);
    }
    scrollRef.current.scrollLeft = scrollLeft - (walk * 2);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center bg-stone-950 z-10 overflow-hidden font-sans select-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-stone-950 to-black pointer-events-none"></div>

      <div className="mt-12 text-center z-20 pointer-events-none">
        <h1 className="text-4xl md:text-6xl text-amber-500 tracking-widest font-extrabold drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">PETA ELEMENTA</h1>
        <p className="text-stone-400 mt-2 text-xl font-semibold tracking-wider uppercase">Geser untuk melihat area</p>
      </div>

      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className={`flex-1 w-full flex items-center overflow-x-auto px-[10vw] z-20 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="flex items-center min-w-max py-20">
          
          {stages.map((stage, index) => {
            const isUnlocked = unlockedStage >= stage.id;
            const isCurrent = unlockedStage === stage.id;
            const isCleared = unlockedStage > stage.id;
            const isComingSoon = stage.id === 6;

            return (
              <React.Fragment key={stage.id}>
                <div className="relative flex flex-col items-center group px-4">
                  <button
                    disabled={!isUnlocked || isComingSoon}
                    onClick={(e) => { 
                      if (isDragging) {
                        e.preventDefault();
                        return;
                      }
                      if (!isComingSoon) onSelectStage(stage.id); 
                    }}
                    className={`relative w-48 h-48 md:w-64 md:h-64 transition-all duration-700 flex items-center justify-center focus:outline-none
                      ${isUnlocked && !isComingSoon ? 'cursor-pointer' : 'cursor-not-allowed opacity-40 grayscale blur-[2px]'}
                      ${isCurrent && !isComingSoon ? 'hover:scale-110 animate-[bounce_3s_ease-in-out_infinite]' : ''}
                      ${isCleared ? 'hover:scale-105 hover:-translate-y-2' : ''}
                      ${isComingSoon && isCurrent ? 'animate-[pulse_3s_ease-in-out_infinite]' : ''}
                    `}
                  >
                    {/* Jika gambar tidak ada, kita fallback ke div kosong transparan */}
                    <img src={stage.img} alt={stage.name} draggable="false" className="w-full h-full object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.9)] pointer-events-none" 
                         onError={(e) => (e.currentTarget.style.display = 'none')} />

                    {/* Badge Misi Aktif / Bos */}
                    {isCurrent && !isComingSoon && (
                      <div className="absolute -top-8 bg-amber-500 text-stone-900 px-4 py-2 rounded-full font-bold text-sm tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse border-2 border-stone-900 pointer-events-none">
                        {stage.id === 5 ? "⚠️ BOSS BATTLE!" : "MISI AKTIF"}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-amber-500"></div>
                      </div>
                    )}

                    {/* Centang Selesai */}
                    {isCleared && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 rounded-full p-4 backdrop-blur-sm border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.8)] pointer-events-none">
                        <span className="text-5xl">✅</span>
                      </div>
                    )}

                    {/* Ikon Coming Soon */}
                    {isComingSoon && (
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl drop-shadow-[0_0_30px_rgba(217,70,239,1)] pointer-events-none">
                         🌀
                       </div>
                    )}
                  </button>

                  <div className={`mt-8 text-center border-2 px-6 py-3 rounded-xl bg-stone-900/90 backdrop-blur-md transition-all duration-300 pointer-events-none
                    ${isCurrent ? `${stage.theme.border}${stage.theme.shadow}` : isCleared ? 'border-emerald-600/50' : 'border-stone-800'}
                  `}>
                    <h3 className={`text-xl md:text-2xl font-black tracking-wide ${isCurrent ? stage.theme.text : isCleared ? 'text-emerald-500' : 'text-stone-500'}`}>
                      {stage.name}
                    </h3>
                    <p className={`text-sm font-bold tracking-widest uppercase mt-1 ${isUnlocked ? (isComingSoon ? 'text-fuchsia-400 animate-pulse' : 'text-stone-400') : 'text-stone-700'}`}>
                      {isComingSoon ? "Segera Hadir!" : `Stage ${stage.id}`}
                    </p>
                  </div>
                </div>

                {index < stages.length - 1 && (
                  <div className="w-16 md:w-24 h-2 flex items-center relative mx-2 pointer-events-none">
                    <div className={`w-full h-full rounded-full transition-all duration-1000 
                      ${unlockedStage > stage.id ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]' : 'bg-stone-800/50 border-y-2 border-stone-800 border-dashed'}
                    `}></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-black via-stone-950/80 to-transparent pointer-events-none"></div>
    </div>
  );
}