"use client";
import React, { useState, useEffect } from "react";
import { audioManager } from "../utils/audio"; // IMPORT AUDIO MANAGER

export default function Stage2({ onWin, onBackToMap }: { onWin: () => void, onBackToMap: () => void }) {
  const [showClue, setShowClue] = useState(false);
  const maxMoves = 5;
  
  // STATE ALJABAR
  const [leftX, setLeftX] = useState(3);
  const [leftC, setLeftC] = useState(18);
  const [rightX, setRightX] = useState(5);
  const [rightC, setRightC] = useState(-12);
  
  const [isSimplified, setIsSimplified] = useState(false);
  const [movesLeft, setMovesLeft] = useState(maxMoves);
  
  // STATE KONTROL
  const [selectedOp, setSelectedOp] = useState<'+'|'-'|'×'|'÷'>('-');
  const [selectedType, setSelectedType] = useState<'x'|'c'>('x');
  const [inputValue, setInputValue] = useState<number | ''>(3);

  const [isGameOverPhase, setIsGameOverPhase] = useState(false);
  const [isCleared, setIsCleared] = useState(false);
  
  // STATE PESAN PERINGATAN (Menggantikan Alert)
  const [noticeMessage, setNoticeMessage] = useState("");

  const formatEquation = (x: number, c: number, unsimplified: boolean, isLeft: boolean) => {
    if (unsimplified) return isLeft ? "4x + 18 - x" : "7x - 12 - 2x";
    
    let parts = [];
    if (x !== 0) {
      if (x === 1) parts.push("x");
      else if (x === -1) parts.push("-x");
      else parts.push(`${x}x`);
    }
    if (c !== 0) {
      if (c > 0 && parts.length > 0) parts.push(`+ ${c}`);
      else if (c < 0 && parts.length > 0) parts.push(`- ${Math.abs(c)}`);
      else parts.push(`${c}`);
    }
    if (parts.length === 0) return "0";
    return parts.join(" ");
  };

  useEffect(() => {
    if ((leftX === 1 && leftC === 0 && rightX === 0) || 
        (rightX === 1 && rightC === 0 && leftX === 0)) {
      setIsCleared(true);
      onWin();
    } else if (movesLeft <= 0 && !isCleared) {
      setIsGameOverPhase(true);
      audioManager?.playSfx('error-buzz'); // SFX KETIKA KEHABISAN LANGKAH (RUNTUH)
      setTimeout(() => resetStage(), 1500);
    }
  }, [leftX, leftC, rightX, rightC, movesLeft, isCleared, onWin]);

  const resetStage = () => {
    setLeftX(3); setLeftC(18);
    setRightX(5); setRightC(-12);
    setIsSimplified(false);
    setMovesLeft(maxMoves);
    setSelectedOp('-'); setSelectedType('x'); setInputValue(3);
    setIsGameOverPhase(false);
    setNoticeMessage("");
  };

  const showNotice = (msg: string) => {
    audioManager?.playSfx('error-buzz'); // SFX KETIKA ATURAN DILANGGAR
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(""), 2500);
  };

  const handleSimplify = () => {
    if (!isSimplified) {
      audioManager?.playSfx('magic-poof'); // SFX GABUNGKAN SUKU
      setIsSimplified(true);
      setMovesLeft(prev => prev - 1);
    } else {
      showNotice("Suku di kedua ruas sudah paling sederhana!");
    }
  };

  const handleApply = () => {
    if (movesLeft <= 0 || inputValue === '' || isGameOverPhase) return;
    const val = Number(inputValue);

    if (selectedOp === '÷' && val === 0) {
      showNotice("Hukum Sihir melarang pembagian dengan 0!"); return;
    }

    let nLx = leftX, nLc = leftC, nRx = rightX, nRc = rightC;

    if (selectedType === 'x') {
      if (selectedOp === '×' || selectedOp === '÷') {
        showNotice("Sihir gagal! Kamu belum bisa mengali/membagi dengan variabel 'x'."); return;
      }
      if (selectedOp === '+') { nLx += val; nRx += val; }
      if (selectedOp === '-') { nLx -= val; nRx -= val; }
    } else {
      if (selectedOp === '+') { nLc += val; nRc += val; }
      if (selectedOp === '-') { nLc -= val; nRc -= val; }
      if (selectedOp === '×') { nLx *= val; nLc *= val; nRx *= val; nRc *= val; }
      if (selectedOp === '÷') { nLx /= val; nLc /= val; nRx /= val; nRc /= val; }
    }

    audioManager?.playSfx('magic-poof'); // SFX OPERASI BERHASIL DITERAPKAN

    setLeftX(Math.round(nLx * 100) / 100); setLeftC(Math.round(nLc * 100) / 100);
    setRightX(Math.round(nRx * 100) / 100); setRightC(Math.round(nRc * 100) / 100);
    setMovesLeft(prev => prev - 1);
    setNoticeMessage(""); // Hapus notice jika berhasil
  };

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center z-10 p-4 transition-colors duration-500 ${isGameOverPhase ? 'bg-red-950' : 'bg-transparent'}`}>
      <img src="/reruntuhan-kuno.png" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 pointer-events-none ${isGameOverPhase ? 'opacity-30 mix-blend-multiply' : 'opacity-60'}`} alt="Reruntuhan" />
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-950/80 to-black/70 pointer-events-none"></div>

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
              <p>Gerbang Reruntuhan Kuno terkunci oleh segel Aljabar.</p>
              <ul className="list-disc pl-5 space-y-2 text-indigo-300">
                <li><strong>Aturan:</strong> Terapkan hukum keseimbangan (apa yang dilakukan di kiri, wajib dilakukan di kanan).</li>
                <li><strong>Tujuan:</strong> Isolasi nilai x hingga menjadi <strong>x = ...</strong></li>
                <li><strong>Tips:</strong> Mulailah dengan menekan &quot;Gabungkan Suku Sejenis&quot;.</li>
              </ul>
            </div>
            <button onClick={() => { audioManager?.playSfx('ui-click'); setShowClue(false); }} className="mt-8 w-full bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 rounded-xl border-b-4 border-amber-900 active:border-b-0 active:translate-y-1 transition-all">Tutup &amp; Lanjutkan</button>
          </div>
        </div>
      )}

      <div className="relative z-20 flex flex-col items-center max-w-5xl w-full pt-2">
        {isCleared ? (
          <div className="bg-indigo-900/95 p-10 border-4 border-indigo-400 text-center rounded-xl animate-in zoom-in-150 duration-700 shadow-[0_0_50px_rgba(99,102,241,0.8)] mt-10 backdrop-blur-md">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-md">PINTU TERBUKA!</h1>
            <p className="text-xl md:text-2xl text-indigo-200 mb-6">Keseimbangan tercapai: <strong className="text-white bg-black/50 px-3 py-1 rounded">x = {rightC !== 0 ? rightC : leftC}</strong></p>
            <button onClick={() => { audioManager?.playSfx('ui-click'); onBackToMap(); }} className="bg-indigo-600 text-white font-bold text-2xl px-10 py-4 rounded-full border-b-4 border-indigo-800 hover:bg-indigo-500 active:translate-y-1 active:border-b-0 transition-all shadow-lg">
              Lanjut ke Peta ▶
            </button>
          </div>
        ) : (
          <>
            <div className={`p-4 rounded-xl border-2 text-center shadow-lg backdrop-blur-md w-full max-w-3xl transition-colors mb-2 ${isGameOverPhase ? 'bg-red-900/80 border-red-500' : 'bg-stone-900/90 border-indigo-500'}`}>
              <h1 className="text-amber-500 font-black text-lg md:text-xl tracking-widest mb-1 uppercase">Stage 2: Aljabar</h1>
              <p className="text-stone-300 text-xs md:text-sm mt-1">
                Aturan <span className="font-bold text-indigo-300">Hukum Keseimbangan</span>: Apa yang dilakukan di ruas kiri, wajib dilakukan di ruas kanan. Isolasi <span className="text-white font-bold bg-black/50 px-2 rounded">x</span>!
              </p>
            </div>

            <div className="mt-1 mb-3">
              <span className={`px-6 py-2 rounded-full font-black tracking-widest text-sm border-2 shadow-lg transition-colors ${movesLeft <= 2 ? 'bg-red-900 text-red-200 border-red-500 animate-pulse' : 'bg-indigo-900 text-indigo-200 border-indigo-500'}`}>
                SISA LANGKAH: {movesLeft} / {maxMoves}
              </span>
            </div>

            <div className="flex flex-row items-center justify-center gap-2 md:gap-6 my-2 w-full relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[750px] h-3 bg-stone-700/80 rounded-full z-0 shadow-lg border-y-2 border-stone-500/50"></div>
              
              <div className="flex flex-col items-center z-10 w-44 md:w-80">
                <span className="text-indigo-400 font-bold tracking-widest text-[10px] md:text-xs mb-2 bg-black/80 px-4 py-1 rounded-full border border-indigo-800">RUAS KIRI</span>
                <div className="w-full py-5 px-4 md:px-6 rounded-xl border-4 border-indigo-800 bg-stone-900/90 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-sm text-center overflow-hidden">
                  <span className="text-lg md:text-3xl font-black text-indigo-200 drop-shadow-md whitespace-nowrap">
                    {formatEquation(leftX, leftC, !isSimplified, true)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center z-10 px-1 md:px-2 relative">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-amber-600 rounded-full border-4 border-stone-800 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                  <span className="text-2xl md:text-3xl text-white font-black">=</span>
                </div>
                {isGameOverPhase && <span className="absolute -bottom-8 text-base font-black text-red-500 animate-ping">RUNTUH!</span>}
              </div>

              <div className="flex flex-col items-center z-10 w-44 md:w-80">
                <span className="text-indigo-400 font-bold tracking-widest text-[10px] md:text-xs mb-2 bg-black/80 px-4 py-1 rounded-full border border-indigo-800">RUAS KANAN</span>
                <div className="w-full py-5 px-4 md:px-6 rounded-xl border-4 border-indigo-800 bg-stone-900/90 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-sm text-center overflow-hidden">
                  <span className="text-lg md:text-3xl font-black text-indigo-200 drop-shadow-md whitespace-nowrap">
                    {formatEquation(rightX, rightC, !isSimplified, false)}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full max-w-4xl h-1 bg-gradient-to-r from-transparent via-indigo-900 to-transparent my-6"></div>

            {/* Tempat Menampilkan Peringatan Kesalahan */}
            <div className="h-6 mb-2">
              {noticeMessage && (
                <div className="bg-red-900/90 border border-red-500 text-red-200 px-6 py-1 rounded-full text-sm font-bold animate-in slide-in-from-bottom-2 shadow-lg">
                  ⚠️ {noticeMessage}
                </div>
              )}
            </div>

            <div className="w-full max-w-4xl bg-stone-900/80 p-5 md:p-6 rounded-2xl border-2 border-indigo-800 backdrop-blur-md shadow-2xl">
              
              <button 
                onClick={handleSimplify}
                disabled={isGameOverPhase || movesLeft <= 0}
                className="w-full mb-6 py-3 md:py-4 rounded-xl font-bold md:text-lg transition-all duration-300 border-b-4 flex items-center justify-center uppercase tracking-widest bg-cyan-700 text-white border-cyan-900 hover:bg-cyan-600 active:border-b-0 active:translate-y-1 shadow-[0_0_15px_rgba(8,145,178,0.5)]"
              >
                🔗 Gabungkan Suku Sejenis
              </button>

              <p className="text-center text-indigo-400 font-bold mb-3 uppercase tracking-widest text-[10px] md:text-xs bg-black/40 py-1 rounded">Rangkai Operasi Untuk Kedua Ruas</p>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 bg-black/40 p-3 md:p-4 rounded-xl border border-stone-700">
                <div className="flex flex-col items-center w-full md:w-auto">
                  <span className="text-stone-400 text-[10px] md:text-xs font-bold mb-1 uppercase tracking-wider">1. Operator</span>
                  <div className="flex bg-stone-800 rounded-lg p-1 border border-stone-600 w-full justify-center">
                    {['+', '-', '×', '÷'].map(op => (
                      <button 
                        key={op} 
                        onClick={() => { audioManager?.playSfx('ui-click'); setSelectedOp(op as any); }} 
                        className={`w-10 h-10 md:w-12 md:h-12 rounded text-xl md:text-2xl font-black transition-colors ${selectedOp === op ? 'bg-amber-600 text-white shadow-inner' : 'text-stone-400 hover:text-white hover:bg-stone-700'}`}
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center w-full md:w-auto">
                  <span className="text-stone-400 text-[10px] md:text-xs font-bold mb-1 uppercase tracking-wider">2. Nilai</span>
                  <input 
                    type="number" 
                    value={inputValue} 
                    onChange={(e) => { audioManager?.playSfx('ui-click'); setInputValue(e.target.value === '' ? '' : Number(e.target.value)); }}
                    className="w-full md:w-24 h-12 md:h-14 bg-stone-800 border-2 border-stone-500 text-center text-xl md:text-2xl font-black text-white rounded-lg focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                </div>

                <div className="flex flex-col items-center w-full md:w-auto">
                  <span className="text-stone-400 text-[10px] md:text-xs font-bold mb-1 uppercase tracking-wider">3. Jenis Suku</span>
                  <div className="flex bg-stone-800 rounded-lg p-1 border border-stone-600 w-full h-12 md:h-14">
                    <button onClick={() => { audioManager?.playSfx('ui-click'); setSelectedType('x'); }} className={`flex-1 px-4 py-1 rounded text-sm md:text-base font-bold transition-colors ${selectedType === 'x' ? 'bg-indigo-600 text-white shadow-inner' : 'text-stone-400 hover:text-white hover:bg-stone-700'}`}>Variabel (x)</button>
                    <button onClick={() => { audioManager?.playSfx('ui-click'); setSelectedType('c'); }} className={`flex-1 px-4 py-1 rounded text-sm md:text-base font-bold transition-colors ${selectedType === 'c' ? 'bg-emerald-600 text-white shadow-inner' : 'text-stone-400 hover:text-white hover:bg-stone-700'}`}>Angka Biasa</button>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-end w-full md:w-auto md:ml-auto md:h-[72px]">
                  <button 
                    onClick={handleApply}
                    disabled={isGameOverPhase || movesLeft <= 0}
                    className="w-full h-12 md:h-14 px-6 md:px-8 rounded-xl font-black text-sm md:text-base transition-all duration-200 bg-amber-700 text-white border-b-4 border-amber-900 hover:bg-amber-600 active:border-b-0 active:translate-y-1 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center justify-center uppercase tracking-wider mt-auto"
                  >
                    ⚡ Terapkan
                  </button>
                </div>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
}
