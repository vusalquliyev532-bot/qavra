import { ImageResponse } from "next/og";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#059669",
          color: "#ffffff",
          fontSize: 118,
          fontWeight: 700,
        }}
      >
        Q
      </div>
    ),
    { width: 192, height: 192 }
  );
}