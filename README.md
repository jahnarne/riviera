# Rivieraen 2026 — familiereiseguide

En selvstendig, mobilvennlig reiseguide for franske Rivieraen (Cannes-basert familieferie 13.–20. juli 2026).
Alt ligger i én fil (`index.html`) — ingen byggesteg, ingen avhengigheter. Bilder hentes fra Wikimedia når man er på nett; ellers vises stiliserte illustrasjoner.

## Innhold
- Perler (severdigheter), matkart, 25 dagsturer med «Om turen» + tidsskjema
- Ukesplan, familieråd, bestillingssjekkliste (huskes lokalt i nettleseren)
- Google Maps-lenker og kildelenker per sted

## Kjør lokalt
Bare åpne `index.html` i en nettleser. Eller server statisk:

```bash
npx serve .
```

## Deploy
Statisk side — `index.html` ligger i rot. Fungerer rett ut av boksen på Vercel, Netlify eller GitHub Pages.
Ingen `vercel.json` trengs.
