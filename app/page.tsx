import Image from "next/image";
import Link from "next/link";
import { BrandLockup } from "@/components/brand-lockup";
import { UploadWorkbench } from "@/components/upload-workbench";
import { siteConfig } from "@/lib/site";

const workflowSteps = [
  {
    step: "01",
    title: "Upload your documents",
    description:
      "Drag in PDFs, DOCX, TXT, CSV, JSON, HTML, or RTF files directly from the browser and review multiple uploads in one run.",
    note: "Everything starts in the same workspace your team exports from.",
  },
  {
    step: "02",
    title: "Aura-Engine scans",
    description:
      "The scanner extracts text, detects common PII, flags sensitive clause language, and surfaces compliance-related references page by page.",
    note: "Every finding includes a risk label, excerpt, and estimated page reference.",
  },
  {
    step: "03",
    title: "Redact, certify, export",
    description:
      "Apply redactions across the reviewed result set, then download a redacted text package and a machine-readable audit log.",
    note: "The export summary stays tied to the exact findings you reviewed.",
  },
];

const heroHighlights = [
  {
    label: "Coverage",
    value: "PII, clauses, compliance",
  },
  {
    label: "Inputs",
    value: "PDF, DOCX, TXT, CSV, JSON, HTML, RTF",
  },
  {
    label: "Outputs",
    value: "Redacted export + audit log",
  },
];

const capabilityCards = [
  {
    title: "Multi-file review",
    description:
      "Queue several related documents in one request and inspect them together from a single result set.",
  },
  {
    title: "Inspectable findings",
    description:
      "Reviewers see exactly what was matched before applying redactions, including excerpts and risk levels.",
  },
  {
    title: "Portable exports",
    description:
      "Download a redacted text package for sharing and a JSON audit log for downstream tooling or records.",
  },
  {
    title: "Temporary processing",
    description:
      "Files are processed server-side for extraction and removed from temporary storage after the scan completes.",
  },
];

const trustPillars = [
  "Text-based PDFs and DOCX files are handled directly from the upload surface.",
  "Results stay transparent: extracted text, findings, and redacted output are all visible in the same flow.",
  "Security and privacy pages outline file handling, exports, and retention clearly.",
];

const faqItems = [
  {
    question: "Which files can I upload right now?",
    answer:
      "AuraLaw supports PDFs, DOCX, TXT, CSV, JSON, HTML, and RTF files from the main upload interface.",
  },
  {
    question: "What does Aura-Engine detect?",
    answer:
      "Aura-Engine checks for common PII patterns, sensitive clause indicators such as indemnity or cross-border transfer language, and compliance references such as NDPR or GDPR.",
  },
  {
    question: "How are files handled during processing?",
    answer:
      "Files are uploaded to the scan route, processed on the server, written to temporary storage only for extraction, and removed after processing completes.",
  },
  {
    question: "Do scanned PDFs work the same as text PDFs?",
    answer:
      "Text-based PDFs work best. Image-only or scanned PDFs should be OCR-processed first so the scanner has usable text to analyze.",
  },
];

const founderProfileItems = [
  {
    label: "Role",
    value: siteConfig.founder.role,
  },
  {
    label: "Founder LinkedIn",
    value: "linkedin.com/in/kevweonosemuode",
    href: siteConfig.founder.linkedin,
  },
];

const companyProfileItems = [
  {
    label: "Company profile",
    value: "LinkedIn company page",
    href: siteConfig.company.linkedin,
  },
  {
    label: "Company address",
    value: siteConfig.company.address,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: siteConfig.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: siteConfig.description,
      url: siteConfig.url,
      creator: {
        "@id": `${siteConfig.url}/#founder`,
      },
      publisher: {
        "@id": `${siteConfig.url}/#company`,
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "AI document scanning and redaction workflow",
      },
    },
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#company`,
      name: siteConfig.name,
      url: siteConfig.url,
      sameAs: [siteConfig.company.linkedin],
      address: {
        "@type": "PostalAddress",
        streetAddress: siteConfig.company.address,
        addressLocality: "Lagos",
        addressCountry: "NG",
      },
      founder: {
        "@id": `${siteConfig.url}/#founder`,
      },
    },
    {
      "@type": "Person",
      "@id": `${siteConfig.url}/#founder`,
      name: siteConfig.founder.name,
      jobTitle: siteConfig.founder.role,
      image: `${siteConfig.url}${siteConfig.founder.image}`,
      url: siteConfig.founder.linkedin,
      sameAs: [siteConfig.founder.linkedin],
      worksFor: {
        "@id": `${siteConfig.url}/#company`,
      },
    },
  ],
};

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-5 font-display text-[2rem] leading-[1.02] tracking-[-0.04em] text-ink sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
        {description}
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section id="upload" className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-6 sm:pt-14 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="grid gap-10 lg:gap-12 xl:grid-cols-[0.96fr_1.04fr] xl:items-start xl:gap-14">
            <div className="max-w-3xl xl:pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                <BrandLockup priority showTagline size="hero" />
                <span className="status-pill self-start sm:self-auto">Live review workflow</span>
              </div>
              <h1 className="mt-7 max-w-4xl font-display text-[2.95rem] leading-[0.92] tracking-[-0.06em] text-ink sm:mt-8 sm:text-[4rem] lg:text-[4.25rem] xl:text-[4.7rem]">
                Private document review with clean uploads, fast scanning, and
                export-ready redactions.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-ink-soft sm:mt-7 sm:text-lg sm:leading-8 xl:text-xl">
                {siteConfig.description}
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link className="cta-primary w-full sm:w-auto" href="/#upload">
                  Start with an upload
                </Link>
                <Link className="cta-secondary w-full sm:w-auto" href="/security">
                  Review security handling
                </Link>
              </div>
              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {heroHighlights.map((item) => (
                  <article key={item.label} className="metric-panel">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-accent">
                      {item.label}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-ink">
                      {item.value}
                    </p>
                  </article>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="hero-radiance" />
              <UploadWorkbench />
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="section-frame border-t border-line/70">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeading
            eyebrow="Workflow"
            title="A tighter three-step path from intake to safe export."
            description="The product keeps the core review flow focused: upload source files, inspect what Aura-Engine found, then generate the redacted package and audit record."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {workflowSteps.map((item) => (
              <article key={item.step} className="surface-panel p-7">
                <div className="flex items-center justify-between gap-3">
                  <span className="step-badge">Step {item.step}</span>
                  <span className="h-px flex-1 bg-line/80" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-ink">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-ink-soft">
                  {item.description}
                </p>
                <p className="mt-6 border-t border-line/70 pt-5 text-sm leading-6 text-ink/85">
                  {item.note}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="workflow"
        className="section-frame border-t border-line/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
            <div>
              <SectionHeading
                eyebrow="Review Surface"
                title="The interface stays readable while the workflow stays transparent."
                description="The upload area, review state, findings, extracted text, and export actions are all available without leaving the primary workbench."
              />
              <div className="mt-12 grid gap-5 sm:grid-cols-2">
                {capabilityCards.map((card) => (
                  <article key={card.title} className="surface-panel p-6">
                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-ink">
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-ink-soft">
                      {card.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="surface-panel flex h-full flex-col justify-between p-6 sm:p-8">
              <div>
                <p className="eyebrow">Operational Clarity</p>
                <h3 className="mt-5 font-display text-[2rem] leading-[1.04] tracking-[-0.04em] text-ink sm:text-4xl">
                  Clean review output is only useful when the handling model is
                  easy to inspect.
                </h3>
                <div className="mt-8 space-y-4">
                  {trustPillars.map((item) => (
                    <div
                      key={item}
                      className="rounded-[1.45rem] border border-line/70 bg-white/[0.04] px-5 py-4"
                    >
                      <p className="text-sm leading-7 text-ink-soft">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="cta-on-dark w-full sm:w-auto" href="/security">
                  Security details
                </Link>
                <Link className="cta-secondary w-full sm:w-auto" href="/privacy">
                  Privacy details
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="founder" className="section-frame border-t border-line/70">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <article className="surface-panel p-5 sm:p-6">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[1.7rem] border border-line/70 bg-deep-soft/80">
                <Image
                  alt={siteConfig.founder.name}
                  className="object-cover"
                  fill
                  sizes="(max-width: 1279px) 100vw, 32vw"
                  src={siteConfig.founder.image}
                />
              </div>
              <div className="mt-6">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
                  Founder
                </p>
                <h3 className="mt-3 font-display text-3xl leading-tight tracking-[-0.04em] text-ink">
                  {siteConfig.founder.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-ink-soft">
                  {siteConfig.founder.role} of {siteConfig.name}
                </p>
              </div>
            </article>

            <div>
              <SectionHeading
                eyebrow="Founder & Company"
                title="The platform is led by Oghenekevwe Onosemuode and anchored in Lagos."
                description="Leadership, company profile, and location at a glance."
              />
              <div className="mt-12 grid gap-5 xl:grid-cols-2">
                <article className="surface-panel p-6">
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
                    Founder profile
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-ink">
                    {siteConfig.founder.name}
                  </h3>
                  <div className="mt-6 space-y-4">
                    {founderProfileItems.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[1.3rem] border border-line/70 bg-white/[0.03] px-5 py-4"
                      >
                        <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-ink-soft">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            className="mt-3 inline-flex break-all text-sm font-medium text-accent hover:text-ink"
                            href={item.href}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="mt-3 text-sm leading-7 text-ink">
                            {item.value}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </article>

                <article className="surface-panel p-6">
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
                    Company details
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-ink">
                    {siteConfig.name}
                  </h3>
                  <div className="mt-6 space-y-4">
                    {companyProfileItems.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[1.3rem] border border-line/70 bg-white/[0.03] px-5 py-4"
                      >
                        <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-ink-soft">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            className="mt-3 inline-flex break-all text-sm font-medium text-accent hover:text-ink"
                            href={item.href}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="mt-3 text-sm leading-7 text-ink">
                            {item.value}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="section-frame border-t border-line/70">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeading
            eyebrow="FAQ"
            title="Answers about uploads, scanning, and exports."
            description="Everything here reflects the workflow available on the site."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {faqItems.map((item) => (
              <article key={item.question} className="surface-panel p-6">
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-ink">
                  {item.question}
                </h3>
                <p className="mt-4 text-sm leading-7 text-ink-soft">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
