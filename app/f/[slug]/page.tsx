"use client";
import { Suspense, type ReactNode } from "react";
import { useParams } from "next/navigation";
import FeatureShell from "../../FeatureShell";
import { useDoc } from "../../DocContext";
import { Summary, Ask, Quiz, Plan } from "../../Tools";
import Flashcards from "../../Flashcards";
import Exam from "../../Exam";
import Adaptive from "../../Adaptive";
import Tutor from "../../Tutor";
import Prepare from "../../Prepare";

function FeatureContent() {
  const params = useParams<{ slug: string }>();
  const { text, fileName } = useDoc();

  const pages: Record<string, { title: string; icon: string; needsDoc: boolean; node: ReactNode }> = {
    summary: { title: "Xülasə", icon: "📝", needsDoc: true, node: <Summary text={text} /> },
    ask: { title: "Sual-cavab", icon: "💬", needsDoc: true, node: <Ask text={text} /> },
    quiz: { title: "Test", icon: "✅", needsDoc: true, node: <Quiz text={text} docName={fileName} /> },
    cards: { title: "Yaddaş kartları", icon: "🃏", needsDoc: true, node: <Flashcards text={text} /> },
    exam: { title: "İmtahan simulyatoru", icon: "🎯", needsDoc: true, node: <Exam text={text} docName={fileName} /> },
    adaptive: { title: "Fərdi test", icon: "🧠", needsDoc: true, node: <Adaptive text={text} docName={fileName} /> },
    tutor: { title: "Şəxsi AI müəllim", icon: "🎓", needsDoc: true, node: <Tutor text={text} /> },
    plan: { title: "Dərs planı", icon: "📅", needsDoc: true, node: <Plan text={text} /> },
    prepare: { title: "İmtahana hazırlıq", icon: "📚", needsDoc: false, node: <Prepare /> },
  };

  const f = pages[params.slug];
  if (!f) {
    return (
      <FeatureShell title="Tapılmadı" icon="🤔" needsDoc={false}>
        <div className="rounded-3xl bg-white p-8 text-center text-slate-600 shadow-sm">Belə bölmə yoxdur.</div>
      </FeatureShell>
    );
  }

  return (
    <FeatureShell title={f.title} icon={f.icon} needsDoc={f.needsDoc}>
      {f.node}
    </FeatureShell>
  );
}

export default function FeaturePage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center text-sm text-slate-500">Yüklənir...</div>}
    >
      <FeatureContent />
    </Suspense>
  );
}