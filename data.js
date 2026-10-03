(function (root) {
  'use strict';
  const symbols = [...'ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦㄧㄨㄩ'];
  const starter = [...'ㄅㄆㄇㄈㄚㄧㄨㄩ'];
  const categories = { all: '全部朋友', animals: '動物', food: '食物', nature: '大自然', things: '生活物品', body: '我的身體', numbers: '數字', actions: '動一動', colors: '色彩' };
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
    ['五','5️⃣','ㄨˇ','numbers'], ['八','8️⃣','ㄅㄚ','numbers'],
    ['蛇','🐍','ㄕㄜˊ','animals'], ['蛙','🐸','ㄨㄚ','animals'],
    ['鼠','🐭','ㄕㄨˇ','animals'], ['豬','🐷','ㄓㄨ','animals'],
    ['狐','🦊','ㄏㄨˊ','animals'], ['龜','🐢','ㄍㄨㄟ','animals'],
    ['猴','🐵','ㄏㄡˊ','animals'], ['虎','🐯','ㄏㄨˇ','animals'],
    ['獅','🦁','ㄕ','animals'], ['蜂','🐝','ㄈㄥ','animals'],
    ['蟲','🐛','ㄔㄨㄥˊ','animals'], ['蝶','🦋','ㄉㄧㄝˊ','animals'],
    ['飯','🍚','ㄈㄢˋ','food'], ['麵','🍜','ㄇㄧㄢˋ','food'],
    ['餅','🍪','ㄅㄧㄥˇ','food'], ['奶','🥛','ㄋㄞˇ','food'],
    ['果','🍎','ㄍㄨㄛˇ','food'], ['橘','🍊','ㄐㄩˊ','food'],
    ['李','🍑','ㄌㄧˇ','food'], ['橙','🍊','ㄔㄥˊ','food'],
    ['粥','🥣','ㄓㄡ','food'], ['油','🫗','ㄧㄡˊ','food'],
    ['鹽','🧂','ㄧㄢˊ','food'], ['棗','🍒','ㄗㄠˇ','food'],
    ['星','⭐','ㄒㄧㄥ','nature'], ['月','🌙','ㄩㄝˋ','nature'],
    ['光','☀️','ㄍㄨㄤ','nature'], ['沙','🏖️','ㄕㄚ','nature'],
    ['雪','❄️','ㄒㄩㄝˇ','nature'], ['雷','🌩️','ㄌㄟˊ','nature'],
    ['冰','🧊','ㄅㄧㄥ','nature'], ['石','🪨','ㄕˊ','nature'],
    ['葉','🍂','ㄧㄝˋ','nature'], ['草','🌿','ㄘㄠˇ','nature'],
    ['湖','🏞️','ㄏㄨˊ','nature'], ['洞','🕳️','ㄉㄨㄥˋ','nature'],
    ['門','🚪','ㄇㄣˊ','things'], ['窗','🪟','ㄔㄨㄤ','things'],
    ['燈','💡','ㄉㄥ','things'], ['船','🚢','ㄔㄨㄢˊ','things'],
    ['鞋','👟','ㄒㄧㄝˊ','things'], ['襪','🧦','ㄨㄚˋ','things'],
    ['鍋','🍳','ㄍㄨㄛ','things'], ['碗','🥣','ㄨㄢˇ','things'],
    ['盤','🍽️','ㄆㄢˊ','things'], ['梳','🪮','ㄕㄨ','things'],
    ['鏡','🪞','ㄐㄧㄥˋ','things'], ['鎖','🔒','ㄙㄨㄛˇ','things'],
    ['琴','🎹','ㄑㄧㄣˊ','things'], ['鼓','🥁','ㄍㄨˇ','things'],
    ['頭','🙂','ㄊㄡˊ','body'], ['鼻','👃','ㄅㄧˊ','body'],
    ['臉','😊','ㄌㄧㄢˇ','body'], ['腿','🦵','ㄊㄨㄟˇ','body'],
    ['背','🧍','ㄅㄟˋ','body'], ['心','❤️','ㄒㄧㄣ','body'],
    ['六','6️⃣','ㄌㄧㄡˋ','numbers'], ['七','7️⃣','ㄑㄧ','numbers'],
    ['九','9️⃣','ㄐㄧㄡˇ','numbers'], ['十','🔟','ㄕˊ','numbers'],
    ['跑','🏃','ㄆㄠˇ','actions'], ['跳','🤸','ㄊㄧㄠˋ','actions'],
    ['走','🚶','ㄗㄡˇ','actions'], ['飛','🕊️','ㄈㄟ','actions'],
    ['游','🏊','ㄧㄡˊ','actions'], ['坐','🧘','ㄗㄨㄛˋ','actions'],
    ['站','🧍','ㄓㄢˋ','actions'], ['看','👀','ㄎㄢˋ','actions'],
    ['笑','😄','ㄒㄧㄠˋ','actions'], ['喝','🥤','ㄏㄜ','actions'],
    ['吃','😋','ㄔ','actions'], ['睡','😴','ㄕㄨㄟˋ','actions'],
    ['紅','🔴','ㄏㄨㄥˊ','colors'], ['黃','🟡','ㄏㄨㄤˊ','colors'],
    ['藍','🔵','ㄌㄢˊ','colors'], ['綠','🟢','ㄌㄩˋ','colors'],
    ['黑','⚫','ㄏㄟ','colors'], ['白','⚪','ㄅㄞˊ','colors'],
    ['紫','🟣','ㄗˇ','colors'], ['灰','🩶','ㄏㄨㄟ','colors']
  ];
  const consonants = new Set([...'ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙ']);
  const words = rows.map(([word, emoji, zhuyin, category]) => {
    const tone = (zhuyin.match(/[ˊˇˋ]/) || [])[0];
    const parts = [...zhuyin.replace(/[ˊˇˋ]/g, '')];
    return { word, emoji, zhuyin, category, tone, parts, initial: parts[0], rhyme: (consonants.has(parts[0]) ? parts.slice(1) : parts).join('') };
  });
  const phraseRows = [
    ['貓咪','🐱','ㄇㄠ ㄇㄧ','animals'], ['小兔','🐰','ㄒㄧㄠˇ ㄊㄨˋ','animals'],
    ['小狗','🐶','ㄒㄧㄠˇ ㄍㄡˇ','animals'], ['小魚','🐟','ㄒㄧㄠˇ ㄩˊ','animals'],
    ['熊貓','🐼','ㄒㄩㄥˊ ㄇㄠ','animals'], ['大象','🐘','ㄉㄚˋ ㄒㄧㄤˋ','animals'],
    ['蝴蝶','🦋','ㄏㄨˊ ㄉㄧㄝˊ','animals'], ['蜜蜂','🐝','ㄇㄧˋ ㄈㄥ','animals'],
    ['長頸鹿','🦒','ㄔㄤˊ ㄐㄧㄥˇ ㄌㄨˋ','animals'], ['毛毛蟲','🐛','ㄇㄠˊ ㄇㄠˊ ㄔㄨㄥˊ','animals'],
    ['恐龍','🦕','ㄎㄨㄥˇ ㄌㄨㄥˊ','animals'], ['企鵝','🐧','ㄑㄧˋ ㄜˊ','animals'],
    ['蝌蚪','🐸','ㄎㄜ ㄉㄡˇ','animals'], ['河馬','🦛','ㄏㄜˊ ㄇㄚˇ','animals'],
    ['海豚','🐬','ㄏㄞˇ ㄊㄨㄣˊ','animals'], ['鱷魚','🐊','ㄜˋ ㄩˊ','animals'],
    ['小白兔','🐰','ㄒㄧㄠˇ ㄅㄞˊ ㄊㄨˋ','animals'], ['小青蛙','🐸','ㄒㄧㄠˇ ㄑㄧㄥ ㄨㄚ','animals'],
    ['蘋果','🍎','ㄆㄧㄥˊ ㄍㄨㄛˇ','food'], ['葡萄','🍇','ㄆㄨˊ ㄊㄠˊ','food'],
    ['香蕉','🍌','ㄒㄧㄤ ㄐㄧㄠ','food'], ['西瓜','🍉','ㄒㄧ ㄍㄨㄚ','food'],
    ['草莓','🍓','ㄘㄠˇ ㄇㄟˊ','food'], ['玉米','🌽','ㄩˋ ㄇㄧˇ','food'],
    ['牛奶','🥛','ㄋㄧㄡˊ ㄋㄞˇ','food'], ['白飯','🍚','ㄅㄞˊ ㄈㄢˋ','food'],
    ['雞蛋','🥚','ㄐㄧ ㄉㄢˋ','food'], ['麵包','🍞','ㄇㄧㄢˋ ㄅㄠ','food'],
    ['餅乾','🍪','ㄅㄧㄥˇ ㄍㄢ','food'], ['冰淇淋','🍦','ㄅㄧㄥ ㄑㄧˊ ㄌㄧㄣˊ','food'],
    ['巧克力','🍫','ㄑㄧㄠˇ ㄎㄜˋ ㄌㄧˋ','food'], ['大西瓜','🍉','ㄉㄚˋ ㄒㄧ ㄍㄨㄚ','food'],
    ['彩虹','🌈','ㄘㄞˇ ㄏㄨㄥˊ','nature'], ['太陽','☀️','ㄊㄞˋ ㄧㄤˊ','nature'],
    ['月亮','🌙','ㄩㄝˋ ㄌㄧㄤˋ','nature'], ['雪花','❄️','ㄒㄩㄝˇ ㄏㄨㄚ','nature'],
    ['白雲','☁️','ㄅㄞˊ ㄩㄣˊ','nature'], ['大海','🌊','ㄉㄚˋ ㄏㄞˇ','nature'],
    ['火山','🌋','ㄏㄨㄛˇ ㄕㄢ','nature'], ['星光','🌟','ㄒㄧㄥ ㄍㄨㄤ','nature'],
    ['火車','🚂','ㄏㄨㄛˇ ㄔㄜ','things'], ['飛機','✈️','ㄈㄟ ㄐㄧ','things'],
    ['汽車','🚗','ㄑㄧˋ ㄔㄜ','things'], ['雨傘','☂️','ㄩˇ ㄙㄢˇ','things'],
    ['書包','🎒','ㄕㄨ ㄅㄠ','things'], ['鉛筆','✏️','ㄑㄧㄢ ㄅㄧˇ','things'],
    ['水杯','🥤','ㄕㄨㄟˇ ㄅㄟ','things'], ['足球','⚽','ㄗㄨˊ ㄑㄧㄡˊ','things'],
    ['風車','🎡','ㄈㄥ ㄔㄜ','things'], ['輪船','🚢','ㄌㄨㄣˊ ㄔㄨㄢˊ','things'],
    ['小小火車','🚂','ㄒㄧㄠˇ ㄒㄧㄠˇ ㄏㄨㄛˇ ㄔㄜ','things'], ['彩色鉛筆','🖍️','ㄘㄞˇ ㄙㄜˋ ㄑㄧㄢ ㄅㄧˇ','things'],
    ['快樂小狗','🐶','ㄎㄨㄞˋ ㄌㄜˋ ㄒㄧㄠˇ ㄍㄡˇ','animals'], ['美麗彩虹','🌈','ㄇㄟˇ ㄌㄧˋ ㄘㄞˇ ㄏㄨㄥˊ','nature'],
    ['小手','✋','ㄒㄧㄠˇ ㄕㄡˇ','body'], ['雙手','🙌','ㄕㄨㄤ ㄕㄡˇ','body'],
    ['雙腳','🦶','ㄕㄨㄤ ㄐㄧㄠˇ','body'], ['刷牙','🪥','ㄕㄨㄚ ㄧㄚˊ','body'],
    ['洗手','🧼','ㄒㄧˇ ㄕㄡˇ','body'], ['拍手','👏','ㄆㄞ ㄕㄡˇ','body'],
    ['小羊','🐑','ㄒㄧㄠˇ ㄧㄤˊ','animals'], ['小馬','🐴','ㄒㄧㄠˇ ㄇㄚˇ','animals'],
    ['小牛','🐮','ㄒㄧㄠˇ ㄋㄧㄡˊ','animals'], ['松鼠','🐿️','ㄙㄨㄥ ㄕㄨˇ','animals'],
    ['烏龜','🐢','ㄨ ㄍㄨㄟ','animals'], ['章魚','🐙','ㄓㄤ ㄩˊ','animals'],
    ['水蜜桃','🍑','ㄕㄨㄟˇ ㄇㄧˋ ㄊㄠˊ','food'], ['烤玉米','🌽','ㄎㄠˇ ㄩˋ ㄇㄧˇ','food'],
    ['小番茄','🍅','ㄒㄧㄠˇ ㄈㄢ ㄑㄧㄝˊ','food'], ['地瓜','🍠','ㄉㄧˋ ㄍㄨㄚ','food'],
    ['洋蔥','🧅','ㄧㄤˊ ㄘㄨㄥ','food'], ['青菜','🥬','ㄑㄧㄥ ㄘㄞˋ','food'],
    ['甜甜圈','🍩','ㄊㄧㄢˊ ㄊㄧㄢˊ ㄑㄩㄢ','food'],
    ['陽光','☀️','ㄧㄤˊ ㄍㄨㄤ','nature'], ['雨水','🌧️','ㄩˇ ㄕㄨㄟˇ','nature'],
    ['青草','🌿','ㄑㄧㄥ ㄘㄠˇ','nature'], ['樹葉','🍃','ㄕㄨˋ ㄧㄝˋ','nature'],
    ['森林','🌳','ㄙㄣ ㄌㄧㄣˊ','nature'], ['大樹','🌲','ㄉㄚˋ ㄕㄨˋ','nature'],
    ['積木','🧱','ㄐㄧ ㄇㄨˋ','things'], ['玩具','🧸','ㄨㄢˊ ㄐㄩˋ','things'],
    ['皮球','🏀','ㄆㄧˊ ㄑㄧㄡˊ','things'], ['檯燈','💡','ㄊㄞˊ ㄉㄥ','things'],
    ['毛巾','🧺','ㄇㄠˊ ㄐㄧㄣ','things'], ['電話','☎️','ㄉㄧㄢˋ ㄏㄨㄚˋ','things'],
    ['鬧鐘','⏰','ㄋㄠˋ ㄓㄨㄥ','things'],
    ['跑步','🏃','ㄆㄠˇ ㄅㄨˋ','actions'], ['跳舞','💃','ㄊㄧㄠˋ ㄨˇ','actions'],
    ['唱歌','🎤','ㄔㄤˋ ㄍㄜ','actions'], ['喝水','🥤','ㄏㄜ ㄕㄨㄟˇ','actions'],
    ['看書','📖','ㄎㄢˋ ㄕㄨ','actions'], ['畫圖','🎨','ㄏㄨㄚˋ ㄊㄨˊ','actions'],
    ['游泳','🏊','ㄧㄡˊ ㄩㄥˇ','actions'], ['走路','🚶','ㄗㄡˇ ㄌㄨˋ','actions'],
    ['紅色','🔴','ㄏㄨㄥˊ ㄙㄜˋ','colors'], ['黃色','🟡','ㄏㄨㄤˊ ㄙㄜˋ','colors'],
    ['藍色','🔵','ㄌㄢˊ ㄙㄜˋ','colors'], ['綠色','🟢','ㄌㄩˋ ㄙㄜˋ','colors'],
    ['白色','⚪','ㄅㄞˊ ㄙㄜˋ','colors'], ['紫色','🟣','ㄗˇ ㄙㄜˋ','colors']
  ];
  const phrases = phraseRows.map(([word, emoji, zhuyin, category]) => ({ word, emoji, zhuyin, category, syllables: zhuyin.split(' '), count: zhuyin.split(' ').length }));
  const confusables = [['ㄅ','ㄆ','ㄇ','ㄈ'],['ㄉ','ㄊ','ㄋ','ㄌ'],['ㄍ','ㄎ','ㄏ'],['ㄐ','ㄑ','ㄒ'],['ㄓ','ㄔ','ㄕ','ㄖ','ㄗ','ㄘ','ㄙ'],['ㄚ','ㄛ','ㄜ','ㄝ'],['ㄞ','ㄟ','ㄠ','ㄡ'],['ㄢ','ㄣ','ㄤ','ㄥ'],['ㄧ','ㄨ','ㄩ']];
  const tones = [
    {value:1,mark:'一聲',label:'平平的',path:'M12 34 H88'},
    {value:2,mark:'ˊ',label:'往上走',path:'M12 57 L88 14'},
    {value:3,mark:'ˇ',label:'先下再上',path:'M12 25 L43 60 L88 14'},
    {value:4,mark:'ˋ',label:'往下走',path:'M12 14 L88 60'}
  ];
  function shuffle(items, rng = Math.random) {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function choices(answer, pool, count = 3) {
    return shuffle([answer, ...shuffle([...new Set(pool)].filter(s => s !== answer)).slice(0, count - 1)]);
  }
  function chooseTargets(pool, recent = []) {
    const history = new Set(recent);
    return [...shuffle(pool.filter(w => !history.has(w.word))), ...shuffle(pool.filter(w => history.has(w.word)))].slice(0, 5);
  }
  function symbolRange(scope, custom=[]){
    const selected=[...new Set(custom)].filter(s=>symbols.includes(s));
    return scope==='custom'&&selected.length>=3?selected:scope==='all'?symbols:starter;
  }
  function makeRound(mode, scope = 'starter', category = 'all', level = 'easy', recent = [], memoryPairs = 3, customSymbols = []) {
    const symbolPool = symbolRange(scope,customSymbols);
    if(mode==='bingo') return shuffle(symbolPool).slice(0,symbolPool.length>=9?9:symbolPool.length>=6?6:3).map((s,i)=>({id:i,symbol:s}));
    if (mode === 'match') {
      const targets=shuffle(symbolPool);
      while(targets.length<5){const next=shuffle(symbolPool.filter(s=>s!==targets.at(-1)));targets.push(...next);}
      return targets.slice(0, 5).map(s => ({ answer: s, options: choices(s, symbolPool) }));
    }
    if (mode === 'memory') {
      const selected = shuffle(symbolPool).slice(0, [3,4,6].includes(memoryPairs) ? memoryPairs : 3);
      return shuffle(selected.flatMap((s, i) => [{ id: i + '-a', symbol: s }, { id: i + '-b', symbol: s }]));
    }
    if (mode === 'rhyme' || mode === 'initial') {
      // Keep the whole garden available: some themes have too few rhyming pairs.
      const key = mode === 'rhyme' ? 'rhyme' : 'initial';
      const eligible = words.filter(w => w[key] && words.some(x => x.word !== w.word && x[key] === w[key]));
      return chooseTargets(eligible, recent).map(w => {
        const friend = shuffle(words.filter(x => x.word !== w.word && x[key] === w[key]))[0];
        const others = shuffle(words.filter(x => x[key] !== w[key] && x.word !== w.word)).slice(0, 2);
        return { ...w, answer: friend.word, options: shuffle([friend, ...others]) };
      });
    }
    const source = ['syllables','picture'].includes(mode) ? [...words.map(w => ({...w, count:1, syllables:[w.zhuyin]})), ...phrases] : words;
    let pool = source.filter(w => category === 'all' || w.category === category);
    if (['build','repair'].includes(mode)) pool = pool.filter(w => w.parts.length >= 2 && w.parts.length <= (level === 'grow' ? 3 : 2));
    // Body and number themes have fewer two-symbol words. Fill from other themes and mark them on screen.
    if (pool.length < 5) {
      const extra = source.filter(w => !pool.includes(w) && (!['build','repair'].includes(mode) || (w.parts.length >= 2 && w.parts.length <= (level === 'grow' ? 3 : 2))));
      pool = [...pool, ...shuffle(extra).slice(0, 5 - pool.length)];
    }
    // Hearing different lengths in one round is more useful than five equally long words.
    if (mode === 'syllables' && category === 'all') pool = [...shuffle(pool.filter(w=>w.count===1)).slice(0,1), ...shuffle(pool.filter(w=>w.count===2)).slice(0,2), ...shuffle(pool.filter(w=>w.count===3)).slice(0,1), ...shuffle(pool.filter(w=>w.count===4)).slice(0,1)];
    return chooseTargets(pool, recent).map(w => {
      if (mode === 'listen') return { ...w, answer: w.initial, options: choices(w.initial, words.map(x => x.initial)) };
      if (mode === 'picture') {
        const seen = new Set([w.emoji]);
        const others = shuffle(source.filter(x => x.word !== w.word && x.category === w.category)).filter(x => {if(seen.has(x.emoji)) return false; seen.add(x.emoji); return true;}).slice(0,2);
        return { ...w, answer:w.word, options:shuffle([w,...others]) };
      }
      if (mode === 'syllables') return {...w, answer:w.count, options:[1,2,3,4]};
      if (mode === 'tone') return {...w, answer:w.tone==='ˊ'?2:w.tone==='ˇ'?3:w.tone==='ˋ'?4:1, options:shuffle(tones)};
      if (mode === 'repair') {
        const missing = Math.floor(Math.random()*w.parts.length), answer=w.parts[missing];
        return {...w, missing, answer, options:choices(answer, confusables.find(g=>g.includes(answer))||symbols)};
      }
      const near = confusables.filter(g=>w.parts.some(p=>g.includes(p))).flat();
      const extra = shuffle([...new Set(near)].filter(s=>!w.parts.includes(s))).slice(0,2);
      return { ...w, options: shuffle([...w.parts, ...extra]) };
    });
  }
  function makeAdventure(scope='starter', category='all', level='easy', recent=[], customSymbols=[]) {
    const route = shuffle(['match','picture','syllables','listen',level === 'grow' ? 'repair' : 'build']);
    const used = [...recent];
    return route.map(mode=>{
      const q=makeRound(mode,scope,category,level,used,3,customSymbols)[0];
      if(q.word)used.push(q.word);
      return {...q,mode};
    });
  }
  const data = { symbols, starter, words, phrases, categories, tones, shuffle, choices, makeRound, makeAdventure, symbolRange };
  root.GardenData = data;
  if (typeof module !== 'undefined') module.exports = data;
})(typeof window !== 'undefined' ? window : globalThis);
