"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ExternalLink, RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useStore } from "@/lib/store";
import { credentialStore, type Credential } from "@/lib/credential-store";
import { EmailDispatchModal } from "./EmailDispatchModal";

const STATUS_BADGE: Record<string, { variant: "green" | "yellow" | "red" | "blue" | "gray"; label: string }> = {
  valid: { variant: "green", label: "Valid" },
  corrected: { variant: "blue", label: "Corrected" },
  reissued: { variant: "yellow", label: "Reissued" },
  revoked: { variant: "red", label: "Revoked" },
};

export default function Step8_Registry() {
  const { setStep } = useStore();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [isEmailModalOpen, setEmailModalOpen] = useState(false);

  const reload = useCallback(async () => {
    const all = await credentialStore.getAll();
    setCredentials(all);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = credentials.filter((c) => {
    const q = query.toLowerCase();
    return (
      c.recipient_name.toLowerCase().includes(q) ||
      c.certificate_code.toLowerCase().includes(q) ||
      c.course_name.toLowerCase().includes(q) ||
      c.recipient_email.toLowerCase().includes(q)
    );
  });

  const validFiltered = filtered.filter(c => c.status === "valid" || c.status === "corrected");
  const selected = selectedCode ? credentials.find((c) => c.certificate_code === selectedCode) : null;

  return (
    <div className="space-y-6">
      <EmailDispatchModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setEmailModalOpen(false)} 
        selectedCredentials={validFiltered} 
      />
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Step 8 — Credential Registry</h2>
          <p className="mt-1 text-gray-500">
            Search, inspect, and manage all issued certificates.
          </p>
        </div>
        <div className="flex gap-2">
          {validFiltered.length > 0 && (
            <Button size="sm" onClick={() => setEmailModalOpen(true)} className="gap-1.5 shrink-0 bg-blue-600 hover:bg-blue-700">
              <Mail size={14} /> Email {validFiltered.length} Recipients
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={reload} className="gap-1.5 shrink-0">
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, code, course, or email…"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {credentials.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
          <p className="text-gray-400 text-sm">No credentials in registry yet.</p>
          <p className="text-gray-400 text-xs mt-1">Generate a batch first to populate the registry.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setStep(1)}>
            Start New Batch
          </Button>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Certificate ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Recipient</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Issued</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.map((cred) => {
                  const badge = STATUS_BADGE[cred.status] ?? { variant: "gray" as const, label: cred.status };
                  return (
                    <tr
                      key={cred.certificate_code}
                      className={`hover:bg-gray-50 cursor-pointer ${selectedCode === cred.certificate_code ? "bg-blue-50" : ""}`}
                      onClick={() => setSelectedCode(cred.certificate_code === selectedCode ? null : cred.certificate_code)}
                    >
                      <td className="px-4 py-3">
                        <code className="text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono">
                          {cred.certificate_code}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{cred.recipient_name}</div>
                        <div className="text-xs text-gray-400">{cred.recipient_email}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{cred.course_name}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{cred.issue_date}</td>
                      <td className="px-4 py-3">
                        <Badge variant={badge.variant}>
                          {badge.label}
                          {cred.version > 1 && <span className="ml-1 opacity-60">v{cred.version}</span>}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Open verification page"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/verify?id=${cred.certificate_code}`, "_blank");
                            }}
                          >
                            <ExternalLink size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            Showing {filtered.length} of {credentials.length} credentials
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {selected && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Certificate Detail</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-gray-500">Code:</span> <code className="font-mono">{selected.certificate_code}</code></div>
            <div><span className="text-gray-500">Version:</span> v{selected.version}</div>
            <div><span className="text-gray-500">SHA-256:</span></div>
            <div></div>
            <div className="col-span-2">
              <code className="block bg-white border border-gray-200 rounded p-2 font-mono text-xs text-gray-600 break-all">
                {selected.sha256_hash}
              </code>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedCode(null);
                setStep(9);
              }}
            >
              ✏️ Correct & Reissue
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                setSelectedCode(null);
                setStep(10);
              }}
            >
              ⛔ Revoke
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(7)}>← Back to Download</Button>
        <Button onClick={() => setStep(1)} variant="secondary" className="ml-auto">
          New Batch
        </Button>
      </div>
    </div>
  );
}
