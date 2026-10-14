"use client";

import { useState, useCallback } from "react";
import { Download, Package, CheckCircle, Loader2, Database } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useStore } from "@/lib/store";
import { streamZipDownload } from "@/lib/zip-stream";

export default function Step7_Download() {
  const { issuedCredentials, setStep } = useStore();
  const [zipping, setZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipDone, setZipDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadZip = useCallback(async () => {
    const generatedPdfs = typeof window !== "undefined"
      ? (window as any).__certifyGeneratedPdfs as Array<{ pdfBytes: Uint8Array; filename: string }> | undefined
      : undefined;

    if (!generatedPdfs || generatedPdfs.length === 0) {
      setError("No generated PDFs found. Please go back and run generation first.");
      return;
    }

    setZipping(true);
    setZipProgress(0);
    setError(null);

    try {
      const today = new Date().toISOString().split("T")[0];
      const zipFilename = `Certificates_Batch_${today}.zip`;

      await streamZipDownload(
        generatedPdfs.map((p) => ({ filename: p.filename, data: p.pdfBytes })),
        zipFilename,
        (done, total) => setZipProgress(Math.round((done / total) * 100))
      );

      setZipDone(true);
    } catch (e) {
      setError(`ZIP packaging failed: ${(e as Error).message}`);
    } finally {
      setZipping(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Step 7 — Download ZIP Archive</h2>
        <p className="mt-1 text-gray-500">
          All generated PDFs are bundled into a single ZIP file using streamed compression to minimize memory usage.
        </p>
      </div>

      {/* Summary */}
      <div className="p-5 bg-green-50 border border-green-200 rounded-xl space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-green-600" />
          <span className="font-semibold text-green-800">
            {issuedCredentials.length} certificate{issuedCredentials.length !== 1 ? "s" : ""} ready in registry
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-green-700">
            <Package size={14} />
            PDF vector format
          </div>
          <div className="flex items-center gap-2 text-green-700">
            <Database size={14} />
            SHA-256 hashes saved
          </div>
        </div>
      </div>

      {/* Download Button */}
      {!zipping && !zipDone && (
        <Button onClick={downloadZip} size="lg" className="w-full gap-2">
          <Download size={18} />
          Download Certificates_Batch.zip
        </Button>
      )}

      {zipping && (
        <div className="space-y-3 p-5 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <Loader2 size={18} className="animate-spin text-blue-600" />
            <span className="text-sm text-gray-700">Compressing PDFs with fflate…</span>
          </div>
          <ProgressBar value={zipProgress} label="ZIP compression progress" color="green" />
        </div>
      )}

      {zipDone && (
        <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-blue-600" />
            <p className="font-semibold text-blue-800">ZIP downloaded successfully!</p>
          </div>
          <p className="text-sm text-blue-700">
            Your certificates are in your Downloads folder. Verification links are live at{" "}
            <code className="text-xs bg-blue-100 px-1 py-0.5 rounded">/verify?id=EKC-…</code>
          </p>
          <Button variant="outline" size="sm" onClick={downloadZip}>
            <Download size={14} /> Download Again
          </Button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(6)}>← Back</Button>
        <Button variant="secondary" onClick={() => setStep(8)} className="ml-auto">
          Go to Registry →
        </Button>
      </div>
    </div>
  );
}
