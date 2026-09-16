import { extractText, getDocumentProxy } from "unpdf";

export async function pdfToText(buffer: Buffer | Uint8Array): Promise<string> {
  const bytes = Uint8Array.from(buffer);
  const pdf = await getDocumentProxy(bytes);
  const result = await extractText(pdf, { mergePages: false });
  const pages = Array.isArray(result.text) ? result.text : [result.text];
  return pages
    .map((page, index) => `--- Seite ${index + 1} ---\n${page.trim()}`)
    .join("\n\n")
    .replace(/\u0000/g, "")
    .trim();
}
