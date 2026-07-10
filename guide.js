/* Rivieraen 2026 — delt logikk + renderere.
   Realiserer Stitch-designet «French Riviera Planner» (Tailwind + Material Symbols),
   drevet av data.js. Gjenbruker lavnivå-helpers fra research-siden (arkiv.html). */

/* ---------------- STATE ---------------- */
let imgCache = {};
let checks = loadChecks();

/* ---------------- SJEKKLISTE (localStorage) ---------------- */
function loadChecks(){ try{ return JSON.parse(localStorage.getItem("rivcheck")||"[]"); }catch(e){ return []; } }
function saveChecks(){ try{ localStorage.setItem("rivcheck", JSON.stringify(checks)); }catch(e){} }
function toggleCheck(inp){
  const it=inp.closest("label").dataset.it; const i=checks.indexOf(it);
  if(inp.checked && i<0) checks.push(it); else if(!inp.checked && i>=0) checks.splice(i,1);
  saveChecks();
  const box=inp.closest("label").querySelector(".chk-body");
  if(box) box.classList.toggle("opacity-40", inp.checked), box.classList.toggle("line-through", inp.checked);
  const c=document.getElementById("count"); if(c) c.textContent=checks.length+"/"+CHECKTOTAL+" gjort";
}

/* ---------------- BILDER (Wikipedia REST, CORS-enabled) ---------------- */
async function fetchThumb(title){
  if(title in imgCache) return imgCache[title];
  for(const lang of ["en","fr"]){
    try{
      const r = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
      if(!r.ok) continue;
      const d = await r.json();
      const src = d && d.thumbnail && d.thumbnail.source;
      if(src){ imgCache[title]=src; return src; }
    }catch(e){}
  }
  imgCache[title]=""; return "";
}
async function hydrate(root){
  /* Kun wiki-plassholdere (data-title, uten src). Bilder med ekte src laster og tones inn selv. */
  (root||document).querySelectorAll("img.ph[data-title]:not([data-done])").forEach(async im=>{
    im.setAttribute("data-done","1");
    const src = await fetchThumb(decodeURIComponent(im.dataset.title));
    if(src){ im.onload=()=>im.classList.add("show"); im.onerror=()=>im.remove(); im.src=src; }
    else im.remove();
  });
}
/* fullbleed foto-overlay over SVG-scene (offline-fallback) */
function phImg(x){
  if(x.img) return `<img class="ph" src="${x.img}" alt="${x.n}" referrerpolicy="no-referrer" onload="this.classList.add('show')" onerror="this.remove()">`;
  if(x.gallery&&x.gallery[0]) return `<img class="ph" src="${x.gallery[0]}" alt="${x.n}" referrerpolicy="no-referrer" onload="this.classList.add('show')" onerror="this.remove()">`;
  if(x.wiki) return `<img class="ph" data-title="${encodeURIComponent(x.wiki)}" alt="${x.n}">`;
  return "";
}
function heroLayers(x){ return x ? `<div class="ph-scene absolute inset-0">${scene(x.z,x.id,null,null)}</div>${phImg(x)}` : ""; }
function galleryRow(urls){
  urls=(urls||[]).filter(Boolean);
  if(!urls.length) return "";
  return `<div class="flex gap-3 overflow-x-auto no-scrollbar py-1">${urls.map(u=>`<img loading="lazy" referrerpolicy="no-referrer" src="${u}" class="h-44 rounded-xl object-cover shrink-0 bg-surface-container" style="min-width:66%" onerror="this.remove()">`).join("")}</div>`;
}

/* ---------------- LENKER / SMÅTT ---------------- */
function gmaps(x){ const place=(x.a||"").split("·")[0].trim(); return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${x.n}, ${place}, France`)}`; }
function isIce(x){ return x.cat==="mat" && typeof x.why==="string" && x.why.indexOf("🍦")===0; }
function icon(name, cls){ return `<span class="material-symbols-outlined ${cls||''}">${name}</span>`; }
function esc(s){ return (s||"").replace(/"/g,"&quot;"); }
function firstSentence(t){ t=(t||"").trim(); const i=t.search(/[.!?]\s/); let s=i>10?t.slice(0,i+1):t; if(s.length>120) s=s.slice(0,118).replace(/\s+\S*$/,"")+"…"; return s; }
function oneLiner(x){ let w=(x.why||"").replace(/^🍦\s*/,"").replace(/^[A-ZÆØÅ]+:\s*/,""); const i=w.search(/[.!]/); if(i>5) w=w.slice(0,i); if(w.length>96) w=w.slice(0,94).replace(/\s+\S*$/,"")+"…"; return w; }
function placeKind(x){ return x.cat==="mat" ? (isIce(x)?"Iskrem":"Spisested") : "Severdighet"; }

/* ---------------- MOTIV / SVG-SCENE (offline-fallback) ---------------- */
const MOTIF = {
 "1 · Lérins-øydag":"boat","2 · Cannes til fots":"oldtown","3 · Kunst & keramikk nær Cannes":"palette",
 "4 · Mougins-kveld":"village","5 · Vieux Nice — marked & socca":"market","6 · Cimiez — museer & olivenlund":"museum",
 "7 · Parc Phoenix + Promenade":"palm","8 · Antibes gamleby + Picasso":"oldtown","9 · Cap d'Antibes — strand & fyr":"lighthouse",
 "9b · Cap d'Antibes + La Plage du Cap":"lighthouse","10 · Juan-les-Pins + Jazz Off":"music","11 · Biot — glassverk + landsby":"glass",
 "12 · Monaco-dagen":"casino","13 · Kornisjene øst: Èze + Villefranche":"village","14 · Villa Ephrussi + Villefranche-bad":"garden",
 "14b · Cap-Ferrat + Èze light":"garden","15 · Parfyme i Grasse":"perfume","16 · Kunst i Saint-Paul & Vence":"palette",
 "17 · Fjellandsbyer & juv":"waterfall","18 · Østlige fjellandsbyer: Coaraze":"mountains","19 · Saint-Tropez (kjør + båt)":"yacht",
 "20 · Port Grimaud + Sainte-Maxime":"boat","21 · Verdon-canyon + turkis innsjø":"canyon","22 · Verdon over to dager (overnatting)":"lavender",
 "23 · Aix-en-Provence halvdag":"fountain","24 · Menton — sitronbyen (lang dagstur)":"lemon"
};
const GLYPH = {
 boat:'<path d="M8 21h16l-2.5 4.5H10.5z"/><path d="M16 5v16"/><path d="M16 7c4 2 6 5 6 9H16z"/>',
 oldtown:'<path d="M7 26V16l4-3 4 3v10"/><path d="M17 26V11l3.5-2.5L24 11v15"/><path d="M6 26h20"/>',
 palette:'<path d="M16 7a9 9 0 100 18c1.4 0 1.6-1.8 2.5-2.4 1-.7 3 .4 3-2A8.6 8.6 0 0016 7z"/><circle cx="12" cy="13" r=".9"/><circle cx="19" cy="12" r=".9"/><circle cx="20.5" cy="16.5" r=".9"/>',
 village:'<path d="M7 26v-7h6v7z"/><path d="M6 19.5l4-3 4 3"/><path d="M15 26V14h7v12z"/><path d="M14 14.5l4.5-3.5L23 14.5"/><path d="M6 26h18"/>',
 market:'<path d="M8 13h16l-1.5 4H9.5z"/><path d="M9 10h14l1.5 3H7.5z"/><path d="M10 17v8m12-8v8"/><path d="M10 25h12"/>',
 museum:'<path d="M6 12l10-5 10 5H6z"/><path d="M8 14v9m4-9v9m8-9v9m-4-9v9"/><path d="M6 25h20"/>',
 palm:'<path d="M16 27c0-6 0-10-.5-14"/><path d="M15.5 13c0-3 2-5.5 5-6.5-.5 3.5-2 5.5-5 6.5zm0 0c0-3-2-5.5-5-6.5.5 3.5 2 5.5 5 6.5zm0 0c3-1.5 6.5-1 9 1-3.5.5-6.5 0-9-1zm0 0c-3-1.5-6.5-1-9 1 3.5.5 6.5 0 9-1z"/><circle cx="15.5" cy="12.5" r="1.1" fill="#fff" stroke="none"/>',
 lighthouse:'<path d="M13 26l1-8h4l1 8z"/><rect x="13.6" y="12" width="4.8" height="6"/><path d="M13 12l1-2.2h4l1 2.2z"/><path d="M14 9.8h4V8.4h-4z"/><path d="M11 26h10"/>',
 music:'<path d="M13 22V8l8-2v12"/><circle cx="11" cy="22" r="2.4"/><circle cx="19" cy="20" r="2.4"/>',
 glass:'<path d="M11 7h10l-1 6a4 4 0 01-8 0z"/><path d="M16 17v6"/><path d="M12 25h8"/>',
 casino:'<path d="M7 12l3.5 6h11L25 12l-5 4-4-7-4 7z"/><path d="M9 22h14"/>',
 garden:'<circle cx="16" cy="11" r="2.5"/><path d="M16 11c0-4 3-5 3-5m-3 5c0-4-3-5-3-5m3 5c3-1.5 5 .5 5 .5m-5-.5c-3-1.5-5 .5-5 .5"/><path d="M16 14v11"/>',
 perfume:'<rect x="11" y="13" width="10" height="12" rx="2"/><rect x="13.5" y="8" width="5" height="5"/><path d="M14 8V6h4v2"/>',
 mountains:'<path d="M5 24l6-11 4 6 3-5 7 10H5z"/><path d="M11 13l2.5 3.5"/>',
 waterfall:'<path d="M6 22l6-12 4 6 3-4 6 10"/><path d="M12 22v4m4-3v4m4-4v4"/>',
 yacht:'<path d="M5 21h22l-3 5H8z"/><path d="M9 21V9l12 3v9"/><path d="M9 12h12"/>',
 canyon:'<path d="M5 8v10l4.5 1.5V9z"/><path d="M27 8v10l-4.5 1.5V9z"/><path d="M10 22.5q6 2.5 12 0"/><path d="M10 25.5q6 2.5 12 0"/>',
 lavender:'<path d="M13 26V15m6 11V13"/><path d="M13 8c-1.2 1-1.2 3 0 4 1.2-1 1.2-3 0-4zm0 4c-1.2 1-1.2 3 0 4 1.2-1 1.2-3 0-4z"/><path d="M19 6c-1.2 1-1.2 3 0 4 1.2-1 1.2-3 0-4zm0 4c-1.2 1-1.2 3 0 4 1.2-1 1.2-3 0-4z"/>',
 fountain:'<path d="M12 25v-6h8v6"/><path d="M16 19v-5"/><path d="M16 13c-2 0-3-2-3-2m3 2c2 0 3-2 3-2"/><circle cx="16" cy="9" r="1.5"/><path d="M10 25h12"/>',
 lemon:'<ellipse cx="16" cy="17" rx="8" ry="6"/><path d="M22 10l2.5-2.5"/><path d="M21 10c1-1 3-1 4-2-.5 1.5-1 2.5-2.5 3"/>'
};
function modGlyph(x){ const k=MOTIF[x.n]; return (k&&GLYPH[k])?GLYPH[k]:null; }
function scene(zone, seed, pal, bgGlyph){
  const p = pal || (ZONES[zone]||ZONES.cannes).pal;
  const s = (seed||0)%3;
  const gid = "sk"+p[0].replace('#','')+s;
  const sun = `<circle cx="${78-s*8}%" cy="32%" r="20" fill="#fff8d8" opacity=".85"/>`;
  const bgFig = bgGlyph ? `<g transform="translate(78,4) scale(4.5)" opacity=".18"><g fill="none" stroke="${p[4]}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${bgGlyph}</g></g>` : "";
  const tree = (x,y,sc,c)=>`<g transform="translate(${x},${y}) scale(${sc})"><rect x="-1.2" y="6" width="2.4" height="7" fill="#5b4632"/><polygon points="0,-10 8,8 -8,8" fill="${c}"/><polygon points="0,-3 6,10 -6,10" fill="${c}"/></g>`;
  let trees="";
  for(let i=0;i<4+s;i++){ const x=(20+i*70+s*15)%360; trees+=tree(x,150+(i%2)*8,.8+(i%3)*.25,p[4]); }
  return `<svg viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p[0]}"/><stop offset="1" stop-color="${p[1]}"/></linearGradient></defs>
    <rect width="360" height="200" fill="url(#${gid})"/>${sun}${bgFig}
    <path d="M0,${120+s*6} Q90,${90+s*8} 180,118 T360,110 V200 H0 Z" fill="${p[2]}" opacity=".95"/>
    <path d="M0,145 Q120,${118+s*6} 240,146 T360,140 V200 H0 Z" fill="${p[3]}"/>${trees}
    <path d="M0,172 Q120,158 240,172 T360,168 V200 H0 Z" fill="${p[4]}"/></svg>`;
}

/* ---------------- KART (Leaflet + OpenStreetMap) ---------------- */
let geo = (function(){ try{ return JSON.parse(localStorage.getItem("rivgeo")||"{}"); }catch(e){ return {}; } })();
function saveGeo(){ try{ localStorage.setItem("rivgeo", JSON.stringify(geo)); }catch(e){} }
const sleep = ms => new Promise(r=>setTimeout(r,ms));
async function geocode(item){
  if(item.ll) return item.ll;
  if(item.n in geo) return geo[item.n];
  const place=(item.a||"").split("·")[0].trim();
  const url=`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=fr&bounded=1&viewbox=4.4,44.7,7.9,43.1&q=${encodeURIComponent(item.n+", "+place+", France")}`;
  try{ const r=await fetch(url,{headers:{'Accept':'application/json'}}); const d=await r.json(); geo[item.n]=(d&&d[0])?[parseFloat(d[0].lat),parseFloat(d[0].lon)]:null; }
  catch(e){ geo[item.n]=null; }
  saveGeo(); return geo[item.n];
}
function pinColor(x){ return x.cat!=="mat" ? "#2f6388" : (isIce(x) ? "#b5559e" : "#c2620f"); }
function pinEmoji(x){ return x.cat!=="mat" ? "📍" : (isIce(x) ? "🍦" : "🍴"); }
function markerIcon(x){ return L.divIcon({className:"", html:`<div class="mpin" style="background:${pinColor(x)}">${pinEmoji(x)}</div>`, iconSize:[27,27], iconAnchor:[13,13], popupAnchor:[0,-12]}); }
function homeMarker(map){
  if(!map||typeof L==="undefined") return;
  const ic=L.divIcon({className:"", html:`<div class="mpin" style="background:#0c4a6e;font-size:15px">🏠</div>`, iconSize:[31,31], iconAnchor:[15,15], popupAnchor:[0,-14]});
  L.marker(HOME.ll,{icon:ic, zIndexOffset:1000}).addTo(map).bindPopup(`🏠 <b>${HOME.name}</b><br>${HOME.addr}`);
}
let _daymap=null;
async function buildDayMap(stops){
  const el=document.getElementById("daymap"); if(!el) return;
  if(typeof L==="undefined"){ el.innerHTML="<div class='p-4 text-sm text-on-surface-variant'>Kart krever internett.</div>"; return; }
  if(_daymap){ try{_daymap.remove();}catch(e){} _daymap=null; }
  _daymap=L.map(el,{scrollWheelZoom:false}).setView([43.6,7.0],9);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(_daymap);
  setTimeout(()=>{ try{_daymap.invalidateSize();}catch(e){} },120);
  const pts=[];
  for(const s of stops){
    const instant=!!(s.ll||(s.n in geo)); const c=await geocode(s);
    if(c){ L.marker(c,{icon:markerIcon(s)}).addTo(_daymap).bindPopup(`<b>${s.n}</b><br><a href="sted.html#${s.id}">Åpne ›</a>`); pts.push(c); try{_daymap.fitBounds(pts,{padding:[28,28],maxZoom:14});}catch(e){} }
    if(!instant) await sleep(1100);
  }
  homeMarker(_daymap);
}
function buildPlaceMap(x, elId){
  const el=document.getElementById(elId); if(!el) return;
  if(typeof L==="undefined"||!x.ll){ el.innerHTML="<div class='p-4 text-sm text-on-surface-variant'>Kart utilgjengelig.</div>"; return; }
  const m=L.map(el,{scrollWheelZoom:false,zoomControl:false}).setView(x.ll,15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(m);
  L.marker(x.ll,{icon:markerIcon(x)}).addTo(m); homeMarker(m);
  setTimeout(()=>{ try{m.invalidateSize();}catch(e){} },120);
}

/* ---------------- FELLES CHROME ---------------- */
function topBar(){
  return `<header class="fixed top-0 inset-x-0 z-50 h-16 bg-background/95 backdrop-blur-sm border-b border-sand flex items-center justify-between px-margin-mobile">
    <a href="programmet.html" class="text-terracotta flex items-center hover:opacity-80 transition-opacity">${icon('menu')}</a>
    <a href="index.html" class="font-headline-lg-mobile text-headline-lg-mobile text-terracotta font-bold">Rivieraen 2026</a>
    <a href="praktisk.html" class="text-terracotta flex items-center hover:opacity-80 transition-opacity">${icon('account_circle')}</a>
  </header>`;
}
function bottomNav(active){
  const item=(href,ic,label,key)=>{
    const on=active===key;
    return `<a href="${href}" class="flex flex-col items-center justify-center gap-0.5 min-w-[56px] ${on?'bg-terracotta text-white rounded-full px-4 py-1':'text-on-surface-variant hover:text-terracotta transition-colors'}">
      <span class="material-symbols-outlined text-[24px]" ${on?"style=\"font-variation-settings:'FILL' 1\"":''}>${ic}</span>
      <span class="font-label-sm text-label-sm">${label}</span></a>`;
  };
  return `<nav class="fixed bottom-0 inset-x-0 z-50 flex justify-around items-center px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] bg-surface border-t border-sand shadow-[0_-6px_24px_rgba(180,83,9,0.06)] rounded-t-xl">
    ${item('index.html','home','Hjem','home')}
    ${item('programmet.html','calendar_today','Plan','plan')}
    ${item('arkiv.html','explore','Oppdag','discover')}
    ${item('praktisk.html','info','Info','info')}
  </nav>`;
}
function shell(inner, active){
  document.getElementById("app").innerHTML = topBar() + inner + bottomNav(active);
  hydrate(document.getElementById("app"));
}

/* ---------------- DAG-INDEKS ETTER DATO ---------------- */
function tripDayIndex(){
  const t=new Date(), y=t.getFullYear(), m=t.getMonth()+1, d=t.getDate();
  if(y<2026||(y===2026&&m<7)) return 1;
  if(y>2026||(y===2026&&m>7)) return WEEK.length;
  for(let i=0;i<WEEK.length;i++){ if(d<=parseInt(WEEK[i].date)) return i+1; }
  return WEEK.length;
}

/* ---------------- KORT-BYGGEKLOSSER ---------------- */
function placeCard(x){
  return `<a href="sted.html#${x.id}" class="group relative block h-64 rounded-2xl overflow-hidden border border-sand shadow-sm">
    <div class="ph-scene absolute inset-0 z-0">${scene(x.z,x.id,null,null)}</div>${phImg(x)}
    <div class="absolute inset-0 z-[2] bg-gradient-to-t from-black/65 via-black/10 to-transparent"></div>
    <div class="absolute bottom-5 left-5 right-5 z-[3] text-white">
      <h5 class="font-headline-md text-headline-md" style="text-shadow:0 2px 8px rgba(0,0,0,.45)">${x.n}</h5>
      <p class="font-label-sm text-label-sm uppercase tracking-wider text-white/85 mt-1">${placeKind(x)} • ${ZONES[x.z].name}</p>
    </div></a>`;
}
function titleCard(title, desc, count, unit, bg){
  return `<div class="${bg} p-8 rounded-2xl flex flex-col justify-between border border-outline-variant/30 min-h-[16rem]">
    <div><h3 class="font-headline-lg text-headline-lg text-terracotta mb-3">${title}</h3>
      <p class="font-body-md text-body-md text-on-surface-variant">${desc}</p></div>
    <div class="mt-8 flex items-baseline gap-2"><span class="text-5xl font-display-lg text-terracotta">${count}</span>
      <span class="font-label-md text-label-md uppercase text-on-surface-variant">${unit}</span></div></div>`;
}
function altCard(a){
  const x=byName[a.n]; const why=a.why||(x?oneLiner(x):"");
  if(!x) return `<div class="bg-white border border-sand rounded-xl p-5 shadow-sm"><h4 class="font-headline-md text-[18px] mb-1">${a.n}</h4><p class="text-body-md text-on-surface-variant text-sm">${why}</p></div>`;
  return `<a href="sted.html#${x.id}" class="flex gap-4 bg-white border border-sand rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <div class="relative w-24 shrink-0"><div class="ph-scene absolute inset-0 z-0">${scene(x.z,x.id,null,null)}</div>${phImg(x)}</div>
    <div class="py-3 pr-4 min-w-0"><h4 class="font-headline-md text-[18px] leading-tight">${x.n}</h4>
      <p class="font-label-sm text-label-sm text-secondary font-bold mt-0.5">${ZONES[x.z].name}${x.cat==='mat'?' · '+x.p:''}</p>
      <p class="text-sm text-on-surface-variant mt-1 leading-snug">${why}</p></div></a>`;
}
function planIcon(text){
  const t=(text||"").toLowerCase();
  if(/ferge|båt|boat/.test(t)) return 'directions_boat';
  if(/tog|train|sncf/.test(t)) return 'train';
  if(/parker|park\b/.test(t)) return 'local_parking';
  if(/kjør|bil|avreise|hjem/.test(t)) return 'directions_car';
  if(/lunsj|middag|frokost|spis|socca|gelato|picnic|is\b/.test(t)) return 'restaurant';
  if(/strand|bad|basseng|beach|vannspeil/.test(t)) return 'beach_access';
  if(/marked|market/.test(t)) return 'storefront';
  if(/museum|picasso|kunst|akvari|oceano/.test(t)) return 'museum';
  if(/fyrverkeri/.test(t)) return 'celebration';
  if(/siesta|hvil|ro\b/.test(t)) return 'bedtime';
  return 'schedule';
}

/* ================= FORSIDE ================= */
function renderHome(){
  const di=tripDayIndex(), day=WEEK[di-1];
  const hero=day.hero?byName[day.hero]:null;
  const FEATURED=["Saint-Tropez gamleby & La Ponche","Monaco – Le Rocher & akvariet","Èze village","Vieux Nice + Cours Saleya"]
    .map(n=>byName[n]).filter(Boolean);
  const preview=WEEK.slice(0,4);

  const inner=`<main class="pb-28">
    <!-- HERO -->
    <section class="relative h-[70vh] min-h-[520px] w-full overflow-hidden">
      ${heroLayers(hero)}
      <div class="absolute inset-0 z-[2]" style="background:linear-gradient(to bottom, rgba(35,26,19,.35) 0%, rgba(35,26,19,0) 38%, rgba(35,26,19,.72) 100%)"></div>
      <div class="absolute bottom-0 inset-x-0 z-[3] p-margin-mobile max-w-container-max mx-auto">
        <span class="inline-block px-4 py-1 mb-4 bg-terracotta/90 text-white rounded-full font-label-sm text-label-sm uppercase tracking-widest">Sommer 2026</span>
        <h1 class="font-display-lg text-[42px] leading-[1.05] text-white mb-3">Familieferie på franske Rivieraen</h1>
        <p class="text-white/90 font-body-lg text-body-lg max-w-md mb-6">13.–20. juli. Én side per dag med severdigheter, mat, kart og alternativer samlet på ett sted.</p>
        <div class="flex flex-wrap gap-3">
          <a href="programmet.html" class="bg-terracotta text-white font-label-md text-label-md px-7 py-4 rounded-full flex items-center gap-2 shadow-lg active:scale-95 transition-transform">Se programmet ${icon('arrow_forward','text-[18px]')}</a>
          <a href="praktisk.html" class="bg-white/10 backdrop-blur-md border border-white/30 text-white font-label-md text-label-md px-7 py-4 rounded-full active:scale-95 transition-transform">Praktisk info</a>
        </div>
      </div>
    </section>

    <!-- DIN TUR -->
    <section class="mt-10 px-margin-mobile max-w-container-max mx-auto">
      <div class="mb-6"><h2 class="font-headline-lg text-headline-lg mb-1">Din tur</h2>
        <p class="text-on-surface-variant font-label-md text-label-md uppercase tracking-widest">Reiseplan · 13.–20. juli 2026</p></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <a href="dag-${di}.html" class="group relative overflow-hidden rounded-xl bg-ivory p-6 shadow-sm border border-sand block">
          <div class="flex justify-between items-start mb-5">
            <div><span class="text-terracotta font-label-sm text-label-sm uppercase tracking-widest block mb-2">Dagens program</span>
              <h3 class="font-headline-md text-headline-md">Dag ${di}: ${day.tag||day.title}</h3></div>
            <div class="bg-surface-container-high w-12 h-12 rounded-lg flex items-center justify-center text-terracotta">${icon('flight_land')}</div>
          </div>
          <p class="text-on-surface-variant mb-5 leading-relaxed">${firstSentence(day.note||day.title)}</p>
          <span class="text-terracotta font-label-md text-label-md flex items-center gap-1">Les mer om dagen ${icon('chevron_right','text-[18px]')}</span>
        </a>
        <a href="praktisk.html" class="relative overflow-hidden rounded-xl bg-secondary-container/30 p-6 border border-secondary-container/50 block">
          <div class="flex justify-between items-start mb-5">
            <div><span class="text-on-secondary-container font-label-sm text-label-sm uppercase tracking-widest block mb-2">Vår base</span>
              <h3 class="font-headline-md text-headline-md">${HOME.name.replace(/\s*\(.*\)/,'')}</h3></div>
            <div class="text-on-secondary-container">${icon('home','text-4xl')}</div>
          </div>
          <p class="text-on-surface leading-tight font-label-md">${HOME.addr}</p>
          <p class="text-label-sm text-on-surface-variant mt-1">Praktisk info, sjekkliste og bestillinger →</p>
        </a>
      </div>
    </section>

    <!-- UTVALGTE DESTINASJONER -->
    <section class="mt-14 px-margin-mobile max-w-container-max mx-auto">
      <h2 class="font-headline-lg text-headline-lg mb-6">Utvalgte destinasjoner</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">${FEATURED.map(placeCard).join("")}</div>
    </section>

    <!-- UKEOVERSIKT -->
    <section class="mt-16 bg-surface-container-low py-14">
      <div class="px-margin-mobile max-w-container-max mx-auto">
        <h2 class="font-headline-lg text-headline-lg mb-10">Ukeoversikt</h2>
        <div class="relative space-y-10 pl-2">
          <div class="absolute left-[19px] top-3 bottom-3 dotted-v opacity-50"></div>
          ${preview.map((d,i)=>`<a href="dag-${i+1}.html" class="flex gap-6 relative z-10">
            <div class="w-10 h-10 rounded-full ${i===0?'bg-terracotta text-white':'bg-white border-2 border-terracotta text-terracotta'} flex items-center justify-center font-label-md flex-shrink-0 shadow-sm">${parseInt(d.date)}</div>
            <div><h5 class="font-headline-md text-[20px] leading-tight mb-1">${d.tag||d.title}</h5>
              <p class="text-on-surface-variant">${firstSentence(d.note||d.title)}</p></div></a>`).join("")}
        </div>
        <a href="programmet.html" class="mt-10 text-terracotta font-label-md text-label-md flex items-center gap-2">Se hele reiseplanen for ${WEEK.length} dager ${icon('expand_more')}</a>
      </div>
    </section>
  </main>`;
  shell(inner, "home");
  document.title="Rivieraen 2026 — Reiseguide";
}

/* ================= PROGRAMMET (8 dager) ================= */
function renderProgram(){
  const items=WEEK.map((d,i)=>{
    const n=i+1, hero=d.hero?byName[d.hero]:null;
    const ns=(d.sights||[]).length, nf=(d.food||[]).length;
    const first=n===1, last=n===WEEK.length;
    const circleIcon=first?'flight_land':last?'flight_takeoff':planIcon((d.plan&&d.plan[0])||d.title);
    const chips=[ns?`${icon('explore','text-[18px]')}<span class="text-label-sm">${ns} severdighet${ns>1?'er':''}</span>`:null,
                 nf?`${icon('restaurant','text-[18px]')}<span class="text-label-sm">${nf} spisested${nf>1?'er':''}</span>`:null]
                 .filter(Boolean).map(c=>`<div class="flex items-center gap-1 text-on-surface-variant">${c}</div>`).join("");
    return `<div class="flex gap-5 relative">
      <div class="flex flex-col items-center shrink-0">
        <div class="w-11 h-11 rounded-full bg-terracotta text-white flex items-center justify-center z-10 shadow border-4 border-background">${icon(circleIcon,'text-[20px]')}</div>
      </div>
      <a href="dag-${n}.html" class="luxury-card bg-white rounded-xl overflow-hidden border border-sand flex-1 mb-2 block">
        <div class="relative h-40">${heroLayers(hero)}<div class="absolute inset-0 z-[2] bg-gradient-to-t from-black/40 to-transparent"></div>
          <span class="absolute top-3 right-3 z-[3] bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full font-label-sm text-label-sm">Dag ${n}</span></div>
        <div class="p-5">
          <p class="font-label-sm text-label-sm text-terracotta uppercase tracking-widest mb-1">${d.day} ${d.date}</p>
          <h3 class="font-headline-md text-headline-md mb-1">${d.tag||d.title}</h3>
          <p class="text-on-surface-variant text-sm mb-3 leading-snug">${firstSentence(d.note||d.title)}</p>
          <div class="flex gap-4">${chips||'<span class="text-label-sm text-on-surface-variant">Reisedag</span>'}</div>
        </div>
      </a></div>`;
  }).join("");

  const inner=`<main class="pt-24 pb-28 px-margin-mobile max-w-container-max mx-auto">
    <section class="mb-10"><span class="font-label-md text-label-md text-terracotta tracking-widest uppercase">Din reiserute</span>
      <h1 class="font-headline-lg text-headline-lg mt-2 mb-3">Programmet — ${WEEK.length} dager</h1>
      <p class="font-body-md text-on-surface-variant max-w-xl">En dag-for-dag-plan for familieferien på franske Rivieraen, 13.–20. juli 2026. Trykk en dag for detaljer.</p></section>
    <section class="relative">
      <div class="absolute left-[21px] top-2 bottom-10 dotted-v"></div>
      <div class="flex flex-col gap-8 relative">${items}</div>
    </section>
  </main>`;
  shell(inner, "plan");
  document.title="Programmet — Rivieraen 2026";
}

/* ================= DAGSSIDE ================= */
function renderDay(n){
  const d=WEEK[n-1];
  if(!d){ document.getElementById("app").innerHTML="<div class='p-10 text-center'>Fant ikke dagen.</div>"; return; }
  const hero=d.hero?byName[d.hero]:null;
  const sights=(d.sights||[]).map(nm=>byName[nm]).filter(Boolean);
  const food=(d.food||[]).map(nm=>byName[nm]).filter(Boolean);
  const stops=sights.concat(food);
  const alts=d.alts||[];
  const prev=n>1?`dag-${n-1}.html`:"programmet.html";
  const next=n<WEEK.length?`dag-${n+1}.html`:"praktisk.html";

  const timeline=(d.plan||[]).map(r=>{
    const i=r.indexOf(" — "); const t=i>0?r.slice(0,i):""; const x=i>0?r.slice(i+3):r;
    return `<div class="relative flex gap-5 items-start">
      <div class="w-9 h-9 rounded-full bg-terracotta text-white flex items-center justify-center shrink-0 z-10 shadow border-2 border-background">${icon(planIcon(x),'text-[18px]')}</div>
      <div class="bg-ivory p-5 rounded-xl shadow-sm border border-sand flex-1">
        ${t?`<span class="font-label-sm text-label-sm text-terracotta block mb-1">${t}</span>`:''}
        <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">${x}</p></div></div>`;
  }).join("");

  const inner=`<main class="pb-28">
    <!-- HERO -->
    <section class="relative w-full h-[440px] overflow-hidden">
      ${hero ? heroLayers(hero) : `<div class="ph-scene absolute inset-0">${scene('cannes',n,null,null)}</div>`}
      <div class="absolute inset-0 z-[2] bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
      <a href="programmet.html" class="absolute top-20 left-4 z-[4] w-11 h-11 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-on-surface shadow">${icon('arrow_back')}</a>
      <div class="absolute bottom-0 inset-x-0 z-[3] p-margin-mobile text-white">
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-widest">Dag ${n}</span>
          <span class="text-white/85 font-label-md text-label-md">${d.day} ${d.date}</span></div>
        <h1 class="font-headline-lg text-headline-lg font-bold leading-tight" style="text-shadow:0 2px 8px rgba(0,0,0,.4)">${d.title}</h1>
      </div>
    </section>

    <div class="px-margin-mobile max-w-container-max mx-auto">
      ${timeline?`<section class="py-10">
        <h2 class="font-headline-md text-headline-md text-on-surface-variant mb-8 flex items-center gap-3">${icon('schedule','text-terracotta')} Dagens rute</h2>
        <div class="relative space-y-6"><div class="absolute left-[17px] top-2 bottom-2 dotted-v"></div>${timeline}</div>
      </section>`:''}

      ${stops.length?`<section class="pb-4">
        <h2 class="font-headline-md text-headline-md mb-5 flex items-center gap-3">${icon('map','text-terracotta')} Kart over dagen</h2>
        <div id="daymap" class="w-full h-72 rounded-2xl overflow-hidden border border-sand bg-surface-container"></div>
        <div class="flex flex-wrap gap-4 mt-3 text-label-sm text-on-surface-variant">
          <span class="inline-flex items-center gap-1.5"><i class="lgdot" style="background:#2f6388"></i>Severdighet</span>
          <span class="inline-flex items-center gap-1.5"><i class="lgdot" style="background:#c2620f"></i>Spisested</span>
          <span class="inline-flex items-center gap-1.5"><i class="lgdot" style="background:#b5559e"></i>Iskrem</span>
          <span class="inline-flex items-center gap-1.5"><i class="lgdot" style="background:#0c4a6e"></i>Base</span></div>
      </section>`:''}

      ${sights.length?`<section class="py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${titleCard('Severdigheter','Utvalgte stopp mellom fjell og hav denne dagen.',sights.length,sights.length>1?'utvalgte steder':'utvalgt sted','bg-surface-container-low')}
        ${sights.map(placeCard).join("")}
      </section>`:''}

      ${food.length?`<section class="py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${titleCard('Spisesteder','Fra markedsboder til reserverte bord.',food.length,food.length>1?'spisesteder':'spisested','bg-surface-container-high')}
        ${food.map(placeCard).join("")}
      </section>`:''}

      ${d.note?`<section class="py-8">
        <div class="bg-terracotta rounded-3xl p-8 md:p-10 text-white relative overflow-hidden">
          <div class="absolute -top-10 -right-8 opacity-10">${icon('lightbulb','text-[220px]')}</div>
          <div class="relative z-10"><h3 class="font-headline-lg text-headline-lg mb-3">Dagens tips</h3>
            <p class="font-body-lg text-body-lg opacity-95">${d.note}</p></div>
        </div></section>`:''}

      ${alts.length?`<section class="py-8">
        <h2 class="font-headline-md text-headline-md mb-2 flex items-center gap-3">${icon('swap_horiz','text-terracotta')} Alternativer</h2>
        <p class="text-on-surface-variant text-sm mb-5">Plan B hvis noe er stengt eller fullt. Sjekk åpningstider og reserver ved behov.</p>
        <div class="flex flex-col gap-4">${alts.map(altCard).join("")}</div>
      </section>`:''}

      <nav class="flex items-center gap-3 py-8">
        <a href="${prev}" class="flex-1 flex items-center justify-center gap-1 bg-white border border-sand rounded-full py-4 font-label-md text-label-md active:scale-95 transition-transform">${icon('chevron_left','text-[18px]')} Forrige</a>
        <a href="programmet.html" class="w-14 h-14 flex items-center justify-center bg-white border border-sand rounded-full text-terracotta">${icon('calendar_today')}</a>
        <a href="${next}" class="flex-1 flex items-center justify-center gap-1 bg-terracotta text-white rounded-full py-4 font-label-md text-label-md active:scale-95 transition-transform">Neste ${icon('chevron_right','text-[18px]')}</a>
      </nav>
    </div>
  </main>`;
  shell(inner, "plan");
  if(stops.length) setTimeout(()=>buildDayMap(stops),120);
  document.title=`Dag ${n}: ${d.tag||d.title} — Rivieraen 2026`;
}

/* ================= STED-DETALJ ================= */
let _placeHashBound=false;
function renderPlace(){
  if(!_placeHashBound){ _placeHashBound=true; window.addEventListener("hashchange",renderPlace); }
  const id=parseInt((location.hash||"").slice(1) || new URLSearchParams(location.search).get("id"));
  const x=ALL[id];
  if(!x){ document.getElementById("app").innerHTML=topBar()+"<main class='pt-24 p-8 text-center'>Fant ikke stedet. <a class='text-terracotta underline' href='index.html'>Til forsiden</a></main>"; return; }
  const isFood=x.cat==="mat";
  const tags=[`<span class="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider">${ZONES[x.z].name}</span>`];
  if(isFood){ tags.push(`<span class="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full font-label-sm text-label-sm">Pris ${x.p}</span>`); if(isIce(x)) tags.push(`<span class="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full font-label-sm text-label-sm">Iskrem</span>`); }
  else tags.push(`<span class="px-3 py-1 rounded-full font-label-sm text-label-sm ${x.k==='nei'?'bg-error-container text-on-error-container':x.k==='ja'?'bg-secondary-container text-on-secondary-container':'bg-surface-container-high text-on-surface-variant'}">3-åring: ${x.k==='ja'?'Ja':x.k==='nei'?'Nei':'Delvis'}</span>`);
  if(x.f!=="bekreftet") tags.push(`<span class="bg-error-container/60 text-on-error-container px-3 py-1 rounded-full font-label-sm text-label-sm">${x.f==="sannsynlig"?"Sjekk nær avreise":"Usikkert"}</span>`);

  const inner=`<main>
    <section class="relative w-full h-[380px] overflow-hidden">
      ${heroLayers(x)}
      <div class="absolute inset-0 z-[2] bg-gradient-to-t from-black/50 to-transparent"></div>
      <button onclick="history.length>1?history.back():location.href='index.html'" class="absolute top-20 left-4 z-[4] w-11 h-11 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-on-surface shadow">${icon('arrow_back')}</button>
    </section>
    <div class="relative -mt-8 z-10 bg-background rounded-t-3xl px-margin-mobile pt-7 pb-10 max-w-container-max mx-auto">
      <div class="w-10 h-1 rounded-full bg-outline-variant/60 mx-auto mb-5"></div>
      <div class="flex flex-wrap gap-2 mb-4">${tags.join("")}</div>
      <h1 class="font-headline-lg text-headline-lg mb-1">${x.n}</h1>
      <p class="flex items-center gap-1.5 text-on-surface-variant font-body-md mb-6">${icon('location_on','text-[18px] text-terracotta')} ${x.a}</p>
      ${x.gallery&&x.gallery.length?`<div class="mb-6">${galleryRow(x.gallery)}</div>`:''}
      ${x.why?`<p class="font-body-lg text-body-lg text-on-surface leading-relaxed mb-6">${x.why.replace(/^🍦\s*/,'')}</p>`:''}
      ${x.tips?`<div class="flex gap-3 bg-tertiary-container/25 border border-tertiary-container/40 rounded-2xl p-5 mb-6">
        ${icon('lightbulb','text-terracotta')}<p class="font-body-md text-on-surface-variant leading-relaxed">${x.tips}</p></div>`:''}
      ${x.pr?`<div class="mb-6"><h2 class="font-headline-md text-headline-md mb-4">Praktisk info</h2>
        <div class="flex gap-3 bg-white border border-sand rounded-2xl p-5 shadow-sm">${icon('info','text-terracotta')}<p class="font-body-md text-on-surface-variant leading-relaxed">${x.pr}</p></div></div>`:''}
      ${x.ll?`<div class="mb-7"><h2 class="font-headline-md text-headline-md mb-4">Kart</h2>
        <div id="placemap" class="w-full h-56 rounded-2xl overflow-hidden border border-sand bg-surface-container"></div></div>`:''}
      <div class="flex gap-3">
        <a href="${gmaps(x)}" target="_blank" rel="noopener" class="flex-1 flex items-center justify-center gap-2 bg-terracotta text-white font-label-md text-label-md py-4 rounded-full shadow-lg active:scale-95 transition-transform">${icon('navigation','text-[20px]')} Naviger</a>
        ${x.u?`<a href="${x.u}" target="_blank" rel="noopener" class="flex-1 flex items-center justify-center gap-2 border-2 border-terracotta text-terracotta font-label-md text-label-md py-4 rounded-full active:scale-95 transition-transform">${icon('open_in_new','text-[20px]')} Kilde</a>`:''}
      </div>
    </div>
  </main>`;
  document.getElementById("app").innerHTML = topBar() + inner + bottomNav("plan");
  hydrate(document.getElementById("app"));
  if(x.ll) setTimeout(()=>buildPlaceMap(x,"placemap"),120);
  document.title=`${x.n} — Rivieraen 2026`;
}

/* ================= PRAKTISK ================= */
function renderPraktisk(){
  const base=HOME;
  const checklist=CHECKLIST.map(g=>`
    <div class="bg-white border border-sand rounded-xl p-6 shadow-sm">
      <h3 class="font-label-md text-label-md text-terracotta mb-4 uppercase tracking-wider">${g.group}</h3>
      <div class="space-y-3">${g.items.map(it=>`
        <label data-it="${esc(it)}" class="flex items-start gap-4 cursor-pointer">
          <input type="checkbox" ${checks.includes(it)?'checked':''} onchange="toggleCheck(this)" class="mt-1 w-5 h-5 rounded border-outline-variant text-terracotta focus:ring-terracotta shrink-0">
          <span class="chk-body font-body-md text-on-surface ${checks.includes(it)?'opacity-40 line-through':''}">${it}</span>
        </label>`).join("")}</div>
    </div>`).join("");
  const praktisk=PRAKTISK.map(g=>`
    <div class="bg-white border border-sand rounded-xl p-6 shadow-sm">
      <h3 class="font-label-md text-label-md text-terracotta mb-3 uppercase tracking-wider">${g.group}</h3>
      <ul class="space-y-2 list-disc pl-5 marker:text-terracotta">${g.items.map(it=>`<li class="font-body-md text-on-surface-variant leading-relaxed">${it}</li>`).join("")}</ul>
    </div>`).join("");

  const inner=`<main class="pt-24 pb-28 px-margin-mobile max-w-container-max mx-auto">
    <section class="mb-10 text-center">
      <span class="font-label-sm text-label-sm text-terracotta uppercase tracking-[0.2em] mb-2 block">Forberedelser</span>
      <h1 class="font-headline-lg text-headline-lg mb-3">Praktisk info & sjekkliste</h1>
      <p class="font-body-md text-on-surface-variant max-w-md mx-auto">Alt dere trenger før avreise til Vallauris og franske Rivieraen.</p>
    </section>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
      <div class="md:col-span-2 relative overflow-hidden rounded-xl h-56 shadow-lg">
        <div class="ph-scene absolute inset-0 z-0">${scene('cannes',3,null,null)}</div>
        ${base.img?`<img class="ph" src="${base.img}" alt="${base.name}" referrerpolicy="no-referrer" onload="this.classList.add('show')" onerror="this.remove()">`:''}
        <div class="absolute inset-0 z-[2]" style="background:linear-gradient(to top, rgba(45,36,30,.92) 0%, rgba(45,36,30,.55) 45%, rgba(45,36,30,.15) 100%)"></div>
        <div class="absolute bottom-0 left-0 right-0 z-[3] p-6">
          <h3 class="font-headline-md text-headline-md text-white mb-1" style="text-shadow:0 1px 6px rgba(0,0,0,.5)">${base.name}</h3>
          <p class="text-white/85 font-body-md mb-4">${base.addr}</p>
          <div class="flex flex-wrap gap-2">
            ${base.url?`<a href="${base.url}" target="_blank" rel="noopener" class="bg-terracotta text-white font-label-md px-5 py-2 rounded-full inline-flex items-center gap-2">Åpne i Airbnb ${icon('open_in_new','text-sm')}</a>`:''}
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(base.addr)}" target="_blank" rel="noopener" class="bg-white/15 backdrop-blur border border-white/40 text-white font-label-md px-5 py-2 rounded-full inline-flex items-center gap-2">Kart ${icon('map','text-sm')}</a>
          </div>
        </div>
      </div>
      <div class="bg-surface-container-high rounded-xl p-6 flex flex-col justify-between shadow-sm">
        <div><div class="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center text-terracotta mb-4">${icon('library_books')}</div>
          <h3 class="font-headline-md text-headline-md mb-2">Arkiv</h3>
          <p class="text-on-surface-variant font-body-md">Full research-side med alle restauranter, severdigheter og skjulte perler.</p></div>
        <a href="arkiv.html" class="border-2 border-terracotta text-terracotta font-label-md px-4 py-2 rounded-full mt-6 text-center">Gå til research</a>
      </div>
    </div>

    <section class="mb-12">
      <h2 class="font-headline-md text-headline-md mb-6 flex items-center gap-3">${icon('rule','text-terracotta')} Bestillingssjekkliste
        <span id="count" class="ml-auto font-label-sm text-label-sm text-on-surface-variant normal-case tracking-normal">${checks.length}/${CHECKTOTAL} gjort</span></h2>
      <div class="space-y-4">${checklist}</div>
    </section>

    <section>
      <h2 class="font-headline-md text-headline-md mb-6 flex items-center gap-3">${icon('travel_explore','text-terracotta')} Praktisk info</h2>
      <div class="space-y-4">${praktisk}</div>
    </section>
  </main>`;
  shell(inner, "info");
  document.title="Praktisk info — Rivieraen 2026";
}
