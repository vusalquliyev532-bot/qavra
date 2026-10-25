"use client";
import { useState } from "react";

type Card = { front: string; back: string; topic?: string };

export default function Flashcards({ text }: { text: string }) {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    setCards(null);
    setIndex(0);
    setFlipped(false);
    setKnown([]);
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Xəta baş verdi.");
      else setCards(data.cards);
    } catch {
      setError("Bağlantı xətası. Yenidən cəhd edin.");
    }
    setLoading(false);
  }

  function next(markKnown: boolean) {
    if (!cards) return;
    if (markKnown && !known.includes(index)) setKnown([...known, index]);
    setFlipped(false);
    setIndex(index + 1);
  }

  const done = cards !== null && index >= cards.length;
  const card = cards && !done ? cards[index] : null;

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-sky-900/10">
      <div className="h-2 bg-gradient-to-r from-sky-400 to-teal-400" />
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-base font-bold text-slate-900">🃏 Yaddaş kartları</div>
            <div className="text-xs text-slate-500">Kartı çevir, bildiyini seç</div>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
          >
            {loading ? "Hazırlanır..." : cards ? "Yeni kartlar" : "Kartlar yarat"}
          </button>
        </div>

        {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {card && cards && (
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs text-slate-500">
              <span>
                Kart {index + 1} / {cards.length}
              </span>
              <span>Bildiklərim: {known.length}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-sky-500 transition-all"
                style={{ width: `${(index / cards.length) * 100}%` }}
              />
            </div>

            <button
              onClick={() => setFlipped(!flipped)}
              className={`mt-4 flex min-h-[200px] w-full flex-col items-center justify-center rounded-2xl p-6 text-center transition ${
                flipped ? "bg-teal-50 border border-teal-200" : "bg-sky-50 border border-sky-200"
              }`}
            >
              {card.topic && (
                <span className="mb-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                  {card.topic}
                </span>
              )}
              <div className={`text-lg font-semibold ${flipped ? "text-teal-900" : "text-sky-900"}`}>
                {flipped ? card.back : card.front}
              </div>
              <div className="mt-4 text-xs text-slate-400">
                {flipped ? "Cavab" : "Cavabı görmək üçün bas"}
              </div>
            </button>

            {flipped && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => next(false)}
                  className="rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-700 hover:bg-red-100"
                >
                  Təkrar etməliyəm
                </button>
                <button
                  onClick={() => next(true)}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  Bilirəm ✓
                </button>
              </div>
            )}
          </div>
        )}

        {done && cards && (
          <div className="mt-5 rounded-2xl bg-sky-50 p-6 text-center">
            <div className="text-sm text-slate-500">Nəticə</div>
            <div className="mt-1 text-4xl font-bold text-slate-900">
              {known.length} / {cards.length}
            </div>
            <div className="mt-1 text-sm text-slate-600">kartı bilirsən</div>
            {cards.length - known.length > 0 && (
              <div className="mt-4 text-left">
                <div className="text-sm font-semibold text-slate-900">Təkrar etməli olduqların:</div>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {cards
                    .filter((_, i) => !known.includes(i))
                    .map((c, i) => (
                      <li key={i}>• {c.front}</li>
                    ))}
                </ul>
              </div>
            )}
            <button
              onClick={() => {
                setIndex(0);
                setFlipped(false);
                setKnown([]);
              }}
              className="mt-5 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
            >
              Yenidən başla
            </button>
          </div>
        )}
      </div>
    </div>
  );
}