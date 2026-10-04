(function(root){
  'use strict';
  const D = typeof module !== 'undefined' && module.exports ? require('./data.js') : root.GardenData;

  function normalized(text){
    return typeof text === 'string' ? text.normalize('NFC').replace(/[\sˊˇˋ˙]/gu,'') : '';
  }
  function words(values){
    return Array.isArray(values) ? values.filter(value=>value && typeof value.word === 'string') : [];
  }
  function recorded(values){
    return new Set(Array.isArray(values) ? values.filter(value=>typeof value === 'string') : []);
  }

  function filterWords(vocabulary, filters={}, progress={}){
    const options = filters || {}, saved = progress || {};
    const category = Object.hasOwn(D.categories,options.category) ? options.category : 'all';
    const query = normalized(options.query), seen = recorded(saved.journal), favorites = recorded(saved.favorites);
    return words(vocabulary).filter(word=>
      (category === 'all' || word.category === category) &&
      (!options.seenOnly || seen.has(word.word)) &&
      (!options.favoritesOnly || favorites.has(word.word)) &&
      (!query || normalized(word.word).includes(query) || normalized(word.zhuyin).includes(query))
    );
  }

  function chooseSurprise(pool, journal=[], rng=Math.random){
    const available = words(pool), seen = recorded(journal);
    const unseen = available.filter(word=>!seen.has(word.word));
    const candidates = unseen.length ? unseen : available;
    if(!candidates.length) return null;
    const sample = typeof rng === 'function' ? rng() : Math.random();
    const index = Number.isFinite(sample) ? Math.min(candidates.length-1,Math.max(0,Math.floor(sample*candidates.length))) : 0;
    return candidates[index];
  }

  function topicStats(vocabulary, progress={}){
    const bank = words(vocabulary), seen = recorded(progress?.journal);
    return Object.keys(D.categories).filter(category=>category !== 'all').map(category=>{
      const entries = new Set(bank.filter(word=>word.category === category).map(word=>word.word));
      return {category,total:entries.size,seen:[...entries].filter(word=>seen.has(word)).length};
    });
  }

  const discovery = {filterWords,chooseSurprise,topicStats};
  root.GardenDiscovery = discovery;
  if(typeof module !== 'undefined' && module.exports) module.exports = discovery;
})(typeof window !== 'undefined' ? window : globalThis);
