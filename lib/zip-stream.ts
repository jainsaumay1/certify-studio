/**
 * Streamed ZIP packager using fflate.
 * Avoids holding the entire uncompressed archive in memory.
 * Writes compressed chunks to a Blob, then triggers a browser download.
 */
import { Zip, ZipDeflate } from "fflate";

export interface ZipEntry {
  filename: string;
  data: Uint8Array;
}

export async function streamZipDownload(
  entries: ZipEntry[],
  zipFilename: string,
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    const total = entries.length;
    let done = 0;

    const zip = new Zip((err, data, final) => {
      if (err) {
        reject(err);
        return;
      }
      chunks.push(data);
      if (final) {
        const blob = new Blob(chunks.map(c => c.buffer as ArrayBuffer), { type: "application/zip" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = zipFilename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
        resolve();
      }
    });

    for (const entry of entries) {
      const file = new ZipDeflate(entry.filename, { level: 6 });
      zip.add(file);
      file.push(entry.data, true); // true = last chunk for this file
      done++;
      onProgress?.(done, total);
    }

    zip.end();
  });
}
