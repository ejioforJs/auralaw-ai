import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { buildScanResponse, scanDocument, type ScannedDocument } from "@/lib/document-scan";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";

function extensionFromName(name: string) {
  return path.extname(name).toLowerCase();
}

async function writeTempFile(file: File) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "auralaw-"));
  const tempPath = path.join(tempDir, `${randomUUID()}-${file.name}`);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(tempPath, buffer);

  return {
    tempDir,
    tempPath,
  };
}

async function extractPageCount(tempPath: string) {
  try {
    const { stdout } = await execFileAsync("mdls", [
      "-name",
      "kMDItemNumberOfPages",
      "-raw",
      tempPath,
    ]);
    const value = Number.parseInt(stdout.trim(), 10);
    return Number.isFinite(value) && value > 0 ? value : undefined;
  } catch {
    return undefined;
  }
}

async function extractTextFromFile(file: File, tempPath: string) {
  const extension = extensionFromName(file.name);

  if ([".txt", ".md", ".csv", ".json", ".html", ".rtf"].includes(extension)) {
    return {
      text: await file.text(),
      extractionMode: "text" as const,
    };
  }

  if ([".doc", ".docx", ".odt"].includes(extension)) {
    try {
      const { stdout } = await execFileAsync("textutil", ["-convert", "txt", "-stdout", tempPath]);
      return {
        text: stdout,
        extractionMode: "converted" as const,
      };
    } catch {
      return {
        text: await file.text().catch(() => ""),
        extractionMode: "heuristic" as const,
      };
    }
  }

  if (extension === ".pdf") {
    try {
      const { stdout } = await execFileAsync("strings", ["-n", "6", tempPath]);
      return {
        text: stdout,
        extractionMode: "heuristic" as const,
      };
    } catch {
      return {
        text: "",
        extractionMode: "heuristic" as const,
      };
    }
  }

  return {
    text: await file.text().catch(() => ""),
    extractionMode: "heuristic" as const,
  };
}

async function scanUploadedFile(file: File): Promise<ScannedDocument> {
  const { tempDir, tempPath } = await writeTempFile(file);

  try {
    const [{ text, extractionMode }, pageCount] = await Promise.all([
      extractTextFromFile(file, tempPath),
      extractPageCount(tempPath),
    ]);

    return scanDocument({
      name: file.name,
      mimeType: file.type,
      size: file.size,
      pageCount,
      extractedText: text,
      extractionMode,
    });
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("documents").filter((value): value is File => value instanceof File);

  if (files.length === 0) {
    return Response.json({ error: "Upload at least one document to start the scan." }, { status: 400 });
  }

  const documents = await Promise.all(files.map((file) => scanUploadedFile(file)));

  return Response.json(buildScanResponse(documents));
}
