import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

// Types for request and response
interface VerifyRequest {
  bytecode: string;
  abi: string;
  networks: ('ethereum' | 'base' | 'arbitrum')[];
}

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

interface ExplorerConfig {
  url: string;
  key: string | undefined;
  explorer: string;
}

// Helper: Get explorer API URL and key
function getExplorerConfig(network: string): ExplorerConfig {
  switch (network) {
    case 'ethereum':
      return {
        url: 'https://api.etherscan.io/api',
        key: process.env.ETHERSCAN_API_KEY,
        explorer: 'Etherscan',
      };
    case 'base':
      return {
        url: 'https://api.basescan.org/api',
        key: process.env.BASESCAN_API_KEY,
        explorer: 'BaseScan',
      };
    case 'arbitrum':
      return {
        url: 'https://api.arbiscan.io/api',
        key: process.env.ARBISCAN_API_KEY,
        explorer: 'Arbiscan',
      };
    default:
      throw new Error('Unsupported network');
  }
}

// Helper: Extract metadata from bytecode
function extractMetadata(bytecode: string): VerifyResponse['optimization'] {
  if (!bytecode.startsWith('0x') || !/^[0-9a-fA-F]+$/.test(bytecode.slice(2))) {
    throw new Error('Invalid bytecode format');
  }
  // TODO: Implement actual metadata parsing with ethers.js
  return {
    compilerVersion: 'v0.8.20',
    runs: 200,
    enabled: true,
  };
}

// Helper: Check for metadata mismatch
function checkMetadataMismatch(bytecode: string, abi: string): string[] {
  const warnings: string[] = [];
  try {
    JSON.parse(abi); // Validate ABI
    // TODO: Compare bytecode metadata with ABI
    // const metadataMismatch = false;
    // if (metadataMismatch) warnings.push('Metadata mismatch detected');
  } catch {
    warnings.push('Invalid ABI format');
  }
  return warnings;
}

// Helper: Verify contract on explorer
async function verifyOnExplorer(
  bytecode: string,
  abi: string,
  explorerConfig: ExplorerConfig,
  optimization: VerifyResponse['optimization'],
): Promise<Pick<VerifyResponse, 'status' | 'explorer' | 'errors'>> {
  const params = new URLSearchParams({
    module: 'contract',
    action: 'verifysourcecode',
    contractaddress: '', // Optional
    sourceCode: '', // Optional
    codeformat: 'solidity-standard-json-input',
    contractname: '', // Optional
    compilerversion: optimization.compilerVersion,
    optimizationUsed: optimization.enabled ? '1' : '0',
    runs: optimization.runs.toString(),
    apikey: explorerConfig.key || '',
  });

  const response = await fetch(`${explorerConfig.url}?${params}`, { method: 'POST' });
  const data = (await response.json()) as { status: string; result: string };

  if (data.status === '1') {
    return { status: 'success', explorer: explorerConfig.explorer };
  }
  return { status: 'error', explorer: explorerConfig.explorer, errors: [data.result] };
}

/**
 * Verifies a smart contract on specified blockchain explorers.
 * @param req - Request containing bytecode, ABI, and networks.
 * @returns Array of verification results or error response.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Validate API keys
    if (
      !process.env.ETHERSCAN_API_KEY ||
      !process.env.BASESCAN_API_KEY ||
      !process.env.ARBISCAN_API_KEY
    ) {
      return NextResponse.json(
        { status: 'error', errors: ['API keys not configured'] },
        { status: 500 },
      );
    }

    const body = (await req.json()) as VerifyRequest;
    const { bytecode, abi, networks } = body;
    if (!bytecode || !abi || !networks || networks.length === 0) {
      return NextResponse.json(
        { status: 'error', errors: ['Missing required fields'] },
        { status: 400 },
      );
    }

    // Validate inputs
    try {
      JSON.parse(abi);
      if (!bytecode.startsWith('0x') || !/^[0-9a-fA-F]+$/.test(bytecode.slice(2))) {
        return NextResponse.json(
          { status: 'error', errors: ['Invalid bytecode format'] },
          { status: 400 },
        );
      }
    } catch {
      return NextResponse.json(
        { status: 'error', errors: ['Invalid ABI format'] },
        { status: 400 },
      );
    }

    const results: VerifyResponse[] = [];
    const metadata = extractMetadata(bytecode);
    const warnings = checkMetadataMismatch(bytecode, abi);

    // Verify on each network
    for (const network of networks) {
      try {
        const explorerConfig = getExplorerConfig(network);
        const result = await verifyOnExplorer(bytecode, abi, explorerConfig, metadata);
        results.push({
          ...result,
          optimization: metadata,
          warnings: warnings.length > 0 ? warnings : undefined,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          status: 'error',
          explorer: network,
          optimization: metadata,
          errors: [message],
        });
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ status: 'error', errors: [message] }, { status: 500 });
  }
}