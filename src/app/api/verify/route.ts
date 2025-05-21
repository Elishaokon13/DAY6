import { NextResponse } from 'next/server';
import solc from 'solc';
import { isAddress } from 'ethers';

// Types for request and response
export interface VerifyRequest {
  contractAddress: string;
  sourceCode: string;
  compilerVersion: string;
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

interface SolcError {
  severity: string;
  formattedMessage: string;
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

// Helper: Compile source code and extract metadata
function compileSourceCode(
  sourceCode: string,
  compilerVersion: string,
  optimizationRuns: number = 200,
): { bytecode: string; abi: string; optimization: VerifyResponse['optimization'] } {
  try {
    // Validate compiler version format (e.g., v0.8.20)
    if (!/^v?\d+\.\d+\.\d+$/.test(compilerVersion)) {
      throw new Error('Invalid compiler version format');
    }

    const input = {
      language: 'Solidity',
      sources: { 'contract.sol': { content: sourceCode } },
      settings: {
        optimizer: { enabled: optimizationRuns > 0, runs: optimizationRuns },
        outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } },
      },
    };

    // Note: solc.compile with dynamic version requires additional setup
    // For production, use solc.loadRemoteVersion(compilerVersion)
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors?.some((err: SolcError) => err.severity === 'error')) {
      throw new Error(`Compilation failed: ${JSON.stringify(output.errors)}`);
    }

    const contract = output.contracts['contract.sol'];
    const contractName = Object.keys(contract)[0];
    const bytecode = contract[contractName].evm.bytecode.object;
    const abi = JSON.stringify(contract[contractName].abi);

    return {
      bytecode: `0x${bytecode}`,
      abi,
      optimization: {
        compilerVersion,
        runs: optimizationRuns,
        enabled: optimizationRuns > 0,
      },
    };
  } catch (error) {
    throw new Error(`Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper: Check for metadata mismatch
async function checkMetadataMismatch(
  contractAddress: string,
  bytecode: string,
  network: string,
): Promise<string[]> {
  const warnings: string[] = [];
  try {
    const explorerConfig = getExplorerConfig(network);
    const params = new URLSearchParams({
      module: 'contract',
      action: 'getcontractcode',
      address: contractAddress,
      apikey: explorerConfig.key || '',
    });

    const response = await fetch(`${explorerConfig.url}?${params}`);
    const data = (await response.json()) as { result: { Code: string } };

    const onChainBytecode = data.result.Code;
    if (!onChainBytecode) {
      warnings.push(`No bytecode found for ${contractAddress} on ${network}`);
      return warnings;
    }

    // Simplified: Compare bytecode (in production, compare metadata hashes)
    if (onChainBytecode !== bytecode) {
      warnings.push('Bytecode mismatch detected between compiled code and on-chain data');
    }
  } catch {
    warnings.push('Failed to verify bytecode on-chain');
  }
  return warnings;
}

// Helper: Verify contract on explorer
async function verifyOnExplorer(
  contractAddress: string,
  sourceCode: string,
  explorerConfig: ExplorerConfig,
  optimization: VerifyResponse['optimization'],
): Promise<Pick<VerifyResponse, 'status' | 'explorer' | 'errors'>> {
  const params = new URLSearchParams({
    module: 'contract',
    action: 'verifysourcecode',
    contractaddress: contractAddress,
    sourceCode,
    codeformat: 'solidity-single-file',
    contractname: 'contract.sol',
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
 * @param req - Request containing contract address, source code, compiler version, and networks.
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
    const { contractAddress, sourceCode, compilerVersion, networks } = body;

    if (!contractAddress || !sourceCode || !compilerVersion || !networks || networks.length === 0) {
      return NextResponse.json(
        { status: 'error', errors: ['Missing required fields'] },
        { status: 400 },
      );
    }

    // Validate contract address
    if (!isAddress(contractAddress)) {
      return NextResponse.json(
        { status: 'error', errors: ['Invalid contract address'] },
        { status: 400 },
      );
    }

    // Compile source code
    const { bytecode, optimization } = compileSourceCode(sourceCode, compilerVersion);
    const results: VerifyResponse[] = [];

    // Verify on each network
    for (const network of networks) {
      try {
        const explorerConfig = getExplorerConfig(network);
        const warnings = await checkMetadataMismatch(contractAddress, bytecode, network);
        const result = await verifyOnExplorer(
          contractAddress,
          sourceCode,
          explorerConfig,
          optimization,
        );
        results.push({
          ...result,
          optimization,
          warnings: warnings.length > 0 ? warnings : undefined,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          status: 'error',
          explorer: network,
          optimization,
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