import { randomUUID } from "node:crypto";

/* ── Enterprise Contract Review Types ── */

export type FindingKind = "Risk" | "Obligation" | "Missing Clause" | "Data Privacy";
export type FindingRisk = "critical" | "high" | "medium" | "low";

export type ScanFinding = {
  id: string;
  documentName: string;
  kind: FindingKind;
  risk: FindingRisk;
  label: string;
  match: string;
  excerpt: string;
  page: number;
  confidence: number;
  recommendation: string;
  actionRequired: boolean;
};

export type ContractMetadata = {
  classification: string;
  effectiveDate: string | null;
  governingLaw: string | null;
  parties: string[];
};

export type RiskScore = {
  overall: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  label: string;
  breakdown: {
    financial: number;
    operational: number;
    legal: number;
    compliance: number;
  };
};

export type ScannedDocument = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  pageCount: number;
  extractionMode: "text" | "converted" | "heuristic";
  preview: string;
  redactedPreview: string;
  findings: ScanFinding[];
  metadata: ContractMetadata;
  categoryCounts: {
    risk: number;
    obligation: number;
    missing: number;
    privacy: number;
  };
  riskScore: RiskScore;
  recommendations: string[];
  scannedAt: string;
};

export type ScanResponse = {
  documents: ScannedDocument[];
  totals: {
    documents: number;
    pages: number;
    findings: number;
    critical: number;
    high: number;
    actionRequired: number;
  };
  overallRiskScore: RiskScore;
  certification: {
    generatedAt: string;
    jurisdictionNote: string;
    summary: string;
    engineVersion: string;
  };
};

/* ── Pattern Specs ── */

type PatternSpec = {
  kind: FindingKind;
  label: string;
  risk: FindingRisk;
  regex: RegExp;
  confidence: number;
  recommendation: string;
  actionRequired: boolean;
  category: "financial" | "operational" | "legal" | "compliance";
};

const RISK_PATTERNS: PatternSpec[] = [
  {
    kind: "Risk",
    label: "Indemnity / Hold Harmless",
    risk: "critical",
    regex: /\b(indemnif(?:y|ication|ied|ies)|hold harmless|defend and hold harmless)\b/gi,
    confidence: 94,
    recommendation: "Critical Legal Risk: Indemnity clauses transfer legal liability directly to your organization. Ensure the scope is narrow, mutual if possible, and capped. Have a lawyer review before execution.",
    actionRequired: true,
    category: "legal",
  },
  {
    kind: "Risk",
    label: "Limitation of Liability",
    risk: "high",
    regex: /\b(limit(?:ation)? of liability|liability cap|exclusion of liability|aggregate liability)\b/gi,
    confidence: 91,
    recommendation: "Financial Risk: Verify the cap amount is adequate (e.g., tied to contract value) and that carve-outs exist for gross negligence, fraud, or IP infringement.",
    actionRequired: true,
    category: "financial",
  },
  {
    kind: "Risk",
    label: "Unilateral Termination",
    risk: "high",
    regex: /\b(terminate for convenience|termination without cause|right to terminate at any time)\b/gi,
    confidence: 88,
    recommendation: "Operational Risk: One-sided termination for convenience creates instability. Negotiate for mutual termination rights or sufficient notice periods (e.g., 60 days).",
    actionRequired: true,
    category: "operational",
  },
  {
    kind: "Risk",
    label: "Intellectual Property Assignment",
    risk: "critical",
    regex: /\b(intellectual property|ip assignment|work for hire|ownership of (?:work|IP|invention)|assigns? all rights)\b/gi,
    confidence: 89,
    recommendation: "Legal Risk: Complete IP assignment strips your organization of ownership. Ensure you are only granting a license, or strictly defining the assigned deliverables.",
    actionRequired: true,
    category: "legal",
  },
  {
    kind: "Risk",
    label: "Non-Compete / Exclusivity",
    risk: "high",
    regex: /\b(non[- ]compete|exclusiv(?:e|ity)|sole provider|restrictive covenant)\b/gi,
    confidence: 85,
    recommendation: "Operational Risk: Exclusivity or non-competes limit future business. Ensure geographic scope and duration are reasonable and legally enforceable in your jurisdiction.",
    actionRequired: true,
    category: "operational",
  },
];

const OBLIGATION_PATTERNS: PatternSpec[] = [
  {
    kind: "Obligation",
    label: "Payment Terms",
    risk: "medium",
    regex: /\b(net \d{2}|payment due within \d{2} days|invoice shall be paid|payment terms|due and payable)\b/gi,
    confidence: 90,
    recommendation: "Financial Obligation: Note the payment window. Ensure your finance department can meet these deadlines to avoid late fees or breach of contract.",
    actionRequired: false,
    category: "financial",
  },
  {
    kind: "Obligation",
    label: "Audit Rights",
    risk: "high",
    regex: /\b(right to audit|audit rights|inspection of records|access to books)\b/gi,
    confidence: 87,
    recommendation: "Compliance Obligation: The counterparty has the right to audit your books or operations. Ensure you limit audits to once per year, during business hours, at their expense.",
    actionRequired: true,
    category: "compliance",
  },
  {
    kind: "Obligation",
    label: "Confidentiality Duration",
    risk: "medium",
    regex: /\b(confidentiality period|survive termination for \d+|maintain in confidence for \d+ years)\b/gi,
    confidence: 85,
    recommendation: "Operational Obligation: Note how long confidentiality obligations last post-termination. Trade secrets should be perpetual; standard information usually 2-5 years.",
    actionRequired: false,
    category: "operational",
  },
];

const PRIVACY_PATTERNS: PatternSpec[] = [
  {
    kind: "Data Privacy",
    label: "Cross-Border Data Transfer",
    risk: "critical",
    regex: /\b(cross[- ]border transfer|international transfer|transfer of (?:personal )?data outside)\b/gi,
    confidence: 92,
    recommendation: "Compliance Risk: Transferring data outside the jurisdiction requires safeguards (e.g., SCCs) under NDPR/GDPR. Consult your DPO.",
    actionRequired: true,
    category: "compliance",
  },
  {
    kind: "Data Privacy",
    label: "Data Protection Law Reference",
    risk: "high",
    regex: /\b(gdpr|ndpr|nigeria data protection|ccpa|data protection act)\b/gi,
    confidence: 95,
    recommendation: "Compliance Risk: Explicit data protection obligations are included. Ensure a DPIA has been conducted if processing sensitive PII.",
    actionRequired: true,
    category: "compliance",
  },
  {
    kind: "Data Privacy",
    label: "Sensitive PII (ID / Financial)",
    risk: "high",
    regex: /\b(?:nin|bvn|ssn|passport|bank account)\s*[:#-]?\s*[A-Z0-9-]{6,18}\b|\b\d{10}\b/gi,
    confidence: 80,
    recommendation: "Compliance Risk: Sensitive identifiers found. Redact these before external distribution to adhere to data minimisation principles.",
    actionRequired: true,
    category: "compliance",
  },
  {
    kind: "Data Privacy",
    label: "Standard PII (Contact)",
    risk: "medium",
    regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|\b(?:\+?234|0)[789]\d{9}\b/gi,
    confidence: 85,
    recommendation: "Compliance Risk: Contact info detected. Verify lawful basis for sharing or redact if not necessary.",
    actionRequired: false,
    category: "compliance",
  },
];

const ALL_PATTERNS = [...RISK_PATTERNS, ...OBLIGATION_PATTERNS, ...PRIVACY_PATTERNS];

/* ── Standard Clause Checking ── */

const REQUIRED_CLAUSES = [
  {
    label: "Force Majeure",
    regex: /force majeure|act of god|unforeseen circumstances/i,
    risk: "high" as FindingRisk,
    recommendation: "Legal Risk: Missing Force Majeure clause. Your organization may be held liable for failure to perform due to events outside your control (e.g., natural disasters, strikes). Suggest inserting standard Force Majeure boilerplate.",
    category: "legal" as const,
  },
  {
    label: "Severability",
    regex: /severability|invalid provision|unenforceable clause/i,
    risk: "medium" as FindingRisk,
    recommendation: "Legal Risk: Missing Severability clause. If one clause is found illegal by a court, the entire contract could be voided. Suggest inserting a severability clause to protect the rest of the agreement.",
    category: "legal" as const,
  },
  {
    label: "Entire Agreement / Integration",
    regex: /entire agreement|integration clause|supersedes all prior/i,
    risk: "medium" as FindingRisk,
    recommendation: "Legal Risk: Missing Entire Agreement clause. Prior emails or verbal discussions could be argued as part of the contract. Insert an entire agreement clause to limit the contract to the written document.",
    category: "legal" as const,
  },
  {
    label: "Dispute Resolution / Arbitration",
    regex: /dispute resolution|arbitration|arbitrator|mediation/i,
    risk: "medium" as FindingRisk,
    recommendation: "Operational Risk: Missing Dispute Resolution framework. You may be forced directly into expensive public litigation. Suggest adding an arbitration or mandatory mediation clause.",
    category: "operational" as const,
  },
];

/* ── Metadata Extractors ── */

function extractClassification(text: string): string {
  const topText = text.slice(0, 1000).toUpperCase();
  if (topText.includes("NON-DISCLOSURE") || topText.includes(" NDA ") || topText.includes("CONFIDENTIALITY AGREEMENT")) return "Non-Disclosure Agreement (NDA)";
  if (topText.includes("EMPLOYMENT") || topText.includes("OFFER OF EMPLOYMENT")) return "Employment Agreement";
  if (topText.includes("SERVICE AGREEMENT") || topText.includes("MASTER SERVICE")) return "Service Agreement (MSA)";
  if (topText.includes("DATA PROCESSING") || topText.includes(" DPA ")) return "Data Processing Agreement (DPA)";
  if (topText.includes("PARTNERSHIP") || topText.includes("JOINT VENTURE")) return "Partnership Agreement";
  if (topText.includes("TERMS AND CONDITIONS") || topText.includes("TERMS OF SERVICE")) return "Terms & Conditions";
  if (topText.includes("LEASE") || topText.includes("TENANCY")) return "Lease Agreement";
  return "General Commercial Contract";
}

function extractEffectiveDate(text: string): string | null {
  const topText = text.slice(0, 2000);
  const match = topText.match(/(?:effective (?:as of|date)|dated|this \d+(?:st|nd|rd|th)? day of)\s*[:\s]*([A-Z0-9,\s/-]{6,20})/i);
  return match && match[1] ? match[1].trim() : null;
}

function extractGoverningLaw(text: string): string | null {
  const match = text.match(/(?:governed by|subject to)(?: and construed in accordance with)? the laws of\s+([A-Z][A-Za-z\s]{3,30})|governing law[:\s-]+([A-Z][A-Za-z\s]{3,30})|jurisdiction[:\s-]+([A-Z][A-Za-z\s]{3,30})/i);
  if (match) {
    return (match[1] || match[2] || match[3]).trim();
  }
  return null;
}

function extractParties(text: string): string[] {
  const preamble = text.slice(0, 3000).replace(/\s+/g, " ");
  let parties: string[] = [];
  
  // Primary Heuristic: "between X and Y"
  const regex = /(?:between|among|by and between)\s+([A-Z][A-Za-z0-9\s.,&'()-]{3,80}?)(?:\s+and\s+|\s*,\s*and\s*)([A-Z][A-Za-z0-9\s.,&'()-]{3,80}?)(?:\s*(?:\(|are\s+the|hereby|agree|dated|effective|,\s*a))/gi;
  const match = regex.exec(preamble);
  if (match) {
    if (match[1]) parties.push(match[1].trim().replace(/^(the|a|an)\s+/i, ""));
    if (match[2]) parties.push(match[2].trim().replace(/^(the|a|an)\s+/i, ""));
    return parties;
  }

  // Secondary Heuristic: Look for defined entities before "hereinafter" or "('..."
  const secondaryRegex = /([A-Z][A-Za-z0-9\s.,&'()-]{3,80}?)(?:,\s*a\s+[A-Za-z\s]+\s+(?:corporation|LLC|company|partnership)|(?:\s*\(.*\))?\s*\(\s*"(?:the\s+)?[A-Z][A-Za-z\s]+"\s*\)|(?:\s*\(.*\))?\s*hereinafter)/g;
  
  let secMatch;
  let count = 0;
  while ((secMatch = secondaryRegex.exec(preamble)) !== null && count < 4) {
    const p = secMatch[1].trim().replace(/^(the|a|an|and)\s+/i, "");
    if (p.length > 3 && !p.toLowerCase().includes("agreement") && !p.toLowerCase().includes("effective")) {
      parties.push(p);
      count++;
    }
  }
  
  return [...new Set(parties)];
}

/* ── Helpers ── */

function normalizeText(text: string) {
  return text.replace(/\0/g, " ").replace(/\s+/g, " ").trim();
}

function clip(text: string, max = 120) {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

function escapeForRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildExcerpt(text: string, start: number, end: number) {
  const excerptStart = Math.max(0, start - 60);
  const excerptEnd = Math.min(text.length, end + 100);
  return clip(text.slice(excerptStart, excerptEnd).trim(), 220);
}

function estimatePage(position: number, textLength: number, pageCount: number) {
  if (pageCount <= 1 || textLength <= 0) return 1;
  return Math.min(pageCount, Math.max(1, Math.ceil((position / textLength) * pageCount)));
}

function redactPreview(preview: string, findings: ScanFinding[]) {
  let redacted = preview;
  const privacyMatches = [...new Set(findings.filter(f => f.kind === "Data Privacy").map((f) => f.match.trim()).filter(Boolean))];
  for (const match of privacyMatches) {
    redacted = redacted.replace(new RegExp(escapeForRegex(match), "gi"), `[REDACTED PII]`);
  }
  return redacted;
}

function computeRiskScore(findings: ScanFinding[]): RiskScore {
  if (findings.length === 0) return { overall: 5, grade: "A", label: "Minimal Risk", breakdown: { financial: 0, operational: 0, legal: 0, compliance: 0 } };

  const weights: Record<FindingRisk, number> = { critical: 25, high: 15, medium: 5, low: 2 };
  
  let financialRaw = 0, operationalRaw = 0, legalRaw = 0, complianceRaw = 0;
  
  for (const f of findings) {
    // Missing clauses have category baked in implicitly in our system design via checking
    let cat = "legal";
    const pattern = ALL_PATTERNS.find(p => p.label === f.label);
    if (pattern) cat = pattern.category;
    else {
      const missing = REQUIRED_CLAUSES.find(c => "Missing " + c.label === f.label);
      if (missing) cat = missing.category;
      else if (f.kind === "Data Privacy") cat = "compliance";
    }

    if (cat === "financial") financialRaw += weights[f.risk];
    if (cat === "operational") operationalRaw += weights[f.risk];
    if (cat === "legal") legalRaw += weights[f.risk];
    if (cat === "compliance") complianceRaw += weights[f.risk];
  }

  const rawTotal = financialRaw + operationalRaw + legalRaw + complianceRaw;
  const overall = Math.min(100, Math.round(rawTotal));

  const scale = (val: number) => Math.min(100, Math.round((val / Math.max(1, rawTotal)) * 100));

  let grade: RiskScore["grade"] = "A";
  let label = "Low Risk";
  if (overall >= 80) { grade = "F"; label = "Critical Risk"; }
  else if (overall >= 60) { grade = "D"; label = "High Risk"; }
  else if (overall >= 40) { grade = "C"; label = "Elevated Risk"; }
  else if (overall >= 20) { grade = "B"; label = "Moderate Risk"; }

  return { 
    overall, grade, label, 
    breakdown: { 
      financial: scale(financialRaw), 
      operational: scale(operationalRaw), 
      legal: scale(legalRaw), 
      compliance: scale(complianceRaw) 
    } 
  };
}

function generateRecommendations(findings: ScanFinding[], classification: string): string[] {
  const recs: string[] = [];
  const risks = findings.filter(f => f.kind === "Risk");
  const missing = findings.filter(f => f.kind === "Missing Clause");
  
  recs.push(`The engine classified this document as a ${classification}.`);
  
  if (risks.some(f => f.risk === "critical")) {
    recs.push("🚨 CRITICAL LIABILITIES DETECTED: This contract contains critical risk clauses (e.g. Indemnities, IP Assignment). Engage senior legal counsel prior to execution.");
  }
  if (missing.length > 0) {
    recs.push(`❌ STRUCTURAL DEFICIENCIES: The contract is missing ${missing.length} standard protective clause(s). Review the Missing Clauses tab for boilerplate insertion suggestions.`);
  }
  if (findings.some(f => f.kind === "Data Privacy")) {
    recs.push("🔐 DATA PRIVACY: PII or Compliance data detected. If sharing externally for review, utilize the 'Apply Redactions' feature.");
  }
  recs.push("📑 NEXT STEPS: Review all flagged Obligations to ensure commercial feasibility, and download the Due Diligence PDF for your records.");

  return recs;
}

/* ── Scanner ── */

export function scanDocument({
  name,
  mimeType,
  size,
  pageCount,
  extractedText,
  extractionMode,
}: {
  name: string;
  mimeType: string;
  size: number;
  pageCount?: number;
  extractedText?: string;
  extractionMode: "text" | "converted" | "heuristic";
}): ScannedDocument {
  const analysisText = normalizeText(extractedText || name);
  const computedPageCount = pageCount || Math.max(1, Math.ceil(analysisText.length / 2200));
  const findings: ScanFinding[] = [];

  // Extract Metadata
  const metadata: ContractMetadata = {
    classification: extractClassification(analysisText),
    effectiveDate: extractEffectiveDate(analysisText),
    governingLaw: extractGoverningLaw(analysisText),
    parties: extractParties(analysisText),
  };

  // Run Regex Pattern Matching
  for (const pattern of ALL_PATTERNS) {
    let match: RegExpExecArray | null;
    const regex = new RegExp(pattern.regex);
    while ((match = regex.exec(analysisText)) !== null && findings.length < 100) {
      const matchedText = match[0].trim();
      const isDuplicate = findings.some((f) => f.label === pattern.label && f.match.toLowerCase() === matchedText.toLowerCase());
      if (isDuplicate) continue;
      findings.push({
        id: randomUUID(),
        documentName: name,
        kind: pattern.kind,
        risk: pattern.risk,
        label: pattern.label,
        match: matchedText,
        excerpt: buildExcerpt(analysisText, match.index, match.index + matchedText.length),
        page: estimatePage(match.index, analysisText.length, computedPageCount),
        confidence: pattern.confidence,
        recommendation: pattern.recommendation,
        actionRequired: pattern.actionRequired,
      });
    }
  }

  // Check for Missing Clauses
  for (const clause of REQUIRED_CLAUSES) {
    if (!clause.regex.test(analysisText)) {
      findings.push({
        id: randomUUID(),
        documentName: name,
        kind: "Missing Clause",
        risk: clause.risk,
        label: `Missing ${clause.label}`,
        match: "Clause absent from document",
        excerpt: `The scanner could not locate standard language relating to ${clause.label} within the extracted text.`,
        page: 1,
        confidence: 90,
        recommendation: clause.recommendation,
        actionRequired: clause.risk === "high" || clause.risk === "critical",
      });
    }
  }

  const riskScore = computeRiskScore(findings);
  const recommendations = generateRecommendations(findings, metadata.classification);
  const preview = clip(analysisText, 4000); // Expanded preview
  const redactedPreview = redactPreview(preview, findings);

  return {
    id: randomUUID(),
    name,
    mimeType,
    size,
    pageCount: computedPageCount,
    extractionMode,
    preview,
    redactedPreview,
    findings,
    metadata,
    categoryCounts: {
      risk: findings.filter((f) => f.kind === "Risk").length,
      obligation: findings.filter((f) => f.kind === "Obligation").length,
      missing: findings.filter((f) => f.kind === "Missing Clause").length,
      privacy: findings.filter((f) => f.kind === "Data Privacy").length,
    },
    riskScore,
    recommendations,
    scannedAt: new Date().toISOString(),
  };
}

export function buildScanResponse(documents: ScannedDocument[]): ScanResponse {
  const totals = documents.reduce(
    (acc, doc) => {
      acc.documents += 1;
      acc.pages += doc.pageCount;
      acc.findings += doc.findings.length;
      acc.critical += doc.findings.filter(f => f.risk === "critical").length;
      acc.high += doc.findings.filter(f => f.risk === "high").length;
      acc.actionRequired += doc.findings.filter((f) => f.actionRequired).length;
      return acc;
    },
    { documents: 0, pages: 0, findings: 0, critical: 0, high: 0, actionRequired: 0 },
  );

  const allFindings = documents.flatMap((d) => d.findings);
  const overallRiskScore = computeRiskScore(allFindings);

  const summary = `Aura-Engine Due Diligence complete for ${totals.documents} document(s). Detected ${totals.findings} total findings, including ${totals.critical} critical liabilities and ${totals.high} high-risk items. Overall Document Portfolio Risk Score: ${overallRiskScore.overall}/100 (${overallRiskScore.label}).`;

  return {
    documents,
    totals,
    overallRiskScore,
    certification: {
      generatedAt: new Date().toISOString(),
      jurisdictionNote:
        "Prepared for comprehensive due diligence review. This report highlights contractual liabilities, obligations, missing protective clauses, and data privacy exposure. This automated analysis does not constitute formal legal counsel.",
      summary,
      engineVersion: "Aura-Engine Enterprise v3.0",
    },
  };
}
