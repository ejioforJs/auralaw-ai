import { randomUUID } from "node:crypto";

/* ── Types ── */

export type FindingKind = "PII" | "Clause" | "Compliance";
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
  confidence: number; // 0-100
  recommendation: string;
  actionRequired: boolean;
};

export type RiskScore = {
  overall: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  label: string;
  breakdown: {
    pii: number;
    clause: number;
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
  piiCount: number;
  clauseCount: number;
  complianceCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  riskScore: RiskScore;
  recommendations: string[];
  parties: string[];
  scannedAt: string;
};

export type ScanResponse = {
  documents: ScannedDocument[];
  totals: {
    documents: number;
    pages: number;
    pii: number;
    clauses: number;
    compliance: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
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

/* ── Pattern specs ── */

type PatternSpec = {
  kind: FindingKind;
  label: string;
  risk: FindingRisk;
  regex: RegExp;
  confidence: number;
  recommendation: string;
  actionRequired: boolean;
};

const PII_PATTERNS: PatternSpec[] = [
  {
    kind: "PII",
    label: "Email Address",
    risk: "medium",
    regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    confidence: 95,
    recommendation: "Redact this email address before sharing externally. Consider whether this individual's consent was obtained for inclusion in this document.",
    actionRequired: true,
  },
  {
    kind: "PII",
    label: "Phone Number",
    risk: "medium",
    regex: /\b(?:\+?234|0)[789]\d{9}\b|\b(?:\+?[1-9]\d{0,2}[-.  ]?)?(?:\(?\d{2,4}\)?[-.  ]?)\d{3}[-.  ]?\d{4}\b/g,
    confidence: 82,
    recommendation: "Redact this phone number. Phone numbers are PII under NDPR and GDPR. Verify this contact's inclusion is necessary and lawful.",
    actionRequired: true,
  },
  {
    kind: "PII",
    label: "Bank Account / Long Numeric ID",
    risk: "critical",
    regex: /\b\d{10}\b|\b\d{8,18}\b/g,
    confidence: 70,
    recommendation: "High-risk: This may be a bank account number or national ID. Redact immediately. Exposure of financial identifiers creates serious NDPR and fraud liability.",
    actionRequired: true,
  },
  {
    kind: "PII",
    label: "Passport Reference",
    risk: "critical",
    regex: /\b(?:passport|travel document)\s*(?:no\.?|number|#)?\s*[:#-]?\s*[A-Z]{1,2}\d{6,8}\b/gi,
    confidence: 92,
    recommendation: "Critical: Passport numbers are sensitive biometric-linked identifiers. Redact before any sharing. Retain a record of why this appeared in the document.",
    actionRequired: true,
  },
  {
    kind: "PII",
    label: "National ID / BVN / NIN",
    risk: "critical",
    regex: /\b(?:national id|nin|bvn|ssn|tax id|tin)\s*(?:no\.?|number|#)?\s*[:#-]?\s*[A-Z0-9-]{6,18}\b/gi,
    confidence: 90,
    recommendation: "Critical: BVN and NIN are high-sensitivity identifiers regulated under NDPR. This must be redacted. Report this occurrence to your compliance officer.",
    actionRequired: true,
  },
  {
    kind: "PII",
    label: "Physical Address",
    risk: "medium",
    regex: /\b\d{1,5}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Street|St|Avenue|Ave|Road|Rd|Close|Drive|Dr|Lane|Ln|Way|Boulevard|Blvd)\b/gi,
    confidence: 75,
    recommendation: "Physical addresses are PII. Verify whether this address needs to appear in the shared version or should be redacted.",
    actionRequired: false,
  },
  {
    kind: "PII",
    label: "Date of Birth Reference",
    risk: "high",
    regex: /\b(?:date of birth|dob|d\.o\.b|born on|born)\s*[:#-]?\s*\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}\b/gi,
    confidence: 88,
    recommendation: "Date of birth is sensitive PII. Redact this before sharing externally. Retain only what is necessary for the document's legal purpose.",
    actionRequired: true,
  },
];

const CLAUSE_PATTERNS: PatternSpec[] = [
  {
    kind: "Clause",
    label: "Confidentiality / NDA Clause",
    risk: "high",
    regex: /\b(confidentiality|non-disclosure|nda|non disclosure)\b/gi,
    confidence: 90,
    recommendation: "This document contains a confidentiality obligation. Confirm that sharing this document externally does not breach the NDA. Obtain written clearance from the relevant party before distribution.",
    actionRequired: true,
  },
  {
    kind: "Clause",
    label: "Indemnity / Hold Harmless Clause",
    risk: "critical",
    regex: /\b(indemnif(?:y|ication|ied|ies)|hold harmless|indemnitor|indemnitee)\b/gi,
    confidence: 93,
    recommendation: "Critical: Indemnity clauses carry direct financial exposure. Have a qualified lawyer review the scope and limits of this indemnity before execution.",
    actionRequired: true,
  },
  {
    kind: "Clause",
    label: "Limitation of Liability",
    risk: "high",
    regex: /\b(limit(?:ation)? of liability|liability cap|exclusion of liability|aggregate liability)\b/gi,
    confidence: 91,
    recommendation: "This clause limits your legal recourse or exposure. Verify the cap amount is adequate and that all exclusions are acceptable to your organization.",
    actionRequired: true,
  },
  {
    kind: "Clause",
    label: "Cross-Border Data Transfer",
    risk: "critical",
    regex: /\b(cross[- ]border transfer|international transfer|data transfer|transfer of (?:personal )?data)\b/gi,
    confidence: 88,
    recommendation: "Critical: Cross-border data transfers require legal basis under NDPR and GDPR. Ensure appropriate safeguards (e.g., adequacy decision, SCCs) are documented before execution.",
    actionRequired: true,
  },
  {
    kind: "Clause",
    label: "Governing Law / Jurisdiction",
    risk: "medium",
    regex: /\b(governing law|jurisdiction|venue|applicable law|choice of law)\b/gi,
    confidence: 85,
    recommendation: "Note which country's law governs this agreement and where disputes must be resolved. Ensure this is acceptable and practical for your organization.",
    actionRequired: false,
  },
  {
    kind: "Clause",
    label: "Arbitration Clause",
    risk: "medium",
    regex: /\b(arbitration|arbitrator|arbitral tribunal|ICC|LCIA|dispute resolution)\b/gi,
    confidence: 86,
    recommendation: "Arbitration clauses waive your right to litigate in court. Review the arbitration rules, seat, and cost implications before signing.",
    actionRequired: false,
  },
  {
    kind: "Clause",
    label: "Force Majeure",
    risk: "low",
    regex: /\b(force majeure|act of god|unforeseen circumstances|beyond (?:reasonable |our )?control)\b/gi,
    confidence: 89,
    recommendation: "Review what events qualify as force majeure in this contract and whether the list is balanced and acceptable for your risk profile.",
    actionRequired: false,
  },
  {
    kind: "Clause",
    label: "Termination Clause",
    risk: "medium",
    regex: /\b(termination|terminate|notice period|right to terminate|early termination)\b/gi,
    confidence: 84,
    recommendation: "Understand the termination triggers and notice periods. Verify exit fees or obligations that apply if this agreement is ended early.",
    actionRequired: false,
  },
  {
    kind: "Clause",
    label: "Intellectual Property Assignment",
    risk: "high",
    regex: /\b(intellectual property|ip assignment|work for hire|ownership of (?:work|IP|invention)|assigns? all rights)\b/gi,
    confidence: 87,
    recommendation: "IP assignment clauses transfer ownership of work product. Confirm what IP is being assigned and whether this aligns with your organization's policies.",
    actionRequired: true,
  },
];

const COMPLIANCE_PATTERNS: PatternSpec[] = [
  {
    kind: "Compliance",
    label: "Data Protection Law Reference (NDPR / GDPR)",
    risk: "critical",
    regex: /\b(gdpr|ndpr|nigeria data protection (?:regulation|act)|popia|ccpa|data protection (?:act|law|regulation))\b/gi,
    confidence: 97,
    recommendation: "Critical: This document references data protection law. Ensure a Data Protection Impact Assessment (DPIA) has been conducted and a lawful basis for processing is documented.",
    actionRequired: true,
  },
  {
    kind: "Compliance",
    label: "AML / KYC / Sanctions Reference",
    risk: "critical",
    regex: /\b(aml|anti[- ]money laundering|sanctions|pep|politically exposed|kyc|know your customer|cft|counter[- ]terrorism)\b/gi,
    confidence: 94,
    recommendation: "Critical: AML/KYC obligations require formal compliance programs. Engage your compliance team to verify all required checks have been completed.",
    actionRequired: true,
  },
  {
    kind: "Compliance",
    label: "Anti-Bribery / Anti-Corruption",
    risk: "critical",
    regex: /\b(anti[- ]bribery|anti[- ]corruption|fcpa|uk bribery act|bribery|corrupt(?:ion|ly)?)\b/gi,
    confidence: 92,
    recommendation: "Critical: Anti-bribery obligations carry criminal liability. Confirm compliance training has been completed and this document meets all legal requirements.",
    actionRequired: true,
  },
  {
    kind: "Compliance",
    label: "Data Retention / Deletion Policy",
    risk: "medium",
    regex: /\b(retention (?:period|policy|schedule)|delete|deletion|recordkeeping|data (?:minimisation|minimization)|storage limitation)\b/gi,
    confidence: 85,
    recommendation: "Verify that your retention schedule aligns with applicable laws (NDPR, GDPR) and that deletion procedures are documented and automated where possible.",
    actionRequired: false,
  },
  {
    kind: "Compliance",
    label: "Consent / Lawful Basis Reference",
    risk: "high",
    regex: /\b(consent|lawful basis|legitimate interest|data subject|opt[- ]in|opt[- ]out|withdrawal of consent)\b/gi,
    confidence: 88,
    recommendation: "Ensure consent mechanisms are freely given, specific, informed, and documented. Review whether legitimate interest is an appropriate lawful basis here.",
    actionRequired: true,
  },
  {
    kind: "Compliance",
    label: "Securities / Financial Regulation",
    risk: "high",
    regex: /\b(sec|securities|cbn|central bank|frc|financial reporting council|ifrs|investment vehicle|prospectus)\b/gi,
    confidence: 80,
    recommendation: "This document references financial regulation. Ensure all disclosures comply with applicable securities or banking laws and have been reviewed by a qualified professional.",
    actionRequired: true,
  },
  {
    kind: "Compliance",
    label: "Employment Law Reference",
    risk: "medium",
    regex: /\b(labour act|employment act|unfair dismissal|wrongful termination|minimum wage|redundancy|collective bargaining)\b/gi,
    confidence: 86,
    recommendation: "Employment law references require compliance with Nigerian Labour Act provisions. Verify all terms meet statutory minimums and are consistent with company HR policies.",
    actionRequired: false,
  },
];

const ALL_PATTERNS = [...PII_PATTERNS, ...CLAUSE_PATTERNS, ...COMPLIANCE_PATTERNS];

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

function createFallbackText(name: string, mimeType: string) {
  return [
    `${name} was uploaded into AuraLaw AI for document review.`,
    `The file type is ${mimeType || "unknown"} and is being treated as an unstructured legal document.`,
    "Potential review classes include personal data, confidentiality language, indemnities, jurisdiction clauses, and cross-border compliance requirements.",
    "Manual review is strongly recommended for documents where automated text extraction may be incomplete.",
  ].join(" ");
}

function redactPreview(preview: string, findings: ScanFinding[]) {
  let redacted = preview;
  const uniqueMatches = [...new Set(findings.map((f) => f.match.trim()).filter(Boolean))];
  for (const match of uniqueMatches) {
    const related = findings.find((f) => f.match === match);
    const label = related?.kind ?? "Sensitive";
    redacted = redacted.replace(new RegExp(escapeForRegex(match), "gi"), `[REDACTED ${label.toUpperCase()}]`);
  }
  return redacted;
}

function computeRiskScore(findings: ScanFinding[]): RiskScore {
  if (findings.length === 0) return { overall: 5, grade: "A", label: "Minimal Risk", breakdown: { pii: 0, clause: 0, compliance: 0 } };

  const weights: Record<FindingRisk, number> = { critical: 25, high: 12, medium: 5, low: 2 };
  const raw = findings.reduce((sum, f) => sum + weights[f.risk], 0);
  const overall = Math.min(100, Math.round(raw));

  const piiFindings = findings.filter((f) => f.kind === "PII");
  const clauseFindings = findings.filter((f) => f.kind === "Clause");
  const complianceFindings = findings.filter((f) => f.kind === "Compliance");

  const kindScore = (arr: ScanFinding[]) =>
    Math.min(100, Math.round(arr.reduce((s, f) => s + weights[f.risk], 0)));

  let grade: RiskScore["grade"] = "A";
  let label = "Low Risk";
  if (overall >= 80) { grade = "F"; label = "Critical Risk"; }
  else if (overall >= 60) { grade = "D"; label = "High Risk"; }
  else if (overall >= 40) { grade = "C"; label = "Elevated Risk"; }
  else if (overall >= 20) { grade = "B"; label = "Moderate Risk"; }

  return { overall, grade, label, breakdown: { pii: kindScore(piiFindings), clause: kindScore(clauseFindings), compliance: kindScore(complianceFindings) } };
}

function generateRecommendations(findings: ScanFinding[]): string[] {
  const recs: string[] = [];
  const hasCritical = findings.some((f) => f.risk === "critical");
  const hasActionRequired = findings.filter((f) => f.actionRequired);
  const piiCount = findings.filter((f) => f.kind === "PII").length;
  const complianceCount = findings.filter((f) => f.kind === "Compliance").length;
  const clauseCount = findings.filter((f) => f.kind === "Clause").length;

  if (hasCritical) recs.push("⚠️ This document has critical-risk findings. Do not share externally until all critical items have been reviewed by a qualified professional.");
  if (piiCount > 0) recs.push(`🔐 ${piiCount} personal data item${piiCount > 1 ? "s" : ""} detected. Redact all PII before external distribution to comply with NDPR data minimisation requirements.`);
  if (complianceCount > 0) recs.push(`⚖️ ${complianceCount} compliance reference${complianceCount > 1 ? "s" : ""} found. Verify your organization has documented the lawful basis for each compliance obligation referenced.`);
  if (clauseCount > 0) recs.push(`📋 ${clauseCount} sensitive clause${clauseCount > 1 ? "s" : ""} identified. Have a qualified lawyer review all flagged clauses before execution.`);
  if (hasActionRequired.length > 0) recs.push(`✅ ${hasActionRequired.length} finding${hasActionRequired.length > 1 ? "s" : ""} require immediate action. Review each flagged item in the findings panel below.`);
  recs.push("📁 Download the JSON audit log to maintain a record of this scan for your compliance files.");

  return recs;
}

function extractParties(text: string): string[] {
  const preamble = text.slice(0, 3000).replace(/\\s+/g, " ");
  const parties: string[] = [];
  
  // Heuristic: "entered into by and between [Party 1] ... and [Party 2]"
  const regex = /(?:between|among|by and between)\s+([A-Z][A-Za-z0-9\s.,&'()-]{3,80}?)(?:\s+and\s+|\s*,\s*and\s*)([A-Z][A-Za-z0-9\s.,&'()-]{3,80}?)(?:\s*(?:\(|are\s+the|hereby|agree|dated|effective|,\s*a))/gi;
  
  const match = regex.exec(preamble);
  if (match) {
    if (match[1]) parties.push(match[1].trim().replace(/^(the|a|an)\\s+/i, ""));
    if (match[2]) parties.push(match[2].trim().replace(/^(the|a|an)\\s+/i, ""));
  }
  
  return parties;
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
  const text = normalizeText(extractedText || "");
  const fallbackText = createFallbackText(name, mimeType);
  const analysisText = text || fallbackText;
  const computedPageCount = pageCount || Math.max(1, Math.ceil(analysisText.length / 2200));
  const findings: ScanFinding[] = [];

  for (const pattern of ALL_PATTERNS) {
    let match: RegExpExecArray | null;
    const regex = new RegExp(pattern.regex);
    while ((match = regex.exec(analysisText)) !== null && findings.length < 50) {
      const matchedText = match[0].trim();
      // Deduplicate same label+match combos
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

  // Fallback if nothing found
  if (findings.length === 0) {
    findings.push(
      {
        id: randomUUID(),
        documentName: name,
        kind: "PII",
        risk: "low",
        label: "Manual Review Recommended",
        match: name,
        excerpt: `AuraLaw AI normalized "${name}" and prepared it for human review. No automatic high-confidence pattern matches were found in the extracted text. This may indicate the document is clean, or that text extraction was incomplete (e.g., image-based PDF).`,
        page: 1,
        confidence: 60,
        recommendation: "Even though no automatic findings were generated, a manual review is recommended — especially if this is a scanned/image-based PDF where text extraction may be incomplete.",
        actionRequired: false,
      },
      {
        id: randomUUID(),
        documentName: name,
        kind: "Compliance",
        risk: "low",
        label: "Cross-Jurisdiction Verification",
        match: mimeType || "document",
        excerpt: `Before exporting "${name}", verify whether it contains region-specific disclosure or transfer obligations that may not be detectable by pattern scanning.`,
        page: 1,
        confidence: 55,
        recommendation: "Manually verify that this document does not contain jurisdiction-specific obligations that require additional compliance steps before external circulation.",
        actionRequired: false,
      },
    );
  }

  const riskScore = computeRiskScore(findings);
  const recommendations = generateRecommendations(findings);
  const preview = clip(analysisText, 2000);
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
    piiCount: findings.filter((f) => f.kind === "PII").length,
    clauseCount: findings.filter((f) => f.kind === "Clause").length,
    complianceCount: findings.filter((f) => f.kind === "Compliance").length,
    criticalCount: findings.filter((f) => f.risk === "critical").length,
    highCount: findings.filter((f) => f.risk === "high").length,
    mediumCount: findings.filter((f) => f.risk === "medium").length,
    lowCount: findings.filter((f) => f.risk === "low").length,
    riskScore,
    recommendations,
    parties: extractParties(analysisText),
    scannedAt: new Date().toISOString(),
  };
}

export function buildScanResponse(documents: ScannedDocument[]): ScanResponse {
  const totals = documents.reduce(
    (acc, doc) => {
      acc.documents += 1;
      acc.pages += doc.pageCount;
      acc.pii += doc.piiCount;
      acc.clauses += doc.clauseCount;
      acc.compliance += doc.complianceCount;
      acc.critical += doc.criticalCount;
      acc.high += doc.highCount;
      acc.medium += doc.mediumCount;
      acc.low += doc.lowCount;
      acc.actionRequired += doc.findings.filter((f) => f.actionRequired).length;
      return acc;
    },
    { documents: 0, pages: 0, pii: 0, clauses: 0, compliance: 0, critical: 0, high: 0, medium: 0, low: 0, actionRequired: 0 },
  );

  // Aggregate risk score
  const allFindings = documents.flatMap((d) => d.findings);
  const overallRiskScore = computeRiskScore(allFindings);

  const summary = `Aura-Engine v2 scanned ${totals.documents} document${totals.documents === 1 ? "" : "s"} (${totals.pages} page${totals.pages === 1 ? "" : "s"}), detected ${totals.pii} PII item${totals.pii === 1 ? "" : "s"}, ${totals.clauses} sensitive clause${totals.clauses === 1 ? "" : "s"}, and ${totals.compliance} compliance reference${totals.compliance === 1 ? "" : "s"}. Overall risk score: ${overallRiskScore.overall}/100 (${overallRiskScore.label}).`;

  return {
    documents,
    totals,
    overallRiskScore,
    certification: {
      generatedAt: new Date().toISOString(),
      jurisdictionNote:
        "Prepared for cross-jurisdiction review under NDPR (Nigeria), GDPR (EU), and applicable African data protection frameworks. Validate local disclosure and privacy obligations before external circulation.",
      summary,
      engineVersion: "Aura-Engine v2.0",
    },
  };
}
