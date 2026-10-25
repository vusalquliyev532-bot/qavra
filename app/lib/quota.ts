import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function checkQuota(
  req: Request
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) {
    return { ok: false, status: 401, error: "Davam etmək üçün daxil ol." };
  }

  const supa = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supa.rpc("consume_quota");
  if (error || !data) {
    return { ok: false, status: 401, error: "Sessiya bitib. Yenidən daxil ol." };
  }
  if (!data.allowed) {
    if (data.reason === "auth") {
      return { ok: false, status: 401, error: "Davam etmək üçün daxil ol." };
    }
    return {
      ok: false,
      status: 429,
      error: `Bu gün üçün ${data.limit} sorğu limiti bitdi. Sabah yenilənəcək.`,
    };
  }
  return { ok: true };
}