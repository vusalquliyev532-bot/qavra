"use client";
import { useEffect } from "react";
import { supabase } from "./lib/supabase";

export default function ApiAuth() {
  useEffect(() => {
    const original = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string" ? input : input instanceof URL ? input.pathname : input.url;
      if (url.startsWith("/api/")) {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (token) {
          const headers = new Headers(init?.headers);
          headers.set("Authorization", `Bearer ${token}`);
          return original(input, { ...init, headers });
        }
      }
      return original(input, init);
    };
    return () => {
      window.fetch = original;
    };
  }, []);
  return null;
}