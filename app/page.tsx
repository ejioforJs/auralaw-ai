import Image from "next/image";
import Link from "next/link";
import { BrandLockup } from "@/components/brand-lockup";
import { UploadWorkbench } from "@/components/upload-workbench";
import { siteConfig } from "@/lib/site";

/* ── static data ── */

const detectionCategories = [
  {
    icon: "🔍",
    title: "Personal Information (PII)",
    plain: "Private details that identify a real person",
    description:
      "AuraLaw automatically finds names, email addresses, phone numbers, bank account numbers, BVN, NIN, passport references, and other personal identifiers hidden inside your documents.",
    examples: ["Email addresses", "Phone numbers", "Bank account numbers", "BVN / NIN / Passport refs"],
    risk: "High",
  },
  {
    icon: "📋",
    title: "Sensitive Legal Clauses",
    plain: "Contract language that carries legal or financial risk",
    description:
      "The scanner flags indemnity clauses, liability limitations, confidentiality agreements, cross-border data transfer clauses, and governing law provisions — the sections lawyers charge the most to review.",
    examples: ["Indemnity & hold harmless", "Liability caps", "NDAs & confidentiality", "Cross-border transfers"],
    risk: "Medium–High",
  },
  {
    icon: "⚖️",
    title: "Compliance References",
    plain: "Mentions of laws and regulations your document must follow",
    description:
      "AuraLaw surfaces references to NDPR, GDPR, AML/KYC obligations, anti-bribery laws, data retention policies, and consent requirements — giving compliance teams a head start on any review.",
    examples: ["NDPR / GDPR", "AML & KYC rules", "Anti-bribery (FCPA)", "Data retention & consent"],
    risk: "High",
  },
];

const workflowSteps = [
  {
    step: "01",
    icon: "📤",
    title: "Upload Your Documents",
    plain: "Drag in any file — it takes seconds",
    description:
      "Drop in PDFs, Word documents (DOCX), plain text files, CSVs, JSON, HTML, or RTF files directly in your browser. You can upload multiple documents at once and review them all in a single run. No software to install — it works right here on this page.",
    note: "Supported: PDF · DOCX · TXT · CSV · JSON · HTML · RTF",
  },
  {
    step: "02",
    icon: "🤖",
    title: "Aura-Engine Scans Automatically",
    plain: "The AI reads and flags sensitive content for you",
    description:
      "Once uploaded, our Aura-Engine reads every page of your document and automatically highlights personal information, risky legal language, and compliance references. Each finding shows you the exact text, the risk level, and which page it appears on — so nothing is hidden.",
    note: "Results include: risk level · exact excerpt · page reference",
  },
  {
    step: "03",
    icon: "✅",
    title: "Review, Redact & Export",
    plain: "Remove sensitive content and download a clean, safe copy",
    description:
      "After reviewing what was found, you can redact all findings with one click — replacing sensitive text with [REDACTED] markers. Then download two files: a clean redacted document ready for sharing, and a JSON audit log documenting every finding for your records.",
    note: "Exports: Redacted document · JSON audit log",
  },
];

const useCases = [
  {
    icon: "🏛️",
    title: "Law Firms",
    description:
      "Review client contracts and agreements before filing or sharing. Catch indemnity clauses, liability caps, and PII before they become problems.",
  },
  {
    icon: "🏢",
    title: "Compliance Teams",
    description:
      "Audit internal documents and vendor agreements for NDPR, GDPR, and AML compliance references. Generate audit logs for regulatory reviews.",
  },
  {
    icon: "👥",
    title: "HR Departments",
    description:
      "Process employment contracts and staff records safely. Redact personal employee data before sharing documents externally.",
  },
  {
    icon: "🚀",
    title: "Startups & SMEs",
    description:
      "Get enterprise-level document review without the enterprise budget. Upload investor agreements, NDAs, and client contracts for instant analysis.",
  },
];

const faqItems = [
  {
    question: "What is AuraLaw AI?",
    answer:
      "AuraLaw AI is a browser-based legal document review platform built in Lagos, Nigeria. It automatically scans your documents to find personal information (PII), sensitive legal clauses, and compliance references — then helps you redact them and export a clean, audit-ready version.",
  },
  {
    question: "Who built AuraLaw AI?",
    answer:
      "AuraLaw AI was founded by Gift (Oghenekevwe) Onosemuode, a People Operations specialist with over 5 years of experience in administrative systems and compliance workflows. She built AuraLaw to solve the manual document review problem she witnessed in organizations firsthand.",
  },
  {
    question: "Do I need to install any software?",
    answer:
      "No. AuraLaw AI runs entirely in your browser. Just visit the site, upload your documents, and the scan runs instantly — no downloads, no accounts required to try it.",
  },
  {
    question: "Which files can I upload?",
    answer:
      "AuraLaw supports PDF, DOCX, TXT, CSV, JSON, HTML, and RTF files. Text-based PDFs work best. If you have a scanned (image) PDF, run OCR on it first so the scanner has readable text to analyze.",
  },
  {
    question: "What does AuraLaw detect?",
    answer:
      "Aura-Engine checks for common PII (emails, phone numbers, IDs, bank numbers), sensitive clause language (indemnity, confidentiality, cross-border transfer), and compliance references (NDPR, GDPR, AML/KYC, anti-bribery, data retention, consent).",
  },
  {
    question: "How are my files handled?",
    answer:
      "Files are uploaded to our server only for the duration of the scan, processed to extract text and generate findings, and then removed from temporary storage once the scan completes. We do not retain or store your documents.",
  },
  {
    question: "Is AuraLaw free to use?",
    answer:
      "The current live workflow on this site is available to use. For enterprise deployments with persistent storage, access control, and OCR capabilities, contact us via our LinkedIn page.",
  },
  {
    question: "Where is AuraLaw AI based?",
    answer:
      "AuraLaw AI is headquartered at 19, Arobieke Street, Alapere, Lagos, Nigeria. The platform is built to serve organizations across Nigeria and Africa navigating NDPR and cross-jurisdiction compliance requirements.",
  },
];

const heroHighlights = [
  { label: "Detection Coverage", value: "PII · Clauses · Compliance" },
  { label: "Supported Formats", value: "PDF · DOCX · TXT · CSV · JSON · RTF" },
  { label: "Export Outputs", value: "Redacted doc + Audit log" },
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
      creator: { "@id": `${siteConfig.url}/#founder` },
      publisher: { "@id": `${siteConfig.url}/#company` },
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#company`,
      name: siteConfig.name,
      url: siteConfig.url,
      sameAs: [siteConfig.company.linkedin],
      foundingDate: siteConfig.company.founded,
      description: siteConfig.company.about,
      address: {
        "@type": "PostalAddress",
        streetAddress: "19, Arobieke Street, Alapere",
        addressLocality: "Lagos",
        addressCountry: "NG",
      },
      founder: { "@id": `${siteConfig.url}/#founder` },
    },
    {
      "@type": "Person",
      "@id": `${siteConfig.url}/#founder`,
      name: siteConfig.founder.name,
      jobTitle: siteConfig.founder.role,
      image: `${siteConfig.url}${siteConfig.founder.image}`,
      url: siteConfig.founder.linkedin,
      sameAs: [siteConfig.founder.linkedin],
      worksFor: { "@id": `${siteConfig.url}/#company` },
      alumniOf: "University of Nigeria, Nsukka",
    },
  ],
};

/* ── helpers ── */

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-5 text-[2rem] font-bold leading-[1.08] tracking-[-0.04em] text-ink sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-8 text-ink-soft sm:text-lg sm:leading-9">{description}</p>
    </div>
  );
}

/* ── page ── */

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── HERO ── */}
      <section id="upload" className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-6 sm:pt-14 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="grid gap-10 lg:gap-12 xl:grid-cols-[0.96fr_1.04fr] xl:items-start xl:gap-14">
            <div className="max-w-3xl xl:pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                <BrandLockup priority showTagline size="hero" />
                <span className="status-pill self-start sm:self-auto">Live review workflow</span>
              </div>
              <h1 className="mt-7 max-w-4xl text-[2.75rem] font-black leading-[0.95] tracking-[-0.05em] text-ink sm:mt-8 sm:text-[3.75rem] lg:text-[4.25rem]">
                Protect sensitive information in your legal documents —{" "}
                <span className="text-accent">automatically.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-ink-soft sm:mt-7 sm:text-lg sm:leading-9">
                Upload any contract, agreement, or compliance document. AuraLaw AI scans it instantly, flags personal data, risky clauses, and compliance issues, then generates a clean redacted copy with a full audit log.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link className="cta-primary w-full sm:w-auto" href="/#upload">
                  Start with an upload — it&apos;s free
                </Link>
                <Link className="cta-secondary w-full sm:w-auto" href="/#product">
                  See how it works
                </Link>
              </div>
              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {heroHighlights.map((item) => (
                  <article key={item.label} className="metric-panel">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-accent">{item.label}</p>
                    <p className="mt-3 text-sm leading-6 text-ink">{item.value}</p>
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

      {/* ── WHAT IS AURALAW ── */}
      <section id="product" className="section-divider section-glow">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="What is AuraLaw AI?"
                title="Document review that anyone can use — not just lawyers."
                description="Most organizations review legal documents manually — reading through pages of contracts line by line, hoping nothing is missed. AuraLaw AI changes that."
              />
              <div className="mt-8 space-y-4">
                {[
                  "Upload a document and get scan results in under 30 seconds",
                  "No legal training required — findings are explained in plain English",
                  "Works for contracts, HR records, NDAs, compliance documents, and more",
                  "Export a redacted version that's safe to share externally",
                  "Download a JSON audit log for your compliance records",
                ].map((item) => (
                  <div key={item} className="feature-check-item">
                    <span className="feature-check-icon">✓</span>
                    <p className="text-sm leading-7 text-ink-soft">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-7 sm:p-8">
              <p className="eyebrow">The Problem We Solve</p>
              <h3 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-ink sm:text-3xl">
                Manual document review is slow, expensive, and easy to get wrong.
              </h3>
              <div className="mt-6 space-y-4 text-sm leading-7 text-ink-soft">
                <p>
                  A single legal contract can contain dozens of risk factors — personal data scattered across pages, liability clauses buried in footnotes, compliance references that require specialist knowledge to spot.
                </p>
                <p>
                  Hiring lawyers for every document review is expensive. Doing it in-house without the right tools means things get missed. AuraLaw AI gives every team the scanning capability of a specialist — instantly, in the browser, at a fraction of the cost.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[["30s", "Avg scan time"], ["3", "Detection types"], ["7+", "File formats"]].map(([val, label]) => (
                  <div key={label} className="rounded-[1.2rem] border border-line/70 bg-white/[0.03] p-4 text-center">
                    <p className="text-2xl font-black text-accent">{val}</p>
                    <p className="mt-1 text-xs text-ink-soft">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT DOES AURALAW DETECT ── */}
      <section id="how-it-works" className="section-divider">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeading
            eyebrow="What Does AuraLaw Detect?"
            title="Three categories of risk, automatically surfaced."
            description="You don't need to know what to look for. Aura-Engine checks for everything — personal data, legal risk, and regulatory compliance — and explains every finding in plain language."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {detectionCategories.map((cat) => (
              <article key={cat.title} className="glass-card p-6 surface-panel-interactive">
                <div className="flex items-start gap-4">
                  <span className="icon-badge icon-badge-lg">{cat.icon}</span>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-[0.24em] text-ink-soft">{cat.plain}</p>
                    <h3 className="mt-1 text-xl font-bold tracking-[-0.02em] text-ink">{cat.title}</h3>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7 text-ink-soft">{cat.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {cat.examples.map((ex) => (
                    <span key={ex} className="chip px-3 py-1.5 text-xs text-ink-soft">{ex}</span>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-line/60 pt-4">
                  <p className="text-xs font-mono uppercase tracking-[0.22em] text-ink-soft">Risk level</p>
                  <span className="rounded-full border border-line/70 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">{cat.risk}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKFLOW ── */}
      <section className="section-divider section-glow">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeading
            eyebrow="How It Works"
            title="Three simple steps from upload to safe export."
            description="You don't need technical skills or a legal background. If you can drag a file and click a button, you can use AuraLaw AI."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {workflowSteps.map((item) => (
              <article key={item.step} className="surface-panel p-7">
                <div className="flex items-center gap-3">
                  <span className="step-number">{item.step}</span>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="mt-5 text-xl font-bold tracking-[-0.02em] text-ink">{item.title}</h3>
                <p className="mt-1 text-xs font-mono uppercase tracking-[0.22em] text-accent">{item.plain}</p>
                <p className="mt-4 text-sm leading-7 text-ink-soft">{item.description}</p>
                <p className="mt-5 border-t border-line/60 pt-4 text-xs leading-6 text-ink/70">{item.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO USES AURALAW ── */}
      <section className="section-divider">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeading
            eyebrow="Who Uses AuraLaw?"
            title="Built for anyone who handles sensitive documents."
            description="From solo founders reviewing their first NDA to compliance teams auditing hundreds of documents — AuraLaw AI scales to every use case."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {useCases.map((item) => (
              <article key={item.title} className="glass-card p-6 surface-panel-interactive">
                <span className="icon-badge text-2xl">{item.icon}</span>
                <h3 className="mt-4 text-lg font-bold tracking-[-0.02em] text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink-soft">{item.description}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Link className="cta-primary px-8" href="/#upload">
              Try it now — upload a document
            </Link>
          </div>
        </div>
      </section>

      {/* ── ABOUT THE COMPANY ── */}
      <section id="about" className="section-divider section-glow">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="About AuraLaw AI"
                title="A Lagos-based legal technology company on a mission."
                description={siteConfig.company.mission}
              />
              <div className="mt-8 space-y-4 text-sm leading-7 text-ink-soft">
                <p>{siteConfig.company.about}</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  ["Founded", siteConfig.company.founded],
                  ["Headquarters", "Lagos, Nigeria"],
                  ["Primary Market", "Africa & Global"],
                  ["Regulation Focus", "NDPR · GDPR · AML"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[1.3rem] border border-line/70 bg-white/[0.03] px-4 py-3">
                    <p className="text-[0.68rem] font-mono uppercase tracking-[0.28em] text-ink-soft">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="surface-panel p-6 sm:p-8">
              <p className="eyebrow">Company Details</p>
              <div className="mt-6 space-y-4">
                {[
                  { label: "Company Name", value: siteConfig.name },
                  { label: "Registered Address", value: siteConfig.company.address },
                  { label: "Company LinkedIn", value: "AuraLaw AI on LinkedIn", href: siteConfig.company.linkedin },
                  { label: "Website", value: "auralaw.ai", href: siteConfig.url },
                  { label: "Founder", value: siteConfig.founder.name },
                  { label: "Founder LinkedIn", value: "Gift Onosemuode on LinkedIn", href: siteConfig.founder.linkedin },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.3rem] border border-line/70 bg-white/[0.03] px-5 py-4">
                    <p className="text-[0.68rem] font-mono uppercase tracking-[0.28em] text-ink-soft">{item.label}</p>
                    {"href" in item && item.href ? (
                      <a className="mt-2 inline-flex text-sm font-medium text-accent hover:text-ink" href={item.href} target="_blank" rel="noreferrer">
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-2 text-sm text-ink">{item.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUNDER ── */}
      <section id="founder" className="section-divider">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <article className="surface-panel p-5 sm:p-6">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[1.7rem] border border-line/70 bg-deep-soft/80">
                <Image alt={siteConfig.founder.name} className="object-cover" fill sizes="(max-width: 1279px) 100vw, 32vw" src={siteConfig.founder.image} />
              </div>
              <div className="mt-6">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Founder & CEO</p>
                <h3 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-ink">{siteConfig.founder.name}</h3>
                <p className="mt-2 text-sm text-ink-soft">{siteConfig.founder.role}, {siteConfig.name}</p>
                <a className="mt-4 inline-flex items-center gap-2 rounded-full border border-line/70 bg-white/[0.03] px-4 py-2 text-sm font-medium text-accent hover:text-ink" href={siteConfig.founder.linkedin} target="_blank" rel="noreferrer">
                  View LinkedIn profile →
                </a>
              </div>
            </article>

            <div>
              <SectionHeading
                eyebrow="Founder & Company"
                title="Built by someone who lived the problem."
                description="AuraLaw AI was not built in a vacuum. It was built by someone who spent years inside organizations watching manual document review fail teams repeatedly."
              />
              <div className="mt-8 space-y-5">
                <div className="glass-card p-6">
                  <p className="eyebrow">Background</p>
                  <p className="mt-4 text-sm leading-7 text-ink-soft">{siteConfig.founder.bio}</p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="glass-card p-6">
                    <p className="eyebrow">Education</p>
                    <p className="mt-4 text-sm leading-7 text-ink-soft">{siteConfig.founder.education}</p>
                  </div>
                  <div className="glass-card p-6">
                    <p className="eyebrow">Community</p>
                    <p className="mt-4 text-sm leading-7 text-ink-soft">{siteConfig.founder.community}</p>
                  </div>
                </div>
                <div className="glass-card p-6">
                  <p className="eyebrow">Volunteering</p>
                  <p className="mt-4 text-sm leading-7 text-ink-soft">{siteConfig.founder.volunteering}</p>
                </div>
                <blockquote className="founder-quote p-5">
                  <p className="text-sm leading-8 text-ink-soft italic">{siteConfig.founder.philosophy}</p>
                  <footer className="mt-3 text-xs font-mono uppercase tracking-[0.22em] text-accent">— {siteConfig.founder.name}</footer>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="section-divider section-glow">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeading
            eyebrow="Frequently Asked Questions"
            title="Everything you need to know about AuraLaw AI."
            description="Common questions about our product, company, data handling, and the people behind it."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {faqItems.map((item) => (
              <article key={item.question} className="surface-panel p-6">
                <h3 className="text-lg font-bold tracking-[-0.02em] text-ink">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-ink-soft">{item.answer}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 rounded-[2rem] border border-line/70 bg-deep p-6 text-ink sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="eyebrow">Ready to get started?</p>
                <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                  Upload your first document and see what AuraLaw finds.
                </h2>
                <p className="mt-3 text-sm leading-7 text-ink-soft">No account needed. No software to install. Just drag in a file and let Aura-Engine do the work.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link className="cta-primary w-full sm:w-auto" href="/#upload">Start scanning now</Link>
                <Link className="cta-on-dark w-full sm:w-auto" href="/security">Security details</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
