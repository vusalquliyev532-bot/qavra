"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useUser } from "../lib/useUser";

type Attempt = {
  id: string;
  doc_name: string;
  kind: "quiz" | "exam";
  score: number;
  total: number;
  created_at: string;
};
type TopicRow = { topic: string; is_correct: boolean; created_at: string };
type TopicStat = { topic: string; total: number; correct: number; lastAt: string };

const DAY = 86400000;

function pct(a: Attempt) {
  return a.total ? Math.round((a.score / a.total) * 100) : 0;
}
function fmtDate(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString("az-AZ", { day: "numeric", month: "short" });
}

export default function Dashboard() {
  const { user, ready } = useUser();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [rows, setRows] = useState<TopicRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
    const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
  }, []);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const a = await supabase
        .from("attempts")
        .select("id, doc_name, kind, score, total, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      const t = await supabase
        .from("topic_results")
        .select("topic, is_correct, created_at")
        .order("created_at", { ascending: false })
        .limit(2000);
      if (a.error || t.error) setError("Məlumatlar yüklənmədi. Səhifəni yeniləyin.");
      setAttempts((a.data as Attempt[]) || []);
      setRows((t.data as TopicRow[]) || []);
      setLoading(false);
    })();
  }, [user]);

  // Mövzu statistikası
  const map = new Map<string, TopicStat>();
  rows.forEach((r) => {
    const s = map.get(r.topic) || { topic: r.topic, total: 0, correct: 0, lastAt: r.created_at };
    s.total += 1;
    if (r.is_correct) s.correct += 1;
    if (r.created_at > s.lastAt) s.lastAt = r.created_at;
    map.set(r.topic, s);
  });
  const topics = Array.from(map.values()).sort(
    (a, b) => a.correct / a.total - b.correct / b.total
  );

  // Təkrar planı
  
  const due = topics
    .map((t) => {
      const acc = t.correct / t.total;
      const days = Math.floor((now - new Date(t.lastAt).getTime()) / DAY);
      const gap = acc < 0.6 ? 1 : acc < 0.85 ? 3 : 7;
      return { ...t, acc, days, gap, isDue: now > 0 && days >= gap };
    })
    .filter((t) => t.isDue);

  // Hazırlıq göstəricisi: son 5 nəticənin çəkili ortalaması (yeni olan daha vacibdir)
  const recent = attempts.slice(0, 5);
  let readiness = 0;
  if (recent.length > 0) {
    let sum = 0;
    let w = 0;
    recent.forEach((a, i) => {
      const weight = recent.length - i;
      sum += pct(a) * weight;
      w += weight;
    });
    readiness = Math.round(sum / w);
  }
  const readinessLabel =
    readiness >= 80 ? "İmtahana hazırsan 🎉" : readiness >= 60 ? "Yaxşı gedir 👍" : "Hələ hazırlıq lazımdır 📚";

  const trend = [...attempts].slice(0, 10).reverse();

  return (
    <div className="min-h-screen bg-[#F4F8F5] text-slate-800">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-sm font-semibold text-emerald-700 hover:underline">
          ← Əsas səhifə
        </Link>
        <div className="text-lg font-bold text-slate-900">📊 Panelim</div>
        <div className="w-24" />
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-20">
        {!ready || (user && loading) ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500">Yüklənir...</div>
        ) : !user ? (
          <div className="rounded-2xl bg-white p-8 text-center">
            <div className="text-lg font-semibold text-slate-900">Panelə baxmaq üçün daxil ol</div>
            <p className="mt-1 text-sm text-slate-500">Əsas səhifədə “Daxil ol” düyməsinə bas.</p>
            <Link href="/" className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">
              Əsas səhifəyə keç
            </Link>
          </div>
        ) : attempts.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center">
            <div className="text-lg font-semibold text-slate-900">Hələ nəticə yoxdur</div>
            <p className="mt-1 text-sm text-slate-500">
              Daxil olmuş halda bir test və ya imtahan həll et, nəticələr burada görünəcək.
            </p>
            <Link href="/" className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">
              Test həll et
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            {/* Hazırlıq göstəricisi */}
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-emerald-500 p-6 text-white sm:col-span-1">
                <div className="text-sm opacity-90">İmtahana hazırlıq</div>
                <div className="mt-1 text-5xl font-bold">{readiness}%</div>
                <div className="mt-2 text-sm opacity-90">{readinessLabel}</div>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="text-sm text-slate-500">Ümumi cəhd</div>
                <div className="mt-1 text-4xl font-bold text-slate-900">{attempts.length}</div>
                <div className="mt-1 text-sm text-slate-500">test və imtahan</div>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="text-sm text-slate-500">Zəif mövzu</div>
                <div className="mt-1 text-4xl font-bold text-red-600">
                  {topics.filter((t) => t.correct / t.total < 0.6).length}
                </div>
                <div className="mt-1 text-sm text-slate-500">60%-dən aşağı</div>
              </div>
            </section>

            {/* Bilik səviyyəsinin izlənməsi */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="font-semibold text-slate-900">📈 Bilik səviyyəsinin izlənməsi</div>
              <p className="text-xs text-slate-500">Son {trend.length} nəticə (solda köhnə, sağda yeni)</p>
              <div className="mt-4 flex h-40 items-end gap-2">
                {trend.map((a) => (
                  <div key={a.id} className="flex flex-1 flex-col items-center justify-end">
                    <div className="mb-1 text-xs font-semibold text-slate-600">{pct(a)}%</div>
                    <div
                      className={`w-full rounded-t-lg ${
                        pct(a) >= 80 ? "bg-emerald-500" : pct(a) >= 50 ? "bg-amber-400" : "bg-red-400"
                      }`}
                      style={{ height: `${Math.max(pct(a), 4)}%` }}
                    />
                    <div className="mt-1 text-[10px] text-slate-400">{fmtDate(a.created_at)}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Zəiflik analizi */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="font-semibold text-slate-900">🎯 Mövzular üzrə analiz</div>
              <p className="text-xs text-slate-500">Ən zəifdən ən güclüyə doğru</p>
              <div className="mt-4 space-y-3">
                {topics.length === 0 && <div className="text-sm text-slate-500">Mövzu məlumatı yoxdur.</div>}
                {topics.map((t) => {
                  const p = Math.round((t.correct / t.total) * 100);
                  return (
                    <div key={t.topic}>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-800">{t.topic}</span>
                        <span className="text-slate-500">
                          {t.correct}/{t.total} · {p}%
                        </span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full ${p >= 80 ? "bg-emerald-500" : p >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                          style={{ width: `${p}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Avtomatik təkrar */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="font-semibold text-slate-900">🔁 Təkrar vaxtı çatan mövzular</div>
              <p className="text-xs text-slate-500">
                Zəif mövzular 1 gün, orta mövzular 3 gün, güclü mövzular 7 gün sonra təkrar olunmalıdır.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {due.length === 0 && (
                  <div className="text-sm text-slate-500">Bu gün təkrar edəcək mövzu yoxdur ✓</div>
                )}
                {due.map((t) => (
                  <span
                    key={t.topic}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      t.acc < 0.6 ? "bg-red-100 text-red-700" : t.acc < 0.85 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {t.topic} · {t.days} gün əvvəl
                  </span>
                ))}
              </div>
            </section>

            {/* Tarixçə */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="font-semibold text-slate-900">🕘 Tarixçə</div>
              <div className="mt-3 divide-y divide-slate-100">
                {attempts.slice(0, 15).map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-800">{a.doc_name}</div>
                      <div className="text-xs text-slate-500">
                        {a.kind === "exam" ? "İmtahan" : "Test"} · {fmtDate(a.created_at)}
                      </div>
                    </div>
                    <div className="shrink-0 font-semibold text-slate-900">
                      {a.score}/{a.total} <span className="text-slate-400">({pct(a)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}