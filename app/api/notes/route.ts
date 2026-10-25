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
    "Sən Azərbaycan şagirdləri üçün təcrübəli müəllimsən.\n" +
    `Proqram: ${program}\nFənn: ${subject}\nMövzu: ${topic}\n\n` +
    "Bu mövzu üçün imtahana hazırlıq məqsədilə qısa qayda-konspekt yaz.\n" +
    "Qaydalar:\n" +
    "- Azərbaycan dilində yaz (İngilis dili fənnində nümunələr ingiliscə olsun).\n" +
    "- 150-250 söz, sadə və aydın dil.\n" +
    "- Bu formatda yaz, başlıqlar '### ' ilə:\n" +
    "### Əsas qayda\n### Mühüm məqamlar (4-6 maddə, hər biri '- ' ilə)\n### Nümunə (1-2 nümunə)\n### Tez-tez edilən səhvlər (2-3 maddə)\n" +
    "- Düsturları sadə mətnlə yaz (məs. x^2, √x, a/b), LaTeX istifadə etmə.\n" +
    "- ** işarəsindən istifadə etmə.\n" +
    "- Əmin olmadığın məlumatı yazma, dəqiq və yoxlanılmış faktlar ver.";

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
      return NextResponse.json({ error: "Çox sorğu göndərildi. 1 dəqiqə gözləyib yenidən cəhd edin." }, { status: 429 });
    }
    if (!r.ok) return NextResponse.json({ error: "AI xətası (" + r.status + ")." }, { status: 500 });
    const data = await r.json();
    const parts: { text?: string }[] = data?.candidates?.[0]?.content?.parts || [];
    return NextResponse.json({ notes: parts.map((p) => p.text || "").join("") });
  } catch {
    return NextResponse.json({ error: "Bağlantı xətası." }, { status: 500 });
  }
}