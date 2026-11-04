"use client";

class AudioManager {
  bgm: HTMLAudioElement | null = null;
  currentBgmName: string | null = null;
  scribbleSfx: HTMLAudioElement | null = null;

  // Memutar efek suara pendek (SFX)
  playSfx(name: string, volume = 1.0) {
    if (typeof window === "undefined") return;
    const audio = new Audio(`/audio/sfx/${name}.mp3`);
    audio.volume = volume;
    audio.play().catch(e => console.warn("SFX Blocked:", e));
  }

  // Memutar musik latar yang berulang (BGM)
  playBgm(name: string, volume = 0.4) {
    if (typeof window === "undefined") return;
    
    // Jangan ulangi jika BGM yang sama sedang diputar
    if (this.currentBgmName === name) return;

    // Matikan BGM sebelumnya jika ada
    if (this.bgm) {
      this.bgm.pause();
      this.bgm.currentTime = 0;
    }

    this.bgm = new Audio(`/audio/bgm/${name}.mp3`);
    this.bgm.loop = true;
    this.bgm.volume = volume;
    this.bgm.play().catch(e => console.warn("Autoplay BGM Blocked (Abaikan jika belum ada interaksi klik):", e));
    this.currentBgmName = name;
  }

  // Khusus untuk suara coretan buku (Looping SFX)
  startScribble() {
    if (typeof window === "undefined") return;
    if (!this.scribbleSfx) {
      this.scribbleSfx = new Audio('/audio/sfx/scribble.mp3');
      this.scribbleSfx.loop = true;
      this.scribbleSfx.volume = 0.6;
    }
    this.scribbleSfx.play().catch(e => console.warn("Scribble Blocked", e));
  }

  stopScribble() {
    if (this.scribbleSfx) {
      this.scribbleSfx.pause();
    }
  }
}

// Ekspor instance agar bisa diakses secara global (Singleton)
export const audioManager = typeof window !== "undefined" ? new AudioManager() : null;