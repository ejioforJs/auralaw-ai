import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default async function AppleIcon() {
  const logo = await readFile(join(process.cwd(), "public", "auralaw-mark.png"));
  const logoDataUri = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 50% 18%, rgba(28,228,211,0.12), transparent 24%), linear-gradient(180deg, rgba(7,17,29,1) 0%, rgba(8,20,32,1) 100%)",
        }}
      >
        <img
          alt="AuraLaw AI apple icon"
          height={154}
          src={logoDataUri}
          style={{
            borderRadius: "38px",
            boxShadow: "0 0 18px rgba(28,228,211,0.12)",
          }}
          width={154}
        />
      </div>
    ),
    size,
  );
}
