"use client";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { useUser } from "./lib/useUser";
import { saveAttempt } from "./lib/saveAttempt";

function Formatted({ text }: { text: string }) {
  const lines = text.replace(/\*\*/g, "").replace(/^\* /gm, "- ").split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("###")) {
          return (
            <div key={i} className="pt-3 text-base font-bold text-slate-900">
              {line.replace(/^#+\s*/, "")}
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return (
          <div key={i} className="text-[15px] leading-relaxed text-slate-700">
            {line}
          </div>
        );
      })}
    </div>
  );
}

const SECRET = "Aysumu cox sevirem kalpkalpkalp";

/* ---------- Xülasə ---------- */
export function Summary({ text }: { text: string }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function make() {
    setLoading(true);
    setError("");
    setSummary("");
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Xəta baş verdi.");
      else setSummary(data.summary);
    } catch {
      setError("Bağlantı xətası. Yenidən cəhd edin.");
    }
    setLoading(false);
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl shadow-emerald-900/10">
      <button
        onClick={make}
        disabled={loading}
        className="w-full rounded-xl bg-emerald-600 py-4 text-base font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? "Hazırlanır..." : summary ? "Yenidən yarat" : "Xülasə yarat"}
      </button>
      {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {summary && (
        <div className="mt-5 rounded-2xl bg-sky-50 p-5">
          <Formatted text={summary} />
        </div>
      )}
    </div>
  );
}

/* ---------- Sual-cavab ---------- */
type QA = { q: string; a: string; error?: boolean };

export function Ask({ text }: { text: string }) {
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [chat, setChat] = useState<QA[]>([]);

  async function ask() {
    const q = question.trim();
    if (!q || asking) return;
    setQuestion("");

    if (q.replace(/\s/g, "") === "22:22") {
      setChat((c) => [...c, { q, a: SECRET }]);
      return;
    }

    setAsking(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, question: q }),
      });
      const data = await res.json();
      if (!res.ok) setChat((c) => [...c, { q, a: data.error || "Xəta baş verdi.", error: true }]);
      else setChat((c) => [...c, { q, a: data.answer }]);
    } catch {
      setChat((c) => [...c, { q, a: "Bağlantı xətası. Yenidən cəhd edin.", error: true }]);
    }
    setAsking(false);
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl shadow-violet-900/10">
      <div className="space-y-3">
        {chat.length === 0 && (
          <div className="text-sm text-slate-500">Yüklədiyin mühazirə barədə istənilən sualı yaz.</div>
        )}
        {chat.map((m, i) => (
          <div key={i} className="space-y-2">
            <div className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-sm bg-violet-600 px-4 py-2 text-sm text-white">
              {m.q}
            </div>
            <div
              className={`w-fit max-w-[95%] whitespace-pre-wrap rounded-2xl rounded-bl-sm px-4 py-2 text-sm leading-relaxed ${
                m.error ? "bg-red-50 text-red-700" : "bg-violet-50 text-slate-700"
              }`}
            >
              {m.a.replace(/\*\*/g, "")}
            </div>
          </div>
        ))}
        {asking && (
          <div className="w-fit rounded-2xl bg-violet-50 px-4 py-2 text-sm text-slate-500">
            Cavab hazırlanır...
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") ask();
          }}
          placeholder="Sualını yaz..."
          className="min-w-0 flex-1 rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
        />
        <button
          onClick={ask}
          disabled={asking || !question.trim()}
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40"
        >
          Göndər
        </button>
      </div>
    </div>
  );
}

/* ---------- Test ---------- */
type Question = {
  question: string;
  options: string[];
  correct: number;
  topic?: string;
  explanation?: string;
};

export function Quiz({ text, docName }: { text: string; docName: string }) {
  const { user } = useUser();
  const [quiz, setQuiz] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const finished = quiz !== null && answers.length > 0 && answers.every((a) => a !== null);
  const score = quiz ? quiz.filter((q, i) => answers[i] === q.correct).length : 0;
  const weakTopics = quiz
    ? Array.from(
        new Set(
          quiz
            .filter((q, i) => answers[i] !== null && answers[i] !== q.correct && q.topic)
            .map((q) => q.topic as string)
        )
      )
    : [];

  useEffect(() => {
    if (!finished || !quiz) return;
    if (!user) {
      setSaved("login");
      return;
    }
    setSaved("saving");
    saveAttempt({
      docName,
      kind: "quiz",
      score,
      total: quiz.length,
      topics: quiz.map((q, i) => ({
        topic: q.topic || "Ümumi",
        isCorrect: answers[i] === q.correct,
      })),
    }).then((ok) => setSaved(ok ? "ok" : "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  async function make() {
    setLoading(true);
    setError("");
    setSaved("");
    setQuiz(null);
    setAnswers([]);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Xəta baş verdi.");
      else {
        setQuiz(data.questions);
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
    <div className="rounded-3xl bg-white p-6 shadow-xl shadow-amber-900/10">
      <button
        onClick={make}
        disabled={loading}
        className="w-full rounded-xl bg-amber-500 py-4 text-base font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
      >
        {loading ? "Hazırlanır..." : quiz ? "Yeni test yarat" : "Test yarat"}
      </button>
      {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {quiz && (
        <div className="mt-5 space-y-4">
          {quiz.map((q, qi) => {
            const chosen = answers[qi];
            return (
              <div key={qi} className="rounded-xl bg-amber-50 p-4">
                <div className="text-sm font-semibold text-slate-900">
                  {qi + 1}. {q.question}
                </div>
                <div className="mt-3 space-y-2">
                  {q.options.map((opt, oi) => {
                    let style = "border-slate-200 bg-white hover:border-amber-400";
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
            <div className="rounded-xl bg-emerald-50 p-5 text-center">
              <div className="text-sm text-slate-500">Nəticəniz</div>
              {saved === "ok" && <div className="mt-1 text-xs text-emerald-600">✓ Nəticə saxlanıldı</div>}
              {saved === "login" && (
                <div className="mt-1 text-xs text-slate-500">Nəticəni saxlamaq üçün daxil ol</div>
              )}
              {saved === "error" && <div className="mt-1 text-xs text-red-600">Nəticə saxlanmadı</div>}
              <div className="mt-1 text-4xl font-bold text-slate-900">
                {score} / {quiz.length}
              </div>
              {weakTopics.length > 0 && (
                <div className="mt-4 text-left">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Dərs planı ---------- */
export function Plan({ text }: { text: string }) {
  const { user } = useUser();
  const [days, setDays] = useState("7");
  const [hours, setHours] = useState("2");
  const [weak, setWeak] = useState<string[]>([]);
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setWeak([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("topic_results")
        .select("topic, is_correct")
        .order("created_at", { ascending: false })
        .limit(1000);
      const map = new Map<string, { t: number; c: number }>();
      ((data as { topic: string; is_correct: boolean }[] | null) || []).forEach((r) => {
        const s = map.get(r.topic) || { t: 0, c: 0 };
        s.t += 1;
        if (r.is_correct) s.c += 1;
        map.set(r.topic, s);
      });
      setWeak(
        Array.from(map.entries())
          .filter(([, s]) => s.c / s.t < 0.7)
          .sort((a, b) => a[1].c / a[1].t - b[1].c / b[1].t)
          .slice(0, 6)
          .map(([k]) => k)
      );
    })();
  }, [user]);

  async function make() {
    setLoading(true);
    setPlan("");
    setError("");
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, days: Number(days), hours: Number(hours), weakTopics: weak }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Xəta baş verdi.");
      else setPlan(data.plan);
    } catch {
      setError("Bağlantı xətası. Yenidən cəhd edin.");
    }
    setLoading(false);
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl shadow-rose-900/10">
      <p className="text-sm text-slate-500">
        İmtahana neçə gün qalıb və gündə neçə saat oxuya bilərsən?
        {weak.length > 0 ? " Testlərdəki zəif mövzuların da nəzərə alınacaq." : ""}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-medium text-slate-600">İmtahana qalan gün</span>
          <input
            type="number"
            min={1}
            max={120}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="mt-1 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-500"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Gündə neçə saat</span>
          <input
            type="number"
            min={0.5}
            max={16}
            step={0.5}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="mt-1 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-500"
          />
        </label>
      </div>
      <button
        onClick={make}
        disabled={loading || !days || !hours}
        className="mt-4 w-full rounded-xl bg-rose-500 py-3.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
      >
        {loading ? "Plan hazırlanır..." : "Plan yarat"}
      </button>
      {error && <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {plan && (
        <div className="mt-4 rounded-xl bg-rose-50 p-4">
          <Formatted text={plan} />
        </div>
      )}
    </div>
  );
}