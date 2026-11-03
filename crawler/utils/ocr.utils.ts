import { execFile } from "node:child_process";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const RENDER_DPI = "200";
const MAX_OUTPUT_BYTES = 20 * 1024 * 1024;

/**
 * OCR of a scanned PDF with poppler (pdftoppm) + tesseract, installed in the GitHub workflow.
 * Returns null when the tools are missing (local dev), so callers can degrade gracefully.
 */
export async function ocrPdf(bytes: Uint8Array): Promise<string | null> {
  const dir = await mkdtemp(join(tmpdir(), "sorties-ocr-"));
  try {
    const pdfPath = join(dir, "agenda.pdf");
    await writeFile(pdfPath, bytes);
    await run("pdftoppm", ["-r", RENDER_DPI, "-png", pdfPath, join(dir, "page")]);
    const pages = (await readdir(dir)).filter((f) => f.endsWith(".png")).sort();
    const texts: string[] = [];
    for (const page of pages) {
      // psm 4: single column of variable sizes, the closest to a zine agenda
      const { stdout } = await run("tesseract", [join(dir, page), "stdout", "-l", "fra", "--psm", "4"], { maxBuffer: MAX_OUTPUT_BYTES });
      texts.push(stdout);
    }
    return texts.join("\n");
  } catch (error) {
    console.warn("[ocr] unavailable or failed:", error instanceof Error ? error.message : error);
    return null;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
