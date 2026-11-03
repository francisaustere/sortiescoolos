# Sorties Cool OS

Dashboard perso des sorties culturelles à Marseille et dans les communes voisines.
Chaque lundi, un robot GitHub collecte les agendas d'une quarantaine de lieux et agrégateurs,
calcule un score « coup de cœur » et republie le site.

- Liste des sources et vérifications : [docs/sources.md](docs/sources.md)
- Goûts (mots-clés et poids du score) : `shared/taste.ts`
- Ajouter ou couper une source : `crawler/sources.ts`
- Zone géographique : `shared/geo.ts`

## Commandes

- `npm run dev` : dashboard en local
- `npm run crawl` : lance la collecte (écrit `public/data/events.json`)
- `npm test` : tests des lecteurs de sources
- `npm run build` : vérification des types + build

## Mise en ligne

GitHub → Settings → Pages → Source : **GitHub Actions**.
La collecte tourne chaque lundi, ou à la main via Actions → « Collecte hebdo + site » → Run workflow.
