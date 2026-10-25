import { NextResponse } from "next/server"; import { checkQuota } from "../../lib/quota";

export async function POST(req: Request) { const quota = await checkQuota(req); if (!quota.ok) return NextResponse.json({ error: quota.error }, { status: quota.status });
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "API açarı tapılmadı." }, { status: 500 });
  }

  const body = await req.json();
  const text: string = body?.text || ""; const maxPage = Math.max(0, ...Array.from(text.matchAll(/\[Səhifə (\d+)\]/g)).map((m) => Number(m[1]))); if (maxPage > 30) return NextResponse.json({ error: "Pulsuz paketdə maksimum 30 səhifəlik PDF olar." }, { status: 400 });
  if (text.length < 50) {
    return NextResponse.json({ error: "Mətn boşdur." }, { status: 400 });
  }

  const prompt =
    "Sən Azərbaycan tələbələri üçün təhsil köməkçisisən. Aşağıdakı mühazirə mətninə əsasən 10 yaddaş kartı (flashcard) hazırla.\n" +
    "Qaydalar:\n" +
    "- Hər kartın üzü ('front') qısa sual və ya anlayış olsun.\n" +
    "- Arxası ('back') qısa və dəqiq cavab olsun (1-2 cümlə).\n" +
    "- 'topic' sahəsinə mövzunu 1-3 sözlə yaz.\n" +
    "- Yalnız mətndəki məlumata əsaslan, Azərbaycan dilində yaz.\n" +
    "- Mətnin hərfləri aralı görünə bilər, onu düzgün başa düş.\n" +
    "Cavabı yalnız bu JSON formatında ver:\n" +
    '{"cards":[{"front":"...","back":"...","topic":"..."}]}\n\n' +
    "MƏTN:\n" +
    text.slice(0, 60000);

  try {
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    if (r.status === 429) {
      return NextResponse.json(
        { error: "Çox sorğu göndərildi. 1 dəqiqə gözləyib yenidən cəhd edin." },
        { status: 429 }
      );
    }
    if (!r.ok) {
      return NextResponse.json({ error: "AI xətası (" + r.status + ")." }, { status: 500 });
    }

    const data = await r.json();
    const parts: { text?: string }[] = data?.candidates?.[0]?.content?.parts || [];
    const raw = parts.map((p) => p.text || "").join("").replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(raw);
    const cards = (parsed.cards || []).filter(
      (c: { front?: string; back?: string }) => c.front && c.back
    );
    if (cards.length === 0) {
      return NextResponse.json({ error: "Kartlar yaradıla bilmədi. Yenidən cəhd edin." }, { status: 500 });
    }
    return NextResponse.json({ cards });
  } catch {
    return NextResponse.json({ error: "Kartlar yaradıla bilmədi. Yenidən cəhd edin." }, { status: 500 });
  }
}