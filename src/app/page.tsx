import dynamic from "next/dynamic";
import { useState } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function Home() {
  const [address, setAddress] = useState("");
  const [source, setSource] = useState("");
  const [compiler, setCompiler] = useState("");
  const [optimization, setOptimization] = useState(false);
  const [runs, setRuns] = useState(200);
  const [loading, setLoading] = useState(false);

  // Placeholder compiler versions
  const compilerVersions = [
    "v0.8.21+commit.d9974bed",
    "v0.8.20+commit.a1b79de6",
    "v0.7.6+commit.7338295f",
    "v0.6.12+commit.27d51765",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-10 px-4">
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
              onChange={v => setSource(v || "")}
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
        >
          {loading && (
            <span className="loader border-2 border-t-2 border-t-white border-blue-400 rounded-full w-4 h-4 animate-spin"></span>
          )}
          Verify
        </button>
      </div>
    </div>
  );
}
