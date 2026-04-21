import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Privacy details for how the current AuraLaw AI build processes uploaded files.",
};

const privacySections = [
  {
    title: "What is processed",
    body: "The current build processes supported uploads such as PDF, DOCX, TXT, CSV, JSON, HTML, and RTF files submitted through the browser.",
  },
  {
    title: "How files are handled",
    body: "Uploaded files are processed server-side for text extraction and scan results are returned in the response to the user interface.",
  },
  {
    title: "What is retained",
    body: "This repository does not persist uploaded documents to a database. Temporary files created for extraction are removed after processing completes.",
  },
];

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="max-w-3xl">
        <p className="eyebrow">Privacy</p>
        <h1 className="mt-6 font-display text-[2.95rem] leading-[0.96] text-ink sm:text-5xl lg:text-6xl">
          Privacy details for the current upload flow.
        </h1>
        <p className="mt-6 text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
          This page describes what the application does with uploaded files in
          its current implementation.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {privacySections.map((section) => (
          <article key={section.title} className="surface-panel p-6">
            <h2 className="text-xl font-semibold text-ink">{section.title}</h2>
            <p className="mt-4 text-sm leading-7 text-ink-soft">
              {section.body}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-12 surface-panel p-7 sm:p-8">
        <p className="eyebrow">Exports</p>
        <div className="mt-6 space-y-5 text-sm leading-7 text-ink-soft">
          <p>
            Redacted output and audit data are generated for download in the
            browser after a successful scan. The exported files reflect the
            current result set shown in the interface.
          </p>
          <p>
            If you need persistent retention, access logging, or policy-driven
            storage controls, those should be added as part of a wider
            deployment architecture.
          </p>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-4 sm:flex-row">
        <Link className="cta-primary w-full sm:w-auto" href="/">
          Return to the homepage
        </Link>
        <Link className="cta-secondary w-full sm:w-auto" href="/security">
          Read the security page
        </Link>
      </div>
    </section>
  );
}
