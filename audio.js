(function (root) {
  'use strict';
  const songs = {
    garden: { name: '花園散步', beat: .48, notes: [72,76,79,76,74,0,72,0,76,79,81,79,76,0,74,0,72,74,76,79,76,74,72,0,67,72,74,76,74,0,72,0], bass: [48,53,55,48] },
    stars: { name: '星星搖籃', beat: .6, notes: [79,0,81,79,76,0,74,0,76,79,84,0,81,79,76,0,74,0,76,74,72,0,67,0,72,76,79,0,76,74,72,0], bass: [48,57,53,55] },
    picnic: { name: '森林野餐', beat: .4, notes: [72,74,76,0,79,76,74,0,76,79,81,0,79,76,74,0,72,76,79,76,74,72,67,0,67,72,74,76,79,74,72,0], bass: [48,53,48,55] }
  };
  class GardenAudio {
    constructor() {
      this.context = null; this.musicBus = null; this.effectsBus = null;
      this.options = { music: false, effects: true, track: 'garden', musicVolume: 18, effectsVolume: 40 };
      this.timer = null; this.nodes = new Set(); this.step = 0; this.nextNote = 0;
      this.ducked = false; this.unlocked = false; this.onState = () => {};
    }
    async unlock() {
      try {
        const Context = root.AudioContext || root.webkitAudioContext;
        if (!Context) return false;
        if (!this.context) {
          this.context = new Context();
          this.musicBus = this.context.createGain(); this.effectsBus = this.context.createGain();
          this.musicBus.connect(this.context.destination); this.effectsBus.connect(this.context.destination);
          this.applyVolumes();
        }
        if (this.context.state !== 'running') await this.context.resume();
        this.unlocked = this.context.state === 'running';
        if (this.unlocked) this.syncMusic();
        this.onState(); return this.unlocked;
      } catch { this.onState(); return false; }
    }
    configure(options) {
      const oldTrack = this.options.track;
      Object.assign(this.options, options);
      this.options.musicVolume = Math.max(0, Math.min(50, Number(this.options.musicVolume) || 0));
      this.options.effectsVolume = Math.max(0, Math.min(70, Number(this.options.effectsVolume) || 0));
      if (!songs[this.options.track]) this.options.track = 'garden';
      this.applyVolumes();
      if (oldTrack !== this.options.track) this.stopMusic();
      this.syncMusic(); this.onState();
    }
    applyVolumes() {
      if (!this.context) return;
      const now = this.context.currentTime;
      this.musicBus.gain.setTargetAtTime(this.options.musicVolume / 100 * (this.ducked ? .16 : 1), now, .06);
      this.effectsBus.gain.setTargetAtTime(this.options.effects ? this.options.effectsVolume / 100 : 0, now, .02);
    }
    duck(value) { this.ducked = value; this.applyVolumes(); }
    tone(midi, when, duration, bus, amplitude = .1, type = 'sine', music = false) {
      if (!midi || !this.context) return;
      const osc = this.context.createOscillator(), env = this.context.createGain();
      osc.type = type; osc.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
      env.gain.setValueAtTime(.0001, when);
      env.gain.exponentialRampToValueAtTime(amplitude, when + .018);
      env.gain.exponentialRampToValueAtTime(.0001, when + duration);
      osc.connect(env); env.connect(bus);
      const record = { osc, env, music }; this.nodes.add(record);
      osc.onended = () => { this.nodes.delete(record); osc.disconnect(); env.disconnect(); };
      osc.start(when); osc.stop(when + duration + .03);
    }
    effect(name) {
      if (!this.options.effects || !this.context || this.context.state !== 'running') return;
      const sequences = { tap: [76], flip: [72,79], retry: [64,62], correct: [72,76,79], place: [79,84], finish: [72,76,79,84,79,84] };
      const notes = sequences[name] || sequences.tap;
      const time = this.context.currentTime;
      // Limit rapid tapping so overlapping envelopes never accumulate into a loud burst.
      if (this.lastEffect && time - this.lastEffect < .055) return;
      this.lastEffect = time;
      notes.forEach((n, i) => this.tone(n, time + i * .12, .18, this.effectsBus, name === 'retry' ? .08 : .14));
    }
    syncMusic() {
      if (!this.context || !this.unlocked || !this.options.music || (root.document && root.document.hidden)) { this.stopMusic(); return; }
      if (this.timer) return;
      this.step = 0; this.nextNote = this.context.currentTime + .08;
      const schedule = () => {
        if (this.context.state !== 'running') return;
        const song = songs[this.options.track];
        if (this.nextNote < this.context.currentTime) this.nextNote = this.context.currentTime + .04;
        while (this.nextNote < this.context.currentTime + .35) {
          const n = song.notes[this.step % song.notes.length];
          this.tone(n, this.nextNote, song.beat * .85, this.musicBus, .1, 'sine', true);
          if (this.step % 8 === 0) this.tone(song.bass[Math.floor(this.step / 8) % song.bass.length], this.nextNote, song.beat * 6, this.musicBus, .065, 'sine', true);
          this.step++; this.nextNote += song.beat;
        }
      };
      schedule(); this.timer = root.setInterval(schedule, 120);
    }
    stopMusic() {
      if (this.timer) root.clearInterval(this.timer);
      this.timer = null;
      for (const r of [...this.nodes]) if (r.music) { try { r.osc.stop(); } catch {} this.nodes.delete(r); }
    }
    async visibility(hidden) {
      if (!this.context) return;
      if (hidden) {
        this.stopMusic();
        for (const r of [...this.nodes]) { try { r.osc.stop(); } catch {} this.nodes.delete(r); }
        await this.context.suspend().catch(() => {});
      }
      else if (this.unlocked) { await this.context.resume().catch(() => {}); this.syncMusic(); }
      this.onState();
    }
  }
  root.GardenAudio = GardenAudio; root.GardenSongs = songs;
  if (typeof module !== 'undefined') module.exports = { GardenAudio, songs };
})(typeof window !== 'undefined' ? window : globalThis);
