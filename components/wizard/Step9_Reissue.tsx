"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { credentialStore, type Credential } from "@/lib/credential-store";
import { renderCertificate } from "@/lib/pdf-engine";
import { sha256Hex } from "@/lib/sha256";
import { generateCertId } from "@/lib/cert-id";

export default function Step9_Reissue() {
  const { templateConfig, isPaidTier, setStep } = useStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Credential[]>([]);
  const [selected, setSelected] = useState<Credential | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedCourse, setEditedCourse] = useState("");
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const all = await credentialStore.getAll();
      if (!query.trim()) {
        setResults(all.filter((c) => c.status === "valid" || c.status === "corrected"));
      } else {
        const q = query.toLowerCase();
        setResults(
          all.filter(
            (c) =>
              (c.status === "valid" || c.status === "corrected") &&
              (c.recipient_name.toLowerCase().includes(q) ||
                c.certificate_code.toLowerCase().includes(q))
          )
        );
      }
    }
    load();
  }, [query]);

  const selectCredential = (cred: Credential) => {
    setSelected(cred);
    setEditedName(cred.recipient_name);
    setEditedEmail(cred.recipient_email);
    setEditedCourse(cred.course_name);
    setSuccess(null);
    setError(null);
  };

  const handleReissue = useCallback(async () => {
    if (!selected) return;
    setGenerating(true);
    setError(null);

    try {
      const newCertCode = `${selected.certificate_code.slice(0, -1)}R`
        .replace(/R+$/, "")
        .concat(generateCertId().slice(-4));

      const baseUrl = typeof window !== "undefined" ? `${window.location.origin}/verify` : "/verify";
      const verifyUrl = `${baseUrl}?id=${newCertCode}`;

      const { pdfBytes } = await renderCertificate({
        recipientName: editedName,
        courseName: editedCourse,
        issueDate: selected.issue_date,
        certificateCode: newCertCode,
        verifyUrl,
        templateConfig,
        isPaidTier,
      });

      const hash = await sha256Hex(pdfBytes.buffer as ArrayBuffer);

      const newRecord: Credential = {
        id: crypto.randomUUID(),
        certificate_code: newCertCode,
        recipient_name: editedName,
        recipient_email: editedEmail,
        course_name: editedCourse,
        issue_date: selected.issue_date,
        sha256_hash: hash,
        status: "corrected",
        version: selected.version + 1,
        created_at: new Date().toISOString(),
      };

      await credentialStore.reissue(selected.certificate_code, newRecord);

      // Trigger PDF download
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${editedName.replace(/[^a-z0-9 ]/gi, "_")}_${newCertCode}_v${newRecord.version}.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);

      setSuccess(`Reissued as ${newCertCode} (v${newRecord.version})`);
      setSelected(null);
      // Refresh list
      setQuery("");
    } catch (e) {
      setError(`Reissue failed: ${(e as Error).message}`);
    } finally {
      setGenerating(false);
    }
  }, [selected, editedName, editedEmail, editedCourse, templateConfig, isPaidTier]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Step 9 — Correct & Reissue</h2>
        <p className="mt-1 text-gray-500">
          Fix typos or legal name changes. A new certificate version is generated, the old record is marked as reissued.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search valid credentials by name or certificate code…"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle size={18} className="text-green-600" />
          <p className="text-sm text-green-800 font-medium">{success}</p>
        </div>
      )}

      {/* Results List */}
      {!selected && (
        <div className="border border-gray-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">No valid credentials found</div>
          ) : (
            results.map((cred) => (
              <button
                key={cred.certificate_code}
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                onClick={() => selectCredential(cred)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800">{cred.recipient_name}</div>
                  <div className="text-xs text-gray-400 truncate">{cred.certificate_code} · {cred.course_name}</div>
                </div>
                <span className="text-xs text-blue-600 shrink-0">Select →</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Edit Form */}
      {selected && (
        <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">Editing: <code className="font-mono text-blue-600">{selected.certificate_code}</code></p>
              <p className="text-xs text-gray-500 mt-0.5">Current v{selected.version} → will become v{selected.version + 1}</p>
            </div>
            <button className="text-xs text-gray-400 hover:text-gray-600" onClick={() => setSelected(null)}>✕ Cancel</button>
          </div>

          {[
            { label: "Recipient Name", value: editedName, setter: setEditedName },
            { label: "Email", value: editedEmail, setter: setEditedEmail },
            { label: "Course Name", value: editedCourse, setter: setEditedCourse },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            ⚠️ The old certificate <strong>{selected.certificate_code}</strong> will be marked as <strong>Reissued</strong> and the new version will be downloaded automatically.
          </div>

          <Button onClick={handleReissue} disabled={generating || !editedName || !editedCourse} className="w-full gap-2">
            {generating ? <><Loader2 size={16} className="animate-spin" /> Generating…</> : "✅ Confirm & Reissue Certificate"}
          </Button>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(8)}>← Back to Registry</Button>
      </div>
    </div>
  );
}
