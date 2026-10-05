(function(root){
  'use strict';
  // The first six anchors preserve the former six flower beds during migration.
  const anchors=[{x:22,y:64},{x:50,y:64},{x:78,y:64},{x:22,y:89},{x:50,y:89},{x:78,y:89},{x:35,y:76},{x:65,y:76}];
  const kinds={tulip:{name:'小花',category:'plants',at:0,zhuyin:'ㄒㄧㄠˇ ㄏㄨㄚ'},sunflower:{name:'向日葵',category:'plants',at:1,zhuyin:'ㄒㄧㄤˋ ㄖˋ ㄎㄨㄟˊ'},mushroom:{name:'小蘑菇',category:'plants',at:2,zhuyin:'ㄒㄧㄠˇ ㄇㄛˊ ㄍㄨ'},butterfly:{name:'蝴蝶',category:'animals',at:3,zhuyin:'ㄏㄨˊ ㄉㄧㄝˊ'},bunny:{name:'小兔',category:'animals',at:0,zhuyin:'ㄒㄧㄠˇ ㄊㄨˋ'},tree:{name:'大樹',category:'plants',at:5,zhuyin:'ㄉㄚˋ ㄕㄨˋ'},pond:{name:'青蛙',category:'animals',at:7,zhuyin:'ㄑㄧㄥ ㄨㄚ'},rainbow:{name:'彩虹',category:'decor',at:10,zhuyin:'ㄘㄞˇ ㄏㄨㄥˊ'}};
  const starter=['tulip','','tulip','','tulip',''];
  const areas={meadow:{name:'小花園',emoji:'🌷'},pond:{name:'池塘',emoji:'🦆'},picnic:{name:'野餐角落',emoji:'🧺'}};
  Object.entries({tulip:'🌷',sunflower:'🌻',mushroom:'🍄',butterfly:'🦋',bunny:'🐰',tree:'🌳',pond:'🐸',rainbow:'🌈'}).forEach(([id,emoji])=>kinds[id].emoji=emoji);
  Object.assign(kinds,{
    daisy:{name:'小雛菊',emoji:'🌼',category:'plants',at:0,zhuyin:'ㄒㄧㄠˇ ㄔㄨˊ ㄐㄩˊ'},
    lily:{name:'睡蓮',emoji:'🪷',category:'plants',at:0,areas:['pond'],water:true,zhuyin:'ㄕㄨㄟˋ ㄌㄧㄢˊ'},
    reeds:{name:'蘆葦',emoji:'🌾',category:'plants',at:2,areas:['pond'],zhuyin:'ㄌㄨˊ ㄨㄟˇ'},
    duck:{name:'小鴨',emoji:'🦆',category:'animals',at:0,areas:['pond'],amphibious:true,zhuyin:'ㄒㄧㄠˇ ㄧㄚ'},
    turtle:{name:'烏龜',emoji:'🐢',category:'animals',at:3,areas:['pond'],amphibious:true,zhuyin:'ㄨ ㄍㄨㄟ'},
    fish:{name:'小魚',emoji:'🐟',category:'animals',at:4,areas:['pond'],water:true,zhuyin:'ㄒㄧㄠˇ ㄩˊ'},
    snail:{name:'蝸牛',emoji:'🐌',category:'animals',at:1,zhuyin:'ㄍㄨㄚ ㄋㄧㄡˊ'},
    ladybug:{name:'瓢蟲',emoji:'🐞',category:'animals',at:2,zhuyin:'ㄆㄧㄠˊ ㄔㄨㄥˊ'},
    bench:{name:'長椅',emoji:'🪑',category:'decor',at:0,areas:['meadow','picnic'],zhuyin:'ㄔㄤˊ ㄧˇ'},
    lantern:{name:'小燈籠',emoji:'🏮',category:'decor',at:3,zhuyin:'ㄒㄧㄠˇ ㄉㄥ ㄌㄨㄥˊ'},
    pinwheel:{name:'風車',emoji:'🎐',category:'decor',at:1,areas:['meadow','picnic'],zhuyin:'ㄈㄥ ㄔㄜ'},
    basket:{name:'野餐籃',emoji:'🧺',category:'decor',at:0,areas:['picnic'],zhuyin:'ㄧㄝˇ ㄘㄢ ㄌㄢˊ'},
    tent:{name:'小帳篷',emoji:'⛺',category:'decor',at:6,areas:['picnic'],zhuyin:'ㄒㄧㄠˇ ㄓㄤˋ ㄆㄥˊ'}
  });
  function slotAllowed(kind,slot,area='meadow'){
    const d=kinds[kind];if(!d||!anchors[slot]||!Object.hasOwn(areas,area)||d.areas&&!d.areas.includes(area))return false;
    if(area!=='pond')return true;
    const water=[1,4,6,7].includes(slot);
    return d.amphibious||kind==='pond'||kind==='butterfly'||kind==='rainbow'?true:d.water?water:!water;
  }
  function restore(recorded={},rounds=0,area='meadow'){
    const source=Array.isArray(recorded.garden)?recorded.garden:(Array.isArray(recorded.plots)?recorded.plots:starter).map((kind,slot)=>({kind,slot}));
    const used=new Set();
    return source.filter(p=>p&&Object.hasOwn(kinds,p.kind)&&kinds[p.kind].at<=rounds&&Number.isInteger(p.slot)&&slotAllowed(p.kind,p.slot,area)&&!used.has(p.slot)&&used.add(p.slot)).map(p=>({kind:p.kind,slot:p.slot}));
  }
  function place(items,kind,slot,rounds,moving=null,area='meadow'){
    if(!Object.hasOwn(kinds,kind)||kinds[kind].at>rounds||!Number.isInteger(slot)||!anchors[slot])return {ok:false,reason:'locked',items};
    if(moving!==null&&!items.some(p=>p.slot===moving&&p.kind===kind))return {ok:false,reason:'missing',items};
    if(!slotAllowed(kind,slot,area))return {ok:false,reason:'area',items};
    if(items.some(p=>p.slot===slot&&p.slot!==moving))return {ok:false,reason:'occupied',items};
    return {ok:true,items:[...items.filter(p=>p.slot!==moving),{kind,slot}]};
  }
  function nearestSlot(items,kind,x,y,rounds,area='meadow',moving=null){
    if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>100||y<0||y>100)return null;
    const candidates=anchors.map((a,slot)=>({slot,distance:Math.hypot(a.x-x,a.y-y)})).filter(a=>place(items,kind,a.slot,rounds,moving,area).ok).sort((a,b)=>a.distance-b.distance);
    return candidates[0]?.distance<=24?candidates[0].slot:null;
  }
  function restoreAlbum(album,rounds){
    if(!Array.isArray(album))return [];
    return album.filter(p=>p&&Object.hasOwn(areas,p.area)&&['sunny','sunset','night'].includes(p.weather)&&Number.isSafeInteger(p.at)&&p.at>=0&&Array.isArray(p.items)).slice(-12).map(p=>({area:p.area,weather:p.weather,at:p.at,items:restore({garden:p.items},rounds,p.area)}));
  }
  function takePhoto(album,items,area,weather,at=Date.now()){
    if(!Object.hasOwn(areas,area)||!['sunny','sunset','night'].includes(weather)||!Number.isSafeInteger(at)||at<0)return {ok:false,reason:'invalid',album};
    if(album.length>=12)return {ok:false,reason:'full',album};
    return {ok:true,album:[...album,{area,weather,at,items:items.map(p=>({...p}))}]};
  }
  function stats(items){return {plants:items.filter(p=>kinds[p.kind]?.category==='plants').length,animals:items.filter(p=>kinds[p.kind]?.category==='animals').length,types:new Set(items.map(p=>p.kind)).size};}
  function milestones(items,recorded=[],placedKind=null){
    const s=stats(items),now=[];
    if(s.plants&&(placedKind===null||kinds[placedKind]?.category==='plants'))now.push('plant');if(s.animals&&(placedKind===null||kinds[placedKind]?.category==='animals'))now.push('animal');if(s.types>=3)now.push('variety');
    return [...new Set([...(Array.isArray(recorded)?recorded:[]).filter(id=>['plant','animal','variety','photo','pondvisit'].includes(id)),...now])];
  }
  const art={
    tulip:'<path d="M60 98V54" stroke="#52784c" stroke-width="7"/><path d="M59 82Q30 85 29 65Q53 64 59 82M62 90Q91 88 92 71Q70 70 62 90" fill="#89ad65"/><path d="M36 22L49 32L60 15L71 32L84 22V44Q84 66 60 66Q36 66 36 44Z" fill="#e48a9e"/><path d="M60 27V59" stroke="#f4b4be" stroke-width="3"/>',
    sunflower:'<path d="M60 102V49" stroke="#547847" stroke-width="7"/><path d="M59 86Q26 85 31 69Q51 70 59 86M63 96Q92 86 89 72Q67 77 63 96" fill="#87a760"/><g fill="#edbc56"><ellipse cx="60" cy="24" rx="11" ry="20"/><ellipse cx="60" cy="64" rx="11" ry="20"/><ellipse cx="40" cy="44" rx="20" ry="11"/><ellipse cx="80" cy="44" rx="20" ry="11"/><ellipse cx="46" cy="30" rx="11" ry="18" transform="rotate(-45 46 30)"/><ellipse cx="74" cy="58" rx="11" ry="18" transform="rotate(-45 74 58)"/><ellipse cx="74" cy="30" rx="11" ry="18" transform="rotate(45 74 30)"/><ellipse cx="46" cy="58" rx="11" ry="18" transform="rotate(45 46 58)"/></g><circle cx="60" cy="44" r="19" fill="#8f6845"/><circle cx="55" cy="40" r="2" fill="#f5d78c"/><circle cx="67" cy="49" r="2" fill="#f5d78c"/>',
    mushroom:'<path d="M47 59L42 98Q60 105 78 98L72 59Z" fill="#f8ecd1"/><path d="M19 63Q21 18 60 18Q99 18 101 63Q62 80 19 63Z" fill="#d98776"/><circle cx="40" cy="42" r="9" fill="#fff3dd"/><circle cx="73" cy="35" r="7" fill="#fff3dd"/><ellipse cx="87" cy="58" rx="7" ry="5" fill="#fff3dd"/>',
    bunny:'<ellipse cx="46" cy="31" rx="11" ry="28" fill="#fff4df"/><ellipse cx="73" cy="31" rx="11" ry="28" fill="#fff4df"/><ellipse cx="46" cy="30" rx="5" ry="19" fill="#ecc1b2"/><ellipse cx="73" cy="30" rx="5" ry="19" fill="#ecc1b2"/><ellipse cx="61" cy="82" rx="29" ry="27" fill="#fff4df"/><circle cx="29" cy="84" r="12" fill="#fff4df"/><ellipse cx="60" cy="58" rx="30" ry="25" fill="#fff4df"/><circle cx="48" cy="56" r="3" fill="#64574a"/><circle cx="72" cy="56" r="3" fill="#64574a"/><path d="M57 64Q60 69 63 64M60 68V72" stroke="#b9837c" stroke-width="3" fill="none"/><ellipse cx="40" cy="66" rx="7" ry="4" fill="#f1c1b3"/><ellipse cx="80" cy="66" rx="7" ry="4" fill="#f1c1b3"/><ellipse cx="46" cy="103" rx="15" ry="7" fill="#f1e0c7"/><ellipse cx="77" cy="103" rx="15" ry="7" fill="#f1e0c7"/>',
    butterfly:'<path d="M56 62Q7 5 13 53Q12 84 54 73Q16 79 31 99Q51 110 59 76M64 62Q113 5 107 53Q108 84 66 73Q104 79 89 99Q69 110 61 76" fill="#dda57e"/><path d="M53 58Q24 25 24 53Q27 67 53 63M67 58Q96 25 96 53Q93 67 67 63" fill="#f8d797"/><path d="M60 53V84M58 52L49 40M62 52L71 40" stroke="#72554c" stroke-width="5" stroke-linecap="round"/>',
    tree:'<path d="M52 52L48 110H74L69 52Z" fill="#9c7952"/><path d="M59 87L40 68M64 78L82 57" stroke="#9c7952" stroke-width="8"/><circle cx="38" cy="46" r="26" fill="#88a878"/><circle cx="74" cy="40" r="30" fill="#7b9d6a"/><circle cx="57" cy="23" r="23" fill="#9bb780"/><circle cx="91" cy="57" r="21" fill="#9ab77e"/><circle cx="31" cy="64" r="23" fill="#94b47b"/><circle cx="61" cy="62" r="28" fill="#8ead71"/>',
    pond:'<ellipse cx="60" cy="100" rx="48" ry="10" fill="#a5ccd0"/><ellipse cx="60" cy="98" rx="32" ry="7" fill="#bbdad3"/><ellipse cx="60" cy="76" rx="29" ry="25" fill="#8fad6b"/><ellipse cx="30" cy="96" rx="17" ry="8" fill="#8fad6b"/><ellipse cx="90" cy="96" rx="17" ry="8" fill="#8fad6b"/><circle cx="43" cy="49" r="16" fill="#9abb78"/><circle cx="77" cy="49" r="16" fill="#9abb78"/><circle cx="43" cy="47" r="8" fill="#fff7e6"/><circle cx="77" cy="47" r="8" fill="#fff7e6"/><circle cx="45" cy="48" r="4" fill="#495a3e"/><circle cx="75" cy="48" r="4" fill="#495a3e"/><path d="M48 71Q60 82 72 71" stroke="#536c41" stroke-width="3" fill="none"/>',
    rainbow:'<path d="M14 85A46 46 0 0 1 106 85" stroke="#dfa096" stroke-width="12" fill="none"/><path d="M26 85A34 34 0 0 1 94 85" stroke="#eccb84" stroke-width="12" fill="none"/><path d="M38 85A22 22 0 0 1 82 85" stroke="#94b994" stroke-width="12" fill="none"/><g fill="#fff5df"><ellipse cx="22" cy="88" rx="19" ry="12"/><circle cx="16" cy="79" r="11"/><ellipse cx="98" cy="88" rx="19" ry="12"/><circle cx="104" cy="79" r="11"/></g>'
  };
  Object.assign(art,{
    daisy:'<path d="M60 102V48" stroke="#5a8050" stroke-width="6"/><path d="M58 85Q25 82 30 67Q49 68 58 85M63 93Q92 91 91 75Q73 76 63 93" fill="#8eae6b"/><g fill="#fff3d8"><ellipse cx="60" cy="26" rx="10" ry="21"/><ellipse cx="60" cy="66" rx="10" ry="21"/><ellipse cx="39" cy="46" rx="21" ry="10"/><ellipse cx="81" cy="46" rx="21" ry="10"/><ellipse cx="45" cy="31" rx="10" ry="20" transform="rotate(-45 45 31)"/><ellipse cx="75" cy="61" rx="10" ry="20" transform="rotate(-45 75 61)"/><ellipse cx="75" cy="31" rx="10" ry="20" transform="rotate(45 75 31)"/><ellipse cx="45" cy="61" rx="10" ry="20" transform="rotate(45 45 61)"/></g><circle cx="60" cy="46" r="16" fill="#e6bc60"/>',
    lily:'<path d="M14 90Q14 66 59 66Q110 67 106 90Q86 111 55 106L61 86L45 105Q24 102 14 90Z" fill="#6f9d79"/><path d="M30 68Q18 40 53 50Q43 14 60 23Q79 14 69 50Q108 39 90 69Q63 91 30 68Z" fill="#e5a6b9"/><path d="M44 66Q45 42 61 40Q78 42 77 66Q59 82 44 66Z" fill="#f5c8cf"/><circle cx="61" cy="65" r="8" fill="#f1d27e"/>',
    reeds:'<g stroke="#78945b" stroke-width="5" fill="none"><path d="M30 105L35 28M56 104L60 15M84 105L90 34M55 105Q33 67 20 65M58 105Q84 76 99 68"/></g><g fill="#aa8b60"><rect x="29" y="25" width="12" height="29" rx="6"/><rect x="54" y="11" width="12" height="31" rx="6"/><rect x="84" y="30" width="12" height="28" rx="6"/></g>',
    duck:'<ellipse cx="57" cy="104" rx="43" ry="5" fill="#acd4d5"/><path d="M23 71L10 60Q11 100 56 100Q91 101 93 75Z" fill="#efcd76"/><circle cx="80" cy="50" r="23" fill="#f5d987"/><path d="M95 51L117 57L96 64Z" fill="#d69e57"/><circle cx="85" cy="47" r="3" fill="#5f5846"/><path d="M31 78Q56 104 73 75" fill="#e4b85f"/>',
    turtle:'<ellipse cx="44" cy="101" rx="13" ry="6" fill="#86a678"/><ellipse cx="76" cy="101" rx="13" ry="6" fill="#86a678"/><circle cx="95" cy="81" r="17" fill="#a5bd82"/><circle cx="100" cy="77" r="3" fill="#526148"/><path d="M18 92Q17 42 58 43Q96 47 94 94Z" fill="#739665"/><path d="M40 56L62 49L78 65L70 84L46 88L32 73Z" fill="#a0b880"/><path d="M42 58L48 86M62 51L60 87M35 71L77 69" stroke="#719363" stroke-width="3"/>',
    fish:'<path d="M18 67L5 48V93L25 79Q47 102 91 85Q114 70 91 54Q46 31 18 67Z" fill="#e7b179"/><path d="M55 47L60 28L75 49M50 91L67 105L76 92" fill="#cf9162"/><circle cx="90" cy="67" r="4" fill="#5b5847"/><path d="M80 58Q67 73 81 87" stroke="#f2d5a3" stroke-width="4" fill="none"/><g fill="#c6e7de"><circle cx="107" cy="31" r="5"/><circle cx="101" cy="17" r="3"/></g>',
    snail:'<path d="M14 101Q37 75 73 84L101 66Q119 77 111 97Q72 112 14 106Z" fill="#a8b989"/><circle cx="49" cy="72" r="29" fill="#cba785"/><path d="M55 91Q24 89 30 66Q36 47 58 60Q72 77 53 81Q40 83 43 71Q45 67 50 70" stroke="#9e7a5c" stroke-width="4" fill="none"/><path d="M100 72L96 48M108 75L116 56" stroke="#a8b989" stroke-width="5"/><circle cx="96" cy="48" r="4" fill="#536149"/><circle cx="116" cy="56" r="4" fill="#536149"/>',
    ladybug:'<g stroke="#615c48" stroke-width="4"><path d="M32 56L17 45M30 77L11 81M40 94L29 109M86 56L102 45M89 77L109 81M80 94L91 109"/></g><circle cx="60" cy="35" r="17" fill="#665f4b"/><ellipse cx="60" cy="73" rx="33" ry="36" fill="#d8907d"/><path d="M60 40V108" stroke="#695b49" stroke-width="4"/><g fill="#665f4b"><circle cx="44" cy="64" r="7"/><circle cx="76" cy="64" r="7"/><circle cx="42" cy="86" r="6"/><circle cx="78" cy="86" r="6"/></g>',
    bench:'<g stroke="#99784f" stroke-width="7" stroke-linecap="round"><path d="M23 105V57M97 105V57M31 85V107M89 85V107"/></g><g fill="#c3a274"><rect x="13" y="43" width="94" height="13" rx="4"/><rect x="13" y="61" width="94" height="13" rx="4"/><rect x="12" y="79" width="96" height="12" rx="4"/></g>',
    lantern:'<path d="M60 12V29M48 27H72M48 87H72M60 86V105" stroke="#9b784d" stroke-width="5"/><ellipse cx="60" cy="57" rx="32" ry="30" fill="#ddb18a"/><ellipse cx="60" cy="57" rx="17" ry="30" fill="#f0ce99"/><path d="M60 28V86" stroke="#f9e0ad" stroke-width="4"/><path d="M54 102V114M60 100V116M66 102V114" stroke="#c9a06a" stroke-width="3"/>',
    pinwheel:'<path d="M60 48V111" stroke="#9a8058" stroke-width="5"/><path d="M60 48L28 9L20 47Z" fill="#dca58b"/><path d="M60 48L99 16L100 55Z" fill="#e8c682"/><path d="M60 48L92 88L54 89Z" fill="#9fb784"/><path d="M60 48L21 80L21 41Z" fill="#9dbac0"/><circle cx="60" cy="48" r="6" fill="#fff0cc"/>',
    basket:'<path d="M31 68V50Q31 16 60 16Q89 16 89 50V68" fill="none" stroke="#a08055" stroke-width="9"/><path d="M16 54H105L97 105H25Z" fill="#c6a16d"/><path d="M24 65H99M27 81H97M30 96H95M40 58L43 102M59 58V102M80 58L76 102" stroke="#ecd4a0" stroke-width="3"/><path d="M20 54L38 45L60 53L80 43L101 54Z" fill="#e6ad9b"/>',
    tent:'<path d="M9 105L53 19H74L112 105Z" fill="#d4b07f"/><path d="M53 19L74 19L90 105H9Z" fill="#e9c997"/><path d="M53 48L29 105H74Z" fill="#81936e"/><path d="M53 48L52 105H74Z" fill="#b19b77"/><path d="M11 103H113" stroke="#94784f" stroke-width="4"/>'
  });
  function sprite(kind){return '<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false" class="garden-sprite">'+(art[kind]||'')+'</svg>';}
  function landscape(){return '<svg class="garden-landscape" viewBox="0 0 800 500" preserveAspectRatio="none" aria-hidden="true"><g fill="#fff9e8" opacity=".8"><ellipse cx="156" cy="83" rx="62" ry="17"/><ellipse cx="138" cy="70" rx="29" ry="22"/><ellipse cx="574" cy="121" rx="60" ry="17"/><ellipse cx="594" cy="106" rx="28" ry="22"/></g><path class="garden-hills" d="M0 242Q140 165 320 243Q557 142 800 220V500H0Z" fill="#c4d8a9"/><path class="garden-lawn" d="M0 299Q390 239 800 286V500H0Z" fill="#a9c78c"/><path d="M432 273Q452 323 403 361Q365 401 410 500H514Q439 414 465 379Q529 310 480 274Z" fill="#e8d6ae" opacity=".7"/><g stroke="#f5e8c8" stroke-width="7" fill="none" stroke-linecap="round"><path d="M0 261L800 248M0 282L800 269"/><path d="M28 244V290M98 242V288M168 240V286M238 238V284M308 236V282M378 234V280M448 232V278M518 230V276M588 228V274M658 226V272M728 224V270M798 222V268"/></g><g stroke="#82a567" stroke-width="3" fill="none" opacity=".6"><path d="M30 480l-4-12m4 12l7-13M185 371l-4-12m4 12l7-13M650 455l-4-12m4 12l7-13M733 355l-4-12m4 12l7-13"/></g><g fill="#f9e6ae"><circle cx="99" cy="423" r="3"/><circle cx="699" cy="405" r="3"/><circle cx="287" cy="468" r="3"/></g></svg>';}
  const baseLandscape=landscape;
  function regionLandscape(area){
    const extra=area==='pond'?'<ellipse class="pond-water" cx="400" cy="364" rx="207" ry="108" fill="#91bbc1"/><ellipse cx="400" cy="364" rx="182" ry="89" fill="#a6ccd0"/><g fill="none" stroke="#d5e5d5" stroke-width="4" opacity=".7"><ellipse cx="399" cy="372" rx="126" ry="44"/><path d="M251 342Q272 336 294 342M481 401Q509 394 535 401"/></g><g fill="#91a78c"><ellipse cx="192" cy="343" rx="15" ry="9"/><ellipse cx="603" cy="383" rx="18" ry="10"/><ellipse cx="489" cy="467" rx="16" ry="8"/></g>':area==='picnic'?'<path d="M182 330L570 322L639 463L159 466Z" fill="#e6c3a9"/><g stroke="#faf0d4" stroke-width="8" opacity=".65"><path d="M209 347L583 339M197 379L598 372M182 415L617 410M168 449L632 444M252 330L233 465M333 328L333 465M415 326L430 464M495 324L528 464M560 323L610 463"/></g>':'';
    return baseLandscape().replace('</svg>',extra+'</svg>');
  }
  function picture(photo){
    const sky={sunny:'#e5eedd',sunset:'#efd1bb',night:'#3a4b63'}[photo.weather]||'#e5eedd';
    const scene=regionLandscape(photo.area).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
    const items=[...photo.items].sort((a,b)=>anchors[a.slot].y-anchors[b.slot].y).map(p=>{const a=anchors[p.slot],size=['tree','rainbow','tent'].includes(p.kind)?165:['mushroom','butterfly','fish','lily'].includes(p.kind)?95:115;const floating=p.kind==='rainbow'?1.2:p.kind==='butterfly'?1.55:.93;return `<g transform="translate(${a.x*8-size/2} ${a.y*5-size*floating})"><ellipse cx="${size/2}" cy="${size*.92}" rx="${size*.3}" ry="${size*.05}" fill="#47683a" opacity=".18"/><svg width="${size}" height="${size}" viewBox="0 0 120 120">${art[p.kind]}</svg></g>`;}).join('');
    const sun=photo.weather==='night'?'<path d="M710 40A25 25 0 1 1 677 70A22 22 0 0 0 710 40Z" fill="#f0d495"/>':'<circle cx="704" cy="68" r="25" fill="#efcc7e"/>';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500"><rect width="800" height="500" fill="${sky}"/><g ${photo.weather==='night'?'opacity=".72"':''}>${scene}${items}</g>${sun}</svg>`;
  }
  const api={anchors,kinds,areas,slotAllowed,nearestSlot,restoreAlbum,takePhoto,picture,restore,place,stats,milestones,sprite,landscape:regionLandscape};root.GardenLayout=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
