# Banner Generator

Generator banerów newsletterowych 700×400px z integracją Cloudinary + AI (Claude).

## Quick Start

```bash
# 1. Sklonuj repo
git clone <your-repo-url>
cd banner-generator

# 2. Zainstaluj zależności
npm install

# 3. Skopiuj env i uzupełnij dane
cp .env.local.example .env.local

# 4. Uruchom
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000)

## Zmienne środowiskowe

| Zmienna | Opis |
|---------|------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Twój Cloud Name z dashboardu Cloudinary |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | API Key (widoczny w dashboardzie) |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset (Settings → Upload → Add upload preset → Unsigned) |
| `ANTHROPIC_API_KEY` | Klucz API Anthropic (server-side, **nie** zaczyna się od NEXT_PUBLIC_) |

## Konfiguracja Cloudinary

1. Zaloguj się na [cloudinary.com](https://cloudinary.com)
2. Dashboard → skopiuj **Cloud Name** i **API Key**
3. Settings → Upload → **Add upload preset** → tryb: **Unsigned** → skopiuj nazwę presetu
4. Settings → Security → upewnij się, że **Media Library** jest włączone

## Deploy na Vercel

1. Push do GitHub
2. Zaimportuj repo w [vercel.com](https://vercel.com)
3. Dodaj 4 zmienne środowiskowe w Settings → Environment Variables
4. Deploy

## Jak działa

1. **Zdjęcie** — otwierasz Cloudinary Media Library, wybierasz zdjęcie
2. **AI** — opisujesz baner, Claude generuje nagłówek + podtytuł
3. **Edycja** — modyfikujesz tekst, klikasz słowa do wyróżnienia
4. **Styl** — rozmiar, pozycja, overlay, kolory
5. **Export** — "Prześlij do Cloudinary" (trafia do folderu `banners/`) lub "Pobierz PNG"
