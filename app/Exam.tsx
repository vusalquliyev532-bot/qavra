"use client";
import { useEffect, useState } from "react";
import { useUser } from "./lib/useUser";
import { saveAttempt } from "./lib/saveAttempt";

type Q = {
  question: string;
  options: string[];
  correct: number;
  topic?: string;
  explanation?: string;
  page?: number;
};

type Phase = "setup" | "running" | "result";

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Exam({ text, docName }: { text: string; docName: string }) {
  const { user } = useUser();
  const [phase, setPhase] = useState<Phase>("setup");
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setPhase("result");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "result" || questions.length === 0) return;
    if (!user) {
      setSaved("login");
      return;
    }
    setSaved("saving");
    saveAttempt({
      docName,
      kind: "exam",
      score: questions.filter((q, i) => answers[i] === q.correct).length,
      total: questions.length,
      topics: questions.map((q, i) => ({
        topic: q.topic || "Ümumi",
        isCorrect: answers[i] === q.correct,
      })),
    }).then((ok) => setSaved(ok ? "ok" : "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  async function start() {
    setLoading(true);
    setError("");
    setSaved("");
    try {
      const res = await fetch("/api/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, count }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Xəta baş verdi.");
      } else {
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(null));
        setCurrent(0);
        setTimeLeft(data.questions.length * 60);
        setPhase("running");
      }
    } catch {
      setError("Bağlantı xətası. Yenidən cəhd edin.");
    }
    setLoading(false);
  }

  function choose(oi: number) {
    setAnswers((a) => a.map((v, i) => (i === current ? oi : v)));
  }

  const total = questions.length;
  const answered = answers.filter((a) => a !== null).length;
  const score = questions.filter((q, i) => answers[i] === q.correct).length;
  const percent = total ? Math.round((score / total) * 100) : 0;
  const weakTopics = Array.from(
    new Set(
      questions
        .filter((q, i) => answers[i] !== q.correct && q.topic)
        .map((q) => q.topic as string)
    )
  );

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-violet-900/10">
      <div className="h-2 bg-gradient-to-r from-violet-500 to-fuchsia-400" />
      <div className="p-6 sm:p-8">
        <div className="text-base font-bold text-slate-900">🎯 İmtahan simulyatoru</div>

        {phase === "setup" && (
          <div className="mt-2">
            <p className="text-sm text-slate-500">
              Real imtahan kimi: vaxt məhduddur, cavablar sonda göstərilir.
            </p>
            <div className="mt-4 flex gap-2">
              {[10, 15, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`flex-1 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                    count === n
                      ? "border-violet-500 bg-violet-50 text-violet-800"
                      : "border-slate-200 text-slate-600 hover:border-violet-300"
                  }`}
                >
                  {n} sual
                  <div className="text-xs font-normal text-slate-500">{n} dəqiqə</div>
                </button>
              ))}
            </div>
            {error && <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <button
              onClick={start}
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "İmtahan hazırlanır..." : "İmtahana başla"}
            </button>
          </div>
        )}

        {phase === "running" && questions[current] && (
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Sual {current + 1} / {total}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-sm font-bold ${
                  timeLeft <= 60 ? "bg-red-100 text-red-700" : "bg-violet-100 text-violet-800"
                }`}
              >
                ⏱ {fmt(timeLeft)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold ${
                    i === current
                      ? "bg-violet-600 text-white"
                      : answers[i] !== null
                      ? "bg-violet-100 text-violet-800"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="mt-4 text-[15px] font-semibold text-slate-900">
              {questions[current].question}
            </div>
            <div className="mt-3 space-y-2">
              {questions[current].options.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => choose(oi)}
                  className={`block w-full rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                    answers[current] === oi
                      ? "border-violet-500 bg-violet-50 text-violet-900"
                      : "border-slate-200 hover:border-violet-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                onClick={() => setCurrent(Math.max(0, current - 1))}
                disabled={current === 0}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 disabled:opacity-40"
              >
                ← Geri
              </button>
              {current < total - 1 ? (
                <button
                  onClick={() => setCurrent(current + 1)}
                  className="rounded-xl bg-violet-100 px-4 py-2.5 text-sm font-semibold text-violet-800 hover:bg-violet-200"
                >
                  Növbəti →
                </button>
              ) : (
                <span className="text-xs text-slate-400">Son sual</span>
              )}
            </div>

            <button
              onClick={() => setPhase("result")}
              className="mt-4 w-full rounded-xl bg-fuchsia-600 py-3 text-sm font-semibold text-white hover:bg-fuchsia-700"
            >
              İmtahanı bitir ({answered}/{total} cavablanıb)
            </button>
          </div>
        )}

        {phase === "result" && (
          <div className="mt-3">
            <div className="rounded-2xl bg-violet-50 p-6 text-center">
              <div className="text-sm text-slate-500">İmtahan nəticəsi</div>
              {saved === "ok" && <div className="mt-1 text-xs text-emerald-600">✓ Nəticə saxlanıldı</div>}
              {saved === "login" && <div className="mt-1 text-xs text-slate-500">Nəticəni saxlamaq üçün daxil ol</div>}
              {saved === "error" && <div className="mt-1 text-xs text-red-600">Nəticə saxlanmadı</div>}
              <div className="mt-1 text-5xl font-bold text-slate-900">{percent}%</div>
              <div className="mt-1 text-sm text-slate-600">
                {score} düzgün / {total} sual
              </div>
              <div className="mt-2 text-sm font-medium text-violet-800">
                {percent >= 80
                  ? "Əla hazırlıq! 🎉"
                  : percent >= 50
                  ? "Yaxşıdır, zəif yerləri təkrar et 👍"
                  : "Daha çox hazırlıq lazımdır 📚"}
              </div>
            </div>

            {weakTopics.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-semibold text-slate-900">Təkrar etməli mövzular:</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {weakTopics.map((t) => (
                    <span key={t} className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 text-sm font-semibold text-slate-900">Cavabların təhlili</div>
            <div className="mt-2 space-y-3">
              {questions.map((q, i) => {
                const ok = answers[i] === q.correct;
                return (
                  <div
                    key={i}
                    className={`rounded-xl border p-4 ${
                      ok ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="text-sm font-semibold text-slate-900">
                      {i + 1}. {q.question}
                    </div>
                    <div className="mt-2 text-xs text-slate-700">
                      <div>
                        Sənin cavabın:{" "}
                        <span className={ok ? "font-semibold text-emerald-700" : "font-semibold text-red-700"}>
                          {answers[i] !== null ? q.options[answers[i] as number] : "Cavablanmayıb"}
                        </span>
                      </div>
                      {!ok && (
                        <div className="mt-1">
                          Düzgün cavab:{" "}
                          <span className="font-semibold text-emerald-700">{q.options[q.correct]}</span>
                        </div>
                      )}
                      {q.explanation && <div className="mt-2 text-slate-600">💡 {q.explanation}</div>}
                      {q.page && <div className="mt-1 text-slate-500">📖 Səhifə {q.page}</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                setPhase("setup");
                setSaved("");
              }}
              className="mt-5 w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Yeni imtahan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}