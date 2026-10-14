"use client";

import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { DEMO_DATA } from "@/lib/demo-data";

export default function Step1_Ingest() {
  const { setRawData, setStep, rawRows, headers } = useStore();
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      try {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext === "csv") {
          Papa.parse<Record<string, string>>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const headers = results.meta.fields ?? [];
              setRawData(results.data as Record<string, string>[], headers);
              setLoading(false);
            },
            error: (err) => {
              setError(`CSV parse error: ${err.message}`);
              setLoading(false);
            },
          });
        } else if (ext === "xlsx" || ext === "xls") {
          const buf = await file.arrayBuffer();
          const wb = XLSX.read(buf, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json<Record<string, string>>(ws, {
            defval: "",
          });
          const headers = data.length > 0 ? Object.keys(data[0]) : [];
          setRawData(data, headers);
          setLoading(false);
        } else {
          setError("Unsupported file format. Please upload .csv, .xlsx, or .xls");
          setLoading(false);
        }
      } catch (e) {
        setError(`Failed to parse file: ${(e as Error).message}`);
        setLoading(false);
      }
    },
    [setRawData]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const loadDemo = useCallback(() => {
    const headers = ["full_name", "email", "course", "date"];
    const rows = DEMO_DATA.map((r) => ({
      full_name: r.full_name,
      email: r.email,
      course: r.course,
      date: r.date,
    }));
    setRawData(rows, headers);
  }, [setRawData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Step 1 — Import Recipient Data</h2>
        <p className="mt-1 text-gray-500">
          Upload a spreadsheet or load the demo dataset. Parsing happens entirely in your browser — no data leaves your device.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
          ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-gray-50"}`}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileInput}
        />
        {loading ? (
          <Loader2 className="mx-auto h-10 w-10 text-blue-500 animate-spin" />
        ) : (
          <Upload className="mx-auto h-10 w-10 text-gray-400" />
        )}
        <p className="mt-3 text-base font-medium text-gray-700">
          {loading ? "Parsing file…" : "Drag & drop or click to upload"}
        </p>
        <p className="text-sm text-gray-400 mt-1">.csv, .xlsx, .xls supported</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Demo Button */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-sm text-gray-400">or</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>
      <Button variant="outline" onClick={loadDemo} className="w-full gap-2">
        <FileSpreadsheet size={16} />
        Load Demo Dataset (20 recipients with edge cases)
      </Button>

      {/* Data Preview */}
      {rawRows.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              Data Preview — {rawRows.length} rows, {headers.length} columns
            </h3>
            <Button size="sm" onClick={() => setStep(2)}>
              Continue to Field Mapping →
            </Button>
          </div>
          <div className="overflow-auto max-h-72 rounded-lg border border-gray-200">
            <table className="min-w-full text-xs divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">#</th>
                  {headers.map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-gray-500 font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {rawRows.slice(0, 100).map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                    {headers.map((h) => (
                      <td key={h} className="px-3 py-2 text-gray-700 max-w-xs truncate">
                        {row[h] || <span className="text-red-400 italic">empty</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rawRows.length > 100 && (
              <p className="px-3 py-2 text-xs text-gray-400 text-center">
                Showing 100 of {rawRows.length} rows
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
