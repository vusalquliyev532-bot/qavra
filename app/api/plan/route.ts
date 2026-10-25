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

  const days: number = Number(body?.days);
  const hours: number = Number(body?.hours);
  const weak: string[] = Array.isArray(body?.weakTopics)
    ? body.weakTopics.slice(0, 10).map((t: unknown) => String(t).slice(0, 80))
    : [];

  if (text.length < 50) {
    return NextResponse.json({ error: "Mətn boşdur." }, { status: 400 });
  }
  if (!days || days < 1 || days > 120 || !hours || hours < 0.5 || hours > 16) {
    return NextResponse.json({ error: "Gün və saat düzgün daxil edilməyib." }, { status: 400 });
  }

  const format =
    days <= 14
      ? "Hər gün üçün ayrıca plan yaz. Hər günün başlığı '### Gün 1', '### Gün 2' kimi olsun."
      : "Həftəlik plan yaz. Hər həftənin başlığı '### Həftə 1', '### Həftə 2' kimi olsun. İlk həftəni gün-gün yaz.";

  const prompt =
    "Sən Azərbaycan tələbələri üçün təcrübəli tədris məsləhətçisisən. Aşağıdakı mühazirə mətninə əsasən imtahana hazırlıq planı hazırla.\n" +
    "Məlumatlar:\n" +
    `- İmtahana qalan gün: ${days}\n` +
    `- Gündə oxuya biləcəyi vaxt: ${hours} saat\n` +
    (weak.length > 0
      ? `- Zəif mövzular (daha çox vaxt ayır): ${weak.join(", ")}\n`
      : "") +
    "Qaydalar:\n" +
    "- Planı Azərbaycan dilində, qısa və konkret yaz.\n" +
    "- Mövzuları yalnız mətndən götür.\n" +
    "- Zəif mövzulara əlavə vaxt ver.\n" +
    "- Hər gün üçün vaxtı saatla göstər (məsələn: 1 saat mövzu oxu, 30 dəq test həll et).\n" +
    "- Son gün ümumi təkrar olsun.\n" +
    "- " + format + "\n" +
    "- Maddələr '- ' ilə başlasın. ** və digər markdown işarələrindən istifadə etmə, yalnız ### başlıqlar olsun.\n" +
    "- Planın əvvəlində 1 cümləlik qısa giriş yaz.\n\n" +
    "MƏTN:\n" +
    text.slice(0, 40000);

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
    const plan = parts.map((p) => p.text || "").join("");
    return NextResponse.json({ plan });
  } catch {
    return NextResponse.json({ error: "Bağlantı xətası." }, { status: 500 });
  }
}