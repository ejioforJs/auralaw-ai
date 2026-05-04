import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Privacy policy and data handling details for AuraLaw AI — how we process uploaded documents, what we retain, and your rights.",
};

const privacySections = [
  {
    icon: "📄",
    title: "What We Process",
    body: "AuraLaw AI processes documents you upload through the browser interface. Supported formats include PDF, DOCX, TXT, CSV, JSON, HTML, and RTF files. The content of these documents is read server-side to extract text, run pattern-based scanning, and return findings to your browser session.",
  },
  {
    icon: "⏱️",
    title: "Temporary Processing Only",
    body: "Uploaded files are handled on a temporary basis only. They are written to temporary server storage during the text extraction phase and permanently deleted as soon as the scan completes. We do not archive, index, or retain copies of your uploaded documents at any point.",
  },
  {
    icon: "🚫",
    title: "No Persistent Document Storage",
    body: "We do not store your documents in a database. We do not back up your files. We do not use your document content for training AI models or for any purpose other than returning the scan results of your current session.",
  },
  {
    icon: "📊",
    title: "Scan Results",
    body: "The findings generated from your scan (risk levels, excerpts, page references) are returned to your browser for the duration of your session. They are not saved server-side, not linked to a user account, and not retained after your browser session ends.",
  },
  {
    icon: "📦",
    title: "Exports Are Yours Alone",
    body: "When you download a redacted document or a JSON audit log, that file is generated in your browser session and downloaded directly to your device. We do not receive, store, or have access to the exported files after they are downloaded.",
  },
  {
    icon: "🏢",
    title: "Enterprise & Compliance Deployments",
    body: "If your organization requires persistent document storage, team audit trails, access-controlled retention policies, or NDPR/GDPR-compliant data processing agreements, these can be added as part of an enterprise deployment. Contact us via our LinkedIn company page for details.",
  },
];

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="max-w-3xl">
        <p className="eyebrow">Privacy</p>
        <h1 className="mt-6 text-[2.75rem] font-black leading-[0.96] tracking-[-0.05em] text-ink sm:text-5xl lg:text-6xl">
          How we handle your documents and data.
        </h1>
        <p className="mt-6 text-base leading-8 text-ink-soft sm:text-lg sm:leading-9">
          AuraLaw AI is built on a simple privacy principle: your documents are yours. We process them temporarily to generate scan results and then delete them. Here is exactly how that works.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {privacySections.map((section) => (
          <article key={section.title} className="surface-panel p-6 surface-panel-interactive">
            <span className="icon-badge text-2xl">{section.icon}</span>
            <h2 className="mt-5 text-lg font-bold tracking-[-0.02em] text-ink">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-ink-soft">{section.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-12 surface-panel p-7 sm:p-8">
        <p className="eyebrow">Regulatory Alignment</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-lg font-bold text-ink">Nigeria Data Protection Regulation (NDPR)</h3>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              AuraLaw AI is built in Nigeria and is designed with NDPR principles in mind — including data minimization (we only collect what is needed for the scan), purpose limitation (your document is only used for the scan you requested), and storage limitation (files are deleted immediately after processing).
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink">GDPR and Cross-Border Compliance</h3>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              For organizations operating across jurisdictions — including those subject to GDPR, POPIA, or CCPA — AuraLaw AI&apos;s temporary processing model means your document data is not retained or transferred across borders after the scan completes. Enterprise deployments can include formal Data Processing Agreements (DPAs).
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[2rem] border border-line/70 bg-deep p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-ink-soft">Data Controller</p>
            <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{siteConfig.name}</h2>
            <p className="mt-2 text-sm leading-7 text-ink-soft">{siteConfig.company.address}</p>
            <a className="mt-3 inline-flex text-sm font-medium text-accent hover:text-ink" href={siteConfig.company.linkedin} target="_blank" rel="noreferrer">
              Contact us on LinkedIn →
            </a>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className="cta-primary w-full sm:w-auto" href="/">Return to homepage</Link>
            <Link className="cta-secondary w-full sm:w-auto" href="/security">Security page</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
