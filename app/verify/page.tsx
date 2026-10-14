"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Award, ShieldCheck, XCircle, AlertTriangle, RotateCcw, Eye, EyeOff, Lock } from "lucide-react";
import { credentialStore, type Credential } from "@/lib/credential-store";
import { maskName } from "@/lib/preflight";
import { Button } from "@/components/ui/Button";

type VerifyState = "loading" | "valid" | "revoked" | "reissued" | "unknown";

function VerifyContent() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";

  const [state, setState] = useState<VerifyState>("loading");
  const [credential, setCredential] = useState<Credential | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [lastNameInput, setLastNameInput] = useState("");
  const [unlockError, setUnlockError] = useState("");

  useEffect(() => {
    if (!id) {
      setState("unknown");
      return;
    }
    // Small timeout to avoid SSR hydration flash
    const timer = setTimeout(async () => {
      const cred = await credentialStore.getByCode(id);
      if (!cred) {
        setState("unknown");
      } else {
        setCredential(cred);
        if (cred.status === "revoked") setState("revoked");
        else if (cred.status === "reissued") setState("reissued");
        else setState("valid");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [id]);

  const tryUnlock = () => {
    if (!credential) return;
    const nameParts = credential.recipient_name.trim().split(/\s+/);
    const lastName = nameParts[nameParts.length - 1].toLowerCase();
    if (lastNameInput.trim().toLowerCase() === lastName) {
      setRevealed(true);
      setUnlockError("");
    } else {
      setUnlockError("Last name doesn't match. Please try again.");
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (state === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Looking up certificate…</p>
      </div>
    );
  }

  // ── Unknown ──────────────────────────────────────────────────────────────
  if (state === "unknown") {
    return (
      <div className="flex flex-col items-center py-16 gap-5">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <XCircle size={40} className="text-gray-400" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">❌ Unknown Credential</h2>
          <p className="text-gray-500 mt-2">
            Certificate <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded font-mono">{id || "(no ID provided)"}</code> was not found in our registry.
          </p>
          <p className="text-sm text-gray-400 mt-3">
            This certificate may be invalid, forged, or issued by a different platform.
          </p>
        </div>
      </div>
    );
  }

  // ── Revoked ──────────────────────────────────────────────────────────────
  if (state === "revoked" && credential) {
    return (
      <div className="flex flex-col items-center py-10 gap-6">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle size={40} className="text-red-500" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-700">⛔ Certificate Revoked</h2>
          <p className="text-gray-600 mt-2">
            This certificate has been revoked and is no longer valid.
          </p>
        </div>
        <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-xl p-5 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div><span className="text-gray-500">Certificate ID</span><br /><code className="font-mono text-xs text-red-700">{credential.certificate_code}</code></div>
            <div><span className="text-gray-500">Revoked At</span><br /><span className="font-medium">{credential.revocation_timestamp ? new Date(credential.revocation_timestamp).toLocaleDateString() : "—"}</span></div>
          </div>
          {credential.revocation_reason && (
            <div><span className="text-gray-500">Reason</span><br /><span className="font-medium text-red-700">{credential.revocation_reason}</span></div>
          )}
        </div>
      </div>
    );
  }

  // ── Reissued ─────────────────────────────────────────────────────────────
  if (state === "reissued" && credential) {
    return (
      <div className="flex flex-col items-center py-10 gap-6">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
          <RotateCcw size={40} className="text-amber-500" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-amber-700">🔄 Certificate Reissued</h2>
          <p className="text-gray-600 mt-2">
            This certificate was replaced by a newer version.
          </p>
        </div>
        {credential.superseded_by && (
          <div className="w-full max-w-md p-5 bg-amber-50 border border-amber-200 rounded-xl text-sm">
            <p className="text-amber-800">
              Newer certificate:{" "}
              <a
                href={`/verify?id=${credential.superseded_by}`}
                className="text-blue-600 underline font-mono"
              >
                {credential.superseded_by}
              </a>
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Valid ─────────────────────────────────────────────────────────────────
  if (state === "valid" && credential) {
    const displayName = revealed ? credential.recipient_name : maskName(credential.recipient_name);
    const displayCourse = revealed ? credential.course_name : credential.course_name.slice(0, 3) + "***";

    return (
      <div className="flex flex-col items-center py-8 gap-6">
        {/* Status Banner */}
        <div className="w-full bg-green-600 rounded-xl p-5 flex items-center gap-4 text-white shadow-lg">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <div>
            <div className="text-lg font-bold">✅ VERIFIED AUTHENTIC</div>
            <div className="text-green-100 text-sm">
              This certificate is cryptographically registered and valid.
            </div>
          </div>
        </div>

        {/* Certificate Card */}
        <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex items-center gap-3">
            <Award size={20} className="text-white" />
            <span className="text-white font-semibold">Certificate Record</span>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Privacy masking notice */}
            {!revealed && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                <Lock size={13} className="mt-0.5 shrink-0" />
                <span>
                  <strong>FERPA Privacy Mode</strong> — Full name and details are masked. Enter the recipient's last name below to reveal.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wide">Recipient</span>
                <div className={`text-xl font-bold mt-0.5 ${revealed ? "text-gray-900" : "text-gray-400 tracking-widest"}`}>
                  {displayName}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wide">Program / Course</span>
                <div className={`font-semibold mt-0.5 ${revealed ? "text-gray-800" : "text-gray-300"}`}>
                  {displayCourse}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Issue Date</span>
                  <div className="font-medium text-gray-700 mt-0.5">{credential.issue_date}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Version</span>
                  <div className="font-medium text-gray-700 mt-0.5">v{credential.version}</div>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wide">Certificate ID</span>
                <div className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded mt-0.5">
                  {credential.certificate_code}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wide">SHA-256 Digest</span>
                <div className="font-mono text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded p-2 mt-0.5 break-all">
                  {credential.sha256_hash}
                </div>
              </div>
            </div>

            {/* Unlock */}
            {!revealed && (
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <p className="text-xs text-gray-500">
                  To reveal full recipient details, enter the recipient's last name:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={lastNameInput}
                    onChange={(e) => setLastNameInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") tryUnlock(); }}
                    placeholder="Last name…"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <Button size="sm" onClick={tryUnlock}>
                    <Eye size={14} /> Reveal
                  </Button>
                </div>
                {unlockError && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle size={12} /> {unlockError}
                  </p>
                )}
              </div>
            )}

            {revealed && (
              <button
                onClick={() => setRevealed(false)}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 pt-1"
              >
                <EyeOff size={12} /> Hide private details
              </button>
            )}
          </div>
        </div>

        {/* Verification timestamp */}
        <p className="text-xs text-gray-400">
          Verified at {new Date().toLocaleString()} · Certify Studio Registry
        </p>
      </div>
    );
  }

  return null;
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Award size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">Certify Studio — Certificate Verification</h1>
          </div>
        </div>
      </header>
      <main className="max-w-xl mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <VerifyContent />
        </Suspense>
      </main>
    </div>
  );
}
