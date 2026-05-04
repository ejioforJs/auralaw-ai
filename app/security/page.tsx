import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Security",
  description:
    "How AuraLaw AI handles your uploaded documents — temporary processing, no retained storage, and audit-ready exports.",
};

const securityPrinciples = [
  {
    icon: "🔒",
    title: "Files Are Never Stored",
    description:
      "When you upload a document, it is processed on the server only to extract text and generate scan results. The file is written to temporary storage during extraction and permanently deleted as soon as processing completes. We do not retain, archive, or store your documents.",
  },
  {
    icon: "👁️",
    title: "Transparent Findings",
    description:
      "Every detection is shown to you before any redaction is applied. You can see the exact matched text, its risk level (high / medium / low), what category it belongs to (PII, Clause, Compliance), and which page it was found on. Nothing is hidden or auto-redacted without your review.",
  },
  {
    icon: "📥",
    title: "You Control Every Export",
    description:
      "Redacted documents and audit logs are only generated when you explicitly click a download button. Nothing is sent, saved, or shared automatically. You decide what gets exported, and you receive it directly in your browser.",
  },
  {
    icon: "🌐",
    title: "Browser-Based Processing",
    description:
      "The upload interface runs in your browser. Files are sent over an encrypted HTTPS connection to the scan route, processed, and the results are returned directly to your session. No third parties receive your document data during this workflow.",
  },
  {
    icon: "📋",
    title: "Audit Log Included",
    description:
      "Every scan produces a machine-readable JSON audit log that records what was found, the risk levels, and the document details. This log is available for download and can be retained in your own systems for compliance records.",
  },
  {
    icon: "⚙️",
    title: "Enterprise-Ready Architecture",
    description:
      "The current experience is optimized for direct browser uploads and immediate redaction. Enterprise deployments can add authentication, access control, persistent document storage, OCR for image-based PDFs, and team collaboration features on top of the existing workflow.",
  },
];

const deploymentDetails = [
  "Files are uploaded over HTTPS — encrypted in transit",
  "Text extraction happens server-side using temporary storage only",
  "Temporary files are deleted immediately after scan completion",
  "Scan results are returned to the browser session only — not logged externally",
  "JSON audit exports are generated in-memory and downloaded directly to your device",
  "No user accounts or authentication required for the core review workflow",
  "Redacted output is produced in the browser — you download it directly",
];

export default function SecurityPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="max-w-3xl">
        <p className="eyebrow">Security</p>
        <h1 className="mt-6 text-[2.75rem] font-black leading-[0.96] tracking-[-0.05em] text-ink sm:text-5xl lg:text-6xl">
          How AuraLaw AI handles your documents.
        </h1>
        <p className="mt-6 text-base leading-8 text-ink-soft sm:text-lg sm:leading-9">
          We take document security seriously. This page explains exactly how uploaded files are processed, how findings are generated, and how exports work — so you always know where your data goes.
        </p>
        <p className="mt-4 text-sm leading-7 text-ink-soft">
          <strong className="text-ink">Short version:</strong> Your files are processed temporarily on the server, scan results are returned to your browser, and the files are deleted immediately. We do not retain your documents.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {securityPrinciples.map((item) => (
          <article key={item.title} className="surface-panel p-6 surface-panel-interactive">
            <span className="icon-badge text-2xl">{item.icon}</span>
            <h2 className="mt-5 text-lg font-bold tracking-[-0.02em] text-ink">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-ink-soft">{item.description}</p>
          </article>
        ))}
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <article className="surface-panel p-7 sm:p-8">
          <p className="eyebrow">File Handling Details</p>
          <ul className="mt-6 space-y-3">
            {deploymentDetails.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-7 text-ink-soft">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="surface-panel p-7 sm:p-8">
          <p className="eyebrow">Company Security Commitment</p>
          <div className="mt-6 space-y-5 text-sm leading-7 text-ink-soft">
            <p>
              AuraLaw AI is headquartered at 19, Arobieke Street, Alapere, Lagos, Nigeria, and is committed to building document review tools that organizations can trust with their most sensitive materials.
            </p>
            <p>
              Our scanning workflow is designed around the principle that <strong className="text-ink">you are always in control</strong>. Files are never retained, findings are always shown before redaction, and every export is a deliberate action by you.
            </p>
            <p>
              For enterprise deployments requiring persistent storage, role-based access control, team audit trails, or dedicated infrastructure, please reach out through our{" "}
              <a className="text-accent hover:text-ink" href={siteConfig.company.linkedin} target="_blank" rel="noreferrer">
                LinkedIn company page
              </a>
              .
            </p>
          </div>
        </article>
      </div>

      <div className="mt-12 rounded-[2rem] border border-line/70 bg-deep p-6 text-ink sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-ink-soft">Continue</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
              Ready to review your documents securely?
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              Upload a document and see exactly what Aura-Engine finds — with full visibility into every detection before you redact anything.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className="cta-primary w-full sm:w-auto" href="/#upload">Upload a document</Link>
            <Link className="cta-on-dark w-full sm:w-auto" href="/privacy">Privacy page</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
