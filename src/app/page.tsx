'use client'
import dynamic from "next/dynamic";
import { useState } from "react";
import { cn } from "./lib/utils";

// @ts-ignore: No types for @monaco-editor/react
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then(mod => mod.default),
  { ssr: false }
);

// Types for mock results
interface VerificationResult {
  chain: string;
  status: "success" | "error" | "pending";
  explorerUrl?: string;
  warnings?: string[];
  error?: string;
}

export default function Home() {
  const [address, setAddress] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [compiler, setCompiler] = useState<string>("");
  const [optimization, setOptimization] = useState<boolean>(false);
  const [runs, setRuns] = useState<number>(200);
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Placeholder compiler versions
  const compilerVersions: string[] = [
    "v0.8.21+commit.d9974bed",
    "v0.8.20+commit.a1b79de6",
    "v0.7.6+commit.7338295f",
    "v0.6.12+commit.27d51765",
  ];

  // Mock verify handler
  const handleVerify = () => {
    setLoading(true);
    setToast(null);
    // Simulate async verification
    setTimeout(() => {
      setResults([
        {
          chain: "Etherscan",
          status: "success",
          explorerUrl: "https://etherscan.io/address/" + address,
        },
        {
          chain: "BaseScan",
          status: "error",
          error: "Compiler version mismatch",
          warnings: ["Optimization runs mismatch"],
        },
        {
          chain: "Arbiscan",
          status: "pending",
        },
      ]);
      setLoading(false);
      setToast({ type: "success", message: "Verification submitted!" });
    }, 1500);
  };

  // Toast auto-dismiss
  if (toast) {
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 to-blue-100 dark:from-zinc-900 dark:to-blue-950 flex flex-col items-center justify-center py-10 px-4">
      {/* Toast/Alert */}
      {toast && (
        <div
          className={cn(
            "fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-semibold transition-all flex items-center gap-2",
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          )}
        >
          {toast.type === "success" ? (
            <span className="inline-block w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">✔</span>
          ) : (
            <span className="inline-block w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">✖</span>
          )}
          {toast.message}
        </div>
      )}
      <div className="w-full max-w-3xl bg-white/90 dark:bg-zinc-900/90 rounded-2xl shadow-2xl p-8 flex flex-col gap-10 border border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
        <h1 className="text-3xl font-extrabold text-center mb-2 tracking-tight bg-gradient-to-r from-blue-600 to-fuchsia-600 bg-clip-text text-transparent">Contract Verification-as-a-Service</h1>
        <div className="flex flex-col gap-6">
          {/* Address Input */}
          <label className="font-semibold text-zinc-700 dark:text-zinc-200">Contract Address</label>
          <input
            className={cn(
              "border-2 border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base font-mono shadow-sm",
              "focus:border-blue-500"
            )}
            type="text"
            placeholder="0x..."
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
        </div>
        {/* Solidity Editor */}
        <div className="flex flex-col gap-4">
          <label className="font-semibold text-zinc-700 dark:text-zinc-200">Solidity Source Code</label>
          <div className="h-64 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-800 shadow-inner">
            <MonacoEditor
              height="100%"
              defaultLanguage="solidity"
              value={source}
              onChange={(v: string | undefined) => setSource(v || "")}
              options={{ minimap: { enabled: false }, fontSize: 14, fontFamily: 'Fira Mono, monospace' }}
            />
          </div>
        </div>
        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Compiler Dropdown */}
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-semibold text-zinc-700 dark:text-zinc-200">Compiler Version</label>
            <select
              className={cn(
                "border-2 border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base shadow-sm",
                "focus:border-blue-500"
              )}
              value={compiler}
              onChange={e => setCompiler(e.target.value)}
            >
              <option value="">Select version</option>
              {compilerVersions.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          {/* Optimization Toggle */}
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-semibold text-zinc-700 dark:text-zinc-200">Optimization</label>
            <button
              type="button"
              className={cn(
                "w-16 h-10 rounded-full flex items-center transition-colors duration-300 focus:outline-none",
                optimization ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700"
              )}
              onClick={() => setOptimization(!optimization)}
            >
              <span
                className={cn(
                  "inline-block w-8 h-8 bg-white dark:bg-zinc-900 rounded-full shadow transform transition-transform duration-300",
                  optimization ? "translate-x-6" : "translate-x-0"
                )}
              />
            </button>
            <span className="text-xs text-zinc-500 mt-1">{optimization ? "On" : "Off"}</span>
          </div>
          {/* Optimization Runs */}
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-semibold text-zinc-700 dark:text-zinc-200">Optimization Runs</label>
            <input
              type="number"
              min={0}
              className={cn(
                "border-2 border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base shadow-sm",
                "focus:border-blue-500",
                !optimization && "opacity-50 cursor-not-allowed"
              )}
              value={runs}
              onChange={e => setRuns(Number(e.target.value))}
              disabled={!optimization}
            />
          </div>
        </div>
        {/* Verify Button */}
        <button
          className={cn(
            "mt-4 bg-gradient-to-r from-blue-600 to-fuchsia-600 hover:from-blue-700 hover:to-fuchsia-700 text-white font-bold py-3 px-8 rounded-xl transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg tracking-wide",
            loading && "animate-pulse"
          )}
          disabled={loading}
          onClick={handleVerify}
        >
          {loading && (
            <span className="loader border-2 border-t-2 border-t-white border-blue-400 rounded-full w-5 h-5 animate-spin"></span>
          )}
          Verify
        </button>
        {/* Result Cards */}
        {results.length > 0 && (
          <div className="mt-8 flex flex-col gap-4">
            <h2 className="text-xl font-bold mb-2 text-zinc-800 dark:text-zinc-100">Verification Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {results.map((res, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-2xl p-5 shadow-lg border-2 flex flex-col gap-2 transition-all duration-300",
                    res.status === "success"
                      ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                      : res.status === "error"
                      ? "border-red-500 bg-red-50 dark:bg-red-900/30"
                      : "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">{res.chain}</span>
                    {res.status === "success" && <span className="text-green-600 text-xl">✔</span>}
                    {res.status === "error" && <span className="text-red-600 text-xl">✖</span>}
                    {res.status === "pending" && <span className="text-yellow-600 text-xl">…</span>}
                  </div>
                  {res.explorerUrl && (
                    <a
                      href={res.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm font-semibold hover:text-fuchsia-600"
                    >
                      View on Explorer
                    </a>
                  )}
                  {res.error && (
                    <div className="text-red-700 text-sm font-medium">{res.error}</div>
                  )}
                  {res.warnings && res.warnings.length > 0 && (
                    <ul className="text-yellow-700 text-xs list-disc ml-4">
                      {res.warnings.map((w, j) => (
                        <li key={j}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
