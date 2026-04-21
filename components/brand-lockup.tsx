import Image from "next/image";
import { siteConfig } from "@/lib/site";

type BrandLockupProps = {
  priority?: boolean;
  showTagline?: boolean;
  size?: "compact" | "hero" | "footer";
};

const markSizes = {
  compact: "h-11 w-11 rounded-[1rem]",
  hero: "h-16 w-16 rounded-[1.35rem] sm:h-[4.5rem] sm:w-[4.5rem]",
  footer: "h-12 w-12 rounded-[1.05rem]",
};

const titleSizes = {
  compact: "text-xl sm:text-[1.65rem]",
  hero: "text-[2rem] sm:text-[2.45rem]",
  footer: "text-[1.7rem] sm:text-[2rem]",
};

const taglineSizes = {
  compact: "text-[0.62rem] tracking-[0.3em]",
  hero: "text-[0.68rem] tracking-[0.34em]",
  footer: "text-[0.65rem] tracking-[0.32em]",
};

export function BrandLockup({
  priority = false,
  showTagline = false,
  size = "compact",
}: BrandLockupProps) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="brand-mark-frame">
        <Image
          alt={`${siteConfig.name} logo`}
          className={`${markSizes[size]} relative z-10 object-cover`}
          height={500}
          priority={priority}
          src="/auralaw-mark.png"
          width={500}
        />
      </div>
      <div className="min-w-0">
        <div
          className={`${titleSizes[size]} flex items-baseline gap-2 font-display leading-none tracking-[-0.05em] text-ink`}
        >
          <span>{siteConfig.shortName}</span>
          <span className="text-accent">AI</span>
        </div>
        {showTagline ? (
          <p
            className={`${taglineSizes[size]} mt-1.5 font-mono uppercase text-ink-soft`}
          >
            {siteConfig.tagline}
          </p>
        ) : null}
      </div>
    </div>
  );
}
