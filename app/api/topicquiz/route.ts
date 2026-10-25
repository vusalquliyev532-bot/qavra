import { NextResponse } from "next/server";
import { checkQuota } from "../../lib/quota";

export async function POST(req: Request) {
  const quota = await checkQuota(req);
  if (!quota.ok) return NextResponse.json({ error: quota.error }, { status: quota.status });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "API açarı tapılmadı." }, { status: 500 });

  const body = await req.json();
  const program = String(body?.program || "").slice(0, 80);
  const subject = String(body?.subject || "").slice(0, 80);
  const topic = String(body?.topic || "").slice(0, 120);
  if (!subject || !topic) return NextResponse.json({ error: "Mövzu seçilməyib." }, { status: 400 });

  const prompt =
    "Sən Azərbaycan şagirdləri üçün imtahan hazırlayan müəllimsən.\n" +
    `Proqram: ${program}\nFənn: ${subject}\nMövzu: ${topic}\n\n` +
    "Bu mövzu üzrə 10 çoxseçimli test sualı hazırla.\n" +
    "Qaydalar:\n" +
    "- Çətinlik ORTA səviyyədə olsun (nə çox asan, nə çox çətin), buraxılış/qəbul imtahanı tərzində.\n" +
    "- Suallar Azərbaycan dilində olsun (İngilis dili fənnində suallar ingiliscə ola bilər).\n" +
    "- Hər sualın 4 variantı olsun, yalnız biri düzgün olsun.\n" +
    "- Düzgün cavabın yerini təsadüfi seç.\n" +
    "- Suallar mövzunun müxtəlif tərəflərini əhatə etsin və təkrarlanmasın.\n" +
    "- 'explanation' sahəsinə düzgün cavabın qısa izahını yaz.\n" +
    "- Düsturları sadə mətnlə yaz (x^2, √x), LaTeX istifadə etmə.\n" +
    "- Əmin olmadığın məlumatla sual qurma.\n" +
    "Cavabı yalnız bu JSON formatında ver:\n" +
    '{"questions":[{"question":"...","options":["...","...","...","..."],"correct":0,"explanation":"..."}]}\n' +
    "'correct' düzgün variantın nömrəsidir (0, 1, 2 və ya 3).";

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
      return NextResponse.json({ error: "Çox sorğu göndərildi. 1 dəqiqə gözləyib yenidən cəhd edin." }, { status: 429 });
    }
    if (!r.ok) return NextResponse.json({ error: "AI xətası (" + r.status + ")." }, { status: 500 });

    const data = await r.json();
    const parts: { text?: string }[] = data?.candidates?.[0]?.content?.parts || [];
    const raw = parts.map((p) => p.text || "").join("").replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(raw);
    const questions = (parsed.questions || [])
      .filter(
        (q: { question?: string; options?: string[]; correct?: number }) =>
          q.question &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          typeof q.correct === "number" &&
          q.correct >= 0 &&
          q.correct <= 3
      )
      .slice(0, 10);

    if (questions.length < 5) {
      return NextResponse.json({ error: "Sınaq yaradıla bilmədi. Yenidən cəhd edin." }, { status: 500 });
    }
    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json({ error: "Sınaq yaradıla bilmədi. Yenidən cəhd edin." }, { status: 500 });
  }
}