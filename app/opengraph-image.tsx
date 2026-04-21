import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = siteConfig.ogAlt;

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public", "auralaw-mark.png"));
  const logoDataUri = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background:
            "radial-gradient(circle at 18% 14%, rgba(28,228,211,0.14), transparent 22%), radial-gradient(circle at 86% 18%, rgba(35,126,179,0.16), transparent 24%), linear-gradient(180deg, rgba(7,17,29,1) 0%, rgba(8,20,32,1) 100%)",
          color: "#f5fbff",
          padding: "52px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Avenir Next, Segoe UI, Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "38px",
            borderRadius: "40px",
            border: "1px solid rgba(28,228,211,0.12)",
            background:
              "linear-gradient(180deg, rgba(11,23,39,0.92), rgba(8,17,29,0.86))",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-84px",
            right: "-36px",
            width: "340px",
            height: "340px",
            borderRadius: "999px",
            background: "rgba(28,228,211,0.16)",
            filter: "blur(24px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-92px",
            left: "44px",
            width: "300px",
            height: "300px",
            borderRadius: "999px",
            background: "rgba(35,126,179,0.14)",
            filter: "blur(24px)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <img
                alt={`${siteConfig.name} logo`}
                height={108}
                src={logoDataUri}
                style={{
                  borderRadius: "26px",
                  boxShadow: "0 0 36px rgba(28,228,211,0.12)",
                }}
                width={108}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "12px",
                    fontFamily: "Georgia, serif",
                    fontSize: "42px",
                    letterSpacing: "-0.06em",
                    lineHeight: 1,
                  }}
                >
                  <span>AuraLaw</span>
                  <span style={{ color: "#1ce4d3" }}>AI</span>
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "#9db0c2",
                  }}
                >
                  {siteConfig.tagline}
                </div>
              </div>
            </div>
            <div
              style={{
                borderRadius: "999px",
                border: "1px solid rgba(28,228,211,0.14)",
                background: "rgba(28,228,211,0.08)",
                padding: "12px 18px",
                fontSize: "14px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#f5fbff",
              }}
            >
              Live workflow
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "22px",
              maxWidth: "860px",
            }}
          >
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "80px",
                lineHeight: 0.96,
                letterSpacing: "-0.07em",
              }}
            >
              Upload, scan, redact, and export from one privacy-first review
              flow.
            </div>
            <div
              style={{
                fontSize: "30px",
                lineHeight: 1.45,
                color: "#93a6ba",
              }}
            >
              AuraLaw AI flags PII, sensitive clauses, and compliance
              references, then generates redacted output and a matching audit
              record.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "14px",
            }}
          >
            {["Upload documents", "Review findings", "Export safely"].map(
              (item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "999px",
                    border: "1px solid rgba(28,228,211,0.14)",
                    background: "rgba(7,18,30,0.86)",
                    padding: "14px 22px",
                    fontSize: "19px",
                    color: "#dce8f0",
                  }}
                >
                  {item}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
