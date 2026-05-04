"use client";

import { useMemo, useRef, useState } from "react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import type { ScanFinding, ScanResponse, FindingKind } from "@/lib/document-scan";

type Stage = "idle" | "uploading" | "scanning" | "reviewed" | "redacted";
type TabId = "all" | FindingKind | "recommendations";

const STAGE_LABELS: Record<Exclude<Stage, "idle">, string[]> = {
  uploading: [
    "Normalizing uploads",
    "Checking file types and page volume",
    "Preparing the review workspace",
  ],
  scanning: [
    "Extracting contract metadata & parties",
    "Identifying structural legal risks & liabilities",
    "Mapping key operational obligations",
    "Flagging missing standard provisions",
  ],
  reviewed: [
    "Due Diligence Review complete",
    "Findings are ready for analysis",
    "Export packages ready",
  ],
  redacted: [
    "Data privacy items redacted",
    "Certification summary prepared",
    "Redacted export ready",
  ],
};

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function badgeTone(risk: ScanFinding["risk"]) {
  if (risk === "critical") return "bg-[#d4314d]/15 text-[#ff4d6d] border-[#d4314d]/40 shadow-[0_0_10px_rgba(212,49,77,0.2)]";
  if (risk === "high") return "bg-[#d46b4d]/15 text-[#ff8c69] border-[#d46b4d]/30";
  if (risk === "medium") return "bg-[#2f6f95]/15 text-[#4da8da] border-[#2f6f95]/30";
  return "bg-deep-soft/80 text-ink-soft border-line";
}

function riskGradeTone(grade: string) {
  if (grade === "A") return "text-[#1ce4d3] border-[#1ce4d3]/30 bg-[#1ce4d3]/10";
  if (grade === "B") return "text-[#4da8da] border-[#4da8da]/30 bg-[#4da8da]/10";
  if (grade === "C") return "text-[#ffd166] border-[#ffd166]/30 bg-[#ffd166]/10";
  if (grade === "D") return "text-[#ff8c69] border-[#ff8c69]/30 bg-[#ff8c69]/10";
  return "text-[#ff4d6d] border-[#ff4d6d]/30 bg-[#ff4d6d]/10"; // F
}

export function UploadWorkbench() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const currentChecklist = useMemo(() => {
    if (stage === "idle") {
      return [
        "Upload MSAs, NDAs, or Employment Contracts",
        "Aura-Engine runs full due diligence review",
        "Export professional enterprise audit reports",
      ];
    }
    return STAGE_LABELS[stage];
  }, [stage]);

  function mergeFiles(nextFiles: File[]) {
    setFiles((current) => {
      const existingKeys = new Set(current.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
      const merged = [...current];
      for (const file of nextFiles) {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (!existingKeys.has(key)) {
          merged.push(file);
          existingKeys.add(key);
        }
      }
      return merged;
    });
  }

  function handleSelect(nextFiles: FileList | null) {
    if (!nextFiles?.length) return;
    setError(null);
    mergeFiles(Array.from(nextFiles));
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  }

  async function handleScan() {
    if (files.length === 0) {
      setError("Upload at least one PDF, DOCX, or related document to start.");
      return;
    }

    const body = new FormData();
    for (const file of files) body.append("documents", file);

    setError(null);
    setScanResult(null);
    setStage("uploading");
    setActiveTab("all");

    await new Promise((resolve) => window.setTimeout(resolve, 550));
    setStage("scanning");

    try {
      const response = await fetch("/api/scan", { method: "POST", body });
      const payload = (await response.json()) as ScanResponse | { error?: string };

      if (!response.ok) {
        throw new Error(payload && "error" in payload ? payload.error : "The scan failed.");
      }

      const result = payload as ScanResponse;
      setScanResult(result);
      setActiveDocumentId(result.documents[0]?.id ?? null);
      setStage("reviewed");
    } catch (scanError) {
      setStage("idle");
      setError(scanError instanceof Error ? scanError.message : "The scan failed.");
    }
  }

  function handleRedactAll() {
    if (!scanResult) return;
    setStage("redacted");
  }

  function handleExportAudit() {
    if (!scanResult) return;
    const blob = new Blob([JSON.stringify(scanResult, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "auralaw-audit-report.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleExportPDF() {
    if (!scanResult) return;

    const doc = scanResult.documents.find((d) => d.id === activeDocumentId) ?? scanResult.documents[0];
    if (!doc) return;

    const findingsRows = doc.findings.map(f => `
      <tr>
        <td><span class="badge ${f.risk}">${f.risk.toUpperCase()}</span></td>
        <td><strong>${f.kind}</strong><br/>Page ${f.page}</td>
        <td><em>"${f.match}"</em><br/><span class="excerpt">${f.excerpt}</span></td>
        <td>${f.recommendation}</td>
      </tr>
    `).join('');

    const partiesList = doc.metadata?.parties && doc.metadata.parties.length > 0 
      ? doc.metadata.parties.map(p => `<li><strong>${p}</strong></li>`).join('')
      : "<li><em>No specific parties automatically identified in preamble.</em></li>";

    const recsList = doc.recommendations.map(r => `<li>${r}</li>`).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AuraLaw AI Export - ${doc.name}</title>
          <style>
            @page { margin: 20mm; size: A4 portrait; }
            body { font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a; line-height: 1.6; max-width: 900px; margin: 0 auto; font-size: 14px; }
            h1 { color: #0f2e4a; border-bottom: 3px solid #1ce4d3; padding-bottom: 15px; margin-bottom: 30px; font-size: 28px; }
            h2 { color: #2a78ae; margin-top: 40px; border-bottom: 1px solid #eee; padding-bottom: 10px; font-size: 20px; }
            h3 { color: #333; margin-top: 25px; font-size: 16px; }
            
            /* Meta Grid */
            .meta { background: #f8fbff; border: 1px solid #e1effa; padding: 25px; border-radius: 8px; margin-bottom: 30px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .meta-item { display: flex; flex-direction: column; }
            .meta-label { font-size: 11px; text-transform: uppercase; color: #666; letter-spacing: 0.5px; font-weight: bold; }
            .meta-value { font-size: 15px; color: #111; font-weight: 500; }
            
            /* Overview Table */
            .overview-table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
            .overview-table th { background: #f8fafc; text-align: left; padding: 12px 15px; font-size: 12px; text-transform: uppercase; color: #475569; width: 30%; border: 1px solid #e2e8f0; }
            .overview-table td { padding: 12px 15px; border: 1px solid #e2e8f0; font-size: 14px; color: #1e293b; }
            .parties-list { margin: 0; padding-left: 20px; }

            /* Risk Bar */
            .risk-bar-container { display: flex; height: 30px; border-radius: 6px; overflow: hidden; margin: 15px 0 5px 0; background: #eee; }
            .risk-segment { display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold; }
            .risk-financial { background: #ff4d6d; }
            .risk-legal { background: #ff8c69; }
            .risk-operational { background: #ffd166; color: #333; }
            .risk-comp { background: #4da8da; }
            .risk-legend { display: flex; gap: 15px; font-size: 12px; margin-bottom: 30px; }
            .legend-item { display: flex; align-items: center; gap: 5px; }
            .dot { width: 10px; height: 10px; border-radius: 50%; }
            
            /* Recommendations */
            .recs-box { background: #fdfaf2; border: 1px solid #f6e6b8; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .recs-box ul { margin: 0; padding-left: 20px; color: #443c24; }
            .recs-box li { margin-bottom: 10px; }

            /* Findings Table */
            .findings-table { width: 100%; border-collapse: collapse; margin-top: 20px; page-break-inside: auto; }
            .findings-table tr { page-break-inside: avoid; page-break-after: auto; }
            .findings-table th { background: #f1f5f9; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
            .findings-table td { padding: 15px 12px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
            .excerpt { font-size: 12px; color: #64748b; display: block; margin-top: 8px; font-style: italic; background: #f8fafc; padding: 8px; border-radius: 4px; }
            
            /* Badges */
            .badge { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; letter-spacing: 0.5px; }
            .critical { background: #fee2e2; color: #b91c1c; border: 1px solid #f87171; }
            .high { background: #ffedd5; color: #c2410c; border: 1px solid #fdba74; }
            .medium { background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; }
            .low { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }

            /* Redacted Content */
            .redacted-content { font-family: 'JetBrains Mono', Consolas, monospace; font-size: 12px; white-space: pre-wrap; background: #fafafa; border: 1px solid #eaeaea; padding: 30px; border-radius: 8px; margin-top: 20px; page-break-before: always; }
            
            .footer { margin-top: 50px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <h1>AuraLaw AI Enterprise Due Diligence Report</h1>
          
          <div class="meta">
            <div class="meta-grid">
              <div class="meta-item"><span class="meta-label">Document Name</span><span class="meta-value">${doc.name}</span></div>
              <div class="meta-item"><span class="meta-label">Generated Date</span><span class="meta-value">${new Date().toLocaleString()}</span></div>
              <div class="meta-item"><span class="meta-label">Page Count</span><span class="meta-value">${doc.pageCount} Pages</span></div>
              <div class="meta-item"><span class="meta-label">Overall Risk Grade</span><span class="meta-value" style="color: ${doc.riskScore.grade === 'A' || doc.riskScore.grade === 'B' ? '#059669' : doc.riskScore.grade === 'F' ? '#dc2626' : '#d97706'}">${doc.riskScore.grade} (${doc.riskScore.label})</span></div>
            </div>
            <p style="margin-top: 15px; font-size: 11px; color: #64748b; font-style: italic;">${scanResult.certification.jurisdictionNote}</p>
          </div>

          <h2>1. Contract Overview</h2>
          <table class="overview-table">
            <tbody>
              <tr>
                <th>Classification</th>
                <td><strong>${doc.metadata?.classification || "Unknown"}</strong></td>
              </tr>
              <tr>
                <th>Identified Parties</th>
                <td><ul class="parties-list">${partiesList}</ul></td>
              </tr>
              <tr>
                <th>Effective Date</th>
                <td>${doc.metadata?.effectiveDate || "Not identified"}</td>
              </tr>
              <tr>
                <th>Governing Law</th>
                <td>${doc.metadata?.governingLaw || "Not identified"}</td>
              </tr>
            </tbody>
          </table>

          <h2>2. Enterprise Risk Breakdown</h2>
          <p style="font-size: 13px; color: #555;">Visual breakdown of business liabilities across the document:</p>
          
          <div class="risk-bar-container">
            <div class="risk-segment risk-financial" style="width: ${Math.max(5, doc.riskScore.breakdown.financial)}%;">${doc.riskScore.breakdown.financial}%</div>
            <div class="risk-segment risk-legal" style="width: ${Math.max(5, doc.riskScore.breakdown.legal)}%;">${doc.riskScore.breakdown.legal}%</div>
            <div class="risk-segment risk-operational" style="width: ${Math.max(5, doc.riskScore.breakdown.operational)}%;">${doc.riskScore.breakdown.operational}%</div>
            <div class="risk-segment risk-comp" style="width: ${Math.max(5, doc.riskScore.breakdown.compliance)}%;">${doc.riskScore.breakdown.compliance}%</div>
          </div>
          <div class="risk-legend">
            <div class="legend-item"><div class="dot risk-financial"></div>Financial</div>
            <div class="legend-item"><div class="dot risk-legal"></div>Legal</div>
            <div class="legend-item"><div class="dot risk-operational"></div>Operational</div>
            <div class="legend-item"><div class="dot risk-comp"></div>Compliance</div>
          </div>

          <h2>3. Executive Recommendations</h2>
          <div class="recs-box">
            <ul>${recsList}</ul>
          </div>

          <h2 style="page-break-before: always;">4. Detailed Findings Log</h2>
          ${doc.findings.length > 0 ? `
            <table class="findings-table">
              <thead>
                <tr>
                  <th style="width: 10%;">Risk</th>
                  <th style="width: 15%;">Category</th>
                  <th style="width: 40%;">Match & Context Excerpt</th>
                  <th style="width: 35%;">Actionable Recommendation</th>
                </tr>
              </thead>
              <tbody>
                ${findingsRows}
              </tbody>
            </table>
          ` : '<p style="padding: 20px; background: #f8fafc; text-align: center; border-radius: 8px;">No high-risk findings detected in this document.</p>'}

          <div class="redacted-content">
            <h2 style="margin-top: 0;">5. Final Redacted Text</h2>
            ${stage === "redacted" ? doc.redactedPreview : doc.preview}
          </div>
          
          <div class="footer">
            Generated securely by AuraLaw AI (${scanResult.certification.engineVersion}). 
            This is an automated scan and does not constitute formal legal advice.
            <br/>https://auralaw.ai
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } else {
      alert("Please allow popups to generate the PDF export.");
    }
  }

  async function handleExportDOCX() {
    if (!scanResult) return;

    const doc = scanResult.documents.find((d) => d.id === activeDocumentId) ?? scanResult.documents[0];
    if (!doc) return;

    const textContent = stage === "redacted" ? doc.redactedPreview : doc.preview;

    const docx = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "AuraLaw AI Enterprise Due Diligence Report",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Document: ", bold: true }),
              new TextRun({ text: `${doc.name}` }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Classification: ", bold: true }),
              new TextRun({ text: `${doc.metadata?.classification || "Unknown"}` }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Generated: ", bold: true }),
              new TextRun({ text: `${new Date().toLocaleString()}` }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Risk Grade: ", bold: true }),
              new TextRun({ text: `${doc.riskScore.grade} (${doc.riskScore.label})` }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: scanResult.certification.jurisdictionNote,
                italics: true,
              }),
            ],
            spacing: { before: 200, after: 400 },
          }),
          new Paragraph({
            text: "Redacted Document Content",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          }),
          ...textContent.split('\n').map(line => new Paragraph({ text: line })),
        ],
      }],
    });

    const blob = await Packer.toBlob(docx);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `AuraLaw-Export-${doc.name}.docx`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const activeDocument = scanResult?.documents.find((d) => d.id === activeDocumentId) ?? scanResult?.documents[0] ?? null;
  const isBusy = stage === "uploading" || stage === "scanning";
  const stageLabel = stage === "idle" ? "Ready" : stage === "uploading" ? "Uploading" : stage === "scanning" ? "Engine Running" : stage === "reviewed" ? "Review Complete" : "Redacted";

  const displayedFindings = activeDocument?.findings.filter((f) => activeTab === "all" || f.kind === activeTab) ?? [];

  return (
    <div className="surface-panel relative overflow-hidden p-5 sm:p-7">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-accent">Review Workspace</p>
            <h2 className="mt-3 text-2xl font-semibold text-ink sm:text-3xl">Enterprise Contract Review</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-ink-soft">
              Extract metadata, map legal risks, track operational obligations, and identify missing clauses.
            </p>
          </div>
          <span className="status-pill self-start">{stageLabel}</span>
        </div>

        {/* Upload Zone */}
        <button
          className={`upload-dropzone ${isDragging ? "upload-dropzone-active" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleSelect(e.dataTransfer.files); }}
          type="button"
        >
          <span className="upload-dropzone-icon">+</span>
          <span className="block text-lg font-semibold text-ink">Drag in supported files</span>
          <span className="mt-2 block text-sm leading-6 text-ink-soft">Click to choose files or drop multiple documents.</span>
          <span className="mt-4 inline-flex flex-wrap justify-center gap-2 text-xs text-ink-soft">
            {["PDF", "DOCX", "TXT", "CSV", "JSON"].map((item) => (
              <span key={item} className="chip px-3 py-2">{item}</span>
            ))}
          </span>
        </button>

        <input
          ref={inputRef}
          accept=".pdf,.doc,.docx,.txt,.md,.csv,.json,.html,.rtf"
          className="hidden"
          multiple
          onChange={(e) => handleSelect(e.target.files)}
          type="file"
        />

        {/* File List & Status */}
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.6rem] border border-line/70 bg-surface/95 p-5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-ink-soft">Uploaded Queue</p>
              {files.length > 0 && (
                <button
                  className="text-sm font-medium text-ink-soft hover:text-ink"
                  onClick={() => { setFiles([]); setScanResult(null); setActiveDocumentId(null); setError(null); setStage("idle"); }}
                  type="button"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="mt-4 space-y-3">
              {files.length === 0 ? (
                <p className="text-sm text-ink-soft">No documents uploaded yet.</p>
              ) : (
                files.map((file, index) => (
                  <div key={`${file.name}-${file.size}`} className="flex items-center justify-between rounded-[1.2rem] border border-line/70 bg-deep-soft/75 p-4">
                    <div>
                      <p className="text-sm font-semibold text-ink break-all">{file.name}</p>
                      <p className="text-xs uppercase text-ink-soft">{file.type || "Unknown"} · {formatBytes(file.size)}</p>
                    </div>
                    <button className="text-sm text-ink-soft hover:text-ink" onClick={() => removeFile(index)} type="button">Remove</button>
                  </div>
                ))
              )}
            </div>
            <div className="mt-5 flex gap-3">
              <button className="cta-primary flex-1" disabled={isBusy} onClick={handleScan} type="button">
                {isBusy ? "Engine Running..." : "Run Due Diligence Scan"}
              </button>
            </div>
            {error && <p className="mt-4 rounded-[1rem] border border-[#d46b4d]/25 bg-[#d46b4d]/10 px-4 py-3 text-sm text-[#ff8c69]">{error}</p>}
          </div>

          <div className="rounded-[1.6rem] border border-line/70 bg-deep p-5 text-ink">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-ink-soft">System Status</p>
            <div className="mt-5 space-y-3">
              {currentChecklist.map((item, i) => (
                <div key={item} className="flex gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-canvas/20 text-xs">{i + 1}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Scan Results */}
        {scanResult && activeDocument && (
          <div className="rounded-[1.8rem] border border-line/70 bg-surface/95 p-5 sm:p-6 animate-fade-in-up">
            
            {/* Top Dashboard: Contract Overview */}
            <div className="mb-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
              <div className="rounded-[1.5rem] border border-line/70 bg-deep-soft/80 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft mb-4">Contract Snapshot</p>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <p className="text-xs text-ink-soft mb-1">Classification</p>
                    <p className="text-sm font-semibold text-accent">{activeDocument.metadata?.classification || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-soft mb-1">Parties Identified</p>
                    <p className="text-sm font-semibold text-ink line-clamp-1" title={activeDocument.metadata?.parties?.join(" & ") || ""}>
                      {activeDocument.metadata?.parties && activeDocument.metadata.parties.length > 0 ? activeDocument.metadata.parties.join(" & ") : "None detected"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-soft mb-1">Effective Date</p>
                    <p className="text-sm font-medium text-ink">{activeDocument.metadata?.effectiveDate || "Unspecified"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-soft mb-1">Governing Law</p>
                    <p className="text-sm font-medium text-ink">{activeDocument.metadata?.governingLaw || "Unspecified"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-line/70 bg-deep-soft/80 p-5 flex items-center justify-center gap-6">
                <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[3px] text-3xl font-black ${riskGradeTone(activeDocument.riskScore.grade)}`}>
                  {activeDocument.riskScore.grade}
                </div>
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">Risk Grade</p>
                  <p className="text-xl font-bold text-ink mt-1">{activeDocument.riskScore.overall} / 100</p>
                  <p className="text-sm text-ink-soft">{activeDocument.riskScore.label}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              
              {/* Left Column: Tabbed Findings */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    <button className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border ${activeTab === 'all' ? 'bg-accent/10 border-accent/30 text-accent font-semibold' : 'border-line/70 text-ink-soft hover:text-ink'}`} onClick={() => setActiveTab('all')}>All</button>
                    <button className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border ${activeTab === 'Risk' ? 'bg-[#ff8c69]/10 border-[#ff8c69]/30 text-[#ff8c69] font-semibold' : 'border-line/70 text-ink-soft hover:text-ink'}`} onClick={() => setActiveTab('Risk')}>Risks & Liabilities ({activeDocument.categoryCounts.risk})</button>
                    <button className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border ${activeTab === 'Obligation' ? 'bg-[#ffd166]/10 border-[#ffd166]/30 text-[#ffd166] font-semibold' : 'border-line/70 text-ink-soft hover:text-ink'}`} onClick={() => setActiveTab('Obligation')}>Obligations ({activeDocument.categoryCounts.obligation})</button>
                    <button className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border ${activeTab === 'Missing Clause' ? 'bg-[#ff4d6d]/10 border-[#ff4d6d]/30 text-[#ff4d6d] font-semibold' : 'border-line/70 text-ink-soft hover:text-ink'}`} onClick={() => setActiveTab('Missing Clause')}>Missing Clauses ({activeDocument.categoryCounts.missing})</button>
                    <button className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border ${activeTab === 'Data Privacy' ? 'bg-[#4da8da]/10 border-[#4da8da]/30 text-[#4da8da] font-semibold' : 'border-line/70 text-ink-soft hover:text-ink'}`} onClick={() => setActiveTab('Data Privacy')}>Data Privacy ({activeDocument.categoryCounts.privacy})</button>
                    <button className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border ${activeTab === 'recommendations' ? 'bg-accent/10 border-accent/30 text-accent font-semibold' : 'border-line/70 text-ink-soft hover:text-ink'}`} onClick={() => setActiveTab('recommendations')}>Recommendations</button>
                  </div>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {activeTab === "recommendations" ? (
                    <div className="space-y-4">
                      {activeDocument.recommendations.map((rec, i) => (
                        <div key={i} className="rounded-[1.2rem] border border-line/70 bg-deep/60 p-5">
                          <p className="text-sm leading-7 text-ink">{rec}</p>
                        </div>
                      ))}
                    </div>
                  ) : displayedFindings.length > 0 ? (
                    displayedFindings.map((finding) => (
                      <article key={finding.id} className="rounded-[1.2rem] border border-line/70 bg-deep/40 p-5 hover:bg-deep/60 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/40 pb-3 mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeTone(finding.risk)}`}>
                              {finding.risk}
                            </span>
                            <span className="font-mono text-xs text-ink-soft">{finding.kind} · Page {finding.page}</span>
                          </div>
                          <span className="font-mono text-xs text-accent">{finding.confidence}% confidence</span>
                        </div>
                        <h4 className="text-base font-semibold text-ink">{finding.label}</h4>
                        {finding.kind === "Missing Clause" ? (
                          <div className="mt-3 rounded bg-[#ff4d6d]/5 p-3 border border-[#ff4d6d]/20">
                            <p className="text-sm leading-6 text-[#ff4d6d]/90 italic">Warning: The contract is missing standard protective language regarding {finding.label.replace("Missing ", "")}.</p>
                          </div>
                        ) : (
                          <div className="mt-3 rounded bg-canvas/50 p-3 border border-line/30">
                            <p className="font-mono text-xs text-[#ffd166] mb-1">Matched: "{finding.match}"</p>
                            <p className="text-sm leading-6 text-ink-soft italic">"{finding.excerpt}"</p>
                          </div>
                        )}
                        <div className="mt-4 flex gap-2 items-start">
                          <span className="mt-0.5">⚖️</span>
                          <p className="text-sm text-ink/90 leading-6">{finding.recommendation}</p>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="py-10 text-center text-ink-soft border border-dashed border-line/50 rounded-[1.2rem]">
                      No findings for this category.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Preview & Export */}
              <div className="flex flex-col gap-4">
                <div className="rounded-[1.5rem] border border-line/70 bg-deep p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-mono text-xs uppercase tracking-[0.28em] text-ink-soft">
                      {stage === "redacted" ? "Redacted View" : "Document Text"}
                    </p>
                    {stage !== "redacted" && activeDocument.categoryCounts.privacy > 0 && (
                      <button className="text-xs font-semibold text-[#4da8da] hover:text-ink transition-colors" onClick={handleRedactAll} type="button">
                        Apply Privacy Redactions →
                      </button>
                    )}
                  </div>
                  <pre className="flex-1 min-h-[300px] max-h-[400px] overflow-auto whitespace-pre-wrap rounded-[1.2rem] border border-line/60 bg-white/5 p-4 text-xs leading-6 text-ink/80 custom-scrollbar">
                    {stage === "redacted" ? activeDocument.redactedPreview : activeDocument.preview}
                  </pre>
                  
                  <div className="mt-5 space-y-3">
                    <button className="cta-primary w-full justify-center" onClick={handleExportPDF} type="button">
                      Download Due Diligence PDF
                    </button>
                    <button className="cta-primary w-full justify-center !bg-[#2a78ae] !text-ink border-none shadow-[0_14px_34px_rgba(42,120,174,0.22)] hover:!bg-[#358bc7]" onClick={handleExportDOCX} type="button">
                      Download Word (.docx)
                    </button>
                    <button className="cta-secondary w-full justify-center border-line bg-white/5 text-ink hover:bg-white/10" onClick={handleExportAudit} type="button">
                      Download JSON Audit Log
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
