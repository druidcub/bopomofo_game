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
    ['紫','🟣','ㄗˇ','colors'], ['灰','🩶','ㄏㄨㄟ','colors'],
    ['蝦','🦐','ㄒㄧㄚ','animals'], ['蟹','🦀','ㄒㄧㄝˋ','animals'],
    ['鯨','🐋','ㄐㄧㄥ','animals'], ['貝','🐚','ㄅㄟˋ','animals'],
    ['鷹','🦅','ㄧㄥ','animals'], ['雀','🐦','ㄑㄩㄝˋ','animals'],
    ['衣','👕','ㄧ','things'], ['褲','👖','ㄎㄨˋ','things'],
    ['裙','👗','ㄑㄩㄣˊ','things'], ['鈴','🔔','ㄌㄧㄥˊ','things'],
    ['笛','🪈','ㄉㄧˊ','things'], ['桶','🪣','ㄊㄨㄥˇ','things'],
    ['針','🪡','ㄓㄣ','things'], ['桌','🪑','ㄓㄨㄛ','things'],
    ['木','🪵','ㄇㄨˋ','nature'], ['竹','🎋','ㄓㄨˊ','nature'],
    ['苗','🌱','ㄇㄧㄠˊ','nature'],
    ['蜜','🍯','ㄇㄧˋ','food'], ['莓','🍓','ㄇㄟˊ','food'], ['蕉','🍌','ㄐㄧㄠ','food'],
    ['象','🐘','ㄒㄧㄤˋ','animals'], ['狼','🐺','ㄌㄤˊ','animals'],
    ['豹','🐆','ㄅㄠˋ','animals'], ['鯊','🦈','ㄕㄚ','animals'],
    ['鵝','🪿','ㄜˊ','animals'], ['蚊','🦟','ㄨㄣˊ','animals'],
    ['茄','🍆','ㄑㄧㄝˊ','food'], ['蒜','🧄','ㄙㄨㄢˋ','food'],
    ['薑','🫚','ㄐㄧㄤ','food'], ['糕','🍰','ㄍㄠ','food'],
    ['浪','🌊','ㄌㄤˋ','nature'], ['霧','🌫️','ㄨˋ','nature'],
    ['島','🏝️','ㄉㄠˇ','nature'], ['河','🏞️','ㄏㄜˊ','nature'],
    ['扇','🪭','ㄕㄢˋ','things'], ['磚','🧱','ㄓㄨㄢ','things'],
    ['箱','📦','ㄒㄧㄤ','things'], ['輪','🛞','ㄌㄨㄣˊ','things'],
    ['哭','😢','ㄎㄨ','actions'], ['抱','🫂','ㄅㄠˋ','actions'],
    ['舌','👅','ㄕㄜˊ','body'], ['唇','👄','ㄔㄨㄣˊ','body'],
    ['眉','🤨','ㄇㄟˊ','body'], ['掌','🖐️','ㄓㄤˇ','body'], ['指','☝️','ㄓˇ','body'],
    ['零','0️⃣','ㄌㄧㄥˊ','numbers'], ['百','💯','ㄅㄞˇ','numbers'],
    ['聽','👂','ㄊㄧㄥ','actions'], ['讀','📖','ㄉㄨˊ','actions'], ['寫','✍️','ㄒㄧㄝˇ','actions']
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
    ['白色','⚪','ㄅㄞˊ ㄙㄜˋ','colors'], ['紫色','🟣','ㄗˇ ㄙㄜˋ','colors'],
    ['小海豚','🐬','ㄒㄧㄠˇ ㄏㄞˇ ㄊㄨㄣˊ','animals'], ['小海龜','🐢','ㄒㄧㄠˇ ㄏㄞˇ ㄍㄨㄟ','animals'],
    ['小河馬','🦛','ㄒㄧㄠˇ ㄏㄜˊ ㄇㄚˇ','animals'], ['小蜜蜂','🐝','ㄒㄧㄠˇ ㄇㄧˋ ㄈㄥ','animals'],
    ['小蝴蝶','🦋','ㄒㄧㄠˇ ㄏㄨˊ ㄉㄧㄝˊ','animals'], ['小松鼠','🐿️','ㄒㄧㄠˇ ㄙㄨㄥ ㄕㄨˇ','animals'],
    ['小烏龜','🐢','ㄒㄧㄠˇ ㄨ ㄍㄨㄟ','animals'], ['小企鵝','🐧','ㄒㄧㄠˇ ㄑㄧˋ ㄜˊ','animals'],
    ['小章魚','🐙','ㄒㄧㄠˇ ㄓㄤ ㄩˊ','animals'], ['小毛蟲','🐛','ㄒㄧㄠˇ ㄇㄠˊ ㄔㄨㄥˊ','animals'],
    ['大恐龍','🦕','ㄉㄚˋ ㄎㄨㄥˇ ㄌㄨㄥˊ','animals'], ['大河馬','🦛','ㄉㄚˋ ㄏㄜˊ ㄇㄚˇ','animals'],
    ['小鱷魚','🐊','ㄒㄧㄠˇ ㄜˋ ㄩˊ','animals'],
    ['小蘋果','🍎','ㄒㄧㄠˇ ㄆㄧㄥˊ ㄍㄨㄛˇ','food'], ['大蘋果','🍎','ㄉㄚˋ ㄆㄧㄥˊ ㄍㄨㄛˇ','food'],
    ['小西瓜','🍉','ㄒㄧㄠˇ ㄒㄧ ㄍㄨㄚ','food'], ['小香蕉','🍌','ㄒㄧㄠˇ ㄒㄧㄤ ㄐㄧㄠ','food'],
    ['小草莓','🍓','ㄒㄧㄠˇ ㄘㄠˇ ㄇㄟˊ','food'], ['小葡萄','🍇','ㄒㄧㄠˇ ㄆㄨˊ ㄊㄠˊ','food'],
    ['小餅乾','🍪','ㄒㄧㄠˇ ㄅㄧㄥˇ ㄍㄢ','food'], ['小麵包','🍞','ㄒㄧㄠˇ ㄇㄧㄢˋ ㄅㄠ','food'],
    ['小雞蛋','🥚','ㄒㄧㄠˇ ㄐㄧ ㄉㄢˋ','food'], ['小玉米','🌽','ㄒㄧㄠˇ ㄩˋ ㄇㄧˇ','food'],
    ['小火車','🚂','ㄒㄧㄠˇ ㄏㄨㄛˇ ㄔㄜ','things'], ['小飛機','✈️','ㄒㄧㄠˇ ㄈㄟ ㄐㄧ','things'],
    ['大雨傘','☂️','ㄉㄚˋ ㄩˇ ㄙㄢˇ','things'], ['小書包','🎒','ㄒㄧㄠˇ ㄕㄨ ㄅㄠ','things'],
    ['小皮球','🏀','ㄒㄧㄠˇ ㄆㄧˊ ㄑㄧㄡˊ','things'], ['小毛巾','🧺','ㄒㄧㄠˇ ㄇㄠˊ ㄐㄧㄣ','things'],
    ['小鬧鐘','⏰','ㄒㄧㄠˇ ㄋㄠˋ ㄓㄨㄥ','things'],
    ['黑白熊貓','🐼','ㄏㄟ ㄅㄞˊ ㄒㄩㄥˊ ㄇㄠ','animals'], ['可愛貓咪','🐱','ㄎㄜˇ ㄞˋ ㄇㄠ ㄇㄧ','animals'],
    ['可愛小兔','🐰','ㄎㄜˇ ㄞˋ ㄒㄧㄠˇ ㄊㄨˋ','animals'], ['可愛小狗','🐶','ㄎㄜˇ ㄞˋ ㄒㄧㄠˇ ㄍㄡˇ','animals'],
    ['快樂小馬','🐴','ㄎㄨㄞˋ ㄌㄜˋ ㄒㄧㄠˇ ㄇㄚˇ','animals'], ['快樂小牛','🐮','ㄎㄨㄞˋ ㄌㄜˋ ㄒㄧㄠˇ ㄋㄧㄡˊ','animals'],
    ['快樂小羊','🐑','ㄎㄨㄞˋ ㄌㄜˋ ㄒㄧㄠˇ ㄧㄤˊ','animals'], ['美麗蝴蝶','🦋','ㄇㄟˇ ㄌㄧˋ ㄏㄨˊ ㄉㄧㄝˊ','animals'],
    ['忙碌蜜蜂','🐝','ㄇㄤˊ ㄌㄨˋ ㄇㄧˋ ㄈㄥ','animals'], ['小小蝌蚪','🐸','ㄒㄧㄠˇ ㄒㄧㄠˇ ㄎㄜ ㄉㄡˇ','animals'],
    ['小小章魚','🐙','ㄒㄧㄠˇ ㄒㄧㄠˇ ㄓㄤ ㄩˊ','animals'], ['小小松鼠','🐿️','ㄒㄧㄠˇ ㄒㄧㄠˇ ㄙㄨㄥ ㄕㄨˇ','animals'],
    ['小小烏龜','🐢','ㄒㄧㄠˇ ㄒㄧㄠˇ ㄨ ㄍㄨㄟ','animals'], ['小小海豚','🐬','ㄒㄧㄠˇ ㄒㄧㄠˇ ㄏㄞˇ ㄊㄨㄣˊ','animals'],
    ['小小企鵝','🐧','ㄒㄧㄠˇ ㄒㄧㄠˇ ㄑㄧˋ ㄜˊ','animals'],
    ['香甜蘋果','🍎','ㄒㄧㄤ ㄊㄧㄢˊ ㄆㄧㄥˊ ㄍㄨㄛˇ','food'], ['香甜香蕉','🍌','ㄒㄧㄤ ㄊㄧㄢˊ ㄒㄧㄤ ㄐㄧㄠ','food'],
    ['香甜西瓜','🍉','ㄒㄧㄤ ㄊㄧㄢˊ ㄒㄧ ㄍㄨㄚ','food'], ['香甜草莓','🍓','ㄒㄧㄤ ㄊㄧㄢˊ ㄘㄠˇ ㄇㄟˊ','food'],
    ['香甜葡萄','🍇','ㄒㄧㄤ ㄊㄧㄢˊ ㄆㄨˊ ㄊㄠˊ','food'], ['香脆餅乾','🍪','ㄒㄧㄤ ㄘㄨㄟˋ ㄅㄧㄥˇ ㄍㄢ','food'],
    ['香香麵包','🍞','ㄒㄧㄤ ㄒㄧㄤ ㄇㄧㄢˋ ㄅㄠ','food'], ['熱熱白飯','🍚','ㄖㄜˋ ㄖㄜˋ ㄅㄞˊ ㄈㄢˋ','food'],
    ['冰涼牛奶','🥛','ㄅㄧㄥ ㄌㄧㄤˊ ㄋㄧㄡˊ ㄋㄞˇ','food'],
    ['美麗雪花','❄️','ㄇㄟˇ ㄌㄧˋ ㄒㄩㄝˇ ㄏㄨㄚ','nature'], ['美麗星光','⭐','ㄇㄟˇ ㄌㄧˋ ㄒㄧㄥ ㄍㄨㄤ','nature'],
    ['小小雪花','❄️','ㄒㄧㄠˇ ㄒㄧㄠˇ ㄒㄩㄝˇ ㄏㄨㄚ','nature'], ['小小雨水','🌧️','ㄒㄧㄠˇ ㄒㄧㄠˇ ㄩˇ ㄕㄨㄟˇ','nature'],
    ['小小森林','🌳','ㄒㄧㄠˇ ㄒㄧㄠˇ ㄙㄣ ㄌㄧㄣˊ','nature'], ['小小火山','🌋','ㄒㄧㄠˇ ㄒㄧㄠˇ ㄏㄨㄛˇ ㄕㄢ','nature'],
    ['老鷹','🦅','ㄌㄠˇ ㄧㄥ','animals'], ['孔雀','🦚','ㄎㄨㄥˇ ㄑㄩㄝˋ','animals'],
    ['鸚鵡','🦜','ㄧㄥ ㄨˇ','animals'], ['蜘蛛','🕷️','ㄓ ㄓㄨ','animals'],
    ['蝸牛','🐌','ㄍㄨㄚ ㄋㄧㄡˊ','animals'], ['螞蟻','🐜','ㄇㄚˇ ㄧˇ','animals'],
    ['鯨魚','🐋','ㄐㄧㄥ ㄩˊ','animals'], ['金魚','🐠','ㄐㄧㄣ ㄩˊ','animals'],
    ['貝殼','🐚','ㄅㄟˋ ㄎㄜˊ','animals'], ['螃蟹','🦀','ㄆㄤˊ ㄒㄧㄝˋ','animals'],
    ['龍蝦','🦞','ㄌㄨㄥˊ ㄒㄧㄚ','animals'], ['河蝦','🦐','ㄏㄜˊ ㄒㄧㄚ','animals'],
    ['袋鼠','🦘','ㄉㄞˋ ㄕㄨˇ','animals'], ['刺蝟','🦔','ㄘˋ ㄨㄟˋ','animals'],
    ['芒果','🥭','ㄇㄤˊ ㄍㄨㄛˇ','food'], ['鳳梨','🍍','ㄈㄥˋ ㄌㄧˊ','food'],
    ['檸檬','🍋','ㄋㄧㄥˊ ㄇㄥˊ','food'], ['櫻桃','🍒','ㄧㄥ ㄊㄠˊ','food'],
    ['花生','🥜','ㄏㄨㄚ ㄕㄥ','food'], ['蜂蜜','🍯','ㄈㄥ ㄇㄧˋ','food'],
    ['香菇','🍄','ㄒㄧㄤ ㄍㄨ','food'], ['紅豆','🫘','ㄏㄨㄥˊ ㄉㄡˋ','food'],
    ['麵條','🍜','ㄇㄧㄢˋ ㄊㄧㄠˊ','food'], ['水餃','🥟','ㄕㄨㄟˇ ㄐㄧㄠˇ','food'],
    ['壽司','🍣','ㄕㄡˋ ㄙ','food'], ['漢堡','🍔','ㄏㄢˋ ㄅㄠˇ','food'],
    ['披薩','🍕','ㄆㄧ ㄙㄚˋ','food'], ['熱狗','🌭','ㄖㄜˋ ㄍㄡˇ','food'],
    ['薯條','🍟','ㄕㄨˇ ㄊㄧㄠˊ','food'], ['鬆餅','🥞','ㄙㄨㄥ ㄅㄧㄥˇ','food'],
    ['蛋糕','🍰','ㄉㄢˋ ㄍㄠ','food'], ['青椒','🫑','ㄑㄧㄥ ㄐㄧㄠ','food'],
    ['辣椒','🌶️','ㄌㄚˋ ㄐㄧㄠ','food'], ['番茄','🍅','ㄈㄢ ㄑㄧㄝˊ','food'],
    ['剪刀','✂️','ㄐㄧㄢˇ ㄉㄠ','things'], ['籃球','🏀','ㄌㄢˊ ㄑㄧㄡˊ','things'],
    ['網球','🎾','ㄨㄤˇ ㄑㄧㄡˊ','things'], ['棒球','⚾','ㄅㄤˋ ㄑㄧㄡˊ','things'],
    ['排球','🏐','ㄆㄞˊ ㄑㄧㄡˊ','things'], ['手套','🧤','ㄕㄡˇ ㄊㄠˋ','things'],
    ['圍巾','🧣','ㄨㄟˊ ㄐㄧㄣ','things'], ['短褲','🩳','ㄉㄨㄢˇ ㄎㄨˋ','things'],
    ['長褲','👖','ㄔㄤˊ ㄎㄨˋ','things'], ['洋裝','👗','ㄧㄤˊ ㄓㄨㄤ','things'],
    ['拖鞋','🩴','ㄊㄨㄛ ㄒㄧㄝˊ','things'], ['眼鏡','👓','ㄧㄢˇ ㄐㄧㄥˋ','things'],
    ['手錶','⌚','ㄕㄡˇ ㄅㄧㄠˇ','things'], ['相機','📷','ㄒㄧㄤˋ ㄐㄧ','things'],
    ['電腦','💻','ㄉㄧㄢˋ ㄋㄠˇ','things'], ['電池','🔋','ㄉㄧㄢˋ ㄔˊ','things'],
    ['信封','✉️','ㄒㄧㄣˋ ㄈㄥ','things'], ['公車','🚌','ㄍㄨㄥ ㄔㄜ','things'],
    ['沙灘','🏖️','ㄕㄚ ㄊㄢ','nature'], ['山谷','🏞️','ㄕㄢ ㄍㄨˇ','nature'],
    ['落葉','🍂','ㄌㄨㄛˋ ㄧㄝˋ','nature'], ['花朵','🌺','ㄏㄨㄚ ㄉㄨㄛˇ','nature'],
    ['櫻花','🌸','ㄧㄥ ㄏㄨㄚ','nature'], ['向日葵','🌻','ㄒㄧㄤˋ ㄖˋ ㄎㄨㄟˊ','nature'],
    ['荷花','🪷','ㄏㄜˊ ㄏㄨㄚ','nature'], ['幼苗','🌱','ㄧㄡˋ ㄇㄧㄠˊ','nature'],
    ['自行車','🚲','ㄗˋ ㄒㄧㄥˊ ㄔㄜ','things'], ['消防車','🚒','ㄒㄧㄠ ㄈㄤˊ ㄔㄜ','things'],
    ['救護車','🚑','ㄐㄧㄡˋ ㄏㄨˋ ㄔㄜ','things'], ['直升機','🚁','ㄓˊ ㄕㄥ ㄐㄧ','things'],
    ['機車','🛵','ㄐㄧ ㄔㄜ','things'], ['帆船','⛵','ㄈㄢˊ ㄔㄨㄢˊ','things'],
    ['氣球','🎈','ㄑㄧˋ ㄑㄧㄡˊ','things'], ['蝴蝶結','🎀','ㄏㄨˊ ㄉㄧㄝˊ ㄐㄧㄝˊ','things'],
    ['垃圾桶','🗑️','ㄌㄜˋ ㄙㄜˋ ㄊㄨㄥˇ','things'], ['牙刷','🪥','ㄧㄚˊ ㄕㄨㄚ','things'],
    ['肥皂','🧼','ㄈㄟˊ ㄗㄠˋ','things'], ['水桶','🪣','ㄕㄨㄟˇ ㄊㄨㄥˇ','things'],
    ['湯匙','🥄','ㄊㄤ ㄔˊ','things'], ['餐盤','🍽️','ㄘㄢ ㄆㄢˊ','things'],
    ['米飯','🍚','ㄇㄧˇ ㄈㄢˋ','food'], ['豆漿','🥛','ㄉㄡˋ ㄐㄧㄤ','food'],
    ['布丁','🍮','ㄅㄨˋ ㄉㄧㄥ','food'], ['爆米花','🍿','ㄅㄠˋ ㄇㄧˇ ㄏㄨㄚ','food'],
    ['番薯','🍠','ㄈㄢ ㄕㄨˇ','food'], ['冰棒','🍦','ㄅㄧㄥ ㄅㄤˋ','food'],
    ['無尾熊','🐨','ㄨˊ ㄨㄟˇ ㄒㄩㄥˊ','animals'], ['貓頭鷹','🦉','ㄇㄠ ㄊㄡˊ ㄧㄥ','animals'],
    ['北極熊','🐻‍❄️','ㄅㄟˇ ㄐㄧˊ ㄒㄩㄥˊ','animals'], ['樹懶','🦥','ㄕㄨˋ ㄌㄢˇ','animals'],
    ['海豹','🦭','ㄏㄞˇ ㄅㄠˋ','animals'], ['斑馬','🦓','ㄅㄢ ㄇㄚˇ','animals'],
    ['駱駝','🐫','ㄌㄨㄛˋ ㄊㄨㄛˊ','animals'], ['白鵝','🪿','ㄅㄞˊ ㄜˊ','animals'],
    ['野狼','🐺','ㄧㄝˇ ㄌㄤˊ','animals'], ['花豹','🐆','ㄏㄨㄚ ㄅㄠˋ','animals'],
    ['鯊魚','🦈','ㄕㄚ ㄩˊ','animals'], ['水母','🪼','ㄕㄨㄟˇ ㄇㄨˇ','animals'],
    ['蝙蝠','🦇','ㄅㄧㄢ ㄈㄨˊ','animals'], ['烏鴉','🐦‍⬛','ㄨ ㄧㄚ','animals'],
    ['浣熊','🦝','ㄨㄢˇ ㄒㄩㄥˊ','animals'], ['公雞','🐓','ㄍㄨㄥ ㄐㄧ','animals'],
    ['母雞','🐔','ㄇㄨˇ ㄐㄧ','animals'], ['乳牛','🐄','ㄖㄨˇ ㄋㄧㄡˊ','animals'],
    ['水牛','🐃','ㄕㄨㄟˇ ㄋㄧㄡˊ','animals'], ['梅花鹿','🦌','ㄇㄟˊ ㄏㄨㄚ ㄌㄨˋ','animals'],
    ['奇異果','🥝','ㄑㄧˊ ㄧˋ ㄍㄨㄛˇ','food'], ['哈密瓜','🍈','ㄏㄚ ㄇㄧˋ ㄍㄨㄚ','food'],
    ['酪梨','🥑','ㄌㄨㄛˋ ㄌㄧˊ','food'], ['小黃瓜','🥒','ㄒㄧㄠˇ ㄏㄨㄤˊ ㄍㄨㄚ','food'],
    ['花椰菜','🥦','ㄏㄨㄚ ㄧㄝˊ ㄘㄞˋ','food'], ['馬鈴薯','🥔','ㄇㄚˇ ㄌㄧㄥˊ ㄕㄨˇ','food'],
    ['大蒜','🧄','ㄉㄚˋ ㄙㄨㄢˋ','food'], ['生薑','🫚','ㄕㄥ ㄐㄧㄤ','food'],
    ['沙拉','🥗','ㄕㄚ ㄌㄚ','food'], ['煎蛋','🍳','ㄐㄧㄢ ㄉㄢˋ','food'],
    ['飯糰','🍙','ㄈㄢˋ ㄊㄨㄢˊ','food'], ['咖哩飯','🍛','ㄎㄚ ㄌㄧˇ ㄈㄢˋ','food'],
    ['三明治','🥪','ㄙㄢ ㄇㄧㄥˊ ㄓˋ','food'], ['可頌','🥐','ㄎㄜˇ ㄙㄨㄥˋ','food'],
    ['吐司','🍞','ㄊㄨˇ ㄙ','food'], ['月餅','🥮','ㄩㄝˋ ㄅㄧㄥˇ','food'],
    ['乳酪','🧀','ㄖㄨˇ ㄌㄨㄛˋ','food'], ['果汁','🧃','ㄍㄨㄛˇ ㄓ','food'],
    ['生日蛋糕','🎂','ㄕㄥ ㄖˋ ㄉㄢˋ ㄍㄠ','food'], ['煎餅','🥞','ㄐㄧㄢ ㄅㄧㄥˇ','food'],
    ['滑板','🛹','ㄏㄨㄚˊ ㄅㄢˇ','things'], ['滑板車','🛴','ㄏㄨㄚˊ ㄅㄢˇ ㄔㄜ','things'],
    ['計程車','🚕','ㄐㄧˋ ㄔㄥˊ ㄔㄜ','things'], ['校車','🚌','ㄒㄧㄠˋ ㄔㄜ','things'],
    ['卡車','🚚','ㄎㄚˇ ㄔㄜ','things'], ['火箭','🚀','ㄏㄨㄛˇ ㄐㄧㄢˋ','things'],
    ['單車','🚲','ㄉㄢ ㄔㄜ','things'], ['輪胎','🛞','ㄌㄨㄣˊ ㄊㄞ','things'],
    ['帳篷','⛺','ㄓㄤˋ ㄆㄥˊ','things'], ['風箏','🪁','ㄈㄥ ㄓㄥ','things'],
    ['手電筒','🔦','ㄕㄡˇ ㄉㄧㄢˋ ㄊㄨㄥˇ','things'], ['放大鏡','🔍','ㄈㄤˋ ㄉㄚˋ ㄐㄧㄥˋ','things'],
    ['望遠鏡','🔭','ㄨㄤˋ ㄩㄢˇ ㄐㄧㄥˋ','things'], ['降落傘','🪂','ㄐㄧㄤˋ ㄌㄨㄛˋ ㄙㄢˇ','things'],
    ['外套','🧥','ㄨㄞˋ ㄊㄠˋ','things'], ['信箱','📬','ㄒㄧㄣˋ ㄒㄧㄤ','things'],
    ['紙箱','📦','ㄓˇ ㄒㄧㄤ','things'], ['蠟燭','🕯️','ㄌㄚˋ ㄓㄨˊ','things'],
    ['吉他','🎸','ㄐㄧˊ ㄊㄚ','things'], ['鋼琴','🎹','ㄍㄤ ㄑㄧㄣˊ','things'],
    ['海浪','🌊','ㄏㄞˇ ㄌㄤˋ','nature'], ['河流','🏞️','ㄏㄜˊ ㄌㄧㄡˊ','nature'],
    ['小島','🏝️','ㄒㄧㄠˇ ㄉㄠˇ','nature'], ['日出','🌅','ㄖˋ ㄔㄨ','nature'],
    ['日落','🌇','ㄖˋ ㄌㄨㄛˋ','nature'], ['夕陽','🌇','ㄒㄧˋ ㄧㄤˊ','nature'],
    ['滿月','🌕','ㄇㄢˇ ㄩㄝˋ','nature'], ['月牙','🌙','ㄩㄝˋ ㄧㄚˊ','nature'],
    ['流星','🌠','ㄌㄧㄡˊ ㄒㄧㄥ','nature'], ['閃電','⚡','ㄕㄢˇ ㄉㄧㄢˋ','nature'],
    ['讀書','📖','ㄉㄨˊ ㄕㄨ','actions'], ['寫字','✍️','ㄒㄧㄝˇ ㄗˋ','actions'],
    ['騎車','🚴','ㄑㄧˊ ㄔㄜ','actions'], ['划船','🚣','ㄏㄨㄚˊ ㄔㄨㄢˊ','actions'],
    ['爬山','🧗','ㄆㄚˊ ㄕㄢ','actions'], ['露營','🏕️','ㄌㄨˋ ㄧㄥˊ','actions'],
    ['釣魚','🎣','ㄉㄧㄠˋ ㄩˊ','actions'], ['洗澡','🛁','ㄒㄧˇ ㄗㄠˇ','actions'],
    ['掃地','🧹','ㄙㄠˇ ㄉㄧˋ','actions'], ['擁抱','🫂','ㄩㄥˇ ㄅㄠˋ','actions'],
    ['手掌','🖐️','ㄕㄡˇ ㄓㄤˇ','body'], ['手指','☝️','ㄕㄡˇ ㄓˇ','body'],
    ['腳掌','🦶','ㄐㄧㄠˇ ㄓㄤˇ','body'], ['牙齒','🦷','ㄧㄚˊ ㄔˇ','body'],
    ['嘴唇','👄','ㄗㄨㄟˇ ㄔㄨㄣˊ','body'], ['眼睛','👁️','ㄧㄢˇ ㄐㄧㄥ','body'],
    ['耳朵','👂','ㄦˇ ㄉㄨㄛˇ','body'], ['眉毛','🤨','ㄇㄟˊ ㄇㄠˊ','body'],
    ['手臂','💪','ㄕㄡˇ ㄅㄧˋ','body'], ['肩膀','🧍','ㄐㄧㄢ ㄅㄤˇ','body'],
    ['黑色','⚫','ㄏㄟ ㄙㄜˋ','colors'], ['灰色','🩶','ㄏㄨㄟ ㄙㄜˋ','colors'],
    ['橘色','🟠','ㄐㄩˊ ㄙㄜˋ','colors'], ['粉紅色','🩷','ㄈㄣˇ ㄏㄨㄥˊ ㄙㄜˋ','colors'],
    ['棕色','🟤','ㄗㄨㄥ ㄙㄜˋ','colors'], ['金色','🟨','ㄐㄧㄣ ㄙㄜˋ','colors'],
    ['數字','🔢','ㄕㄨˋ ㄗˋ','numbers'], ['一百','💯','ㄧ ㄅㄞˇ','numbers'],
    ['揮手','👋','ㄏㄨㄟ ㄕㄡˇ','actions'], ['點頭','🙂','ㄉㄧㄢˇ ㄊㄡˊ','actions'],
    ['搖頭','🙅','ㄧㄠˊ ㄊㄡˊ','actions'], ['握手','🤝','ㄨㄛˋ ㄕㄡˇ','actions'],
    ['伸手','🫴','ㄕㄣ ㄕㄡˇ','actions'], ['招手','👋','ㄓㄠ ㄕㄡˇ','actions'],
    ['舉手','🙋','ㄐㄩˇ ㄕㄡˇ','actions'], ['踢球','⚽','ㄊㄧ ㄑㄧㄡˊ','actions'],
    ['丟球','🤾','ㄉㄧㄡ ㄑㄧㄡˊ','actions'], ['接球','🤲','ㄐㄧㄝ ㄑㄧㄡˊ','actions'],
    ['攀爬','🧗','ㄆㄢ ㄆㄚˊ','actions'], ['溜冰','⛸️','ㄌㄧㄡ ㄅㄧㄥ','actions'],
    ['打鼓','🥁','ㄉㄚˇ ㄍㄨˇ','actions'], ['彈琴','🎹','ㄊㄢˊ ㄑㄧㄣˊ','actions'],
    ['吹笛','🪈','ㄔㄨㄟ ㄉㄧˊ','actions'], ['敲門','🚪','ㄑㄧㄠ ㄇㄣˊ','actions'],
    ['開門','🚪','ㄎㄞ ㄇㄣˊ','actions'], ['關門','🚪','ㄍㄨㄢ ㄇㄣˊ','actions'],
    ['摺紙','📃','ㄓㄜˊ ㄓˇ','actions'], ['澆花','🌷','ㄐㄧㄠ ㄏㄨㄚ','actions'],
    ['種花','🌱','ㄓㄨㄥˋ ㄏㄨㄚ','actions'], ['煮飯','🍳','ㄓㄨˇ ㄈㄢˋ','actions'],
    ['雨衣','🧥','ㄩˇ ㄧ','things'], ['雨鞋','🥾','ㄩˇ ㄒㄧㄝˊ','things'],
    ['運動鞋','👟','ㄩㄣˋ ㄉㄨㄥˋ ㄒㄧㄝˊ','things'], ['安全帽','⛑️','ㄢ ㄑㄩㄢˊ ㄇㄠˋ','things'],
    ['背心','🦺','ㄅㄟˋ ㄒㄧㄣ','things'], ['泳衣','🩱','ㄩㄥˇ ㄧ','things'],
    ['泳鏡','🥽','ㄩㄥˇ ㄐㄧㄥˋ','things'], ['掃帚','🧹','ㄙㄠˋ ㄓㄡˇ','things'],
    ['水壺','🫖','ㄕㄨㄟˇ ㄏㄨˊ','things'], ['茶壺','🫖','ㄔㄚˊ ㄏㄨˊ','things'],
    ['保溫杯','🥤','ㄅㄠˇ ㄨㄣ ㄅㄟ','things'], ['電視','📺','ㄉㄧㄢˋ ㄕˋ','things'],
    ['收音機','📻','ㄕㄡ ㄧㄣ ㄐㄧ','things'], ['電梯','🛗','ㄉㄧㄢˋ ㄊㄧ','things'],
    ['滑梯','🛝','ㄏㄨㄚˊ ㄊㄧ','things'], ['火車站','🚉','ㄏㄨㄛˇ ㄔㄜ ㄓㄢˋ','things'],
    ['紅綠燈','🚦','ㄏㄨㄥˊ ㄌㄩˋ ㄉㄥ','things'], ['拼圖','🧩','ㄆㄧㄣ ㄊㄨˊ','things'],
    ['磁鐵','🧲','ㄘˊ ㄊㄧㄝˇ','things'], ['羽毛球','🏸','ㄩˇ ㄇㄠˊ ㄑㄧㄡˊ','things'],
    ['露水','💧','ㄌㄨˋ ㄕㄨㄟˇ','nature'], ['冰山','🧊','ㄅㄧㄥ ㄕㄢ','nature'],
    ['海島','🏝️','ㄏㄞˇ ㄉㄠˇ','nature'], ['沙漠','🏜️','ㄕㄚ ㄇㄛˋ','nature'],
    ['火焰','🔥','ㄏㄨㄛˇ ㄧㄢˋ','nature'], ['樹林','🌲','ㄕㄨˋ ㄌㄧㄣˊ','nature'],
    ['竹林','🎋','ㄓㄨˊ ㄌㄧㄣˊ','nature'], ['草原','🌿','ㄘㄠˇ ㄩㄢˊ','nature'],
    ['小溪','🏞️','ㄒㄧㄠˇ ㄒㄧ','nature'], ['山洞','🕳️','ㄕㄢ ㄉㄨㄥˋ','nature'],
    ['水滴','💧','ㄕㄨㄟˇ ㄉㄧ','nature'], ['雨雲','🌧️','ㄩˇ ㄩㄣˊ','nature'],
    ['雪人','⛄','ㄒㄩㄝˇ ㄖㄣˊ','nature'], ['星空','🌌','ㄒㄧㄥ ㄎㄨㄥ','nature'],
    ['玫瑰','🌹','ㄇㄟˊ ㄍㄨㄟ','nature'],
    ['蟋蟀','🦗','ㄒㄧ ㄕㄨㄞˋ','animals'], ['瓢蟲','🐞','ㄆㄧㄠˊ ㄔㄨㄥˊ','animals'],
    ['蚯蚓','🪱','ㄑㄧㄡ ㄧㄣˇ','animals'], ['蜥蜴','🦎','ㄒㄧ ㄧˋ','animals'],
    ['犀牛','🦏','ㄒㄧ ㄋㄧㄡˊ','animals'], ['大猩猩','🦍','ㄉㄚˋ ㄒㄧㄥ ㄒㄧㄥ','animals'],
    ['火雞','🦃','ㄏㄨㄛˇ ㄐㄧ','animals'], ['野豬','🐗','ㄧㄝˇ ㄓㄨ','animals'],
    ['山羊','🐐','ㄕㄢ ㄧㄤˊ','animals'], ['水獺','🦦','ㄕㄨㄟˇ ㄊㄚˋ','animals'],
    ['便當','🍱','ㄅㄧㄢˋ ㄉㄤ','food'], ['拉麵','🍜','ㄌㄚ ㄇㄧㄢˋ','food'],
    ['炒飯','🍚','ㄔㄠˇ ㄈㄢˋ','food'], ['炒麵','🍜','ㄔㄠˇ ㄇㄧㄢˋ','food'],
    ['義大利麵','🍝','ㄧˋ ㄉㄚˋ ㄌㄧˋ ㄇㄧㄢˋ','food']
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
  function chooseTargets(pool, recent = [], count=5, preferred=[]) {
    const history = new Set(recent), favorites=new Set(preferred);
    if(favorites.size) return [...shuffle(pool.filter(w=>favorites.has(w.word)&&!history.has(w.word))),...shuffle(pool.filter(w=>favorites.has(w.word)&&history.has(w.word))),...shuffle(pool.filter(w=>!favorites.has(w.word)&&!history.has(w.word))),...shuffle(pool.filter(w=>!favorites.has(w.word)&&history.has(w.word)))].slice(0,count);
    return [...shuffle(pool.filter(w => !history.has(w.word))), ...shuffle(pool.filter(w => history.has(w.word)))].slice(0, count);
  }
  function symbolRange(scope, custom=[]){
    const selected=[...new Set(custom)].filter(s=>symbols.includes(s));
    return scope==='custom'&&selected.length>=3?selected:scope==='all'?symbols:starter;
  }
  function makeRound(mode, scope = 'starter', category = 'all', level = 'easy', recent = [], memoryPairs = 3, customSymbols = [], preferred = []) {
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
      return chooseTargets(eligible, recent,5,preferred).map(w => {
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
    if (mode === 'syllables' && category === 'all') pool = [...chooseTargets(pool.filter(w=>w.count===1),recent,1,preferred), ...chooseTargets(pool.filter(w=>w.count===2),recent,2,preferred), ...chooseTargets(pool.filter(w=>w.count===3),recent,1,preferred), ...chooseTargets(pool.filter(w=>w.count===4),recent,1,preferred)];
    return chooseTargets(pool, recent,5,preferred).map(w => {
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
  function makeAdventure(scope='starter', category='all', level='easy', recent=[], customSymbols=[], preferred=[]) {
    const route = shuffle(['match','picture','syllables','listen',level === 'grow' ? 'repair' : 'build']);
    const used = [...recent], stationWords=[];
    return route.map(mode=>{
      // Each generated round has five distinct word targets, so one is always
      // available after at most three earlier word stations. Recency alone is
      // not enough: a well-explored theme may have every word in its history.
      const availableFavorites=preferred.filter(w=>!stationWords.includes(w));
      const candidates=makeRound(mode,scope,category,level,used,3,customSymbols,availableFavorites);
      const q=candidates.find(candidate=>!candidate.word||!stationWords.includes(candidate.word));
      if(q.word){used.push(q.word);stationWords.push(q.word);}
      return {...q,mode};
    });
  }
  function makePackRound(category='all', size=2, recent=[], preferred=[]) {
    const count=size===3?3:2, source=[...words,...phrases], history=[...recent];
    if(!Object.hasOwn(categories,category))category='all';
    const favoredThemes=[...new Set(source.filter(w=>preferred.includes(w.word)).map(w=>w.category))];
    return Array.from({length:5},()=>{
      const theme=category==='all'?shuffle(favoredThemes.length?favoredThemes:Object.keys(categories).filter(c=>c!=='all'))[0]:category;
      const pool=source.filter(w=>w.category===theme), seen=new Set();
      const sequence=chooseTargets(pool,history,pool.length,preferred).filter(w=>{
        if(seen.has(w.emoji))return false;seen.add(w.emoji);return true;
      }).slice(0,count);
      // Select distractors against the chosen pictures, not every candidate in the pool.
      const pictures=new Set(sequence.map(w=>w.emoji));
      const distractors=shuffle(pool).filter(w=>{
        if(pictures.has(w.emoji))return false;pictures.add(w.emoji);return true;
      }).slice(0,2);
      history.push(...sequence.map(w=>w.word));
      return {category:theme,sequence,options:shuffle([...sequence,...distractors])};
    });
  }
  const data = { symbols, starter, words, phrases, categories, tones, shuffle, choices, makeRound, makeAdventure, makePackRound, symbolRange };
  root.GardenData = data;
  if (typeof module !== 'undefined') module.exports = data;
})(typeof window !== 'undefined' ? window : globalThis);
