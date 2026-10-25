"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabase";
import { useUser } from "./lib/useUser";

function translate(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "E-poçt və ya şifrə yanlışdır.";
  if (m.includes("already registered")) return "Bu e-poçt artıq qeydiyyatdan keçib. Daxil ol.";
  if (m.includes("password should be")) return "Şifrə ən azı 6 simvol olmalıdır.";
  if (m.includes("valid email") || m.includes("invalid email")) return "E-poçt ünvanı düzgün deyil.";
  if (m.includes("rate limit")) return "Çox cəhd edildi. Bir az gözləyin.";
  return "Xəta baş verdi. Yenidən cəhd edin.";
}

export default function AuthBar() {
  const { user, ready } = useUser();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function submit() {
    setBusy(true);
    setError("");
    setInfo("");
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setError(translate(error.message));
      else if (!data.session) setInfo("E-poçtunuza təsdiq linki göndərildi. Linkə basıb sonra daxil olun.");
      else setOpen(false);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(translate(error.message));
      else setOpen(false);
    }
    setBusy(false);
  }

  if (!ready) return <div className="h-9 w-24" />;

  if (user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/dashboard"
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          📊 Panel
        </Link>
        <span className="hidden max-w-[140px] truncate text-sm text-slate-600 md:block">{user.email}</span>
        <button
          onClick={() => supabase.auth.signOut()}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Çıxış
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Daxil ol
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xl font-bold text-slate-900">
              {mode === "login" ? "Daxil ol" : "Qeydiyyat"}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Nəticələrin saxlanması və zəif mövzuların izlənməsi üçün.
            </p>

            <div className="mt-4 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-poçt"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
                placeholder="Şifrə (ən azı 6 simvol)"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            {error && <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {info && <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{info}</div>}

            <button
              onClick={submit}
              disabled={busy || !email || password.length < 6}
              className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {busy ? "Gözləyin..." : mode === "login" ? "Daxil ol" : "Qeydiyyatdan keç"}
            </button>

            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
                setInfo("");
              }}
              className="mt-3 w-full text-center text-sm text-slate-500 hover:text-slate-800"
            >
              {mode === "login" ? "Hesabın yoxdur? Qeydiyyatdan keç" : "Hesabın var? Daxil ol"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}