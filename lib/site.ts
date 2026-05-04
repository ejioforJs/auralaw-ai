const defaultSiteUrl = "https://auralaw.ai";

function normalizeUrl(value?: string) {
  if (!value) {
    return defaultSiteUrl;
  }

  const trimmed = value.trim().replace(/\/+$/, "");
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

export const siteConfig = {
  name: "AuraLaw AI",
  shortName: "AuraLaw",
  tagline: "Privacy Intelligence Platform",
  description:
    "AuraLaw AI is a browser-based legal document review platform that automatically scans contracts, agreements, and compliance documents to detect personal information (PII), sensitive legal clauses, and regulatory compliance references — then generates redacted output and audit-ready export packages.",
  ogAlt:
    "AuraLaw AI — upload legal documents, scan for PII and compliance risk, and export certified redactions.",
  url: normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL),
  founder: {
    name: "Gift (Oghenekevwe) Onosemuode",
    role: "Founder & CEO",
    linkedin: "https://linkedin.com/in/kevweonosemuode",
    image: "/founderImage.jpeg",
    bio: "Gift Onosemuode is the Founder and CEO of AuraLaw AI. With over five years of experience in people operations and administrative systems, she witnessed first-hand how legal document review, compliance checks, and sensitive data handling were still being done manually — creating costly delays and exposing organizations to regulatory risk. She founded AuraLaw AI to bring intelligent automation to this process, making it possible for teams of any size to scan, redact, and export legal documents securely from a browser — without expensive enterprise software or specialized legal tech training.",
    education: "University of Nigeria, Nsukka — B.Sc. Human Physiology (2018–2022)",
    community:
      "Founder of The GenZ Professional, a career growth community helping young professionals build skills, navigate workplaces, and lead with confidence.",
    volunteering:
      "Active volunteer supporting causes in Children, Education, Health, Science, and Technology.",
    philosophy:
      "\"I built AuraLaw because I believe protecting sensitive information should not require a legal department or an enterprise budget. Every organization — from a two-person startup to a large corporation — deserves tools that make compliance simple, transparent, and affordable.\"",
  },
  company: {
    linkedin: "https://www.linkedin.com/company/115802041/",
    address: "19, Arobieke Street, Alapere, Lagos, Nigeria",
    mission:
      "To make legal document review, PII detection, and compliance scanning accessible to every organization — regardless of size, budget, or technical expertise.",
    about:
      "AuraLaw AI is a legal technology company headquartered in Lagos, Nigeria. The company builds browser-based tools that help businesses, law firms, compliance teams, and HR departments review sensitive documents faster and more accurately. The platform uses pattern-based AI scanning to detect personal identifiable information (PII), flag risky legal clauses, identify compliance references across jurisdictions, and generate audit-ready redacted exports — all from a single, intuitive browser interface with no software installation required.",
    founded: "2024",
  },
};

export const primaryNav = [
  { label: "Product", href: "/#product" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About", href: "/#about" },
  { label: "Founder", href: "/#founder" },
  { label: "Security", href: "/security" },
  { label: "FAQ", href: "/#faq" },
];

export const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Upload & Scan", href: "/#upload" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About the Company", href: "/#about" },
  { label: "Founder", href: "/#founder" },
  { label: "Security", href: "/security" },
  { label: "Privacy", href: "/privacy" },
  { label: "FAQ", href: "/#faq" },
];
