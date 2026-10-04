(function(root){
  'use strict';
  const D = typeof module !== 'undefined' && module.exports ? require('./data.js') : root.GardenData;

  function wordSet(values){
    return new Set(Array.isArray(values) || values instanceof Set ? values : []);
  }
  function groups(field='initial'){
    const result = new Map();
    D.words.forEach(word => {
      if(!word[field])return;
      if(!result.has(word[field])) result.set(word[field], []);
      result.get(word[field]).push(word);
    });
    return [...result].map(([symbol, words]) => ({symbol, words}));
  }
  function priority(word, recent, preferred){
    return (preferred.has(word.word) ? 1000 : 0) + (recent.has(word.word) ? 0 : 10);
  }
  function ordered(words, recent, preferred){
    return D.shuffle(words).sort((a,b) => priority(b,recent,preferred) - priority(a,recent,preferred));
  }
  function pairs(words, blockedPictures){
    const candidates = words.filter(word => !blockedPictures.has(word.emoji));
    const result = [];
    for(let a=0; a<candidates.length; a++) for(let b=a+1; b<candidates.length; b++) {
      if(candidates[a].emoji !== candidates[b].emoji) result.push([candidates[a],candidates[b]]);
    }
    return result;
  }

  // Two delivery cards per house, plus a different spoken example at its door.
  function makeMailRound(recent=[], preferred=[], houseCount=2){
    const count = houseCount === 3 ? 3 : 2;
    const history = wordSet(recent), favorites = wordSet(preferred);
    const available = groups().filter(group => group.words.length >= 3);
    const houses = [], cards = [], usedPictures = new Set(), usedInitials = new Set();
    for(let index=0; index<count; index++) {
      const candidates = available.filter(group => !usedInitials.has(group.symbol)).flatMap(group =>
        pairs(group.words,usedPictures).map(pair => ({group,pair,
          score:pair.reduce((sum,word)=>sum+priority(word,history,favorites),0)}))
      );
      const chosen = D.shuffle(candidates).sort((a,b)=>b.score-a.score)[0];
      if(!chosen) break;
      const {group,pair} = chosen;
      const example = ordered(group.words.filter(word => !pair.includes(word)),history,favorites)[0];
      houses.push({symbol:group.symbol,example});
      cards.push(...pair);
      usedInitials.add(group.symbol);
      pair.forEach(word=>usedPictures.add(word.emoji));
    }
    return {houses:D.shuffle(houses),cards:D.shuffle(cards)};
  }

  // Two words begin alike; the third is the one to discover by listening.
  function makeOddRound(recent=[], preferred=[], comparison='initial'){
    const field=comparison==='rhyme'?'rhyme':'initial';
    const history = wordSet(recent), favorites = wordSet(preferred), usedAnswers = new Set();
    const bankGroups = groups(field);
    const questions = [];
    for(let index=0; index<5; index++) {
      let question;
      const answerCandidates = ordered(D.words.filter(word=>word[field]&&!usedAnswers.has(word.word)),history,favorites);
      for(const answer of answerCandidates) {
        const commonCandidates = bankGroups.filter(group=>group.symbol!==answer[field]).flatMap(group=>
          pairs(group.words,new Set([answer.emoji])).map(pair=>({group,pair,
            score:pair.reduce((sum,word)=>sum+priority(word,history,favorites),0)}))
        );
        const chosen = D.shuffle(commonCandidates).sort((a,b)=>b.score-a.score)[0];
        if(!chosen) continue;
        question = {options:D.shuffle([...chosen.pair,answer]),answer:answer.word,
          comparison:field,commonSound:chosen.group.symbol,oddSound:answer[field],
          ...(field==='initial'?{commonInitial:chosen.group.symbol,oddInitial:answer.initial}:{}),
          word:answer.word,zhuyin:answer.zhuyin,category:answer.category};
        usedAnswers.add(answer.word);
        history.add(answer.word);
        break;
      }
      if(question) questions.push(question);
    }
    return questions;
  }

  // A requested hint reveals only the destination of one undelivered letter.
  function nextMailHint(round, delivered=[], selectedWord=''){
    if(!round || !Array.isArray(round.cards) || !Array.isArray(round.houses)) return null;
    const completed = wordSet(delivered), houseSymbols = new Set(round.houses.map(house=>house.symbol));
    const remaining = round.cards.filter(card=>!completed.has(card.word) && houseSymbols.has(card.initial));
    const card = remaining.find(word=>word.word===selectedWord) || remaining[0];
    return card ? {word:card.word,symbol:card.initial} : null;
  }

  const challenges = {makeMailRound,makeOddRound,nextMailHint};
  root.GardenChallenges = challenges;
  if(typeof module !== 'undefined' && module.exports) module.exports = challenges;
})(typeof window !== 'undefined' ? window : globalThis);
