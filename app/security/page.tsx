import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Security",
  description:
    "Security and file-handling details for the AuraLaw AI document review workflow.",
};

const securityPrinciples = [
  {
    title: "Temporary upload handling",
    description:
      "Files are written to a temporary working directory during extraction and removed when scanning completes.",
  },
  {
    title: "Reviewable findings",
    description:
      "Each detection returns a label, risk level, excerpt, and estimated page reference before any redaction is applied.",
  },
  {
    title: "User-triggered exports",
    description:
      "Redacted output and audit data are exported only when the user explicitly chooses a download action in the interface.",
  },
];

const deploymentOptions = [
  "Browser upload for supported file types",
  "Server-side text extraction during scan requests",
  "JSON audit export and redacted text export",
  "Temporary processing with no retained document storage by default",
];

export default function SecurityPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="max-w-3xl">
        <p className="eyebrow">Security</p>
        <h1 className="mt-6 font-display text-[2.95rem] leading-[0.96] text-ink sm:text-5xl lg:text-6xl">
          How AuraLaw handles uploaded files.
        </h1>
        <p className="mt-6 text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
          This page explains upload handling, scan output, and export behavior
          for the live document review workflow.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {securityPrinciples.map((item) => (
          <article key={item.title} className="surface-panel p-6">
            <h2 className="text-xl font-semibold text-ink">{item.title}</h2>
            <p className="mt-4 text-sm leading-7 text-ink-soft">
              {item.description}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="surface-panel p-7 sm:p-8">
          <p className="eyebrow">Workflow</p>
          <ul className="mt-6 space-y-4">
            {deploymentOptions.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-7 text-ink-soft">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="surface-panel p-7 sm:p-8">
          <p className="eyebrow">Architecture Notes</p>
          <div className="mt-6 space-y-5 text-sm leading-7 text-ink-soft">
            <p>
              For enterprise deployments, the next security layers typically
              include authentication, access control, OCR for image-based PDFs,
              and managed storage for retained documents.
            </p>
            <p>
              This experience is optimized for direct browser uploads and
              immediate redaction and export workflows.
            </p>
          </div>
        </article>
      </div>

      <div className="mt-12 rounded-[2rem] border border-line/70 bg-deep p-6 text-ink sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-ink-soft">
              Continue
            </p>
            <h2 className="mt-4 font-display text-[2rem] leading-tight sm:text-4xl">
              Return to the upload flow or review privacy and retention.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className="cta-on-dark w-full sm:w-auto" href="/#upload">
              Upload workflow
            </Link>
            <Link className="cta-on-dark w-full sm:w-auto" href="/privacy">
              Privacy page
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
