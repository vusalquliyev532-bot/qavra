import type { Metadata, Viewport } from "next";
import "./globals.css";
import ApiAuth from "./ApiAuth";
import DocProvider from "./DocContext";

export const metadata: Metadata = {
  title: "Qavra: mühazirələri daha tez öyrən",
  description: "PDF mühazirədən xülasə, sual-cavab, test və fərdi dərs planı.",
  appleWebApp: { capable: true, title: "Qavra" },
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <body className="antialiased">
        <ApiAuth />
        <DocProvider>{children}</DocProvider>
      </body>
    </html>
  );
}