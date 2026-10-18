// Web Audio API sound synthesis (zero external audio files needed)

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private activeSirenNodes: { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null = null;

  private initCtx() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playBlip() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Audio might be blocked by browser autoplay policy until user gesture
    }
  }

  playAlert() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.setValueAtTime(440, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {
      // Ignore
    }
  }

  playSuccess() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const chord = [523.25, 659.25, 783.99, 1046.5]; // C Major
      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.65);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.06);
        osc.stop(this.ctx.currentTime + 0.65);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Authentic Industrial / Railway Emergency Siren Wail
   * Multi-oscillator synthesis with dynamic wailing frequency curve (520Hz <-> 960Hz)
   * Runs for a genuine 2.8 - 3.0 seconds duration with authoritative presence.
   */
  playSiren() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      // Stop any existing siren so they don't produce overlapping dissonance
      this.stopSiren();

      const t = this.ctx.currentTime;
      const duration = 2.9; // Genuine ~3 second siren duration

      // Dynamics Compressor to maximize loud perceived volume without clipping
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-12, t);
      compressor.knee.setValueAtTime(8, t);
      compressor.ratio.setValueAtTime(12, t);
      compressor.attack.setValueAtTime(0.003, t);
      compressor.release.setValueAtTime(0.25, t);
      compressor.connect(this.ctx.destination);

      // Lowpass Filter to shape the acoustic body (sounds like a real station horn / speaker horn)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, t);
      filter.Q.setValueAtTime(2.0, t);
      filter.connect(compressor);

      // Master Gain Envelope
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, t);
      masterGain.gain.linearRampToValueAtTime(0.26, t + 0.08); // Loud & fast attack
      masterGain.gain.setValueAtTime(0.26, t + duration - 0.2);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, t + duration); // Smooth decay at end
      masterGain.connect(filter);

      // Oscillator 1: Primary aggressive horn wail (Sawtooth)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';

      // Oscillator 2: Resonant Sub-harmonic & Detune Body (Triangle + 5 cents)
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.detune.setValueAtTime(7, t); // Rich chorus effect

      // Program 4-cycle wail over 2.9 seconds (~0.725s per rise-fall cycle)
      // Cycle 1: 0.00 -> 0.36 -> 0.72
      // Cycle 2: 0.72 -> 1.08 -> 1.45
      // Cycle 3: 1.45 -> 1.81 -> 2.18
      // Cycle 4: 2.18 -> 2.54 -> 2.90
      const cycleTimes = [
        { t: 0.00, f: 520 },
        { t: 0.36, f: 940 },
        { t: 0.72, f: 540 },
        { t: 1.08, f: 960 },
        { t: 1.45, f: 540 },
        { t: 1.81, f: 980 },
        { t: 2.18, f: 540 },
        { t: 2.54, f: 920 },
        { t: 2.90, f: 500 },
      ];

      cycleTimes.forEach(({ t: relT, f }) => {
        osc1.frequency.exponentialRampToValueAtTime(f, t + relT);
        osc2.frequency.exponentialRampToValueAtTime(f * 0.5, t + relT); // sub-octave tone gives massive punch
      });

      // Individual gain for sub-oscillator
      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.4, t);
      osc2.connect(subGain);
      subGain.connect(masterGain);

      osc1.connect(masterGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + duration);
      osc2.stop(t + duration);

      this.activeSirenNodes = { osc1, osc2, gain: masterGain };

      setTimeout(() => {
        if (this.activeSirenNodes?.osc1 === osc1) {
          this.activeSirenNodes = null;
        }
      }, duration * 1000 + 100);

    } catch {
      // Audio fallback handling
    }
  }

  stopSiren() {
    if (this.activeSirenNodes && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.activeSirenNodes.gain.gain.cancelScheduledValues(now);
        this.activeSirenNodes.gain.gain.setValueAtTime(this.activeSirenNodes.gain.gain.value, now);
        this.activeSirenNodes.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        this.activeSirenNodes.osc1.stop(now + 0.06);
        this.activeSirenNodes.osc2.stop(now + 0.06);
      } catch {
        // Ignore
      }
      this.activeSirenNodes = null;
    }
  }

  playMedicalChime() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [880, 1174.66, 1760].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.14);

        gain.gain.setValueAtTime(0.12, t + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.14 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.14);
        osc.stop(t + idx * 0.14 + 0.45);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundManager();
