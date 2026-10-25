"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabase";
import { useUser } from "./lib/useUser";

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };

export default function Tutor({ text }: { text: string }) {
  const { user } = useUser();
  const [weak, setWeak] = useState<string[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

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
      const list = Array.from(map.entries())
        .filter(([, s]) => s.c / s.t < 0.7)
        .sort((a, b) => a[1].c / a[1].t - b[1].c / b[1].t)
        .slice(0, 5)
        .map(([k]) => k);
      setWeak(list);
    })();
  }, [user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);

  async function send(content: string) {
    const c = content.trim();
    if (!c || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: c }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          weakTopics: weak,
          messages: next.filter((m) => !m.error).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages([...next, { role: "assistant", content: data.error || "Xəta baş verdi.", error: true }]);
      } else {
        setMessages([...next, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages([...next, { role: "assistant", content: "Bağlantı xətası. Yenidən cəhd edin.", error: true }]);
    }
    setBusy(false);
  }

  const starters = [
    "Bu mühazirənin əsas fikrini sadə dillə izah et",
    ...(weak.length > 0 ? [`${weak[0]} mövzusunu mənə başa sal`] : []),
    "Məni bu mövzu üzrə sına",
  ];

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-teal-900/10">
      <div className="h-2 bg-gradient-to-r from-teal-500 to-cyan-400" />
      <div className="p-6 sm:p-8">
        <div className="text-base font-bold text-slate-900">🎓 Şəxsi AI müəllim</div>
        <p className="mt-1 text-xs text-slate-500">
          Mühazirəni izah edir, sual verir və zəif mövzularını nəzərə alır.
        </p>

        {weak.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {weak.map((w) => (
              <span key={w} className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                {w}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {starters.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-left text-xs font-medium text-teal-800 hover:bg-teal-100"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-sm bg-teal-600 px-4 py-2 text-sm text-white"
                  : `w-fit max-w-[95%] whitespace-pre-wrap rounded-2xl rounded-bl-sm px-4 py-2 text-sm leading-relaxed ${
                      m.error ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-800"
                    }`
              }
            >
              {m.content.replace(/\*\*/g, "")}
            </div>
          ))}
          {busy && (
            <div className="w-fit rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-500">
              Müəllim düşünür...
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send(input);
            }}
            placeholder="Müəllimə yaz..."
            className="min-w-0 flex-1 rounded-xl border border-teal-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
          />
          <button
            onClick={() => send(input)}
            disabled={busy || !input.trim()}
            className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-40"
          >
            Göndər
          </button>
        </div>
      </div>
    </div>
  );
}