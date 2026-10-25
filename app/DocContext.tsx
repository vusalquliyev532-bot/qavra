"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Script from "next/script";

const MAX_PAGES = 30;
const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174";

type Doc = {
  fileName: string;
  pages: number;
  text: string;
  message: string;
  isError: boolean;
  loadFile: (file: File) => Promise<void>;
};

const Ctx = createContext<Doc | null>(null);

export function useDoc() {
  const c = useContext(Ctx);
  if (!c) throw new Error("DocProvider tapılmadı");
  return c;
}

export default function DocProvider({ children }: { children: ReactNode }) {
  const [fileName, setFileName] = useState("");
  const [pages, setPages] = useState(0);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("qavra:doc");
      if (raw) {
        const d = JSON.parse(raw);
        if (d.text) {
          setFileName(d.fileName || "");
          setPages(d.pages || 0);
          setText(d.text);
          setMessage(`${d.pages} səhifə oxundu ✓`);
        }
      }
    } catch {}
  }, []);

  async function loadFile(file: File) {
    setText("");
    setPages(0);
    setIsError(false);
    setFileName(file.name);
    setMessage("PDF oxunur...");
    try {
      sessionStorage.removeItem("qavra:doc");
    } catch {}

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lib = (window as any).pdfjsLib;
      if (!lib) {
        setIsError(true);
        setMessage("Kitabxana hələ yüklənməyib. Bir neçə saniyə sonra yenidən seç.");
        return;
      }
      lib.GlobalWorkerOptions.workerSrc = `${PDFJS}/pdf.worker.min.js`;

      const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
      setPages(pdf.numPages);

      if (pdf.numPages > MAX_PAGES) {
        setIsError(true);
        setMessage(`Bu PDF ${pdf.numPages} səhifədir. Maksimum limit ${MAX_PAGES} səhifədir.`);
        return;
      }

      const parts: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parts.push("[Səhifə " + i + "] " + content.items.map((it: any) => it.str).join(" "));
      }
      const all = parts.join("\n\n").trim();

      if (all.length < 50) {
        setIsError(true);
        setMessage("Bu PDF-dən mətn çıxmadı (skan olunmuş şəkil ola bilər). Mətnli PDF yoxlayın.");
        return;
      }

      setText(all);
      setMessage(`${pdf.numPages} səhifə oxundu ✓`);
      try {
        sessionStorage.setItem(
          "qavra:doc",
          JSON.stringify({ fileName: file.name, pages: pdf.numPages, text: all })
        );
      } catch {}
    } catch {
      setIsError(true);
      setMessage("PDF oxuna bilmədi. Başqa fayl yoxlayın.");
    }
  }

  return (
    <Ctx.Provider value={{ fileName, pages, text, message, isError, loadFile }}>
      <Script src={`${PDFJS}/pdf.min.js`} strategy="afterInteractive" />
      {children}
    </Ctx.Provider>
  );
}