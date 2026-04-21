import Link from "next/link";
import { BrandLockup } from "@/components/brand-lockup";
import { primaryNav, siteConfig } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-canvas/72 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-5 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <Link className="min-w-0 flex items-center" href="/" aria-label={siteConfig.name}>
            <BrandLockup priority size="compact" />
          </Link>
          <nav className="hidden items-center gap-2 rounded-full border border-line/70 bg-white/[0.03] p-1.5 lg:flex">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                className="nav-link rounded-full px-4 py-2 text-sm font-medium"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link className="cta-primary shrink-0 px-4 py-2.5 text-sm sm:px-5 sm:py-3" href="/#upload">
            Upload files
          </Link>
        </div>
        <nav
          aria-label="Mobile navigation"
          className="nav-scroller mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden"
        >
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              className="nav-link shrink-0 rounded-full border border-line/70 bg-white/[0.03] px-4 py-2 text-sm font-medium"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
