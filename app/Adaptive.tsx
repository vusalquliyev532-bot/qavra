"use client";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { useUser } from "./lib/useUser";
import { saveAttempt } from "./lib/saveAttempt";

type Q = {
  question: string;
  options: string[];
  correct: number;
  topic?: string;
  explanation?: string;
};
type Stat = { topic: string; total: number; correct: number };

export default function Adaptive({ text, docName }: { text: string; docName: string }) {
  const { user } = useUser();
  const [weak, setWeak] = useState<Stat[]>([]);
  const [questions, setQuestions] = useState<Q[] | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  async function loadWeak() {
    const { data } = await supabase
      .from("topic_results")
      .select("topic, is_correct")
      .order("created_at", { ascending: false })
      .limit(1000);
    const map = new Map<string, Stat>();
    ((data as { topic: string; is_correct: boolean }[] | null) || []).forEach((r) => {
      const s = map.get(r.topic) || { topic: r.topic, total: 0, correct: 0 };
      s.total += 1;
      if (r.is_correct) s.correct += 1;
      map.set(r.topic, s);
    });
    const list = Array.from(map.values())
      .filter((s) => s.correct / s.total < 0.7)
      .sort((a, b) => a.correct / a.total - b.correct / b.total)
      .slice(0, 5);
    setWeak(list);
  }

  useEffect(() => {
    if (!user) {
      setWeak([]);
      return;
    }
    loadWeak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const finished = questions !== null && answers.length > 0 && answers.every((a) => a !== null);
  const score = questions ? questions.filter((q, i) => answers[i] === q.correct).length : 0;

  useEffect(() => {
    if (!finished || !questions || !user) return;
    setSaved("saving");
    saveAttempt({
      docName,
      kind: "quiz",
      score,
      total: questions.length,
      topics: questions.map((q, i) => ({
        topic: q.topic || "Ümumi",
        isCorrect: answers[i] === q.correct,
      })),
    }).then((ok) => {
      setSaved(ok ? "ok" : "error");
      if (ok) loadWeak();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  async function generate() {
    setLoading(true);
    setError("");
    setSaved("");
    setQuestions(null);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, weakTopics: weak.map((w) => w.topic) }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Xəta baş verdi.");
      else {
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(null));
      }
    } catch {
      setError("Bağlantı xətası. Yenidən cəhd edin.");
    }
    setLoading(false);
  }

  function pick(qi: number, oi: number) {
    if (answers[qi] !== null) return;
    setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)));
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-rose-900/10">
      <div className="h-2 bg-gradient-to-r from-rose-500 to-orange-400" />
      <div className="p-6 sm:p-8">
        <div className="text-base font-bold text-slate-900">🧠 Fərdi (adaptiv) test</div>
        <p className="mt-1 text-xs text-slate-500">
          Suallar əvvəlki nəticələrinə görə sənin zəif mövzularından hazırlanır.
        </p>

        {!user ? (
          <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Fərdi test üçün əvvəl daxil ol. Sistem testlərinin nəticələrini xatırlayıb zəif mövzularını tapacaq.
          </div>
        ) : (
          <>
            <div className="mt-4">
              {weak.length > 0 ? (
                <>
                  <div className="text-sm font-semibold text-slate-900">Zəif mövzuların:</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {weak.map((w) => (
                      <span key={w.topic} className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                        {w.topic} · {Math.round((w.correct / w.total) * 100)}%
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Hələ zəif mövzu tapılmadı. Əvvəl adi test və ya imtahan həll et, sonra test sənə uyğunlaşacaq.
                  İstəsən, ümumi test də yarada bilərsən.
                </div>
              )}
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
            >
              {loading ? "Hazırlanır..." : questions ? "Yeni fərdi test" : "Fərdi test yarat"}
            </button>
          </>
        )}

        {error && <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {questions && (
          <div className="mt-4 space-y-4">
            {questions.map((q, qi) => {
              const chosen = answers[qi];
              return (
                <div key={qi} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-slate-900">
                      {qi + 1}. {q.question}
                    </div>
                    {q.topic && (
                      <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] text-slate-500">
                        {q.topic}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-2">
                    {q.options.map((opt, oi) => {
                      let style = "border-slate-200 bg-white hover:border-rose-400";
                      if (chosen !== null) {
                        if (oi === q.correct) style = "border-emerald-500 bg-emerald-50 text-emerald-900";
                        else if (oi === chosen) style = "border-red-400 bg-red-50 text-red-800";
                        else style = "border-slate-200 bg-white opacity-60";
                      }
                      return (
                        <button
                          key={oi}
                          onClick={() => pick(qi, oi)}
                          disabled={chosen !== null}
                          className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition ${style}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {chosen !== null && q.explanation && (
                    <div className="mt-3 rounded-lg bg-white px-3 py-2 text-xs leading-relaxed text-slate-600">
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}

            {finished && (
              <div className="rounded-xl bg-rose-50 p-5 text-center">
                <div className="text-sm text-slate-500">Nəticən</div>
                {saved === "ok" && <div className="mt-1 text-xs text-emerald-600">✓ Nəticə saxlanıldı</div>}
                {saved === "error" && <div className="mt-1 text-xs text-red-600">Nəticə saxlanmadı</div>}
                <div className="mt-1 text-4xl font-bold text-slate-900">
                  {score} / {questions.length}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}