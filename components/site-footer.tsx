import Link from "next/link";
import { BrandLockup } from "@/components/brand-lockup";
import { footerLinks, siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line/70">
      <div className="mx-auto max-w-7xl px-5 pt-14 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr_1fr]">

          {/* Brand + about */}
          <div className="max-w-md">
            <BrandLockup showTagline size="footer" />
            <p className="mt-5 text-sm leading-7 text-ink-soft">
              AuraLaw AI is a browser-based legal document review platform that automatically detects personal information, sensitive legal clauses, and compliance references — then generates redacted output and audit-ready exports.
            </p>
            <p className="mt-4 text-sm leading-7 text-ink-soft">
              Headquartered in Lagos, Nigeria. Built for organizations navigating NDPR, GDPR, and cross-jurisdiction compliance.
            </p>
            <div className="mt-5 space-y-1 text-sm text-ink-soft">
              <p className="font-semibold text-ink">{siteConfig.name}</p>
              <p>{siteConfig.company.address}</p>
              <a className="text-accent hover:text-ink" href={siteConfig.company.linkedin} target="_blank" rel="noreferrer">
                LinkedIn Company Page →
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Navigation</p>
            <div className="mt-4 flex flex-col gap-2">
              {footerLinks.map((item) => (
                <Link
                  key={item.href}
                  className="nav-link text-sm hover:translate-x-1 transition-transform"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Founder */}
          <div className="rounded-[1.6rem] border border-line/70 bg-white/[0.025] p-5">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Founder</p>
            <p className="mt-4 text-base font-bold text-ink">{siteConfig.founder.name}</p>
            <p className="mt-1 text-sm text-ink-soft">{siteConfig.founder.role}, {siteConfig.name}</p>
            <p className="mt-3 text-xs leading-6 text-ink-soft">{siteConfig.founder.education}</p>
            <a
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-ink"
              href={siteConfig.founder.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn profile →
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-line/70 pt-6 flex flex-col gap-2 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved. Legal document scanning and redaction workflow.</p>
          <div className="flex gap-4">
            <Link className="hover:text-ink" href="/security">Security</Link>
            <Link className="hover:text-ink" href="/privacy">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
