"use client";

import { useState } from "react";
import { Award, Database, RotateCcw, XCircle, CheckSquare } from "lucide-react";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { AuthModal } from "@/components/ui/AuthModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import Step1_Ingest from "@/components/wizard/Step1_Ingest";
import Step2_FieldMap from "@/components/wizard/Step2_FieldMap";
import Step3_TemplateDesigner from "@/components/wizard/Step3_TemplateDesigner";
import Step4_Preview from "@/components/wizard/Step4_Preview";
import Step5_Preflight from "@/components/wizard/Step5_Preflight";
import Step6_Generate from "@/components/wizard/Step6_Generate";
import Step7_Download from "@/components/wizard/Step7_Download";
import Step8_Registry from "@/components/wizard/Step8_Registry";
import Step9_Reissue from "@/components/wizard/Step9_Reissue";
import Step10_Revoke from "@/components/wizard/Step10_Revoke";

const STEPS = [
  { id: 1, label: "Import" },
  { id: 2, label: "Map Fields" },
  { id: 3, label: "Template" },
  { id: 4, label: "Preview" },
  { id: 5, label: "Preflight" },
  { id: 6, label: "Generate" },
  { id: 7, label: "Download" },
  { id: 8, label: "Registry" },
  { id: 9, label: "Reissue" },
  { id: 10, label: "Revoke" },
];

export default function DashboardPage() {
  const { currentStep, setStep, rawRows, issuedCredentials } = useStore();
  const [isAuthOpen, setAuthOpen] = useState(false);

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1_Ingest />;
      case 2: return <Step2_FieldMap />;
      case 3: return <Step3_TemplateDesigner />;
      case 4: return <Step4_Preview />;
      case 5: return <Step5_Preflight />;
      case 6: return <Step6_Generate />;
      case 7: return <Step7_Download />;
      case 8: return <Step8_Registry />;
      case 9: return <Step9_Reissue />;
      case 10: return <Step10_Revoke />;
      default: return <Step1_Ingest />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Award size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Certify Studio</h1>
              <p className="text-xs text-gray-400">Privacy-first certificate generator</p>
            </div>
          </div>

          {/* Status chips */}
          <div className="flex items-center gap-3 text-xs">
            {rawRows.length > 0 && (
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                <CheckSquare size={12} /> {rawRows.length} rows loaded
              </span>
            )}
            {issuedCredentials.length > 0 && (
              <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
                <Database size={12} /> {issuedCredentials.length} issued
              </span>
            )}
            {supabase ? (
              <button onClick={() => setAuthOpen(true)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-2.5 py-1 rounded-full border border-blue-200 transition-colors font-medium">
                ☁️ Supabase Connected (Sign In)
              </button>
            ) : (
              <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full border border-gray-200">
                🔒 Free Tier (Local Storage)
              </span>
            )}
            <ThemeToggle />
          </div>
        </div>
        <AuthModal isOpen={isAuthOpen} onClose={() => setAuthOpen(false)} />

        {/* Step Progress Bar */}
        <div className="max-w-7xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-0.5 overflow-x-auto pb-1">
            {STEPS.map((step, idx) => {
              const isPast = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              const isFuture = step.id > currentStep;
              return (
                <button
                  key={step.id}
                  onClick={() => setStep(step.id as any)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap
                    ${isCurrent ? "bg-blue-600 text-white" : isPast ? "text-blue-600 hover:bg-blue-50" : "text-gray-400 hover:bg-gray-100"}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
                      ${isCurrent ? "bg-white text-blue-600" : isPast ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-500"}`}
                  >
                    {isPast ? "✓" : step.id}
                  </span>
                  {step.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {renderStep()}
        </div>

        {/* Privacy Notice */}
        <p className="text-center text-xs text-gray-400 mt-6">
          🔒 All certificate generation runs entirely in your browser. No recipient data is uploaded to remote servers.
        </p>
      </main>
    </div>
  );
}
