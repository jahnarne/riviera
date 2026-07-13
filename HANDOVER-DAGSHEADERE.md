# Handover til Claude Code — fase-headere i dagsprogrammet

## Mål
Gjøre dagsprogrammene lettere å følge ved å dele hver dag inn i **faser** (Morgen, Formiddag, Lunsj, Ettermiddag, Kveld osv.). Hver fase innledes med et **eget header-innslag** i tidslinja — samme stil som dagens «Ettermiddag / Puls og sjarm i Nice»-innslag (blå node, liten kicker + serif-tittel + kort beskrivelse).

**Viktig — ikke mist granularitet:** alle eksisterende timede steg beholdes uendret. Vi legger kun til header-innslag *foran* hver blokk av steg.

## Hvor
Dagsplanen ligger i `data.js` i `WEEK`-arrayen, felt `plan` (én per dag). Stegene rendres i tidslinja på dag-sidene.

## Datamodell
Gjør `plan`-sekvensen i stand til å inneholde to typer innslag, i rekkefølge:
- **Fase-header:** `{type:"phase", kicker:"Ettermiddag", title:"Puls og sjarm i Nice", desc:"…"}` → rendres med **blå node** (som eksemplet på skjermbildet), uten klokkeslett.
- **Steg (som i dag):** de eksisterende timede innslagene → rendres med **brun/oransje node** og klokkeslett.

Behold gjerne bakoverkompatibilitet (steg kan være vanlige strenger som før). Kun headerne er nye.

## Rendering
- Fase-header: blå node, kicker i små caps (farget), tittel i serif, valgfri kort `desc`.
- Steg: uendret.

---

## Innhold per dag
For hver dag: sett inn header-innslagene i rekkefølgen under. Stegene (angitt ved klokkeslett) er de eksisterende — ikke endre dem, bare grupper dem under riktig header.

### Man 13 — Ankomst
- **Kveld · Lande og lene seg tilbake** — Ankomst til huset ~21, kom i orden. Middag: Uber Eats bestilt underveis.
  - *(dagen har ikke timede steg i dag; legg evt. inn ett steg: «21:00 — Ankomst huset i Vallauris, kom i orden»)*

### Tir 14 — Lérins + fyrverkeri
- **Morgen · Øyeventyr på Sainte-Marguerite** — Ferge fra Cannes, skog, badeviker og picnic i skyggen.
  - steg: 08:15 · 09:00 · 09:30 · 13:30
- **Midt på dagen · Hellig siesta ved bassenget** — Hvile og bad før en lang kveld.
  - steg: 14:30
- **Kveld · Fyrverkeri over Croisetten** — Picnic på stranda og nasjonaldagens show kl. 23.
  - steg: 20:30 · 21:30 · 23:00

### Ons 15 — Saint-Tropez + Port Grimaud
- **Morgen · Over bukta til Saint-Tropez** — Kjøretur til Sainte-Maxime og båt inn til myten.
  - steg: 08:10 · 09:25 · 10:00
- **Formiddag · Gamlebyen og citadellet** — Smug, havn og panorama med plass til å løpe.
  - steg: 10:20 · 11:15
- **Lunsj · Pause på Place des Lices** — Sandwich hos Gaby og en ekte tarte tropézienne.
  - steg: 12:15
- **Ettermiddag · Kanaler i Lille Venezia** — Port Grimaud på elbåt før retur over bukta.
  - steg: 14:10 · 14:35 · 16:15 · 17:30
- **Kveld · Middag i Sainte-Maxime** — Rolig familiemiddag på La Maison Bleue.
  - steg: 18:30 · 19:45

### Tor 16 — Grasse + basseng
- **Formiddag · Lag din egen duft i Grasse** — Parfyme-atelier for de store, marked og gratis omvisning for de små.
  - steg: 09:00 · 10:00
- **Lunsj · Provençalsk i gamlebyen** — Enkel, god lunsj på Le Gazan.
  - steg: 12:00
- **Ettermiddag · Pustehull ved bassenget** — Bading, grilling og tidlig kveld.
  - steg: 13:30 · 14:15

### Fre 17 — Èze + Nice
- **Tidlig morgen · Èze før folkemengdene** — Smug, botanisk hage og utsikt fra ørnereiret.
  - steg: 07:45 · 08:45 · 11:00
- **Lunsj · Puls og sjarm i Nice** — Socca hos Chez Pipo og gelato på Place Rossetti.
  - steg: 11:30 · 11:55 · 13:00
- **Ettermiddag · Utsikt, vann og bad** — Colline du Château, plasking på Paillon og svaberg for de store.
  - steg: 14:30 · 16:00 · 17:30
- **Kveld · Nissart-middag i gamlebyen** — Tradisjonskjøkken på L'Escalinada.
  - steg: 18:45 · 20:15

### Lør 18 — Monaco + Menton
- **Morgen · Tog langs kysten** — Fra Golfe-Juan østover til fyrstedømmet.
  - steg: 08:00
- **Formiddag · Monaco på sitt beste** — Akvariet, vaktskiftet, markedslunsj og prinsens biler.
  - steg: 10:00 · 11:55 · 12:15 · 13:30
- **Ettermiddag · Bad og gult i Menton** — Grunt vann på Sablettes og sitronbyens gamleby.
  - steg: 14:45 · 15:15 · 17:30
- **Kveld · Bistronomi i Menton** — Rolig middag på JR Bistronomie før toget hjem.
  - steg: 19:00 · 20:45

### Søn 19 — Antibes
- **Morgen · Marked og mestere** — Marché Provençal, bakverk og Picasso i Château Grimaldi.
  - steg: 08:45 · 09:15 · 11:00
- **Lunsj · Sjømat ved sjøen** — Fersk fangst på Chez Mô.
  - steg: 12:30
- **Ettermiddag · Siste dukkert** — Grunt vann på Salis/Ponteil og gelato på veien hjem.
  - steg: 14:15 · 16:30

### Man 20 — Avreise
- **Morgen · Farvel til Rivieraen** — Tidlig pakking og avreise fra Nice, evt. et siste markedsstopp.
  - *(ikke timede steg; kan stå som ren header med desc)*

---

## Akseptkriterier
- Hver dag starter med en fase-header, og alle timede steg ligger under riktig header.
- Ingen eksisterende steg er fjernet eller endret (full granularitet beholdt).
- Fase-headere har blå node og skiller seg visuelt fra de timede stegene.
- Kicker + tittel + kort beskrivelse vises som på referanse-skjermbildet.
