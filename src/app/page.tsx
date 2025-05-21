'use client';

import { useState, ChangeEvent } from 'react';
import { Button as MovingBorderButton } from '@/components/ui/moving-border';

// Backend response type
interface VerifyResponse {
  status: 'success' | 'error';
  explorer: string;
  optimization: {
    compilerVersion: string;
    runs: number;
    enabled: boolean;
  };
  warnings?: string[];
  errors?: string[];
}

const NETWORKS = [
  { label: 'Ethereum', value: 'ethereum' },
  { label: 'Base', value: 'base' },
  { label: 'Arbitrum', value: 'arbitrum' },
] as const;

const COMPILER_VERSIONS = [
  { label: 'Solidity v0.8.20', value: 'v0.8.20' },
  { label: 'Solidity v0.8.19', value: 'v0.8.19' },
  { label: 'Solidity v0.8.18', value: 'v0.8.18' },
] as const;

const Progress = (): JSX.Element => (
  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mt-4">
    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse w-2/3" />
  </div>
);

const Alert = ({
  type,
  message,
}: {
  type: 'success' | 'warning' | 'error';
  message: string;
}): JSX.Element => {
  const color =
    type === 'success' ? 'bg-green-600' : type === 'warning' ? 'bg-yellow-600' : 'bg-red-600';
  return (
    <div className={`w-full px-4 py-2 rounded-lg text-white ${color} mt-4 animate-fade-in`}>
      {message}
    </div>
  );
};

const ResultGrid = ({ data }: { data: VerifyResponse[] }): JSX.Element => (
  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
    {data.map((result, index) => (
      <div
        key={index}
        className="rounded-xl bg-gradient-to-br from-[#232526] to-[#414345] p-4 shadow-lg flex flex-col gap-2 border border-white/10"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Explorer:</span>
          <span className="px-2 py-1 rounded bg-blue-700 text-xs text-white">{result.explorer}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Status:</span>
          <span
            className={`px-2 py-1 rounded text-xs text-white ${
              result.status === 'success' ? 'bg-green-700' : 'bg-red-700'
            }`}
          >
            {result.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Compiler:</span>
          <span className="px-2 py-1 rounded bg-gray-700 text-xs text-white">
            {result.optimization.compilerVersion}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Optimization:</span>
          <span className="px-2 py-1 rounded bg-purple-700 text-xs text-white">
            {result.optimization.enabled
              ? `Enabled (${result.optimization.runs} runs)`
              : 'Disabled'}
          </span>
        </div>
        {result.warnings?.map((warning, i) => (
          <Alert key={i} type="warning" message={warning} />
        ))}
        {result.errors?.map((err, i) => (
          <Alert key={i} type="error" message={err} />
        ))}
      </div>
    ))}
  </div>
);

export default function Home(): JSX.Element {
  const [contractAddress, setContractAddress] = useState<string>('');
  const [sourceCode, setSourceCode] = useState<string>('');
  const [compilerVersion, setCompilerVersion] = useState<string>('');
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([NETWORKS[0].value]);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<VerifyResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleNetwork = (value: string): void => {
    setSelectedNetworks((prev) =>
      prev.includes(value) ? prev.filter((n) => n !== value) : [...prev, value],
    );
  };

  const handleVerify = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const payload = {
        contractAddress,
        sourceCode,
        compilerVersion,
        networks: selectedNetworks,
      };

      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = (await response.json()) as VerifyResponse[] | VerifyResponse;
      setResults(Array.isArray(data) ? data : [data]);
    } catch {
      setError('Failed to verify contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18181b] to-[#232526] p-4">
      <form
        onSubmit={handleVerify}
        className="w-full max-w-xl mx-auto rounded-3xl bg-white/10 backdrop-blur-lg shadow-2xl p-8 flex flex-col gap-6 border border-white/20 animate-fade-in"
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
      >
        <h1 className="text-2xl font-bold text-white text-center mb-2 tracking-tight">
          Contract Verification-as-a-Service
        </h1>
        <p className="text-center text-gray-300 mb-4">
          Paste your contract details and verify instantly across major block explorers.
        </p>

        {/* Network Multi-Select */}
        <label className="flex flex-col gap-2 relative">
          <span className="text-white font-medium">Network(s)</span>
          <div className="relative">
            <button
              type="button"
              className="w-full rounded-lg p-3 bg-black/40 text-white border border-white/10 focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              <span className="flex flex-wrap gap-2">
                {selectedNetworks.length === 0 ? (
                  <span className="text-gray-400">Select network(s)...</span>
                ) : (
                  selectedNetworks.map((n) => (
                    <span
                      key={n}
                      className="bg-blue-700 text-xs px-2 py-1 rounded mr-1"
                    >
                      {NETWORKS.find((net) => net.value === n)?.label}
                    </span>
                  ))
                )}
              </span>
              <svg
                className={`w-4 h-4 ml-2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute z-30 mt-2 w-full rounded-lg bg-black/90 border border-white/10 shadow-xl animate-fade-in">
                {NETWORKS.map((n) => (
                  <button
                    type="button"
                    key={n.value}
                    className={`w-full text-left px-4 py-2 hover:bg-blue-800/40 flex items-center gap-2 ${
                      selectedNetworks.includes(n.value) ? 'bg-blue-800/60 text-white' : 'text-gray-200'
                    }`}
                    onClick={() => toggleNetwork(n.value)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedNetworks.includes(n.value)}
                      readOnly
                      className="accent-blue-500 mr-2"
                    />
                    {n.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </label>

        {/* Contract Address */}
        <label className="flex flex-col gap-2 relative">
          <span className="text-white font-medium flex items-center gap-2">
            Contract Address
            <span className="relative group cursor-pointer">
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block text-blue-400"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <text x="12" y="16" textAnchor="middle" fontSize="12" fill="currentColor">
                  i
                </text>
              </svg>
              <span className="absolute left-1/2 z-20 -translate-x-1/2 mt-2 w-64 rounded bg-gray-900 text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-xl">
                <b>Contract Address</b> is the unique address of your deployed smart contract, starting
                with <code>0x</code>.<br />
                <br />
                You can find it on block explorers like Etherscan after deploying your contract.
              </span>
            </span>
          </span>
          <input
            className="rounded-lg p-3 bg-black/40 text-white border border-white/10 focus:ring-2 focus:ring-blue-500"
            placeholder="Enter contract address (e.g., 0x...)"
            value={contractAddress}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setContractAddress(e.target.value)}
            required
          />
        </label>

        {/* Source Code */}
        <label className="flex flex-col gap-2">
          <span className="text-white font-medium">Source Code</span>
          <textarea
            className="rounded-lg p-3 bg-black/40 text-white border border-white/10 focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
            placeholder="Paste contract source code here..."
            value={sourceCode}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSourceCode(e.target.value)}
            required
          />
        </label>

        {/* Compiler Version */}
        <label className="flex flex-col gap-2">
          <span className="text-white font-medium">Compiler Version</span>
          <select
            className="rounded-lg p-3 bg-black/40 text-white border border-white/10 focus:ring-2 focus:ring-blue-500"
            value={compilerVersion}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setCompilerVersion(e.target.value)}
            required
          >
            <option value="" disabled>
              Select compiler version
            </option>
            {COMPILER_VERSIONS.map((version) => (
              <option key={version.value} value={version.value}>
                {version.label}
              </option>
            ))}
          </select>
        </label>

        {/* Submit and Results */}
        <div className="flex flex-col gap-4 mt-2">
          <MovingBorderButton type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Contract'}
          </MovingBorderButton>
          {loading && <Progress />}
          {error && <Alert type="error" message={error} />}
          {results.length > 0 && <ResultGrid data={results} />}
        </div>
      </form>
    </div>
  );
}