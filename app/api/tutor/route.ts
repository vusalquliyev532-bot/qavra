import { NextResponse } from "next/server"; import { checkQuota } from "../../lib/quota";

type Msg = { role: string; content: string };

export async function POST(req: Request) { const quota = await checkQuota(req); if (!quota.ok) return NextResponse.json({ error: quota.error }, { status: quota.status });
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "API açarı tapılmadı." }, { status: 500 });
  }

  const body = await req.json();
  const text: string = body?.text || ""; const maxPage = Math.max(0, ...Array.from(text.matchAll(/\[Səhifə (\d+)\]/g)).map((m) => Number(m[1]))); if (maxPage > 30) return NextResponse.json({ error: "Pulsuz paketdə maksimum 30 səhifəlik PDF olar." }, { status: 400 });
  const weak: string[] = Array.isArray(body?.weakTopics)
    ? body.weakTopics.slice(0, 6).map((t: unknown) => String(t).slice(0, 80))
    : [];
  let history: Msg[] = Array.isArray(body?.messages) ? body.messages.slice(-10) : [];
  while (history.length > 0 && history[0].role !== "user") history = history.slice(1);

  if (text.length < 50 || history.length === 0) {
    return NextResponse.json({ error: "Mətn və ya mesaj boşdur." }, { status: 400 });
  }

  const system =
    "Sən Azərbaycan tələbəsinin şəxsi müəllimisən. Adın Qavra müəllimdir. Səmimi, səbirli və aydın danış.\n" +
    "Qaydalar:\n" +
    "- Həmişə Azərbaycan dilində cavab ver.\n" +
    "- Yalnız aşağıdakı mühazirə mətninə əsaslan. Cavab mətndə yoxdursa, bunu de və uydurma.\n" +
    "- Mövzunu sadə dillə, qısa və nümunə ilə izah et. Cavab 6-8 cümləni keçməsin.\n" +
    "- İzahdan sonra bəzən 1 qısa yoxlama sualı ver və tələbənin cavabını qiymətləndir.\n" +
    "- Mətndə [Səhifə N] işarələri var. Mümkün olduqda məlumatın səhifəsini (Səhifə 3) formatında göstər.\n" +
    "- ** və # kimi markdown işarələrindən istifadə etmə.\n" +
    "- Mətnin hərfləri aralı görünə bilər, onu düzgün başa düş.\n" +
    (weak.length > 0
      ? `- Tələbənin əvvəlki testlərdə zəif olduğu mövzular: ${weak.join(", ")}. Uyğun olanda bunlara diqqət yetir və tələbəyə bunları təklif et.\n`
      : "") +
    "\nMÜHAZİRƏ MƏTNİ:\n" +
    text.slice(0, 50000);

  const contents = history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: String(m.content).slice(0, 1000) }],
  }));

  try {
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
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
    const reply = parts.map((p) => p.text || "").join("");
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Bağlantı xətası." }, { status: 500 });
  }
}