"use client";

import { useMemo, useRef, useState } from "react";
import type { ScanFinding, ScanResponse } from "@/lib/document-scan";

type Stage = "idle" | "uploading" | "scanning" | "reviewed" | "redacted";

const STAGE_LABELS: Record<Exclude<Stage, "idle">, string[]> = {
  uploading: [
    "Normalizing uploads",
    "Checking file types and page volume",
    "Preparing the review workspace",
  ],
  scanning: [
    "Running PII detection",
    "Scanning sensitive clauses",
    "Mapping cross-jurisdiction compliance risk",
  ],
  reviewed: [
    "Findings are ready for review",
    "Redaction package can be generated",
    "Export options are unlocked",
  ],
  redacted: [
    "All findings applied to the redacted output",
    "Certification summary prepared",
    "Export package ready to download",
  ],
};

function formatBytes(value: number) {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function badgeTone(risk: ScanFinding["risk"]) {
  if (risk === "high") {
    return "bg-[#d46b4d]/15 text-[#9e4024] border-[#d46b4d]/30";
  }

  if (risk === "medium") {
    return "bg-[#2f6f95]/10 text-[#2f6f95] border-[#2f6f95]/20";
  }

  return "bg-deep-soft/80 text-ink-soft border-line";
}

export function UploadWorkbench() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  const currentChecklist = useMemo(() => {
    if (stage === "idle") {
      return [
        "Upload PDFs, DOCX, or text-based files",
        "AuraLaw scans for PII, clauses, and compliance risk",
        "Redact and export the current results",
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
    if (!nextFiles?.length) {
      return;
    }

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

    for (const file of files) {
      body.append("documents", file);
    }

    setError(null);
    setScanResult(null);
    setStage("uploading");

    await new Promise((resolve) => window.setTimeout(resolve, 550));
    setStage("scanning");

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        body,
      });

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
    if (!scanResult) {
      return;
    }

    setStage("redacted");
  }

  function downloadFile(filename: string, contents: string, mimeType: string) {
    const blob = new Blob([contents], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  function handleExportAudit() {
    if (!scanResult) {
      return;
    }

    downloadFile(
      "auralaw-audit-report.json",
      JSON.stringify(scanResult, null, 2),
      "application/json",
    );
  }

  function handleExportCertified() {
    if (!scanResult) {
      return;
    }

    const lines = [
      "AuraLaw AI Certified Export",
      "===========================",
      `Generated: ${scanResult.certification.generatedAt}`,
      "",
      scanResult.certification.summary,
      scanResult.certification.jurisdictionNote,
      "",
      ...scanResult.documents.flatMap((document) => [
        `Document: ${document.name}`,
        `Pages: ${document.pageCount}`,
        `PII hits: ${document.piiCount}`,
        `Clause hits: ${document.clauseCount}`,
        `Compliance hits: ${document.complianceCount}`,
        "",
        "Redacted output:",
        stage === "redacted" ? document.redactedPreview : document.preview,
        "",
        "----",
        "",
      ]),
    ];

    downloadFile("auralaw-certified-export.txt", lines.join("\n"), "text/plain;charset=utf-8");
  }

  const activeDocument =
    scanResult?.documents.find((document) => document.id === activeDocumentId) ??
    scanResult?.documents[0] ??
    null;
  const isBusy = stage === "uploading" || stage === "scanning";
  const stageLabel =
    stage === "idle"
      ? "Ready"
      : stage === "uploading"
        ? "Uploading"
        : stage === "scanning"
          ? "Scanning"
          : stage === "reviewed"
            ? "Reviewed"
            : "Redacted";

  return (
    <div className="surface-panel relative overflow-hidden p-5 sm:p-7">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-accent">
              Review workspace
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-ink sm:text-3xl">
              Upload documents and run Aura-Engine
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-ink-soft">
              Keep upload, findings, redaction, and export actions in one clean
              browser workflow.
            </p>
          </div>
          <span className="status-pill self-start">{stageLabel}</span>
        </div>

        <button
          className={`upload-dropzone ${isDragging ? "upload-dropzone-active" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleSelect(event.dataTransfer.files);
          }}
          type="button"
        >
          <span className="upload-dropzone-icon">+</span>
          <span className="block text-lg font-semibold text-ink">
            Drag in supported files
          </span>
          <span className="mt-2 block text-sm leading-6 text-ink-soft">
            Click to choose files or drop multiple documents to scan them
            together in one request.
          </span>
          <span className="mt-4 inline-flex flex-wrap justify-center gap-2 text-xs text-ink-soft">
            {["PDF", "DOCX", "TXT", "CSV", "JSON"].map((item) => (
              <span key={item} className="chip px-3 py-2">
                {item}
              </span>
            ))}
          </span>
        </button>

        <input
          ref={inputRef}
          accept=".pdf,.doc,.docx,.txt,.md,.csv,.json,.html,.rtf"
          className="hidden"
          multiple
          onChange={(event) => handleSelect(event.target.files)}
          type="file"
        />

        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.6rem] border border-line/70 bg-surface/95 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-ink-soft">
                Uploaded documents
              </p>
              {files.length > 0 ? (
                <button
                  className="text-sm font-medium text-ink-soft hover:text-ink"
                  onClick={() => {
                    setFiles([]);
                    setScanResult(null);
                    setActiveDocumentId(null);
                    setError(null);
                    setStage("idle");
                  }}
                  type="button"
                >
                  Clear all
                </button>
              ) : null}
            </div>
            <div className="mt-4 space-y-3">
              {files.length === 0 ? (
                <p className="text-sm leading-6 text-ink-soft">
                  No documents uploaded yet. Add one or more files to run the
                  scan and generate redacted output.
                </p>
              ) : (
                files.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="rounded-[1.2rem] border border-line/70 bg-deep-soft/75 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="break-all text-sm font-semibold text-ink">{file.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-ink-soft">
                          {file.type || "Unknown"} · {formatBytes(file.size)}
                        </p>
                      </div>
                      <button
                        className="text-sm font-medium text-ink-soft hover:text-ink"
                        onClick={() => removeFile(index)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                className="cta-primary flex-1"
                disabled={isBusy}
                onClick={handleScan}
                type="button"
              >
                {isBusy ? "Processing..." : "Run Aura-Engine scan"}
              </button>
              <button
                className="cta-secondary flex-1"
                disabled={isBusy}
                onClick={() => inputRef.current?.click()}
                type="button"
              >
                Add more documents
              </button>
            </div>
            {error ? (
              <p className="mt-4 rounded-[1rem] border border-[#d46b4d]/25 bg-[#d46b4d]/10 px-4 py-3 text-sm text-[#9e4024]">
                {error}
              </p>
            ) : null}
          </div>

          <div className="rounded-[1.6rem] border border-line/70 bg-deep p-5 text-ink">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-ink-soft">
              Processing status
            </p>
            <div className="mt-5 space-y-3">
              {currentChecklist.map((item, index) => (
                <div key={item} className="flex gap-3 text-sm leading-6">
                  <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-canvas/20 text-xs">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[1.3rem] border border-line/70 bg-white/5 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-ink-soft">
                Scanner notes
              </p>
              <p className="mt-3 text-sm leading-6 text-ink/85">
                DOCX files are converted server-side. Text-based PDFs work best.
                Image-only PDFs should be OCR-processed before upload.
              </p>
            </div>
          </div>
        </div>

        {scanResult ? (
          <div className="rounded-[1.8rem] border border-line/70 bg-surface/95 p-5 sm:p-6">
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <div className="console-stat">
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-ink-soft">
                  Documents
                </p>
                <p className="mt-3 text-2xl font-semibold text-ink">
                  {scanResult.totals.documents}
                </p>
              </div>
              <div className="console-stat">
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-ink-soft">
                  Pages
                </p>
                <p className="mt-3 text-2xl font-semibold text-ink">
                  {scanResult.totals.pages}
                </p>
              </div>
              <div className="console-stat">
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-ink-soft">
                  PII hits
                </p>
                <p className="mt-3 text-2xl font-semibold text-ink">
                  {scanResult.totals.pii}
                </p>
              </div>
              <div className="console-stat">
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-ink-soft">
                  Clauses
                </p>
                <p className="mt-3 text-2xl font-semibold text-ink">
                  {scanResult.totals.clauses}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[1.5rem] border border-line/70 bg-deep-soft/72 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.28em] text-ink-soft">
                      Scan results
                    </p>
                    <h3 className="mt-2 break-all text-xl font-semibold text-ink">
                      {activeDocument?.name}
                    </h3>
                  </div>
                  <button
                    className="cta-secondary w-full px-5 py-3 text-sm sm:w-auto"
                    onClick={handleRedactAll}
                    type="button"
                  >
                    Redact all findings
                  </button>
                </div>
                {scanResult.documents.length > 1 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {scanResult.documents.map((document) => (
                      <button
                        key={document.id}
                        className="console-button w-full px-4 py-2 text-sm sm:w-auto"
                        aria-pressed={document.id === activeDocumentId}
                        onClick={() => setActiveDocumentId(document.id)}
                        type="button"
                      >
                        {document.name}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="mt-4 space-y-3">
                  {activeDocument?.findings.map((finding) => (
                    <article
                      key={finding.id}
                      className="rounded-[1.2rem] border border-line/70 bg-canvas/40 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${badgeTone(
                            finding.risk,
                          )}`}
                        >
                          {finding.risk}
                        </span>
                        <span className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
                          {finding.kind} · Page {finding.page}
                        </span>
                      </div>
                      <h4 className="mt-3 text-sm font-semibold text-ink">
                        {finding.label}
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-ink-soft">
                        {finding.excerpt}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-line/70 bg-deep p-5 text-ink">
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-ink-soft">
                  {stage === "redacted" ? "Redacted output" : "Extracted text"}
                </p>
                <pre className="mt-4 max-h-[26rem] overflow-auto whitespace-pre-wrap rounded-[1.2rem] border border-line/60 bg-white/5 p-4 text-sm leading-7 text-ink/90">
                  {activeDocument
                    ? stage === "redacted"
                      ? activeDocument.redactedPreview
                      : activeDocument.preview
                    : "Upload and scan a document to inspect extracted text and results."}
                </pre>
                <div className="mt-5 rounded-[1.2rem] border border-line/60 bg-white/5 p-4">
                  <p className="font-mono text-xs uppercase tracking-[0.28em] text-ink-soft">
                    Export summary
                  </p>
                  <p className="mt-3 text-sm leading-6 text-ink/85">
                    {scanResult.certification.summary}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">
                    {scanResult.certification.jurisdictionNote}
                  </p>
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button className="cta-on-dark flex-1" onClick={handleExportCertified} type="button">
                    Download redacted export
                  </button>
                  <button className="cta-secondary flex-1 border-line bg-white/6 text-ink hover:bg-white/10" onClick={handleExportAudit} type="button">
                    Download audit log
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
