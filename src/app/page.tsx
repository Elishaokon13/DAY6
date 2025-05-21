import dynamic from "next/dynamic";
import { useState } from "react";

// @ts-expect-error: monaco-editor types are not available
const MonacoEditor: any = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// Types for mock results
interface VerificationResult {
  chain: string;
  status: "success" | "error" | "pending";
  explorerUrl?: string;
  warnings?: string[];
  error?: string;
}

export default function Home() {
  const [address, setAddress] = useState("");
  const [source, setSource] = useState("");
  const [compiler, setCompiler] = useState("");
  const [optimization, setOptimization] = useState(false);
  const [runs, setRuns] = useState(200);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Placeholder compiler versions
  const compilerVersions = [
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-10 px-4">
      {/* Toast/Alert */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold transition-all
            ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}
        >
          {toast.message}
        </div>
      )}
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 flex flex-col gap-8">
        <h1 className="text-2xl font-bold text-center mb-2">Contract Verification-as-a-Service</h1>
        <div className="flex flex-col gap-4">
          <label className="font-medium">Contract Address</label>
          <input
            className="border rounded px-3 py-2 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="0x..."
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-4">
          <label className="font-medium">Solidity Source Code</label>
          <div className="h-64 border rounded overflow-hidden bg-zinc-50 dark:bg-zinc-800">
            <MonacoEditor
              height="100%"
              defaultLanguage="solidity"
              value={source}
              onChange={(v: string | undefined) => setSource(v || "")}
              options={{ minimap: { enabled: false } }}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-medium">Compiler Version</label>
            <select
              className="border rounded px-3 py-2 bg-zinc-50 dark:bg-zinc-800"
              value={compiler}
              onChange={e => setCompiler(e.target.value)}
            >
              <option value="">Select version</option>
              {compilerVersions.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-medium">Optimization</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={optimization}
                onChange={e => setOptimization(e.target.checked)}
                className="accent-blue-500 w-5 h-5"
              />
              <span>{optimization ? "On" : "Off"}</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-medium">Optimization Runs</label>
            <input
              type="number"
              min={0}
              className="border rounded px-3 py-2 bg-zinc-50 dark:bg-zinc-800"
              value={runs}
              onChange={e => setRuns(Number(e.target.value))}
              disabled={!optimization}
            />
          </div>
        </div>
        <button
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition flex items-center justify-center gap-2 disabled:opacity-50"
          disabled={loading}
          onClick={handleVerify}
        >
          {loading && (
            <span className="loader border-2 border-t-2 border-t-white border-blue-400 rounded-full w-4 h-4 animate-spin"></span>
          )}
          Verify
        </button>
        {/* Result Cards */}
        {results.length > 0 && (
          <div className="mt-8 flex flex-col gap-4">
            <h2 className="text-lg font-semibold mb-2">Verification Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {results.map((res, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-4 shadow border-2 flex flex-col gap-2
                    ${res.status === "success" ? "border-green-500 bg-green-50 dark:bg-green-900/30" :
                      res.status === "error" ? "border-red-500 bg-red-50 dark:bg-red-900/30" :
                      "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30"}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{res.chain}</span>
                    {res.status === "success" && <span className="text-green-600">✔</span>}
                    {res.status === "error" && <span className="text-red-600">✖</span>}
                    {res.status === "pending" && <span className="text-yellow-600">…</span>}
                  </div>
                  {res.explorerUrl && (
                    <a
                      href={res.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
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
