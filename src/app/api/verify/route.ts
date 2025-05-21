import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Types for request and response
interface VerifyRequest {
  bytecode: string;
  abi: string;
  network: 'ethereum' | 'base' | 'arbitrum';
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

// Helper: Get explorer API URL and key
function getExplorerConfig(network: string) {
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

// POST /api/verify
export async function POST(req: Request) {
  try {
    const body = await req.json() as VerifyRequest;
    const { bytecode, abi, network } = body;
    if (!bytecode || !abi || !network) {
      return NextResponse.json({ status: 'error', errors: ['Missing required fields'] }, { status: 400 });
    }

    // Get explorer config
    let explorerConfig;
    try {
      explorerConfig = getExplorerConfig(network);
    } catch (err: any) {
      return NextResponse.json({ status: 'error', errors: [err.message] }, { status: 400 });
    }

    // --- Parse bytecode for metadata (stubbed for now) ---
    // In a real implementation, use ethers.js or custom logic to extract compiler version and optimization runs
    // For demo, we'll return dummy data
    const optimization = {
      compilerVersion: 'v0.8.20',
      runs: 200,
      enabled: true,
    };

    // TODO: Call explorer API to verify contract (stubbed)
    // You would use fetch/explorerConfig.url with the right params and explorerConfig.key

    // Example warning if metadata mismatches (stub)
    const warnings: string[] = [];
    // if (metadataMismatch) warnings.push('Metadata mismatch detected');

    const response: VerifyResponse = {
      status: 'success',
      explorer: explorerConfig.explorer,
      optimization,
      warnings,
    };
    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json({ status: 'error', errors: [err.message || 'Unknown error'] }, { status: 500 });
  }
} 