'use client';

import { Card, Textarea, Button, Select, Alert, Badge } from '@aceternity/ui';
import { useState } from 'react';

// Reuse backend types
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

export default function ContractVerifier(): JSX.Element {
  const [bytecode, setBytecode] = useState<string>('');
  const [abi, setAbi] = useState<string>('');
  const [networks, setNetworks] = useState<string[]>([]);
  const [results, setResults] = useState<VerifyResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const verify = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bytecode, abi, networks }),
      });
      const data = (await res.json()) as VerifyResponse[] | VerifyResponse;
      setResults(Array.isArray(data) ? data : [data]);
    } catch {
      setError('Failed to verify contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-2xl p-6 bg-gradient-to-br from-gray-900 to-black">
      <h1 className="mb-6 text-3xl font-bold">Contract Verifier</h1>
      <Select
        options={[
          { value: 'ethereum', label: 'Ethereum' },
          { value: 'base', label: 'Base' },
          { value: 'arbitrum', label: 'Arbitrum' },
        ]}
        onChange={(values: string[]) => setNetworks(values)}
        multiple
        placeholder="Select Networks"
        className="mb-4"
      />
      <Textarea
        placeholder="Paste Bytecode"
        value={bytecode}
        onChange={(e) => setBytecode(e.target.value)}
        className="mb-4"
      />
      <Textarea
        placeholder="Paste ABI"
        value={abi}
        onChange={(e) => setAbi(e.target.value)}
        className="mb-4"
      />
      <Button onClick={verify} disabled={loading} className="w-full">
        {loading ? 'Verifying...' : 'Verify Contract'}
      </Button>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      {results.map((result, index) => (
        <Card key={index} className="mt-4">
          <Badge>{result.explorer}</Badge>
          <p>Status: {result.status}</p>
          <p>Compiler: {result.optimization.compilerVersion}</p>
          <p>Runs: {result.optimization.runs}</p>
          {result.warnings?.map((warning, i) => (
            <Alert key={i} variant="warning">
              {warning}
            </Alert>
          ))}
          {result.errors?.map((err, i) => (
            <Alert key={i} variant="destructive">
              {err}
            </Alert>
          ))}
        </Card>
      ))}
    </Card>
  );
}