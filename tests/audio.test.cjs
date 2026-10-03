const test = require('node:test');
const assert = require('node:assert/strict');
const { GardenAudio, songs } = require('../audio.js');
class MockContext {
  constructor() { this.state = 'suspended'; this.currentTime = 1; this.destination = {}; this.started = []; this.stopped = []; }
  async resume() { this.state = 'running'; }
  async suspend() { this.state = 'suspended'; }
  createGain() { return { gain: { value: 0, setTargetAtTime(v) { this.value = v; }, setValueAtTime(v) { this.value = v; }, exponentialRampToValueAtTime(v) { this.value = v; } }, connect() {}, disconnect() {} }; }
  createOscillator() { const ctx = this; return { frequency: {value: 0}, connect() {}, disconnect() {}, start(t) { ctx.started.push(t); }, stop(t) { ctx.stopped.push(t); } }; }
}
test('three original music loops have valid notes and bass arrangements', () => {
  assert.equal(Object.keys(songs).length, 3);
  Object.values(songs).forEach(s => { assert.equal(s.notes.length, 32); assert.equal(s.bass.length, 4); assert.ok(s.beat >= .4); assert.ok(s.notes.every(n => n === 0 || n >= 60 && n <= 84)); });
});
test('audio requires unlock; controls, speech ducking and page suspension are independent', async () => {
  globalThis.AudioContext = MockContext;
  const audio = new GardenAudio();
  try {
    audio.configure({music: true, musicVolume: 20}); assert.equal(audio.context, null); assert.equal(audio.timer, null);
    assert.equal(await audio.unlock(), true); assert.ok(audio.timer); assert.ok(audio.context.started.length > 0);
    const normal = audio.musicBus.gain.value; audio.duck(true); assert.ok(audio.musicBus.gain.value < normal); audio.duck(false); assert.equal(audio.musicBus.gain.value, normal);
    audio.configure({effects: false}); const count = audio.context.started.length; audio.effect('correct'); assert.equal(audio.context.started.length, count); assert.ok(audio.timer);
    audio.configure({music: false, effects: true}); assert.equal(audio.timer, null); audio.effect('correct'); assert.ok(audio.context.started.length > count);
    audio.configure({music: true, track: 'stars'}); assert.ok(audio.timer);
    await audio.visibility(true); assert.equal(audio.timer, null); assert.equal(audio.context.state, 'suspended');
    await audio.visibility(false); assert.ok(audio.timer); assert.equal(audio.context.state, 'running');
    audio.configure({musicVolume: 999, effectsVolume: -20}); assert.equal(audio.options.musicVolume, 50); assert.equal(audio.options.effectsVolume, 0);
  } finally { audio.stopMusic(); delete globalThis.AudioContext; }
});
test('unsupported audio never prevents the game from running', async () => { const audio = new GardenAudio(); assert.equal(await audio.unlock(), false); audio.effect('correct'); audio.configure({music: true}); assert.equal(audio.timer, null); });
