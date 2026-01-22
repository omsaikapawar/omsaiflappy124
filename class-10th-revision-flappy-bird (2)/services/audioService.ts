
class AudioService {
  private ctx: AudioContext | null = null;
  private musicOsc: OscillatorNode | null = null;
  private musicGain: GainNode | null = null;
  private isMusicPlaying = false;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSfx(type: 'jump' | 'point' | 'hit' | 'correct' | 'wrong', volume: number) {
    this.initCtx();
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    if (type === 'jump') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'point') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'hit') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, now); // C5
      osc.frequency.setValueAtTime(659, now + 0.1); // E5
      osc.frequency.setValueAtTime(783, now + 0.2); // G5
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'wrong') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  }

  startMusic(volume: number) {
    if (this.isMusicPlaying) return;
    this.initCtx();
    const ctx = this.ctx!;
    this.musicGain = ctx.createGain();
    this.musicGain.gain.setValueAtTime(volume * 0.05, ctx.currentTime);
    this.musicGain.connect(ctx.destination);

    const playNote = (freq: number, time: number, duration: number) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.1, time);
      g.gain.exponentialRampToValueAtTime(0.01, time + duration);
      osc.connect(g);
      g.connect(this.musicGain!);
      osc.start(time);
      osc.stop(time + duration);
    };

    let step = 0;
    const melody = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    
    const loop = () => {
      if (!this.isMusicPlaying) return;
      const now = ctx.currentTime;
      playNote(melody[step % melody.length], now, 0.5);
      step++;
      setTimeout(loop, 600);
    };

    this.isMusicPlaying = true;
    loop();
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicGain) {
      this.musicGain.disconnect();
    }
  }

  setMusicVolume(volume: number) {
    if (this.musicGain) {
      this.musicGain.gain.setTargetAtTime(volume * 0.05, this.ctx!.currentTime, 0.1);
    }
  }
}

export const audioService = new AudioService();
