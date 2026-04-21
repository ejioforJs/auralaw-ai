import Link from "next/link";
import { BrandLockup } from "@/components/brand-lockup";
import { footerLinks, siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-6 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div className="max-w-2xl">
          <BrandLockup showTagline size="footer" />
          <p className="mt-5 max-w-xl text-base leading-7 text-ink-soft sm:mt-6 sm:text-lg sm:leading-8">
            Upload supported files, scan for legal risk, and download redacted
            output with a matching audit record.
          </p>
        </div>
        <div className="grid gap-3 rounded-[1.6rem] border border-line/70 bg-white/[0.03] p-5 sm:grid-cols-2 sm:p-6">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              className="nav-link rounded-2xl border border-transparent px-4 py-3 text-sm font-medium hover:border-line/80 hover:bg-white/[0.04]"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-line/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-sm text-ink-soft sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2026 {siteConfig.name}. Document scanning and redaction workflow.</p>
          <p>{siteConfig.url.replace(/^https?:\/\//, "")}</p>
        </div>
      </div>
    </footer>
  );
}
