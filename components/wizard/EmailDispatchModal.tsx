"use client";

import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import {
  Send,
  CheckCircle,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  Loader2,
  Check,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import type { Credential } from "@/lib/credential-store";

interface EmailDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCredentials: Credential[];
  /** Pre-built PDF bytes keyed by certificate_code */
  pdfMap?: Record<string, { pdfBytes: Uint8Array; filename: string }>;
}

type SmtpPreset = {
  label: string;
  host: string;
  port: number;
};

const SMTP_PRESETS: SmtpPreset[] = [
  { label: "Gmail", host: "smtp.gmail.com", port: 587 },
  { label: "Outlook / Hotmail", host: "smtp-mail.outlook.com", port: 587 },
  { label: "Yahoo Mail", host: "smtp.mail.yahoo.com", port: 587 },
  { label: "Zoho Mail", host: "smtp.zoho.com", port: 587 },
  { label: "Custom SMTP", host: "", port: 587 },
];

export function EmailDispatchModal({
  isOpen,
  onClose,
  selectedCredentials,
  pdfMap,
}: EmailDispatchModalProps) {
  // Sender settings
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPassword, setSenderPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [smtpPreset, setSmtpPreset] = useState<SmtpPreset>(SMTP_PRESETS[0]);
  const [customHost, setCustomHost] = useState("");
  const [customPort, setCustomPort] = useState(587);

  // Email content
  const [subject, setSubject] = useState(
    "Your Certificate for {{course_name}} is Ready 🎓"
  );
  const [body, setBody] = useState(
    `Hi {{recipient_name}},

Congratulations on completing {{course_name}}! 🎉

Your official certificate has been issued on {{issue_date}} and securely verified.

You can view, download, or verify your credential here:
{{verify_url}}

Best regards,
Certification Team`
  );

  // Test connection state
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Send state
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [done, setDone] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load saved sender email
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("certify_sender_email");
      if (savedEmail) setSenderEmail(savedEmail);
      const savedPreset = localStorage.getItem("certify_smtp_preset");
      if (savedPreset) {
        const found = SMTP_PRESETS.find((p) => p.label === savedPreset);
        if (found) setSmtpPreset(found);
      }
    }
  }, []);

  const effectiveHost =
    smtpPreset.label === "Custom SMTP" ? customHost : smtpPreset.host;
  const effectivePort =
    smtpPreset.label === "Custom SMTP" ? customPort : smtpPreset.port;

  // Filter recipients with valid emails
  const recipientsWithEmail = selectedCredentials.filter(
    (c) => c.recipient_email && c.recipient_email.trim().includes("@")
  );
  const missingEmailCount = selectedCredentials.length - recipientsWithEmail.length;

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!senderEmail.trim() || !senderPassword.trim()) {
      setError("Please enter your sender email and password before testing.");
      return;
    }
    setError(null);
    setTestResult(null);
    setTestingConnection(true);

    try {
      const res = await fetch("/api/send-certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: senderEmail.trim(),
          senderPassword: senderPassword.trim().replace(/\s+/g, ""),
          smtpHost: effectiveHost,
          smtpPort: effectivePort,
          testOnly: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to connect to SMTP server");
      }

      setTestResult({
        success: true,
        message: data.message || "Connected successfully! Credentials verified.",
      });

      // Save email for next time
      localStorage.setItem("certify_sender_email", senderEmail.trim());
      localStorage.setItem("certify_smtp_preset", smtpPreset.label);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Failed to verify SMTP credentials.",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSend = async () => {
    if (!senderEmail.trim() || !senderPassword.trim()) {
      setError("Please enter your sender email and password / app password.");
      return;
    }

    if (recipientsWithEmail.length === 0) {
      setError(
        "None of the recipients have an email address in the CSV. Please ensure your CSV has an Email column mapped in Step 2."
      );
      return;
    }

    setError(null);
    setTestResult(null);
    setSending(true);
    setProgress(5);
    setProgressLabel("Authenticating with mail server…");

    try {
      // Build recipients array with PDF attachments
      const recipients = recipientsWithEmail.map((cred) => {
        const pdfEntry = pdfMap?.[cred.certificate_code];
        let pdfBase64 = "";
        let filename = `${cred.recipient_name.replace(/[^a-z0-9_-]/gi, "_")}_${cred.certificate_code}.pdf`;
        if (pdfEntry) {
          const bytes = pdfEntry.pdfBytes;
          let binary = "";
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          pdfBase64 = btoa(binary);
          filename = pdfEntry.filename;
        }

        return {
          name: cred.recipient_name,
          email: cred.recipient_email!.trim(),
          course: cred.course_name,
          issueDate: cred.issue_date,
          verifyUrl: `${window.location.origin}/verify?id=${cred.certificate_code}`,
          pdfBase64,
          filename,
        };
      });

      setProgressLabel(`Sending ${recipients.length} certificates…`);
      setProgress(25);

      const res = await fetch("/api/send-certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: senderEmail.trim(),
          senderPassword: senderPassword.trim().replace(/\s+/g, ""),
          smtpHost: effectiveHost,
          smtpPort: effectivePort,
          subject,
          bodyTemplate: body,
          recipients,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send emails");
      }

      setSuccessCount(data.successCount ?? 0);
      setFailCount(data.failCount ?? 0);
      setProgress(100);
      setDone(true);

      // Save email for next time
      localStorage.setItem("certify_sender_email", senderEmail.trim());
      localStorage.setItem("certify_smtp_preset", smtpPreset.label);
    } catch (e: any) {
      setError(e.message || "An error occurred while sending emails.");
    } finally {
      setSending(false);
    }
  };

  const resetAndClose = () => {
    setSending(false);
    setProgress(0);
    setProgressLabel("");
    setDone(false);
    setSuccessCount(0);
    setFailCount(0);
    setError(null);
    setTestResult(null);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={resetAndClose}
      title={`Send Certificates via Email (${recipientsWithEmail.length} eligible)`}
      maxWidth="lg"
    >
      {!done ? (
        <div className="space-y-4">
          {/* Recipient summary */}
          <div className="flex items-center justify-between text-xs px-3 py-2 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-900">
            <span>
              <strong>{recipientsWithEmail.length}</strong> of{" "}
              {selectedCredentials.length} recipients have email addresses ready.
            </span>
            {missingEmailCount > 0 && (
              <span className="text-amber-700 font-medium">
                ⚠️ {missingEmailCount} skipped (no email in CSV)
              </span>
            )}
          </div>

          {/* ── SENDER SETTINGS ── */}
          <div className="border border-gray-200 dark:border-slate-800 rounded-xl p-4 space-y-3 bg-gray-50 dark:bg-slate-950/70">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider">
                📤 Sender Mailbox
              </h3>
              {smtpPreset.label === "Gmail" && (
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <HelpCircle size={13} />
                  Get Gmail App Password
                </a>
              )}
            </div>

            {/* Provider selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                Email Provider
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SMTP_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setSmtpPreset(preset);
                      setTestResult(null);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      smtpPreset.label === preset.label
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-300 dark:border-slate-700 hover:border-blue-400"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom SMTP options */}
            {smtpPreset.label === "Custom SMTP" && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    placeholder="mail.example.com"
                    value={customHost}
                    onChange={(e) => setCustomHost(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={customPort}
                    onChange={(e) => setCustomPort(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Sender email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Your Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder={
                  smtpPreset.label === "Gmail"
                    ? "yourname@gmail.com"
                    : "you@example.com"
                }
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                disabled={sending}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password / App password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700">
                  {smtpPreset.label === "Gmail" ? "Gmail App Password" : "Password"}{" "}
                  <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    smtpPreset.label === "Gmail"
                      ? "16-letter App Password (e.g. abcd efgh ijkl mnop)"
                      : "Account password"
                  }
                  value={senderPassword}
                  onChange={(e) => {
                    setSenderPassword(e.target.value);
                    setTestResult(null);
                  }}
                  disabled={sending}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {smtpPreset.label === "Gmail" && (
                <div className="text-[11px] text-gray-500 mt-1.5 space-y-0.5">
                  <p>
                    💡 <strong>Gmail note:</strong> Standard passwords will not work.
                    Spaces in your 16-character App Password are automatically removed.
                  </p>
                </div>
              )}
            </div>

            {/* Test Connection Button */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection || sending || !senderEmail || !senderPassword}
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium px-2.5 py-1 rounded border border-blue-200 bg-white hover:bg-blue-50 transition-colors disabled:opacity-40"
              >
                {testingConnection ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <ShieldCheck size={12} />
                )}
                Test Login Connection
              </button>

              {testResult && (
                <span
                  className={`text-xs flex items-center gap-1 ${
                    testResult.success ? "text-green-600 font-medium" : "text-red-600 font-medium"
                  }`}
                >
                  {testResult.success ? (
                    <>
                      <Check size={14} /> Connected successfully!
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={14} /> Failed to connect
                    </>
                  )}
                </span>
              )}
            </div>

            {testResult && !testResult.success && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {testResult.message}
              </p>
            )}
          </div>

          {/* ── EMAIL CONTENT ── */}
          <div className="border border-gray-200 dark:border-slate-800 rounded-xl p-4 space-y-3 bg-white dark:bg-slate-900">
            <h3 className="text-xs font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider">
              ✉️ Email Content & Personalization
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={sending}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Message Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={sending}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100"
              />
              <div className="flex flex-wrap gap-1 mt-1.5 text-[11px] text-gray-500">
                <span>Variables:</span>
                <code className="bg-gray-100 px-1 py-0.2 rounded font-mono">
                  {"{{recipient_name}}"}
                </code>
                <code className="bg-gray-100 px-1 py-0.2 rounded font-mono">
                  {"{{course_name}}"}
                </code>
                <code className="bg-gray-100 px-1 py-0.2 rounded font-mono">
                  {"{{verify_url}}"}
                </code>
                <code className="bg-gray-100 px-1 py-0.2 rounded font-mono">
                  {"{{issue_date}}"}
                </code>
              </div>
            </div>
          </div>

          {/* Global Error Banner */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Progress Banner */}
          {sending && (
            <div className="space-y-2 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
              <div className="flex items-center justify-between text-xs text-gray-700">
                <span className="flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin text-blue-600" />
                  {progressLabel}
                </span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions - Sticky Footer so it is ALWAYS visible */}
          {!sending && (
            <div className="sticky -bottom-4 sm:-bottom-6 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-t border-gray-200 dark:border-slate-800 z-10 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Ready to dispatch <strong>{recipientsWithEmail.length}</strong> email{recipientsWithEmail.length !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={resetAndClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={recipientsWithEmail.length === 0}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2"
                >
                  <Send size={15} />
                  Send {recipientsWithEmail.length} Certificate{recipientsWithEmail.length !== 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Done Screen */
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <CheckCircle size={30} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Emails Dispatched!
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              <strong>{successCount}</strong> certificate
              {successCount !== 1 ? "s" : ""} delivered successfully.
              {failCount > 0 && (
                <span className="text-red-500">
                  {" "}
                  · {failCount} failed to deliver
                </span>
              )}
            </p>
          </div>
          <Button onClick={resetAndClose} className="mt-3">
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
}
