"use client";

import { useState } from "react";

const NETWORKS = [
  { label: "Ethereum", value: "ethereum" },
  { label: "Base", value: "base" },
  { label: "Arbitrum", value: "arbitrum" },
];

export default function Home() {
  const [bytecode, setBytecode] = useState("");
  const [abi, setAbi] = useState("");
  const [network, setNetwork] = useState(NETWORKS[0].value);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Placeholder for animated button
  const AnimatedButton = ({ children, ...props }: any) => (
    <button
      {...props}
      className="relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium transition-all duration-300 rounded-xl group bg-gradient-to-br from-[#232526] to-[#414345] hover:from-[#232526] hover:to-[#232526] text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-40 transition-all duration-300" />
      <span className="relative z-10">{children}</span>
    </button>
  );

  // Placeholder for progress bar
  const Progress = () => (
    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mt-4">
      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse w-2/3" />
    </div>
  );

  // Placeholder for alert
  const Alert = ({ type, message }: { type: "success" | "warning" | "error"; message: string }) => {
    const color =
      type === "success"
        ? "bg-green-600"
        : type === "warning"
        ? "bg-yellow-600"
        : "bg-red-600";
    return (
      <div className={`w-full px-4 py-2 rounded-lg text-white ${color} mt-4 animate-fade-in`}>{message}</div>
    );
  };

  // Placeholder for result card grid
  const ResultGrid = ({ data }: { data: any }) => (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {/* Example result card */}
      <div className="rounded-xl bg-gradient-to-br from-[#232526] to-[#414345] p-4 shadow-lg flex flex-col gap-2 border border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Status:</span>
          <span className="px-2 py-1 rounded bg-green-700 text-xs text-white">Verified</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Network:</span>
          <span className="px-2 py-1 rounded bg-blue-700 text-xs text-white">Ethereum</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Compiler:</span>
          <span className="px-2 py-1 rounded bg-gray-700 text-xs text-white">v0.8.20</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Optimization:</span>
          <span className="px-2 py-1 rounded bg-purple-700 text-xs text-white">Enabled (200 runs)</span>
        </div>
      </div>
      {/* Add more cards as needed */}
    </div>
  );

  // Handle form submit (placeholder)
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    // TODO: Call backend API
    setTimeout(() => {
      setLoading(false);
      setResult({ status: "success" });
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18181b] to-[#232526] p-4">
      <form
        onSubmit={handleVerify}
        className="w-full max-w-xl mx-auto rounded-3xl bg-white/10 backdrop-blur-lg shadow-2xl p-8 flex flex-col gap-6 border border-white/20 animate-fade-in"
        style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }}
      >
        <h1 className="text-2xl font-bold text-white text-center mb-2 tracking-tight">Contract Verification-as-a-Service</h1>
        <p className="text-center text-gray-300 mb-4">Paste your contract bytecode and ABI, select a network, and verify instantly across major block explorers.</p>
        <label className="flex flex-col gap-2">
          <span className="text-white font-medium">Contract Bytecode</span>
          <textarea
            className="rounded-lg p-3 bg-black/40 text-white border border-white/10 focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
            placeholder="Paste contract bytecode here..."
            value={bytecode}
            onChange={e => setBytecode(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-white font-medium">Contract ABI</span>
          <textarea
            className="rounded-lg p-3 bg-black/40 text-white border border-white/10 focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
            placeholder="Paste contract ABI here..."
            value={abi}
            onChange={e => setAbi(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-white font-medium">Network</span>
          <select
            className="rounded-lg p-3 bg-black/40 text-white border border-white/10 focus:ring-2 focus:ring-blue-500"
            value={network}
            onChange={e => setNetwork(e.target.value)}
          >
            {NETWORKS.map(n => (
              <option key={n.value} value={n.value}>{n.label}</option>
            ))}
          </select>
        </label>
        <div className="flex flex-col gap-4 mt-2">
          <AnimatedButton type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify Contract"}
          </AnimatedButton>
          {loading && <Progress />}
          {error && <Alert type="error" message={error} />}
        </div>
        {result && <ResultGrid data={result} />}
      </form>
    </div>
  );
}
