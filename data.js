(function (root) {
  'use strict';
  const symbols = [...'ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦㄧㄨㄩ'];
  const starter = [...'ㄅㄆㄇㄈㄚㄧㄨㄩ'];
  const categories = { all: '全部朋友', animals: '動物', food: '食物', nature: '大自然', things: '生活物品', body: '我的身體', numbers: '數字' };
  const rows = [
    ['貓','🐱','ㄇㄠ','animals'], ['兔','🐰','ㄊㄨˋ','animals'],
    ['狗','🐶','ㄍㄡˇ','animals'], ['馬','🐴','ㄇㄚˇ','animals'],
    ['魚','🐟','ㄩˊ','animals'], ['鹿','🦌','ㄌㄨˋ','animals'],
    ['牛','🐮','ㄋㄧㄡˊ','animals'], ['羊','🐑','ㄧㄤˊ','animals'],
    ['雞','🐔','ㄐㄧ','animals'], ['鴨','🦆','ㄧㄚ','animals'],
    ['鳥','🐦','ㄋㄧㄠˇ','animals'], ['熊','🐻','ㄒㄩㄥˊ','animals'],
    ['米','🍚','ㄇㄧˇ','food'], ['梨','🍐','ㄌㄧˊ','food'],
    ['瓜','🍉','ㄍㄨㄚ','food'], ['桃','🍑','ㄊㄠˊ','food'],
    ['菜','🥬','ㄘㄞˋ','food'], ['茶','🍵','ㄔㄚˊ','food'],
    ['蛋','🥚','ㄉㄢˋ','food'], ['糖','🍬','ㄊㄤˊ','food'],
    ['豆','🫘','ㄉㄡˋ','food'], ['肉','🥩','ㄖㄡˋ','food'],
    ['湯','🥣','ㄊㄤ','food'], ['薯','🍠','ㄕㄨˇ','food'],
    ['花','🌷','ㄏㄨㄚ','nature'], ['風','🍃','ㄈㄥ','nature'],
    ['山','⛰️','ㄕㄢ','nature'], ['水','💧','ㄕㄨㄟˇ','nature'],
    ['雨','🌧️','ㄩˇ','nature'], ['雲','☁️','ㄩㄣˊ','nature'],
    ['天','🌤️','ㄊㄧㄢ','nature'], ['火','🔥','ㄏㄨㄛˇ','nature'],
    ['土','🪴','ㄊㄨˇ','nature'], ['坡','🏞️','ㄆㄛ','nature'],
    ['樹','🌳','ㄕㄨˋ','nature'], ['海','🌊','ㄏㄞˇ','nature'],
    ['書','📖','ㄕㄨ','things'], ['筆','✏️','ㄅㄧˇ','things'],
    ['包','🎒','ㄅㄠ','things'], ['杯','🥤','ㄅㄟ','things'],
    ['刀','🔪','ㄉㄠ','things'], ['球','⚽','ㄑㄧㄡˊ','things'],
    ['傘','☂️','ㄙㄢˇ','things'], ['車','🚗','ㄔㄜ','things'],
    ['帽','🧢','ㄇㄠˋ','things'], ['床','🛏️','ㄔㄨㄤˊ','things'],
    ['鐘','⏰','ㄓㄨㄥ','things'], ['椅','🪑','ㄧˇ','things'],
    ['手','✋','ㄕㄡˇ','body'], ['腳','🦶','ㄐㄧㄠˇ','body'],
    ['眼','👁️','ㄧㄢˇ','body'], ['耳','👂','ㄦˇ','body'],
    ['口','👄','ㄎㄡˇ','body'], ['牙','🦷','ㄧㄚˊ','body'],
    ['一','1️⃣','ㄧ','numbers'], ['二','2️⃣','ㄦˋ','numbers'],
    ['三','3️⃣','ㄙㄢ','numbers'], ['四','4️⃣','ㄙˋ','numbers'],
    ['五','5️⃣','ㄨˇ','numbers'], ['八','8️⃣','ㄅㄚ','numbers']
  ];
  const consonants = new Set([...'ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙ']);
  const words = rows.map(([word, emoji, zhuyin, category]) => {
    const tone = (zhuyin.match(/[ˊˇˋ]/) || [])[0];
    const parts = [...zhuyin.replace(/[ˊˇˋ]/g, '')];
    return { word, emoji, zhuyin, category, tone, parts, initial: parts[0], rhyme: (consonants.has(parts[0]) ? parts.slice(1) : parts).join('') };
  });
  function shuffle(items, rng = Math.random) {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function choices(answer, pool, count = 3) {
    return shuffle([answer, ...shuffle([...new Set(pool)].filter(s => s !== answer)).slice(0, count - 1)]);
  }
  function chooseTargets(pool) {
    const picked = shuffle(pool);
    return picked.slice(0, 5);
  }
  function makeRound(mode, scope = 'starter', category = 'all', level = 'easy') {
    const symbolPool = scope === 'all' ? symbols : starter;
    if (mode === 'match') return shuffle(symbolPool).slice(0, 5).map(s => ({ answer: s, options: choices(s, symbolPool) }));
    if (mode === 'memory') {
      const selected = shuffle(symbolPool).slice(0, 3);
      return shuffle(selected.flatMap((s, i) => [{ id: i + '-a', symbol: s }, { id: i + '-b', symbol: s }]));
    }
    if (mode === 'rhyme') {
      // Keep the whole garden available: some themes have too few rhyming pairs.
      const eligible = words.filter(w => w.rhyme && words.some(x => x.word !== w.word && x.rhyme === w.rhyme));
      return chooseTargets(eligible).map(w => {
        const friend = shuffle(words.filter(x => x.word !== w.word && x.rhyme === w.rhyme))[0];
        const others = shuffle(words.filter(x => x.rhyme !== w.rhyme && x.word !== w.word)).slice(0, 2);
        return { ...w, answer: friend.word, options: shuffle([friend, ...others]) };
      });
    }
    let pool = words.filter(w => category === 'all' || w.category === category);
    if (mode === 'build') pool = pool.filter(w => w.parts.length >= 2 && w.parts.length <= (level === 'grow' ? 3 : 2));
    // Body and number themes have fewer two-symbol words. Fill from other themes and mark them on screen.
    if (pool.length < 5) {
      const extra = words.filter(w => !pool.includes(w) && (mode !== 'build' || (w.parts.length >= 2 && w.parts.length <= (level === 'grow' ? 3 : 2))));
      pool = [...pool, ...shuffle(extra).slice(0, 5 - pool.length)];
    }
    return chooseTargets(pool).map(w => {
      if (mode === 'listen') return { ...w, answer: w.initial, options: choices(w.initial, words.map(x => x.initial)) };
      if (mode === 'picture') return { ...w, answer: w.word, options: shuffle([w, ...shuffle(words.filter(x => x.word !== w.word && (category === 'all' || x.category === category))).slice(0, 2)]) };
      return { ...w, options: shuffle(w.parts) };
    });
  }
  const data = { symbols, starter, words, categories, shuffle, choices, makeRound };
  root.GardenData = data;
  if (typeof module !== 'undefined') module.exports = data;
})(typeof window !== 'undefined' ? window : globalThis);
