"use client";
import { useEffect, useState } from "react";
import { PROGRAMS, type Program, type Subject } from "./lib/curriculum";
import { useUser } from "./lib/useUser";
import { saveAttempt } from "./lib/saveAttempt";

type Q = { question: string; options: string[]; correct: number; explanation?: string };

const KEY_DONE = "qavra:done";
const KEY_LEVEL = "qavra:level";

function readStore<T>(key: string): Record<string, T> {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}
function writeStore(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}
const isHeader = (t: string) => t.startsWith("# ");
const tk = (subject: Subject, topic: string) => `${subject.id}|${topic}`;

function Notes({ text }: { text: string }) {
  const lines = text.replace(/\*\*/g, "").replace(/^\* /gm, "- ").split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("###"))
          return (
            <div key={i} className="pt-3 text-base font-bold text-slate-900">
              {line.replace(/^#+\s*/, "")}
            </div>
          );
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

function levelOf(pct: number) {
  if (pct >= 90) return { label: "Əla səviyyə 🎉", color: "text-emerald-700" };
  if (pct >= 70) return { label: "Yaxşı səviyyə 👍", color: "text-sky-700" };
  if (pct >= 40) return { label: "Orta səviyyə, bir də təkrar et", color: "text-amber-700" };
  return { label: "Zəif səviyyə, mövzunu yenidən oxu 📚", color: "text-red-700" };
}

function TopicView({
  program, subject, topic, onBack, onPassed, onScore,
}: {
  program: Program; subject: Subject; topic: string;
  onBack: () => void; onPassed: () => void; onScore: (pct: number) => void;
}) {
  const { user } = useUser();
  const ck = `qavra:notes:${tk(subject, topic)}`;
  const [notes, setNotes] = useState("");
  const [notesErr, setNotesErr] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  const [questions, setQuestions] = useState<Q[] | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [qLoading, setQLoading] = useState(false);
  const [qErr, setQErr] = useState("");
  const [saved, setSaved] = useState("");

  async function loadNotes(force = false) {
    if (!force) {
      try {
        const c = localStorage.getItem(ck);
        if (c) {
          setNotes(c);
          return;
        }
      } catch {}
    }
    setNotesLoading(true);
    setNotesErr("");
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program: program.title, subject: subject.name, topic }),
      });
      const data = await res.json();
      if (!res.ok) setNotesErr(data.error || "Xəta baş verdi.");
      else {
        setNotes(data.notes);
        try {
          localStorage.setItem(ck, data.notes);
        } catch {}
      }
    } catch {
      setNotesErr("Bağlantı xətası. Yenidən cəhd edin.");
    }
    setNotesLoading(false);
  }

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finished = questions !== null && answers.length > 0 && answers.every((a) => a !== null);
  const score = questions ? questions.filter((q, i) => answers[i] === q.correct).length : 0;
  const pct = questions ? Math.round((score / questions.length) * 100) : 0;

  useEffect(() => {
    if (!finished || !questions) return;
    onScore(pct);
    if (pct >= 70) onPassed();
    if (!user) {
      setSaved("login");
      return;
    }
    setSaved("saving");
    saveAttempt({
      docName: `${subject.name}: ${topic}`,
      kind: "quiz",
      score,
      total: questions.length,
      topics: questions.map((q, i) => ({
        topic: `${subject.name}: ${topic}`,
        isCorrect: answers[i] === q.correct,
      })),
    }).then((ok) => setSaved(ok ? "ok" : "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  async function startQuiz() {
    setQLoading(true);
    setQErr("");
    setSaved("");
    setQuestions(null);
    setAnswers([]);
    try {
      const res = await fetch("/api/topicquiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program: program.title, subject: subject.name, topic }),
      });
      const data = await res.json();
      if (!res.ok) setQErr(data.error || "Xəta baş verdi.");
      else {
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(null));
      }
    } catch {
      setQErr("Bağlantı xətası. Yenidən cəhd edin.");
    }
    setQLoading(false);
  }

  function pick(qi: number, oi: number) {
    if (answers[qi] !== null) return;
    setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)));
  }

  return (
    <div>
      <button onClick={onBack} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
        ← Mövzular
      </button>
      <div className="mt-3 text-xs text-slate-500">{subject.name}</div>
      <h2 className="text-xl font-bold text-slate-900">{topic}</h2>

      <div className="mt-4 rounded-3xl bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-emerald-800">📖 Qısa qayda</div>
        {notesLoading && <div className="mt-3 text-sm text-slate-500">Qayda hazırlanır...</div>}
        {notesErr && (
          <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {notesErr}
            <button onClick={() => loadNotes(true)} className="ml-2 font-semibold underline">
              Yenidən cəhd et
            </button>
          </div>
        )}
        {notes && (
          <>
            <div className="mt-2">
              <Notes text={notes} />
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Qayda süni intellekt tərəfindən hazırlanıb. Vacib məlumatları dərslikdən də yoxla.
            </div>
          </>
        )}
      </div>

      {notes && !questions && (
        <button
          onClick={startQuiz}
          disabled={qLoading}
          className="mt-4 w-full rounded-xl bg-emerald-600 py-4 text-base font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {qLoading ? "Sınaq hazırlanır..." : "Oxudum, 10 suallıq sınağa başla"}
        </button>
      )}
      {qErr && <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{qErr}</div>}

      {questions && (
        <div className="mt-4 space-y-4">
          {questions.map((q, qi) => {
            const chosen = answers[qi];
            return (
              <div key={qi} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">
                  {qi + 1}. {q.question}
                </div>
                <div className="mt-3 space-y-2">
                  {q.options.map((opt, oi) => {
                    let style = "border-slate-200 hover:border-emerald-400";
                    if (chosen !== null) {
                      if (oi === q.correct) style = "border-emerald-500 bg-emerald-50 text-emerald-900";
                      else if (oi === chosen) style = "border-red-400 bg-red-50 text-red-800";
                      else style = "border-slate-200 opacity-60";
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
                  <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
                    💡 {q.explanation}
                  </div>
                )}
              </div>
            );
          })}

          {finished && (
            <div className="rounded-2xl bg-emerald-50 p-5 text-center">
              <div className="text-sm text-slate-500">Öyrənmə səviyyən</div>
              <div className="mt-1 text-4xl font-bold text-slate-900">
                {score} / {questions.length}
              </div>
              <div className={`mt-1 text-sm font-semibold ${levelOf(pct).color}`}>{levelOf(pct).label}</div>
              {pct >= 70 && <div className="mt-1 text-xs text-emerald-700">✓ Mövzu oxunmuş kimi işarələndi</div>}
              {saved === "ok" && <div className="mt-1 text-xs text-emerald-600">✓ Nəticə saxlanıldı</div>}
              {saved === "login" && <div className="mt-1 text-xs text-slate-500">Nəticəni saxlamaq üçün daxil ol</div>}
              {saved === "error" && <div className="mt-1 text-xs text-red-600">Nəticə saxlanmadı</div>}
              <button onClick={startQuiz} className="mt-4 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">
                Yeni sınaq
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Prepare() {
  const [programId, setProgramId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topic, setTopic] = useState("");
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [level, setLevel] = useState<Record<string, number>>({});

  useEffect(() => {
    setDone(readStore<boolean>(KEY_DONE));
    setLevel(readStore<number>(KEY_LEVEL));
  }, []);

  const program = PROGRAMS.find((p) => p.id === programId);
  const subject = program?.subjects.find((s) => s.id === subjectId);

  function toggle(s: Subject, t: string) {
    const next = { ...done };
    if (next[tk(s, t)]) delete next[tk(s, t)];
    else next[tk(s, t)] = true;
    setDone(next);
    writeStore(KEY_DONE, next);
  }
  function markDone(s: Subject, t: string) {
    setDone((d) => {
      const next = { ...d, [tk(s, t)]: true };
      writeStore(KEY_DONE, next);
      return next;
    });
  }
  function setScore(s: Subject, t: string, pct: number) {
    setLevel((l) => {
      const next = { ...l, [tk(s, t)]: pct };
      writeStore(KEY_LEVEL, next);
      return next;
    });
  }
  const count = (s: Subject) => {
    const list = s.topics.filter((t) => !isHeader(t));
    return { total: list.length, done: list.filter((t) => done[tk(s, t)]).length };
  };

  if (!program) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600">Hansı imtahana hazırlaşırsan?</p>
        {PROGRAMS.map((p) => (
          <button
            key={p.id}
            onClick={() => setProgramId(p.id)}
            className="block w-full rounded-2xl bg-white p-5 text-left shadow-sm hover:shadow-md"
          >
            <div className="font-semibold text-slate-900">{p.title}</div>
            <div className="mt-1 text-sm text-slate-500">{p.hint}</div>
          </button>
        ))}
      </div>
    );
  }

  if (!subject) {
    return (
      <div>
        <button
          onClick={() => setProgramId("")}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm"
        >
          ← Proqramlar
        </button>
        <h2 className="mt-3 text-xl font-bold text-slate-900">{program.title}</h2>
        <div className="mt-3 space-y-3">
          {program.subjects.map((s) => {
            const c = count(s);
            const p = c.total ? Math.round((c.done / c.total) * 100) : 0;
            return (
              <button
                key={s.id}
                onClick={() => setSubjectId(s.id)}
                className="block w-full rounded-2xl bg-white p-5 text-left shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-900">{s.name}</div>
                  <div className="text-sm text-slate-500">
                    {c.total ? `${c.done}/${c.total}` : "tezliklə"}
                  </div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-emerald-500" style={{ width: `${p}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (topic) {
    return (
      <TopicView
        program={program}
        subject={subject}
        topic={topic}
        onBack={() => setTopic("")}
        onPassed={() => markDone(subject, topic)}
        onScore={(p) => setScore(subject, topic, p)}
      />
    );
  }

  const c = count(subject);
  return (
    <div>
      <button
        onClick={() => setSubjectId("")}
        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm"
      >
        ← Fənlər
      </button>
      <h2 className="mt-3 text-xl font-bold text-slate-900">{subject.name}</h2>
      <div className="text-sm text-slate-500">
        {program.title} · {c.done}/{c.total} mövzu oxunub
      </div>

      {c.total === 0 ? (
        <div className="mt-4 rounded-2xl bg-white p-6 text-center text-sm text-slate-600 shadow-sm">
          Bu fənn üçün mövzu siyahısı hələ əlavə olunmayıb.
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-white p-2 shadow-sm">
          {subject.topics.map((t, i) => {
            if (isHeader(t)) {
              return (
                <div key={i} className="px-3 pb-1 pt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {t.slice(2)}
                </div>
              );
            }
            const isDone = !!done[tk(subject, t)];
            const lv = level[tk(subject, t)];
            return (
              <div key={i} className="flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-slate-50">
                <button
                  onClick={() => toggle(subject, t)}
                  aria-label="Oxudum"
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                    isDone ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-transparent"
                  }`}
                >
                  ✓
                </button>
                <button
                  onClick={() => setTopic(t)}
                  className={`min-w-0 flex-1 py-2 text-left text-[15px] ${
                    isDone ? "text-slate-400 line-through" : "text-slate-800"
                  }`}
                >
                  {t}
                </button>
                {lv !== undefined && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      lv >= 70 ? "bg-emerald-100 text-emerald-700" : lv >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {lv}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}