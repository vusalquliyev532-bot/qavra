"use client";
import Link from "next/link";
import { useDoc } from "./DocContext";
import AuthBar from "./AuthBar";

const items = [
  { href: "/f/summary", icon: "📝", title: "Xülasə", text: "Əsas məqamlar", box: "bg-emerald-100", tile: "bg-emerald-500", doc: true },
  { href: "/f/ask", icon: "💬", title: "Sual-cavab", text: "Sənəd barədə soruş", box: "bg-sky-100", tile: "bg-sky-500", doc: true },
  { href: "/f/quiz", icon: "✅", title: "Test", text: "5 suallıq test", box: "bg-amber-100", tile: "bg-amber-500", doc: true },
  { href: "/f/cards", icon: "🃏", title: "Yaddaş kartları", text: "Çevir və öyrən", box: "bg-teal-100", tile: "bg-teal-500", doc: true },
  { href: "/f/exam", icon: "🎯", title: "İmtahan", text: "Vaxtlı simulyator", box: "bg-violet-100", tile: "bg-violet-500", doc: true },
  { href: "/f/adaptive", icon: "🧠", title: "Fərdi test", text: "Zəif mövzulara görə", box: "bg-rose-100", tile: "bg-rose-500", doc: true },
  { href: "/f/tutor", icon: "🎓", title: "AI müəllim", text: "İzah et və sına", box: "bg-cyan-100", tile: "bg-cyan-600", doc: true },
  { href: "/f/plan", icon: "📅", title: "Dərs planı", text: "Gündəlik plan", box: "bg-orange-100", tile: "bg-orange-500", doc: true },
  { href: "/f/prepare", icon: "📚", title: "İmtahana hazırlıq", text: "Buraxılış və blok", box: "bg-lime-100", tile: "bg-lime-600", doc: false },
  { href: "/dashboard", icon: "📊", title: "Panelim", text: "Nəticələr və analiz", box: "bg-slate-200", tile: "bg-slate-600", doc: false },
];

export default function Home() {
  const { fileName, pages, text, message, isError, loadFile } = useDoc();

  return (
    <div className="min-h-screen bg-[#F4F8F5] text-slate-800">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">Q</span>
          Qavra
        </div>
        <AuthBar />
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-20 pt-2">
        <section className="text-center">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Mühazirələri oxumaq yox,{" "}
            <span className="text-emerald-600">başa düşmək</span> vaxtıdır
          </h1>
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow-xl shadow-emerald-900/10">
          <div className="flex h-2">
            <div className="flex-1 bg-emerald-500" />
            <div className="flex-1 bg-sky-500" />
            <div className="flex-1 bg-violet-500" />
            <div className="flex-1 bg-amber-400" />
          </div>
          <div className="p-5">
            <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-8 text-center transition hover:border-emerald-500 hover:bg-emerald-100/70">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-2xl shadow-md">
                📄
              </div>
              <div className="mt-3 truncate text-lg font-bold text-slate-900">
                {fileName || "PDF faylını bura yüklə"}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {pages > 0 ? `${pages} səhifə` : "Seçmək üçün bas · maksimum 30 səhifə"}
              </div>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) loadFile(f);
                }}
              />
            </label>
            {message && (
              <div
                className={`mt-3 rounded-xl px-4 py-3 text-sm font-medium ${
                  isError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </section>

        <h2 className="mt-8 text-lg font-bold text-slate-900">
          {text ? "Nə etmək istəyirsən?" : "Funksiyalar"}
        </h2>
        <section className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((it) => {
            const locked = it.doc && !text;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`rounded-2xl p-4 transition hover:-translate-y-0.5 ${it.box} ${locked ? "opacity-60" : ""}`}
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl shadow-sm ${it.tile}`}>
                  {it.icon}
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-900">{it.title}</div>
                <div className="text-xs text-slate-600">{locked ? "PDF lazımdır" : it.text}</div>
              </Link>
            );
          })}
        </section>
      </main>

      <footer className="border-t border-emerald-100 py-6 text-center text-sm text-slate-400">
        © 2026 Qavra
      </footer>
    </div>
  );
}