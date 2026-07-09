# Rivieraen 2026 — familiereiseguide

En selvstendig, mobilvennlig reiseguide for franske Rivieraen (Cannes/Vallauris-basert familieferie 13.–20. juli 2026).
Statisk — ingen byggesteg, ingen avhengigheter. Bilder ligger lokalt i `images/` eller hentes fra Wikimedia når man er på nett; ellers vises stiliserte SVG-illustrasjoner. Kart er Leaflet + OpenStreetMap (krever nett for kartflisene).

## Struktur
Guiden er organisert **én side per programdag**:

| Fil | Innhold |
|-----|---------|
| `index.html` | Forside — cover + oversikt over alle 8 dagene, med lenker til praktisk info og arkiv |
| `dag-1.html` … `dag-8.html` | Én side per dag: dagens plan (tidslinje), kart over stoppene, hver severdighet og restaurant i sin helhet, og kuraterte alternativer nederst hvis noe er stengt/fullt |
| `praktisk.html` | Bestillingssjekkliste (huskes lokalt i nettleseren) + praktisk info |
| `arkiv.html` | Den opprinnelige research-siden — bla i hele biblioteket etter kategori/område/søk. Selvstendig snapshot |

Delte filer:
- `data.js` — all data (severdigheter, mat, dagsturer, ukesplan med per-dag kuratering, koordinater, bilder, sjekkliste, praktisk info)
- `guide.js` — delt logikk + rendererne `renderHome()`, `renderDay(n)`, `renderPraktisk()`
- `style.css` — all stil

Hver dagsside er en tynn HTML-fil som laster `style.css`, `data.js` og `guide.js` og kaller `renderDay(n)`. Programmet defineres av `WEEK`-arrayen i `data.js`; for å endre en dag redigerer du dens `hero`/`sights`/`food`/`alts`/`plan` der.

## Kjør lokalt
Åpne `index.html` i en nettleser, eller server statisk:

```bash
npx serve .
```

## Deploy
Statisk side — alle filer ligger i rot. Fungerer rett ut av boksen på Vercel, Netlify eller GitHub Pages. Ingen `vercel.json` trengs.
