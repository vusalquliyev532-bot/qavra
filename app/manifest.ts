import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Qavra",
    short_name: "Qavra",
    description: "PDF mühazirədən xülasə, sual-cavab, test və fərdi dərs planı.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F4F8F5",
    theme_color: "#059669",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}