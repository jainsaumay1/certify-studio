"use client";

import { useState, useCallback } from "react";
import { Loader2, CheckCircle, AlertTriangle, Lock, Zap, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useStore } from "@/lib/store";
import { renderCertificate } from "@/lib/pdf-engine";
import { generateCertId } from "@/lib/cert-id";
import { sha256Hex } from "@/lib/sha256";
import { credentialStore, type Credential } from "@/lib/credential-store";
import { EmailDispatchModal } from "./EmailDispatchModal";
import type { RowAuditResult } from "@/lib/preflight";

export default function Step6_Generate() {
  const {
    mappedRows,
    templateConfig,
    preflightSummary,
    isPaidTier,
    FREE_TIER_LIMIT,
    addCredentials,
    setStep,
    issuedCredentials,
  } = useStore();

  const [progress, setProgress] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [pdfMap, setPdfMap] = useState<Record<string, { pdfBytes: Uint8Array; filename: string }>>({});
  const [batchCredentials, setBatchCredentials] = useState<Credential[]>([]);


  const eligibleRows = preflightSummary
    ? preflightSummary.results.filter((r) => r.status !== "blocked")
    : mappedRows.map((_, i) => ({ rowIndex: i, status: "ready" as const }));

  const totalToGenerate = eligibleRows.length;
  const overFreeTierLimit = !isPaidTier && totalToGenerate > FREE_TIER_LIMIT;

  const generate = useCallback(async () => {
    if (overFreeTierLimit) {
      setShowUpgradeModal(true);
      return;
    }

    setGenerating(true);
    setError(null);
    setProgress(0);

    const baseUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/verify`
        : "https://certifystudio.app/verify";

    const credentials: Credential[] = [];
    const generated: Array<{ pdfBytes: Uint8Array; filename: string }> = [];

    try {
      for (let i = 0; i < eligibleRows.length; i++) {
        const result = eligibleRows[i];
        const row = mappedRows[result.rowIndex];
        const auditResult = preflightSummary?.results[result.rowIndex] as RowAuditResult | undefined;
        const certCode = generateCertId();
        const verifyUrl = `${baseUrl}?id=${certCode}`;

        const { pdfBytes, certificateCode } = await renderCertificate({
          recipientName: row.full_name,
          courseName: row.course,
          issueDate: row.date || new Date().toISOString().split("T")[0],
          certificateCode: certCode,
          verifyUrl,
          templateConfig,
          auditResult,
          isPaidTier,
        });

        const hash = await sha256Hex(pdfBytes.buffer as ArrayBuffer);
        const safeName = (auditResult?.resolvedName ?? row.full_name)
          .replace(/[^a-z0-9_\- ]/gi, "_")
          .slice(0, 60);

        generated.push({ pdfBytes, filename: `${safeName}_${certificateCode}.pdf` });

        const cred: Credential = {
          id: crypto.randomUUID(),
          certificate_code: certCode,
          recipient_name: auditResult?.resolvedName ?? row.full_name,
          recipient_email: row.email,
          course_name: row.course,
          issue_date: row.date || new Date().toISOString().split("T")[0],
          sha256_hash: hash,
          status: "valid",
          version: 1,
          created_at: new Date().toISOString(),
        };
        credentials.push(cred);

        setProgress(Math.round(((i + 1) / eligibleRows.length) * 100));
      }

      // Persist credentials
      await credentialStore.insertMany(credentials);
      addCredentials(credentials);

      // Store generated PDFs for download step
      if (typeof window !== "undefined") {
        (window as any).__certifyGeneratedPdfs = generated;
      }

      // Build pdfMap keyed by certificate_code for email dispatch
      const newPdfMap: Record<string, { pdfBytes: Uint8Array; filename: string }> = {};
      credentials.forEach((cred, i) => {
        if (generated[i]) newPdfMap[cred.certificate_code] = generated[i];
      });
      setPdfMap(newPdfMap);
      setBatchCredentials(credentials);

      setDone(true);
      setGenerating(false);
    } catch (e) {
      setError(`Generation failed: ${(e as Error).message}`);
      setGenerating(false);
    }
  }, [eligibleRows, mappedRows, templateConfig, preflightSummary, isPaidTier, overFreeTierLimit, addCredentials]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Step 6 — Generate Certificates</h2>
        <p className="mt-1 text-gray-500">
          Rendering {totalToGenerate} vector PDFs entirely in your browser using pdf-lib. Zero data leaves your device.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-blue-700">{totalToGenerate}</div>
          <div className="text-xs text-blue-600 mt-1">PDFs to Generate</div>
        </div>
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-700">
            {preflightSummary?.autoFixed ?? 0}
          </div>
          <div className="text-xs text-green-600 mt-1">Auto-Fixed</div>
        </div>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-gray-700">
            {preflightSummary?.blocked ?? 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">Skipped (Blocked)</div>
        </div>
      </div>

      {/* Free Tier Warning */}
      {overFreeTierLimit && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3">
          <Lock size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Free Tier Limit: {FREE_TIER_LIMIT} certificates per batch
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Your batch has {totalToGenerate} eligible rows. Upgrade to Education or Pro to generate unlimited batches without watermarks.
            </p>
          </div>
        </div>
      )}

      {/* Generate / Progress */}
      {!done && !generating && (
        <Button onClick={generate} size="lg" className="w-full gap-2">
          <Zap size={18} />
          {overFreeTierLimit
            ? `Upgrade Required (>${FREE_TIER_LIMIT} certs)`
            : `Generate ${totalToGenerate} Certificate${totalToGenerate !== 1 ? "s" : ""}`}
        </Button>
      )}

      {generating && (
        <div className="space-y-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <Loader2 size={20} className="animate-spin text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Rendering PDF {Math.round((progress / 100) * totalToGenerate)} of {totalToGenerate}…
            </span>
          </div>
          <ProgressBar value={progress} label="Compilation progress" />
          <p className="text-xs text-gray-500">
            Embedding QR codes, applying font scaling, computing SHA-256 hashes…
          </p>
        </div>
      )}

      {done && (
        <>
          <EmailDispatchModal
            isOpen={emailModalOpen}
            onClose={() => setEmailModalOpen(false)}
            selectedCredentials={batchCredentials.length > 0 ? batchCredentials : issuedCredentials}
            pdfMap={pdfMap}
          />
          <div className="p-6 bg-green-50 border border-green-300 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-green-600" />
              <div>
                <p className="font-semibold text-green-800">
                  {totalToGenerate} certificate{totalToGenerate !== 1 ? "s" : ""} generated successfully!
                </p>
                <p className="text-xs text-green-700 mt-0.5">
                  SHA-256 hashes computed and registry saved locally.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setEmailModalOpen(true)}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Mail size={16} />
              Send Certificates via Email
            </Button>
          </div>
        </>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Upgrade to Generate More</h3>
            <p className="text-sm text-gray-600">
              The Free tier is limited to <strong>{FREE_TIER_LIMIT} certificates per batch</strong>.
              Your batch has <strong>{totalToGenerate} eligible recipients</strong>.
            </p>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2 text-sm">
              <div className="font-semibold text-blue-800">Education — $29/mo</div>
              <ul className="text-blue-700 space-y-1 text-xs list-disc list-inside">
                <li>Unlimited local batching</li>
                <li>Watermark removal</li>
                <li>2,500 hosted QR links/mo</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>Cancel</Button>
              <Button onClick={() => setShowUpgradeModal(false)}>View Plans</Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(5)}>← Back</Button>
        {done && (
          <Button onClick={() => setStep(7)} className="ml-auto">
            Download ZIP →
          </Button>
        )}
      </div>
    </div>
  );
}
