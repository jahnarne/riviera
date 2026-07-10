# Rivieraen 2026 — familiereiseguide

En mobilvennlig reiseguide for franske Rivieraen (Cannes/Vallauris-basert familieferie 13.–20. juli 2026).
Statisk side, ingen byggesteg. Designsystemet **«Azure & Earth»** (fra Stitch-prosjektet *French Riviera Planner*) er realisert med Tailwind (Play CDN) + Material Symbols + Libre Caslon Text/Manrope. Bilder ligger lokalt i `images/` eller hentes fra Wikimedia; ellers vises stiliserte SVG-illustrasjoner. Kart er Leaflet + OpenStreetMap.

## Sidestruktur
| Fil | Renderer | Innhold |
|-----|----------|---------|
| `index.html` | `renderHome()` | Forside: full-bleed hero, «Din tur»-hurtigkort, utvalgte destinasjoner, ukeoversikt |
| `programmet.html` | `renderProgram()` | Hele 8-dagers reiseruten som tidslinje |
| `dag-1.html` … `dag-8.html` | `renderDay(n)` | Dagsside: hero, «Dagens rute»-tidslinje, kart, bento severdigheter/spisesteder, dagens tips, alternativer |
| `sted.html#<id>` | `renderPlace()` | Detaljside per severdighet/restaurant: hero, galleri, beskrivelse, tips, praktisk, kart, «Naviger»/«Kilde» |
| `reise.html` | `renderReise()` | Transport: togbilletter/ferger og parkering (å verifisere) per dag |
| `praktisk.html` | `renderPraktisk()` | Base- og arkiv-kort + bestillingssjekkliste (huskes lokalt) + praktisk info |
| `arkiv.html` | (selvstendig) | Den opprinnelige research-siden, nås via arkiv-kortet på praktisk-siden. Egne inline-stiler |

Fast bunn-navigasjon på alle guide-sider: **Hjem** → `index.html`, **Plan** → `programmet.html`, **Reise** → `reise.html`, **Info** → `praktisk.html`.

## Delte filer
- `data.js` — all data (severdigheter, mat, dagsturer, `WEEK`-ukesplan med per-dag kuratering `hero`/`sights`/`food`/`alts`/`plan`, koordinater, bilder, sjekkliste, praktisk info, `TRANSPORT` for reise-siden)
- `guide.js` — delt logikk + alle renderere (`topBar`/`bottomNav`, `renderHome/Program/Day/Place/Reise/Praktisk`, kart, SVG-scener)
- `ds.js` — Tailwind-konfig (design-tokens); lastes etter Tailwind-CDN-taggen på hver side
- `style.css` — tilleggslag over Tailwind (ikoner, foto-overlay, kartpins, prikkelinje)

Hver side er en tynn HTML-fil som laster Tailwind CDN + `ds.js` + `data.js` + `guide.js` og kaller sin renderer. Lenker mellom sted-detaljer bruker `sted.html#<id>` (hash overlever «clean URL»-redirects på både `serve`, Vercel og `file://`). For å endre en dag: rediger dens felt i `WEEK` i `data.js`.

## Kjør lokalt
Åpne `index.html` i en nettleser, eller server statisk:

```bash
npx serve .
```

## Deploy
Statisk side — alle filer ligger i rot. Fungerer rett ut av boksen på Vercel, Netlify eller GitHub Pages. Ingen `vercel.json` trengs. Tailwind/ikoner/fonter/kart lastes fra CDN (krever nett); SVG-scener er offline-fallback for bilder.
