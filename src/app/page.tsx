"use client";

import { useState } from "react";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";

type VerificationResult = {
  status: string;
  // Add more fields as needed (e.g., network, compiler, optimization, etc.)
};

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
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState("");
  const [sourceCode, setSourceCode] = useState("");

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
  const ResultGrid = ({ data }: { data: VerificationResult }) => (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <div className="rounded-xl bg-gradient-to-br from-[#232526] to-[#414345] p-4 shadow-lg flex flex-col gap-2 border border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Status:</span>
          <span className="px-2 py-1 rounded bg-green-700 text-xs text-white">{data.status}</span>
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
    // TODO: Call backend API with contractAddress, sourceCode, abi, network
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
        <label className="flex flex-col gap-2 relative">
          <span className="text-white font-medium flex items-center gap-2">
            Contract Bytecode
            {/* Info icon with tooltip */}
            <span className="relative group cursor-pointer">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="inline-block text-blue-400"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><text x="12" y="16" textAnchor="middle" fontSize="12" fill="currentColor">i</text></svg>
              <span className="absolute left-1/2 z-20 -translate-x-1/2 mt-2 w-64 rounded bg-gray-900 text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-xl">
                <b>Contract Bytecode</b> is the compiled version of your smart contract, usually starting with <code>0x</code>.<br/><br/>
                You can get it from your contract&apos;s deployment transaction or from block explorers like Etherscan.<br/><br/>
                <b>Tip:</b> If you have the contract address, you can find the bytecode on Etherscan under the contract&apos;s Code tab.
              </span>
            </span>
          </span>
          <textarea
            className="rounded-lg p-3 bg-black/40 text-white border border-white/10 focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
            placeholder="e.g. 0x608060405234801561001057600080fd5b506040516101..."
            value={bytecode}
            onChange={e => setBytecode(e.target.value)}
            required
          />
          <div className="flex items-center gap-2 mt-1">
            <a
              href="https://docs.etherscan.io/tutorials/how-to-get-contract-bytecode"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 underline hover:text-blue-300"
            >
              How to find bytecode?
            </a>
            <button
              type="button"
              className="text-xs text-gray-400 bg-gray-800 rounded px-2 py-1 ml-2 cursor-not-allowed opacity-60"
              disabled
            >
              Paste from Explorer (coming soon)
            </button>
          </div>
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
        <label className="flex flex-col gap-2">
          <span className="text-white font-medium">Contract Address</span>
          <input
            className="rounded-lg p-3 bg-black/40 text-white border border-white/10 focus:ring-2 focus:ring-blue-500"
            placeholder="Enter contract address..."
            value={contractAddress}
            onChange={e => setContractAddress(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-white font-medium">Source Code</span>
          <textarea
            className="rounded-lg p-3 bg-black/40 text-white border border-white/10 focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
            placeholder="Paste contract source code here..."
            value={sourceCode}
            onChange={e => setSourceCode(e.target.value)}
            required
          />
        </label>
        <div className="flex flex-col gap-4 mt-2">
          <MovingBorderButton type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify Contract"}
          </MovingBorderButton>
          {loading && <Progress />}
          {error && <Alert type="error" message={error} />}
        </div>
        {result && <ResultGrid data={result} />}
      </form>
    </div>
  );
}
