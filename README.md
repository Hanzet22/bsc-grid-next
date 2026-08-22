# BSC GRID — Live Chain Board

Live price board buat coin-coin di ekosistem BNB Smart Chain (BSC). Next.js 14
(App Router) + Chart.js, data dari CoinGecko public API lewat API routes
Next.js sendiri (jadi browser gak langsung nembak CoinGecko).

## Stack

- **Next.js 14** (App Router) — React framework + API routes sebagai proxy
- **React 18** — client components buat live-updating chart
- **Chart.js 4** (`react-chartjs-2` + `chartjs-adapter-date-fns`) — sparkline & detail chart
- **CSS Modules** — styling, no framework tambahan
- **PWA** — `manifest.webmanifest` + custom `sw.js` service worker (installable, app-shell cached, data API selalu network-first biar harga gak basi)

> Catatan jujur: request awal nyebut WebGPU/WebGL juga. Buat line chart 2D
> kayak gini, canvas (Chart.js) udah paling stabil & ringan — WebGPU/WebGL
> gak dipaksain masuk karena overkill dan malah nambah kompleksitas tanpa
> manfaat nyata di chart sesimpel ini. Kalau nanti mau nambah visual 3D/particle
> effect di background, itu baru masuk akal pake WebGL.

## Jalanin lokal

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Struktur

```
app/
  api/bsc/markets/route.js   -> proxy GET list top BSC coins (CoinGecko)
  api/bsc/chart/route.js     -> proxy GET chart harga per-coin
  layout.js                  -> root layout, font, PWA meta
  page.js                    -> render <BscBoard />
  globals.css
components/
  BscBoard.jsx                -> state utama: fetch list, polling 45s
  CoinCard.jsx                -> card + sparkline tiap coin
  DetailPanel.jsx             -> chart detail + timeframe switch
  SwRegister.jsx               -> registrasi service worker
lib/format.js                 -> helper format harga/angka
public/
  manifest.webmanifest
  sw.js
  icons/
```

## Push ke GitHub

```bash
git init
git add .
git commit -m "init: BSC GRID live chain board"
git branch -M main
git remote add origin https://github.com/<username-lu>/<nama-repo>.git
git push -u origin main
```

## Deploy ke Vercel

**Opsi A — lewat dashboard (paling gampang):**
1. Buka https://vercel.com/new
2. Import repo GitHub yang barusan lu push
3. Framework preset otomatis kedetect "Next.js" — biarin default
4. Klik Deploy

**Opsi B — lewat CLI:**
```bash
npm i -g vercel
vercel login
vercel        # preview deploy
vercel --prod # production deploy
```

Gak perlu environment variable apapun — CoinGecko public API dipanggil tanpa
API key. Kalau nanti lu upgrade ke CoinGecko Pro/Demo API key (biar rate limit
lebih longgar), tinggal tambahin `COINGECKO_API_KEY` di Vercel env vars dan
sisipin ke header `x-cg-demo-api-key` di kedua file `route.js`.

## Rate limit note

CoinGecko free tier public API ~10-30 calls/menit tergantung beban server
mereka. List coin di-refresh tiap 45 detik, dan tiap route API punya cache
30 detik server-side (`revalidate: 30`) biar gak boros call kalau banyak
visitor barengan.

## Icon PWA

Icon di `public/icons/` itu placeholder gold-diamond simpel. Ganti aja
`icon-192.png` dan `icon-512.png` sama logo HyperGaruda / Furry-mu sendiri
kalau mau custom — ukurannya udah pas buat manifest.
