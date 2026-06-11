import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand palette (mirrors CSS tokens; ImageResponse can't read CSS vars).
const IVORY = "#FBF7F2";
const CREAM = "#F4EAE0";
const PLUM = "#3C2331";
const ROSE = "#B97E78";
const GOLD = "#B8945A";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(150deg, ${IVORY} 0%, ${CREAM} 55%, #E7C8C2 130%)`,
          fontFamily: "serif",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 70, right: 90, width: 260, height: 260, borderRadius: 999, border: `2px solid ${GOLD}`, opacity: 0.6 }} />
        <div
          style={{
            fontSize: 30,
            letterSpacing: 14,
            textTransform: "uppercase",
            color: ROSE,
            marginBottom: 26,
          }}
        >
          Skin · Beauty · Confidence
        </div>
        <div style={{ fontSize: 132, fontWeight: 600, letterSpacing: 18, color: PLUM, lineHeight: 1 }}>
          AGEFINE
        </div>
        <div style={{ fontSize: 34, color: PLUM, marginTop: 24, opacity: 0.8 }}>
          {SITE.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
