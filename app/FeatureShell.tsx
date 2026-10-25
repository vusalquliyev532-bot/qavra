"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { useDoc } from "./DocContext";
import AuthBar from "./AuthBar";

export default function FeatureShell({
  title,
  icon,
  needsDoc = true,
  children,
}: {
  title: string;
  icon: string;
  needsDoc?: boolean;
  children: ReactNode;
}) {
  const { text, fileName } = useDoc();

  return (
    <div className="min-h-screen bg-[#F4F8F5] text-slate-800">
      <header className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-4">
        <Link
          href="/"
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50"
        >
          ← Menyu
        </Link>
        <AuthBar />
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-20">
        <h1 className="text-2xl font-bold text-slate-900">
          {icon} {title}
        </h1>
        {needsDoc && fileName && text && (
          <div className="mt-1 truncate text-xs text-slate-500">📄 {fileName}</div>
        )}

        <div className="mt-4">
          {needsDoc && !text ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
              <div className="text-lg font-semibold text-slate-900">Əvvəl PDF yüklə</div>
              <p className="mt-1 text-sm text-slate-500">Bu bölmə yüklədiyin mühazirə ilə işləyir.</p>
              <Link
                href="/"
                className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                PDF yüklə
              </Link>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}