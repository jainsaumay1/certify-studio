"use client";

import { useState, useEffect } from "react";
import { Search, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useStore } from "@/lib/store";
import { credentialStore, type Credential } from "@/lib/credential-store";

export default function Step10_Revoke() {
  const { setStep } = useStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Credential[]>([]);
  const [selected, setSelected] = useState<Credential | null>(null);
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      const all = await credentialStore.getAll();
      if (!query.trim()) {
        setResults(all.filter((c) => c.status !== "revoked" && c.status !== "reissued"));
      } else {
        const q = query.toLowerCase();
        setResults(
          all.filter(
            (c) =>
              c.status !== "revoked" &&
              c.status !== "reissued" &&
              (c.recipient_name.toLowerCase().includes(q) ||
                c.certificate_code.toLowerCase().includes(q))
          )
        );
      }
    }
    fetchResults();
  }, [query]);

  const handleRevoke = async () => {
    if (!selected || confirmText !== "REVOKE" || !reason.trim()) return;
    await credentialStore.revoke(selected.certificate_code, reason.trim());
    setSuccess(`Certificate ${selected.certificate_code} has been revoked.`);
    setSelected(null);
    setReason("");
    setConfirmText("");
    setQuery(""); // trigger reload
    // force reload of results
    const all = await credentialStore.getAll();
    setResults(all.filter((c) => c.status !== "revoked" && c.status !== "reissued"));
  };

  const canRevoke =
    selected && confirmText === "REVOKE" && reason.trim().length > 5;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Step 10 — Revocation Engine</h2>
        <p className="mt-1 text-gray-500">
          Permanently revoke a certificate. The public verification page will immediately show ⛔ REVOKED with a timestamp.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search active credentials by name or certificate code…"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle size={18} className="text-green-600" />
          <p className="text-sm text-green-800 font-medium">{success}</p>
        </div>
      )}

      {/* Results */}
      {!selected && (
        <div className="border border-gray-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">No active credentials found</div>
          ) : (
            results.map((cred) => (
              <button
                key={cred.certificate_code}
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-red-50 border-b border-gray-100 last:border-b-0 transition-colors"
                onClick={() => {
                  setSelected(cred);
                  setReason("");
                  setConfirmText("");
                  setSuccess(null);
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800">{cred.recipient_name}</div>
                  <div className="text-xs text-gray-400 truncate">{cred.certificate_code} · {cred.course_name}</div>
                </div>
                <Badge variant="green">Active</Badge>
              </button>
            ))
          )}
        </div>
      )}

      {/* Revocation Confirmation Modal (inline) */}
      {selected && (
        <div className="p-5 bg-red-50 border-2 border-red-300 rounded-xl space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-800">Revoke Certificate</p>
              <p className="text-xs text-red-700 mt-0.5">
                This action cannot be undone. The public verify page will immediately reflect this revocation.
              </p>
            </div>
          </div>

          <div className="bg-white border border-red-200 rounded-lg p-3 text-sm space-y-1">
            <div><span className="text-gray-500">Recipient:</span> <strong>{selected.recipient_name}</strong></div>
            <div><span className="text-gray-500">Code:</span> <code className="font-mono text-blue-600">{selected.certificate_code}</code></div>
            <div><span className="text-gray-500">Course:</span> {selected.course_name}</div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-xs font-semibold text-red-700 mb-1 block">
              Revocation Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Certificate issued in error, fraud confirmed, disciplinary action…"
              rows={2}
              className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          {/* Confirmation */}
          <div>
            <label className="text-xs font-semibold text-red-700 mb-1 block">
              Type <code className="bg-red-100 px-1 rounded">REVOKE</code> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="REVOKE"
              className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-red-400"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={handleRevoke}
              disabled={!canRevoke}
              className="gap-2"
            >
              ⛔ Confirm Revocation
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(8)}>← Back to Registry</Button>
      </div>
    </div>
  );
}
