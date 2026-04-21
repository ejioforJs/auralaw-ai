import { randomUUID } from "node:crypto";

export type FindingKind = "PII" | "Clause" | "Compliance";
export type FindingRisk = "high" | "medium" | "low";

export type ScanFinding = {
  id: string;
  documentName: string;
  kind: FindingKind;
  risk: FindingRisk;
  label: string;
  match: string;
  excerpt: string;
  page: number;
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
};

export type ScanResponse = {
  documents: ScannedDocument[];
  totals: {
    documents: number;
    pages: number;
    pii: number;
    clauses: number;
    compliance: number;
  };
  certification: {
    generatedAt: string;
    jurisdictionNote: string;
    summary: string;
  };
};

type PatternSpec = {
  kind: FindingKind;
  label: string;
  risk: FindingRisk;
  regex: RegExp;
};

const PII_PATTERNS: PatternSpec[] = [
  {
    kind: "PII",
    label: "Email address",
    risk: "medium",
    regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  },
  {
    kind: "PII",
    label: "Phone number",
    risk: "medium",
    regex: /\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g,
  },
  {
    kind: "PII",
    label: "Bank account or long numeric identifier",
    risk: "high",
    regex: /\b\d{8,18}\b/g,
  },
  {
    kind: "PII",
    label: "Passport reference",
    risk: "high",
    regex: /\b(?:passport|travel document)\s*(?:no\.?|number)?\s*[:#-]?\s*[A-Z0-9]{6,12}\b/gi,
  },
  {
    kind: "PII",
    label: "National ID reference",
    risk: "high",
    regex: /\b(?:national id|nin|bvn|ssn|tax id|tin)\s*(?:no\.?|number)?\s*[:#-]?\s*[A-Z0-9-]{6,18}\b/gi,
  },
];

const CLAUSE_PATTERNS: PatternSpec[] = [
  {
    kind: "Clause",
    label: "Confidentiality clause",
    risk: "medium",
    regex: /\b(confidentiality|non-disclosure|nda)\b/gi,
  },
  {
    kind: "Clause",
    label: "Indemnity clause",
    risk: "high",
    regex: /\b(indemnif(?:y|ication)|hold harmless)\b/gi,
  },
  {
    kind: "Clause",
    label: "Liability limitation clause",
    risk: "medium",
    regex: /\b(limit(?:ation)? of liability|liability cap)\b/gi,
  },
  {
    kind: "Clause",
    label: "Cross-border transfer clause",
    risk: "high",
    regex: /\b(cross-border transfer|international transfer|data transfer)\b/gi,
  },
  {
    kind: "Clause",
    label: "Governing law clause",
    risk: "low",
    regex: /\b(governing law|jurisdiction|venue|arbitration)\b/gi,
  },
];

const COMPLIANCE_PATTERNS: PatternSpec[] = [
  {
    kind: "Compliance",
    label: "Privacy regulation reference",
    risk: "high",
    regex: /\b(gdpr|ndpr|nigeria data protection act|popia|ccpa|data protection)\b/gi,
  },
  {
    kind: "Compliance",
    label: "AML or sanctions reference",
    risk: "high",
    regex: /\b(aml|anti-money laundering|sanctions|pep|kyc)\b/gi,
  },
  {
    kind: "Compliance",
    label: "Anti-bribery reference",
    risk: "high",
    regex: /\b(anti-bribery|anti corruption|fcp?a|uk bribery act)\b/gi,
  },
  {
    kind: "Compliance",
    label: "Retention and deletion reference",
    risk: "medium",
    regex: /\b(retention|delete|deletion|recordkeeping|records policy)\b/gi,
  },
  {
    kind: "Compliance",
    label: "Consent reference",
    risk: "medium",
    regex: /\b(consent|lawful basis|legitimate interest)\b/gi,
  },
];

const ALL_PATTERNS = [...PII_PATTERNS, ...CLAUSE_PATTERNS, ...COMPLIANCE_PATTERNS];

function normalizeText(text: string) {
  return text
    .replace(/\0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clip(text: string, max = 120) {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

function escapeForRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildExcerpt(text: string, start: number, end: number) {
  const excerptStart = Math.max(0, start - 40);
  const excerptEnd = Math.min(text.length, end + 80);
  return clip(text.slice(excerptStart, excerptEnd).trim(), 180);
}

function estimatePage(position: number, textLength: number, pageCount: number) {
  if (pageCount <= 1 || textLength <= 0) {
    return 1;
  }

  return Math.min(pageCount, Math.max(1, Math.ceil((position / textLength) * pageCount)));
}

function createFallbackText(name: string, mimeType: string) {
  return [
    `${name} was uploaded into AuraLaw AI for document review.`,
    `The file type is ${mimeType || "unknown"} and is being treated as an unstructured legal document.`,
    "Potential review classes include personal data, confidentiality language, indemnities, jurisdiction clauses, and cross-border compliance requirements.",
  ].join(" ");
}

function redactPreview(preview: string, findings: ScanFinding[]) {
  let redacted = preview;
  const uniqueMatches = [...new Set(findings.map((finding) => finding.match.trim()).filter(Boolean))];

  for (const match of uniqueMatches) {
    const relatedFinding = findings.find((finding) => finding.match === match);
    const label = relatedFinding?.kind ?? "Sensitive";
    redacted = redacted.replace(
      new RegExp(escapeForRegex(match), "gi"),
      `[REDACTED ${label.toUpperCase()}]`,
    );
  }

  return redacted;
}

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

    while ((match = regex.exec(analysisText)) !== null && findings.length < 30) {
      const matchedText = match[0].trim();

      findings.push({
        id: randomUUID(),
        documentName: name,
        kind: pattern.kind,
        risk: pattern.risk,
        label: pattern.label,
        match: matchedText,
        excerpt: buildExcerpt(analysisText, match.index, match.index + matchedText.length),
        page: estimatePage(match.index, analysisText.length, computedPageCount),
      });
    }
  }

  if (findings.length === 0) {
    findings.push(
      {
        id: randomUUID(),
        documentName: name,
        kind: "PII",
        risk: "medium",
        label: "Manual review recommended",
        match: name,
        excerpt: `AuraLaw normalized ${name} and prepared it for human review. No automatic high-confidence hits were found in the extracted text, so a reviewer should still confirm whether the document is safe to share.`,
        page: 1,
      },
      {
        id: randomUUID(),
        documentName: name,
        kind: "Compliance",
        risk: "medium",
        label: "Cross-jurisdiction check",
        match: mimeType || "document",
        excerpt: `Before export, confirm whether ${name} contains region-specific disclosure or transfer obligations that should remain blocked or redacted.`,
        page: 1,
      },
    );
  }

  const preview = clip(analysisText, 1500);
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
    piiCount: findings.filter((finding) => finding.kind === "PII").length,
    clauseCount: findings.filter((finding) => finding.kind === "Clause").length,
    complianceCount: findings.filter((finding) => finding.kind === "Compliance").length,
  };
}

export function buildScanResponse(documents: ScannedDocument[]): ScanResponse {
  const totals = documents.reduce(
    (accumulator, document) => {
      accumulator.documents += 1;
      accumulator.pages += document.pageCount;
      accumulator.pii += document.piiCount;
      accumulator.clauses += document.clauseCount;
      accumulator.compliance += document.complianceCount;
      return accumulator;
    },
    {
      documents: 0,
      pages: 0,
      pii: 0,
      clauses: 0,
      compliance: 0,
    },
  );

  return {
    documents,
    totals,
    certification: {
      generatedAt: new Date().toISOString(),
      jurisdictionNote:
        "Prepared for cross-jurisdiction review. Validate local disclosure and privacy obligations before external circulation.",
      summary: `AuraLaw AI scanned ${totals.documents} document${totals.documents === 1 ? "" : "s"}, flagged ${totals.pii} PII hits, ${totals.clauses} sensitive clause indicators, and ${totals.compliance} compliance-related references.`,
    },
  };
}
