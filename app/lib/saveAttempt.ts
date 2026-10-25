import { supabase } from "./supabase";

export type TopicRow = { topic: string; isCorrect: boolean };

export async function saveAttempt(p: {
  docName: string;
  kind: "quiz" | "exam";
  score: number;
  total: number;
  topics: TopicRow[];
}): Promise<boolean> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return false;

  const { data, error } = await supabase
    .from("attempts")
    .insert({
      doc_name: p.docName || "Sənəd",
      kind: p.kind,
      score: p.score,
      total: p.total,
    })
    .select("id")
    .single();
  if (error || !data) return false;

  const rows = p.topics.map((t) => ({
    attempt_id: data.id,
    doc_name: p.docName || "Sənəd",
    topic: t.topic,
    is_correct: t.isCorrect,
  }));
  if (rows.length > 0) {
    const { error: e2 } = await supabase.from("topic_results").insert(rows);
    if (e2) return false;
  }
  return true;
}