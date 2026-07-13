# Handover til Claude Code — oppdater Riviera-appen

**Formål:** oppdatere reiseappen (`data.js` + evt. sider) så dagsplanen er nøyaktig, booking-status er tydelig, og ankomstdagen + huset stemmer.

**Kontekst:**
- Tur 13.–20. juli 2026. Reisefølge: **2 voksne + 3 barn (13, 10, 3 år)**.
- Base/Airbnb: **281 Chemin Notre-Dame, Vallauris 06220** — https://www.airbnb.no/rooms/1407983190197493191
- Husbilde ligger i **`~/Downloads/hus.jpg`** (skal inn i appen, se punkt F).
- All data ligger i **`data.js`**: `WEEK`-arrayen (dagsplan), `HOME` (base), `CHECKLIST` (bestillinger), `PRAKTISK`.

---

## A. Booking-status (kilde til sannhet)

| Måltid/aktivitet | Dag | Tid | Status |
|---|---|---|---|
| Ferge Île Sainte-Marguerite | Tir 14 | 09:00 | ✅ **BOOKET** (tur/retur, fleksibel retur) |
| Akvariet (Musée Océanographique) | Lør 18 | 10:00 | ✅ **BOOKET** — «morgen»-billett, 20 % nettrabatt (adgang før 11) |
| L'Escalinada (middag, Nice) | Fre 17 | 18:45 | ✅ **BOOKET** |
| JR Bistronomie (middag, Menton) | Lør 18 | 19:00 | ✅ **BOOKET** |
| Chez Mô (lunsj, Antibes) | Søn 19 | 12:30 | ✅ **BOOKET** — *erstatter Le Safranier* |
| La Maison Bleue (middag, Ste-Maxime) | Ons 15 | 18:30 | ⏳ **IKKE BOOKET** — kun telefon +33 4 94 96 51 92 |
| Galimard parfyme-atelier | Tor 16 | 10:00 | ⏳ **IKKE BOOKET** — avventer valg Galimard vs. Fragonard |
| Le Gazan (lunsj, Grasse) | Tor 16 | 12:00 | ⏳ reserveres / kom tidlig |
| Middag mandag (Uber Eats) | Man 13 | ~21:15 | ⏳ bestilles underveis (fly/flyplass) |

Kjøpes på stedet (ingen forhåndsbooking): Pass Découverte/Bateaux Verts (ons), Prinsens bilsamling (lør), Jardin Exotique d'Èze (fre), Gaby + PhilCat + markeder.

---

## B. Nøyaktig dagsplan (ønsket sluttresultat)

Tegn: ✅ booket · ⏳ må bookes · 🚶 walk-in · 🧺 picnic · 🏠 hjemme.

### Man 13 — ANKOMST (ingen program)
- **21:00** — Ankomst til huset i Vallauris. Kun komme i orden, ingen aktiviteter.
- **Middag:** Uber Eats, **bestilt på flyet/flyplassen** så maten kommer omtrent samtidig som dere. Ingen restaurant.

### Tir 14 — Lérins + fyrverkeri
- 08:15 — Kjør til Cannes, parker P Laubeuf. **Kjøp pan bagnat på PhilCat** (havna, kontant) til øy-lunsj. **Handle kveldspicnic nå også** hvis dere vil (Marché Forville stenger 13:00).
- 09:00 — Ferge til Île Sainte-Marguerite ✅
- 09:30 — Skogstur, grunne viker, 🧺 picnic i skyggen, evt. Fort Royal
- 13:30 — Ferge tilbake (~13:45 i havn — **Marché Forville er da stengt**)
- 14:30 — Hellig siesta + basseng til ~20:00. **Handle kveldspicnic på Monoprix** (9 rue Maréchal Foch, til ~21) hvis ikke gjort om morgenen.
- 20:30 — Kjør inn, parker P Gare/Ferrage el. P République (ikke sjøfronten)
- 21:30 — 🧺 Sen picnic på Croisette-stranda
- 23:00 — Fyrverkeri ~25 min

### Ons 15 — Saint-Tropez + Port Grimaud
- 08:10 — Avreise
- 10:00 — Båt fra Sainte-Maxime (Pass Découverte kjøpes på kiosken)
- 12:15 — **Lunsj Gaby** (sandwich/pan bagnat, Rue de la Citadelle) 🚶 → Tarte Tropézienne til dessert *(erstatter Le Café)*
- 14:10–17:20 — Port Grimaud + retur via båt
- **18:30 — Middag La Maison Bleue** ⏳ (reserver)

### Tor 16 — Grasse + basseng
- 10:00 — Parfyme-atelier ⏳ (Galimard 10:00, eller Fragonard 11:30 — se punkt E)
- **12:00 — Lunsj Le Gazan** ⏳
- 14:15 — 🏠 Basseng + grill hjemme

### Fre 17 — Èze + Nice
- 12:00 — 🚶 Chez Pipo socca (kø, kom tidlig)
- **18:45 — Middag L'Escalinada** ✅

### Lør 18 — Monaco + Menton
- 10:00 — Akvariet ✅ (morgenbillett)
- 12:15 — 🚶 Place d'Armes-markedet (Chez Roger socca)
- 13:30 — Prinsens bilsamling (15/10 €)
- **19:00 — Middag JR Bistronomie** ✅

### Søn 19 — Antibes
- 09:15 — 🚶 Marché Provençal + Veziano/La Frenglish
- 11:00 — Musée Picasso
- **12:30 — Lunsj Chez Mô** ✅ *(erstatter Le Safranier)*
- 14:15 — Strand + Amarena-gelato
- 🏠 Enkel middag hjemme + pakking

### Man 20 — Avreise
- Avreise fra Nice kl. 10:30. Evt. siste stopp Marché Forville.

---

## C. Konkrete endringer i `data.js` → `WEEK`

### 1) Mandag (første objekt i WEEK) — endre til ankomst kl. 21, ingen program
- `title`: **"Ankomst kl. 21 — kom i orden"** (var "Ankomst kl. 19, slå dere til ro")
- `note`: **"Ankomst til huset ~21:00. Ingen program — bare kom i orden. Middag: bestill Uber Eats på flyet eller flyplassen, så kommer maten omtrent når dere gjør."**
- `food`: sett til **["Uber Eats hjem til basen"]** (fjern Astoux et Brun)
- `alts`: fjern (eller tøm) — ingen restaurantvalg på ankomstdagen
- `mods`: tøm til **[]** (ingen «Cannes til fots» på ankomstkvelden)
- `hero`/`sights`: kan fjernes eller settes tomt (ingen severdigheter mandag)

### 2) Onsdag — bytt lunsj Le Café → Gaby
I `plan`, endre steget:
`"12:15 — Lunsj Le Café på Place des Lices → Tarte Tropézienne til dessert"`
→ `"12:15 — Lunsj Gaby (sandwich/pan bagnat, Rue de la Citadelle), walk-in → Tarte Tropézienne til dessert"`
Oppdater også `food`-lista: bytt "Le Café" med "Gaby".

### 3) Søndag — bytt lunsj Le Safranier → Chez Mô
- I `plan`: `"12:30 — Lunsj Le Safranier på det stille torget (reserver!)"`
  → `"12:30 — Lunsj Chez Mô (booket), Bd Albert 1er — sjømat"`
- I `note`: bytt "Book Le Safranier ... med Bistrot Margaux som backup." →
  **"Lunsj på Chez Mô (booket, sjømat). Backup: Pizzeria d'la Ruelle / Les Vieux Murs."**
- Oppdater `food`: bytt "Le Safranier" med "Chez Mô".

### 4) Tirsdag — picnic-presisering (valgfritt, men anbefalt)
I `note` eller `plan`, legg til at **Marché Forville stenger kl. 13**, så kveldspicnicen handles enten om morgenen eller på Monoprix på ettermiddagen. Øy-lunsj = pan bagnat fra PhilCat (kontant), kjøpt før fergen.

---

## D. Endringer i `CHECKLIST`
- Marker som booket (f.eks. prefiks "✅ "): Lérins-ferge, L'Escalinada, JR Bistronomie, akvariet.
- Bytt `"Le Safranier, Antibes, søn 19/7 kl. 12:30 (backup: Bistrot Margaux)"` →
  **"✅ Chez Mô, Antibes, søn 19/7 kl. 12:30 (backup: Pizzeria d'la Ruelle)"**
- Akvarie-linjen: legg til **"«morgen»-billett (før kl. 11) gir 20 % nettrabatt"**.
- Legg til ny linje under «Book nå»: **"Middag mandag: bestill Uber Eats på fly/flyplass (ankomst 21:00)"**.
- Behold som ikke-booket: **La Maison Bleue** (telefon) og **Galimard** (avventer valg).

---

## E. Åpen beslutning — parfyme-atelier (tor 16)
Ikke booket ennå. To reelle alternativer, begge åpne torsdag, begge fra 8 år:
- **Galimard** (anbefalt, står i planen nå): kl. 10:00, 1 t 45, 100 ml Eau de Parfum, lagret oppskrift. **65 €/voksen, 55 €/barn u15**. *(NB: `data.js` sier trolig 52 €/barn — rett til 55 €, og legg til 65 €/voksen.)*
- **Fragonard** «Mini Perfume Workshop»: kl. 11:30 eller 15:00, 45 min, 12 ml Eau de Toilette, rimeligere, inkl. fabrikkomvisning.

Når valget er tatt: oppdater tid + pris i mandag—torsdag-planen og i CHECKLIST.

---

## F. Huset — legg inn i appen
- **Kopiér bildet:** `~/Downloads/hus.jpg` → `riviera-guide/images/hus.jpg`.
- **`HOME`-objektet i `data.js`:** legg til `url:"https://www.airbnb.no/rooms/1407983190197493191"` og `img:"images/hus.jpg"`.
- Vis huset (bilde + «Åpne i Airbnb»-lenke) der basen presenteres — f.eks. på hjem-/praktisk-/sted-siden.

---

## G. Priskorrigeringer (bekreft)
- ✅ **Prinsens bilsamling**: allerede rettet i `data.js` til **15 €/voksen, 10 €/barn 6–17, gratis u6** (to steder: PERLER-`pr` og lørdagens plan-steg). Verifiser at det stemmer.
- ⏳ **Galimard**: rett **52 → 55 €/barn u15** og legg til **65 €/voksen** når atelier-valget er landet.

---

## H. Ikke rør (allerede riktig)
- Fyrverkeri tir 14: kl. **23:00** — korrekt i `data.js`.
- Vaktskifte Monaco lør 18: kl. **11:55** — korrekt.
- Museer i Nice stengt tirsdag → Nice lagt til fredag — korrekt.
