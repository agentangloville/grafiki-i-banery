export async function POST(request) {
  const { prompt } = await request.json();

  if (!prompt?.trim()) {
    return Response.json({ error: "Brak promptu" }, { status: 400 });
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) {
    return Response.json({ error: "Brak ANTHROPIC_API_KEY w env" }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: `Jesteś copywriterem tworzącym nagłówki na banery newsletterowe 1140x751px dla firmy Angloville (obozy językowe, programy edukacyjne, wymiany, podróże).

Temat/opis: "${prompt}"

Wygeneruj:
1. label — mała etykieta nad nagłówkiem, max 3-4 słowa uppercase (np. "SUPER EARLY BIRD", "LATO 2026")
2. headline — chwytliwy nagłówek max 6-8 słów
3. subtitle — podtytuł/CTA na żółty pasek max 8-10 słów
4. tags — 3-4 krótkie tagi oddzielone przecinkami do badge'ów na dole (np. "Polska, Europa, USA")
5. highlightMain — 1-2 słowa z headline do wyróżnienia na żółto
6. highlightSub — 0-1 słów z subtitle do wyróżnienia na czerwono

TYLKO JSON bez markdown:
{"label":"...","headline":"...","subtitle":"...","tags":"...","highlightMain":["..."],"highlightSub":["..."]}`,
          },
        ],
      }),
    });

    const data = await res.json();
    const text = (data.content?.[0]?.text || "")
      .replace(/```json|```/g, "")
      .trim();
    const parsed = JSON.parse(text);

    return Response.json(parsed);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
