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
    "AuraLaw AI uploads supported legal documents, detects PII, sensitive clauses, and compliance references, then produces redacted output and an audit-ready export package.",
  ogAlt:
    "AuraLaw AI social card about uploading documents, scanning for legal risk, and exporting certified redactions.",
  url: normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL),
  founder: {
    name: "Oghenekevwe Onosemuode",
    role: "Founder",
    linkedin: "https://linkedin.com/in/kevweonosemuode",
    image: "/founderImage.jpeg",
  },
  company: {
    linkedin: "https://www.linkedin.com/company/115802041/",
    address: "19, Arobieke Street, Alapere, Lagos",
  },
};

export const primaryNav = [
  { label: "Upload", href: "/#upload" },
  { label: "How It Works", href: "/#product" },
  { label: "Founder", href: "/#founder" },
  { label: "Security", href: "/security" },
  { label: "FAQ", href: "/#faq" },
];

export const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Upload", href: "/#upload" },
  { label: "Founder", href: "/#founder" },
  { label: "Security", href: "/security" },
  { label: "Privacy", href: "/privacy" },
];
