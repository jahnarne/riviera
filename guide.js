/* Rivieraen 2026 — delt logikk for reiseguiden.
   Gjenbruker hjelpefunksjoner fra den opprinnelige research-siden (arkiv.html)
   og legger til rendererne renderHome / renderDay / renderPraktisk. */

/* ---------------- STATE ---------------- */
let imgCache = {};
let checks = loadChecks();

/* ---------------- SJEKKLISTE (localStorage) ---------------- */
function loadChecks(){ try{ return JSON.parse(localStorage.getItem("rivcheck")||"[]"); }catch(e){ return []; } }
function saveChecks(){ try{ localStorage.setItem("rivcheck", JSON.stringify(checks)); }catch(e){} }
function toggleCheck(inp){
  const it=inp.parentElement.dataset.it; const i=checks.indexOf(it);
  if(inp.checked && i<0) checks.push(it); else if(!inp.checked && i>=0) checks.splice(i,1);
  saveChecks();
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
  (root||document).querySelectorAll("img.ph:not([data-done])").forEach(async im=>{
    im.setAttribute("data-done","1");
    const src = await fetchThumb(decodeURIComponent(im.dataset.title));
    if(src){ im.onload=()=>im.classList.add("show"); im.onerror=()=>im.remove(); im.src=src; }
    else im.remove();
  });
}
function phImg(x){
  if(x.img) return `<img class="ph" src="${x.img}" alt="${x.n}" referrerpolicy="no-referrer" onload="this.classList.add('show')" onerror="this.remove()">`;
  if(x.gallery&&x.gallery[0]) return `<img class="ph" src="${x.gallery[0]}" alt="${x.n}" referrerpolicy="no-referrer" onload="this.classList.add('show')" onerror="this.remove()">`;
  if(x.wiki) return `<img class="ph" data-title="${encodeURIComponent(x.wiki)}" alt="${x.n}">`;
  return "";
}
function galleryHTML(urls){
  urls = (urls||[]).filter(Boolean);
  if(!urls.length) return "";
  return `<div class="d-block"><h3>Bildegalleri (${urls.length})</h3><div class="gallery">${urls.map(u=>`<img loading="lazy" referrerpolicy="no-referrer" src="${u}" alt="" onerror="this.remove()">`).join("")}</div></div>`;
}

/* ---------------- LENKER ---------------- */
function gmaps(x){
  const place = (x.a||"").split("·")[0].trim();
  const q = encodeURIComponent(`${x.n}, ${place}, France`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/* ---------------- SMÅTT ---------------- */
function transIcon(x){ const t=(x.trans||"")+" "+(x.a||""); let s="";
  if(/båt|ferge|shuttle/i.test(t))s+="⛴️";
  if(/tog/i.test(t))s+="🛤️";
  if(/bil/i.test(t))s+="🚗";
  if(/fots/i.test(t))s+="🚶";
  return s||"📍"; }
function isIce(x){ return x.cat==="mat" && typeof x.why==="string" && x.why.indexOf("🍦")===0; }
function freshBadge(f){ if(f==="bekreftet") return ""; return `<span class="badge">${f==="sannsynlig"?"~ Sjekk nær":"? Usikkert"}</span>`; }
function kidPill(k){ const m={ja:"3-åring: Ja",delvis:"3-åring: Delvis",nei:"3-åring: Nei"}; return `<span class="pill ${k}">${m[k]||m.delvis}</span>`; }
function oneLiner(x){
  let w=(x.why||"").replace(/^🍦\s*/,"").replace(/^[A-ZÆØÅ]+:\s*/,"");
  const i=w.search(/[.!]/); if(i>5) w=w.slice(0,i);
  if(w.length>96) w=w.slice(0,94).replace(/\s+\S*$/,"")+"…";
  return w;
}
function firstSentence(t){
  t=(t||"").trim(); const i=t.search(/[.!?]\s/);
  let s = i>10 ? t.slice(0,i+1) : t;
  if(s.length>120) s=s.slice(0,118).replace(/\s+\S*$/,"")+"…";
  return s;
}

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
function motif(x){
  const k=MOTIF[x.n]; if(!k||!GLYPH[k]) return "";
  return `<div class="motif"><svg viewBox="0 0 32 32" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="15" fill="#1f3d2f" fill-opacity=".34" stroke="none"/>${GLYPH[k]}</svg></div>`;
}
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

const COVER_SVG = `
<svg viewBox="0 0 340 300" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="cs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff5ec"/><stop offset="1" stop-color="#f6d8b6"/></linearGradient></defs>
  <circle cx="170" cy="140" r="120" fill="url(#cs)"/><circle cx="245" cy="78" r="26" fill="#fde68a" opacity=".95"/>
  <path d="M30,200 Q110,150 190,196 T330,188 V300 H30 Z" fill="#7fb2cf"/>
  <path d="M10,230 Q120,188 240,232 T350,224 V300 H10 Z" fill="#3f7aa0"/>
  <path d="M0,262 Q120,244 240,264 T340,258 V300 H0 Z" fill="#0c4a6e"/>
  <g transform="translate(150,120) rotate(-12)"><rect x="-26" y="-34" width="52" height="74" rx="7" fill="#c2620f"/>
   <rect x="-26" y="-34" width="52" height="74" rx="7" fill="none" stroke="#8d4b00" stroke-width="2"/>
   <circle cx="0" cy="-4" r="15" fill="#fde68a"/>
   <path d="M-15,-4 H15 M0,-19 V11 M-10,-13 Q0,-4 -10,5 M10,-13 Q0,-4 10,5" stroke="#c2620f" stroke-width="1.4" fill="none"/>
   <rect x="-20" y="22" width="40" height="8" rx="2" fill="#2f6388"/></g>
  <g stroke="#c2620f" stroke-width="2" stroke-dasharray="3 6" fill="none" opacity=".65"><path d="M70,90 Q150,40 250,86"/></g>
  <g transform="translate(74,86)"><rect x="-16" y="-14" width="32" height="28" rx="3" fill="#fffaf4" stroke="#2f6388" stroke-width="2"/>
   <path d="M-13,8 L-3,-4 L4,4 L9,-2 L13,6 Z" fill="#7fb2cf"/><circle cx="6" cy="-7" r="3" fill="#fde68a"/></g>
</svg>`;

/* ---------------- KART (Leaflet + OpenStreetMap) ---------------- */
let geo = (function(){ try{ return JSON.parse(localStorage.getItem("rivgeo")||"{}"); }catch(e){ return {}; } })();
function saveGeo(){ try{ localStorage.setItem("rivgeo", JSON.stringify(geo)); }catch(e){} }
const sleep = ms => new Promise(r=>setTimeout(r,ms));
async function geocode(item){
  if(item.ll) return item.ll;
  if(item.n in geo) return geo[item.n];
  const place = (item.a||"").split("·")[0].trim();
  const q = encodeURIComponent(item.n + ", " + place + ", France");
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=fr&bounded=1&viewbox=4.4,44.7,7.9,43.1&q=${q}`;
  try{
    const r = await fetch(url, {headers:{'Accept':'application/json'}});
    const d = await r.json();
    geo[item.n] = (d && d[0]) ? [parseFloat(d[0].lat), parseFloat(d[0].lon)] : null;
  }catch(e){ geo[item.n] = null; }
  saveGeo();
  return geo[item.n];
}
function pinColor(x){ return x.cat!=="mat" ? "#2f6388" : (isIce(x) ? "#b5559e" : "#c2620f"); }
function pinEmoji(x){ return x.cat!=="mat" ? "📍" : (isIce(x) ? "🍦" : "🍴"); }
function markerIcon(x){
  return L.divIcon({className:"", html:`<div class="mpin" style="background:${pinColor(x)}">${pinEmoji(x)}</div>`,
    iconSize:[27,27], iconAnchor:[13,13], popupAnchor:[0,-12]});
}
function homeMarker(map){
  if(!map||typeof L==="undefined") return;
  const ic=L.divIcon({className:"", html:`<div class="mpin" style="background:#0c4a6e;font-size:15px">🏠</div>`, iconSize:[31,31], iconAnchor:[15,15], popupAnchor:[0,-14]});
  L.marker(HOME.ll,{icon:ic, zIndexOffset:1000}).addTo(map).bindPopup(`🏠 <b>${HOME.name}</b><br>${HOME.addr}`);
}
let _daymap=null;
async function buildDayMap(stops){
  const el = document.getElementById("daymap");
  if(!el) return;
  if(typeof L === "undefined"){ el.innerHTML = "<div style='padding:16px;font-size:12px;color:#777'>Kart krever internett.</div>"; return; }
  if(_daymap){ try{ _daymap.remove(); }catch(e){} _daymap=null; }
  _daymap = L.map(el, {scrollWheelZoom:false}).setView([43.6,7.0], 9);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'© OpenStreetMap'}).addTo(_daymap);
  setTimeout(()=>{ try{ _daymap.invalidateSize(); }catch(e){} }, 120);
  const pts=[];
  for(const s of stops){
    const instant = !!(s.ll || (s.n in geo));
    const c = await geocode(s);
    if(c){
      const kind = s.cat!=="mat" ? "Severdighet" : (isIce(s) ? "Iskrem" : "Spisested");
      L.marker(c,{icon:markerIcon(s)}).addTo(_daymap).bindPopup(`<b>${s.n}</b><br><span style="color:#777">${kind}</span><br><a href="#place-${s.id}">Til stedet ↓</a>`);
      pts.push(c);
      try{ _daymap.fitBounds(pts,{padding:[28,28],maxZoom:14}); }catch(e){}
    }
    if(!instant){ await sleep(1100); }
  }
  homeMarker(_daymap);
}
function buildPlaceMap(x, elId){
  const el=document.getElementById(elId); if(!el) return;
  if(typeof L==="undefined"||!x.ll){ el.innerHTML="<div style='padding:14px;font-size:12px;color:#777'>Kart utilgjengelig.</div>"; return; }
  const m=L.map(el,{scrollWheelZoom:false,zoomControl:false}).setView(x.ll,15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(m);
  L.marker(x.ll,{icon:markerIcon(x)}).addTo(m);
  setTimeout(()=>{ try{m.invalidateSize();}catch(e){} },120);
}

/* ---------------- STED-SEKSJON (full inline-presentasjon) ---------------- */
function placeSection(x){
  if(!x) return "";
  const isFood = x.cat==="mat";
  const hero = scene(x.z,x.id,null,null)+phImg(x);
  let tags = "";
  if(x.f!=="bekreftet") tags += `<span class="tag warn">${x.f==="sannsynlig"?"~ Sjekk nær avreise":"? Usikkert"}</span> `;
  tags += `<span class="tag">${ZONES[x.z].name}</span>`;
  if(isFood){ tags += ` <span class="tag">Pris ${x.p}</span>`; if(isIce(x)) tags += ` <span class="tag">🍦 Iskrem</span>`; }
  else { tags += ` <span class="tag ${x.k==='nei'?'warn':x.k==='ja'?'fresh':''}">3-åring: ${x.k==='ja'?'Ja':x.k==='nei'?'Nei':'Delvis'}</span>`; }

  let blocks="";
  if(isFood){
    blocks += `<div class="d-block"><h3>Hvorfor hit</h3><p>${x.why.replace(/^🍦\s*/,"")}</p></div>`;
  } else {
    if(x.why) blocks += `<div class="d-block"><h3>Hvorfor verdt det</h3><p>${x.why}</p></div>`;
    if(x.tips) blocks += `<div class="d-block"><h3>Slik gjør du det riktig</h3><p>${x.tips}</p></div>`;
    if(x.pr) blocks += `<div class="d-block"><h3>Praktisk</h3><p>${x.pr}</p></div>`;
  }
  blocks += galleryHTML(x.gallery);
  if(x.ll) blocks += `<div class="d-block"><h3>Kart</h3><div class="placemap" id="pm-${x.id}"></div></div>`;

  let actions="";
  if(x.u) actions += `<a class="d-src" href="${x.u}" target="_blank" rel="noopener">Åpne kilde ↗</a>`;
  actions += `<a class="d-src light" href="${gmaps(x)}" target="_blank" rel="noopener">🗺️ Google Maps</a>`;

  return `<article class="place" id="place-${x.id}">
    <div class="place-hero">${hero}${freshBadge(x.f)}</div>
    <div class="place-body">
      <div class="d-tagrow">${tags}</div>
      <h2 class="place-title">${x.n}</h2>
      <div class="d-loc">📍 ${x.a}</div>
      ${blocks}
      <div class="d-actions">${actions}</div>
    </div></article>`;
}

function altCard(a){
  const x=byName[a.n];
  const why = a.why || (x?oneLiner(x):"");
  if(!x) return `<div class="altc"><div class="altc-b"><h3>${a.n}</h3><p class="altc-why">${why}</p></div></div>`;
  const href = x.u || gmaps(x);
  return `<a class="altc" href="${href}" target="_blank" rel="noopener">
     <div class="altc-th">${scene(x.z,x.id,null,null)}${phImg(x)}</div>
     <div class="altc-b"><h3>${x.n} <span class="altc-arr">↗</span></h3>
       <div class="altc-meta">${ZONES[x.z].name}${x.cat==='mat'?' · '+x.p:''}</div>
       <p class="altc-why">${why}</p>
     </div></a>`;
}

/* ---------------- RENDER: DAGSSIDE ---------------- */
function renderDay(n){
  const d = WEEK[n-1];
  const app = document.getElementById("app");
  if(!d){ app.innerHTML = "<div class='empty'>Fant ikke dagen.</div>"; return; }

  const heroItem = d.hero ? byName[d.hero] : null;
  const heroHTML = heroItem ? scene(heroItem.z,heroItem.id,null,null)+phImg(heroItem) : scene('cannes',n,null,null);

  const planHTML = (d.plan||[]).map(r=>{
    const i=r.indexOf(" — "); const t=i>0?r.slice(0,i):""; const x=i>0?r.slice(i+3):r;
    return `<div class="tlrow"><div class="tlt">${t}</div><div class="tld">${x}</div></div>`;
  }).join("");

  const sights = (d.sights||[]).map(nm=>byName[nm]).filter(Boolean);
  const food   = (d.food||[]).map(nm=>byName[nm]).filter(Boolean);
  const stops  = sights.concat(food);
  const alts   = d.alts||[];

  const prev = n>1 ? {href:`dag-${n-1}.html`, label:`← Dag ${n-1}`} : {href:"index.html", label:"← Forsiden"};
  const next = n<WEEK.length ? {href:`dag-${n+1}.html`, label:`Dag ${n+1} →`} : {href:"praktisk.html", label:"Praktisk →"};

  app.innerHTML = `
    <header class="day-hero">
      ${heroHTML}
      <a class="d-back" href="index.html" aria-label="Til forsiden">←</a>
      <div class="day-hero-cap">
        <div class="day-head"><span class="dnum">${d.day}</span><span class="ddate">${d.date}</span>${d.tag?`<span class="dtag">${d.tag}</span>`:''}</div>
        <h1 class="day-title">${d.title}</h1>
        <div class="day-count">Dag ${n} av ${WEEK.length}</div>
      </div>
    </header>
    <div class="day-body">
      ${d.note?`<p class="dnote big">${d.note}</p>`:''}

      ${planHTML?`<section class="sec"><div class="sec-title">Dagens plan</div><div class="tl card-tl">${planHTML}</div></section>`:''}

      ${stops.length?`<section class="sec"><div class="sec-title">Kart over dagen</div>
        <div id="daymap"></div>
        <div class="maplegend"><span><i class="lgdot" style="background:#2f6388"></i>📍 Severdighet</span><span><i class="lgdot" style="background:#c2620f"></i>🍴 Spisested</span><span><i class="lgdot" style="background:#b5559e"></i>🍦 Iskrem</span><span><i class="lgdot" style="background:#0c4a6e"></i>🏠 Base</span></div>
        <p class="muted" style="font-size:11px;margin-top:6px">Pins er forhåndsplassert (noen omtrentlige). Kartflisene krever nett.</p></section>`:''}

      ${sights.length?`<section class="sec"><div class="sec-title">Severdigheter &amp; opplevelser <span class="sec-n">${sights.length}</span></div>
        <div class="places">${sights.map(placeSection).join("")}</div></section>`:''}

      ${food.length?`<section class="sec"><div class="sec-title">Mat &amp; drikke <span class="sec-n">${food.length}</span></div>
        <div class="places">${food.map(placeSection).join("")}</div></section>`:''}

      ${alts.length?`<section class="sec alt-sec"><div class="sec-title">Alternativer hvis stengt eller fullt</div>
        <p class="muted" style="font-size:12.5px;margin:0 0 10px">Plan B for dagen — sjekk åpningstider og reserver ved behov.</p>
        <div class="altgrid">${alts.map(altCard).join("")}</div></section>`:''}

      <nav class="daynav">
        <a class="daynav-btn" href="${prev.href}">${prev.label}</a>
        <a class="daynav-home" href="index.html" aria-label="Forsiden">☰</a>
        <a class="daynav-btn" href="${next.href}">${next.label}</a>
      </nav>
      <div class="foot">Base: ${HOME.name} · ${HOME.addr}</div>
    </div>`;

  hydrate(app);
  if(stops.length) setTimeout(()=>buildDayMap(stops), 80);
  stops.forEach(x=>{ if(x.ll) setTimeout(()=>buildPlaceMap(x, "pm-"+x.id), 140); });
  document.title = `Dag ${n} · ${d.tag||d.title} — Rivieraen 2026`;
}

/* ---------------- RENDER: FORSIDE ---------------- */
function renderHome(){
  const app=document.getElementById("app");
  const cards = WEEK.map((d,i)=>{
    const h = d.hero?byName[d.hero]:null;
    const thumb = h ? scene(h.z,h.id,null,null)+phImg(h) : scene('cannes',i,null,null);
    const nSights = (d.sights||[]).length, nFood=(d.food||[]).length;
    const meta = [nSights?`${nSights} severdighet${nSights>1?'er':''}`:null, nFood?`${nFood} spisested${nFood>1?'er':''}`:null].filter(Boolean).join(" · ");
    return `<a class="daycard" href="dag-${i+1}.html">
      <div class="daycard-th">${thumb}<span class="daycard-num">Dag ${i+1}</span></div>
      <div class="daycard-b">
        <div class="day-head"><span class="dnum">${d.day}</span><span class="ddate">${d.date}</span>${d.tag?`<span class="dtag">${d.tag}</span>`:''}</div>
        <h3>${d.title}</h3>
        ${d.note?`<p class="daycard-note">${firstSentence(d.note)}</p>`:''}
        ${meta?`<div class="daycard-meta">${meta}</div>`:''}
      </div></a>`;
  }).join("");

  app.innerHTML = `
    <section class="home-cover">
      <div class="cover-art" id="coverArt"></div>
      <div class="cover-copy"><h1>Rivieraen 2026</h1>
        <p>Familieferie på franske Rivieraen · 13.–20. juli. Én side per dag — trykk deg inn på dagen for severdigheter, mat, kart og alternativer.</p></div>
    </section>
    <div class="sec-label"><h2>Programmet</h2><span>${WEEK.length} dager</span></div>
    <div class="daylist">${cards}</div>
    <div class="home-links">
      <a class="btn2" href="praktisk.html">🧳 Praktisk info &amp; sjekkliste</a>
      <a class="btn2 light" href="arkiv.html">📚 Arkiv — full research-side</a>
    </div>
    <div class="foot">Base: ${HOME.name} · ${HOME.addr}</div>`;
  const ca=document.getElementById("coverArt"); if(ca) ca.innerHTML = COVER_SVG;
  hydrate(app);
  document.title = "Rivieraen 2026 — Reiseguide";
}

/* ---------------- RENDER: PRAKTISK ---------------- */
function renderPraktisk(){
  const app=document.getElementById("app");
  app.innerHTML = `
    <header class="page-head"><a class="d-back" href="index.html" aria-label="Til forsiden">←</a><h1>Praktisk info</h1></header>
    <div class="page-body">
      <div class="sec-label"><h2>Bestillingssjekkliste</h2><span id="count">${checks.length}/${CHECKTOTAL} gjort</span></div>
      <div class="checkwrap">${CHECKLIST.map(g=>`
        <div class="dayc"><div class="dtitle">${g.group}</div>
          ${g.items.map(it=>`<label class="chk" data-it="${it}"><input type="checkbox" ${checks.includes(it)?'checked':''} onchange="toggleCheck(this)"><span>${it}</span></label>`).join("")}
        </div>`).join("")}</div>

      <div class="sec-label"><h2>Praktisk info</h2><span>${PRAKTISK.length} temaer</span></div>
      <div class="checkwrap">${PRAKTISK.map(g=>`
        <div class="dayc"><div class="dtitle">${g.group}</div>
          <ul class="plist">${g.items.map(it=>`<li>${it}</li>`).join("")}</ul>
        </div>`).join("")}</div>

      <div class="foot"><a href="index.html">← Tilbake til forsiden</a></div>
    </div>`;
  document.title = "Praktisk info — Rivieraen 2026";
}
