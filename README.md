# Banner Generator

Generator banerów newsletterowych 1140×751px z integracją Cloudinary + AI.

## Setup

```bash
npm install
cp .env.local.example .env.local  # uzupełnij dane
npm run dev
```

## Env variables (Vercel)

| Zmienna | Opis |
|---------|------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloud Name z Cloudinary |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | API Key z Cloudinary |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset |
| `ANTHROPIC_API_KEY` | Klucz API Anthropic (server-side) |

## Struktura

```
app/
├── layout.js              — Funnel Sans + ML widget
├── page.js                — generator (cały UI)
└── api/generate/route.js  — server-side AI
```

## Deploy

Push na GitHub → Import w Vercel → dodaj env variables → Deploy.
