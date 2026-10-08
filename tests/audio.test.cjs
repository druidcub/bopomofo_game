const test = require('node:test');
const assert = require('node:assert/strict');
const { GardenAudio, songs } = require('../audio.js');
class MockContext {
  constructor() { this.state = 'suspended'; this.currentTime = 1; this.destination = {}; this.started = []; this.stopped = []; }
  async resume() { this.state = 'running'; }
  async suspend() { this.state = 'suspended'; }
  createGain() { return { gain: { value: 0, setTargetAtTime(v) { this.value = v; }, setValueAtTime(v) { this.value = v; }, exponentialRampToValueAtTime(v) { this.value = v; }, linearRampToValueAtTime(v) { this.value = v; } }, connect() {}, disconnect() {} }; }
  createOscillator() { const ctx = this; return { frequency: {value: 0}, connect() {}, disconnect() {}, start(t) { ctx.started.push(t); }, stop(t) { ctx.stopped.push(t); } }; }
  async decodeAudioData(){return {duration:10};}
  createBufferSource(){const ctx=this;return {connect(bus){this.bus=bus;},disconnect(){},start(){ctx.started.push('recording');},stop(){this.stopped=true;}};}
}
test('five original music loops have valid notes and bass arrangements', () => {
  assert.equal(Object.values(songs).filter(s=>s.notes).length, 5);
  Object.values(songs).filter(s=>s.notes).forEach(s => { assert.equal(s.notes.length, 32); assert.equal(s.bass.length, 4); assert.ok(s.beat >= .4); assert.ok(s.notes.every(n => n === 0 || n >= 60 && n <= 84)); });
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
test('five local CC0 recordings have credits, valid MP3 payloads and a varied playlist',()=>{
  const fs=require('node:fs'),path=require('node:path'),credits=fs.readFileSync(path.join(__dirname,'../CREDITS.md'),'utf8');
  const recordings=Object.values(songs).filter(s=>s.file);assert.equal(recordings.length,5);assert.equal(new Set(songs.mix.playlist).size,5);
  recordings.forEach(s=>{assert.equal(s.license,'CC0');assert.ok(credits.includes(s.source));assert.ok(credits.includes(s.file));const bytes=fs.readFileSync(path.join(__dirname,'../'+s.file));assert.ok(bytes.length>400000);assert.ok(bytes.subarray(0,3).toString()==='ID3'||bytes[0]===255&&bytes[1]>=224);});
});
test('recording playback needs unlock, rotates tracks, ducks and stops independently from effects',async()=>{
  const oldFetch=globalThis.fetch;globalThis.AudioContext=MockContext;const fetched=[];globalThis.fetch=async url=>{fetched.push(url);return {ok:true,arrayBuffer:async()=>new ArrayBuffer(1)};};
  const a=new GardenAudio();const settle=()=>new Promise(resolve=>setImmediate(resolve));
  try{
    a.configure({music:true,track:'mix'});assert.equal(fetched.length,0);await a.unlock();await settle();assert.ok(a.fileSource);assert.equal(a.currentTrack,'happy');assert.equal(a.timer,null);
    const initial=a.fileSource;a.duck(true);assert.ok(a.musicBus.gain.value<.18);a.duck(false);assert.equal(fetched.length,1);
    assert.equal(a.nextTrack(),true);await settle();assert.equal(initial.stopped,true);assert.equal(a.currentTrack,'happyLoop');
    a.fileSource.onended();await settle();assert.equal(a.currentTrack,'happyAdventure');
    a.fileSource.onended();await settle();assert.equal(a.currentTrack,'classicalPop');
    a.fileSource.onended();await settle();assert.equal(a.currentTrack,'growingVillage');
    a.fileSource.onended();await settle();assert.equal(a.currentTrack,'happy');assert.equal(fetched.length,5);
    a.configure({music:false});assert.equal(a.fileSource,null);const count=a.context.started.length;a.effect('place');assert.ok(a.context.started.length>count);
    a.configure({music:true,track:'happy'});await settle();await a.visibility(true);assert.equal(a.fileSource,null);assert.equal(a.context.state,'suspended');await a.visibility(false);await settle();assert.ok(a.fileSource);
  }finally{a.stopMusic();globalThis.fetch=oldFetch;delete globalThis.AudioContext;}
});
test('a stale recording load cannot resume after mute; unavailable recordings fall back safely',async()=>{
  const oldFetch=globalThis.fetch;globalThis.AudioContext=MockContext;let release;
  globalThis.fetch=()=>new Promise(resolve=>release=resolve);const a=new GardenAudio();const settle=()=>new Promise(resolve=>setImmediate(resolve));
  try{
    a.configure({music:true,track:'happy'});await a.unlock();a.configure({music:false});release({ok:true,arrayBuffer:async()=>new ArrayBuffer(1)});await settle();assert.equal(a.fileSource,null);assert.equal(a.timer,null);
    globalThis.fetch=async()=>({ok:false});a.configure({music:true,track:'happyLoop'});await settle();assert.equal(a.musicError,true);assert.equal(a.currentTrack,'garden');assert.ok(a.timer);assert.equal(a.options.track,'happyLoop');
    await new Promise(resolve=>setTimeout(resolve,140));assert.equal(a.musicError,true);assert.ok(a.timer);
  }finally{a.stopMusic();globalThis.fetch=oldFetch;delete globalThis.AudioContext;}
});
