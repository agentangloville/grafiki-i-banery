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
            content: `Jesteś copywriterem piszącym nagłówki na banery newsletterowe 700x400px.
Temat: "${prompt}"
Wygeneruj:
1. Nagłówek (max 6-8 słów)
2. Podtytuł/CTA na żółty pasek (max 8-10 słów)
3. 1-2 słowa z nagłówka do wyróżnienia
4. 0-1 słów z podtytułu do wyróżnienia
TYLKO JSON bez markdown:
{"headline":"...","subtitle":"...","highlightMain":["..."],"highlightSub":["..."]}`,
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
