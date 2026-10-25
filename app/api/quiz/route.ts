import { NextResponse } from "next/server";
import { checkQuota } from "../../lib/quota";

export async function POST(req: Request) {
  const quota = await checkQuota(req);
  if (!quota.ok) return NextResponse.json({ error: quota.error }, { status: quota.status });

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "API açarı tapılmadı." }, { status: 500 });
  }

  const body = await req.json();
  const text: string = body?.text || "";
  const maxPage = Math.max(
    0,
    ...Array.from(text.matchAll(/\[Səhifə (\d+)\]/g)).map((m) => Number(m[1]))
  );
  if (maxPage > 30) {
    return NextResponse.json({ error: "Maksimum 30 səhifəlik PDF olar." }, { status: 400 });
  }

  const weak: string[] = Array.isArray(body?.weakTopics)
    ? body.weakTopics.slice(0, 5).map((t: unknown) => String(t).slice(0, 80))
    : [];
  if (text.length < 50) {
    return NextResponse.json({ error: "Mətn boşdur." }, { status: 400 });
  }

  const prompt =
    "Sən Azərbaycan tələbələri üçün müəllimsən. Aşağıdakı mühazirə mətninə əsasən 5 çoxseçimli test sualı hazırla.\n" +
    "Qaydalar:\n" +
    "- Suallar və variantlar Azərbaycan dilində olsun.\n" +
    "- Yalnız mətndəki məlumata əsaslan.\n" +
    "- Hər sualın 4 variantı olsun, yalnız biri düzgün olsun.\n" +
    "- Düzgün cavabın yerini təsadüfi seç (həmişə eyni yerdə olmasın).\n" +
    "- Hər sual üçün 'topic' sahəsinə mətndəki mövzunu 1-3 sözlə yaz.\n" +
    "- 'explanation' sahəsinə düzgün cavabın qısa izahını yaz.\n" +
    "- Mətnin hərfləri aralı görünə bilər, onu düzgün başa düş.\n" +
    (weak.length > 0
      ? `- Tələbənin əvvəlki testlərdə zəif olduğu mövzular: ${weak.join(", ")}. Əgər mətndə bu mövzulara aid hissə varsa, sualların ən azı yarısını onlardan hazırla və 'topic' sahəsində həmin mövzunun adını eyni cür yaz. Mətndə yoxdursa, ümumi suallar hazırla.\n`
      : "") +
    "Cavabı yalnız bu JSON formatında ver:\n" +
    '{"questions":[{"question":"...","options":["...","...","...","..."],"correct":0,"topic":"...","explanation":"..."}]}\n' +
    "'correct' düzgün variantın nömrəsidir (0, 1, 2 və ya 3).\n\n" +
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
    const questions = (parsed.questions || []).filter(
      (q: { question?: string; options?: string[]; correct?: number }) =>
        q.question &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correct === "number" &&
        q.correct >= 0 &&
        q.correct <= 3
    );

    if (questions.length === 0) {
      return NextResponse.json({ error: "Test yaradıla bilmədi. Yenidən cəhd edin." }, { status: 500 });
    }
    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json({ error: "Test yaradıla bilmədi. Yenidən cəhd edin." }, { status: 500 });
  }
}