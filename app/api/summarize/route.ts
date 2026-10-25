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
    "Sən Azərbaycan tələbələri üçün təhsil köməkçisisən. Aşağıdakı mühazirə mətninin xülasəsini Azərbaycan dilində hazırla.\n" +
    "Format:\n" +
    "Qısa icmal (2-3 cümlə)\n" +
    "Əsas məqamlar (5-8 maddə, hər biri '- ' ilə başlasın)\n" +
    "Əsas anlayışlar (qısa izahla)\n" +
        "Yalnız mətndə olanlara əsaslan. Mətnin hərfləri aralı görünə bilər, onu düzgün başa düş.\n" +
    "Mətndə [Səhifə N] işarələri var. 'Əsas məqamlar' maddələrinin hər birinin sonunda məlumatın səhifəsini (Səhifə 3) formatında yaz.\n\n" +
    "MƏTN:\n" +
    text.slice(0, 60000);

  try {
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
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
    const summary = parts.map((p) => p.text || "").join("");
    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ error: "Bağlantı xətası." }, { status: 500 });
  }
}