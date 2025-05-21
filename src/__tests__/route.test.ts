import { POST } from './route';
import type { VerifyRequest } from './route';

// Mock Request helper
function createRequest(body: Partial<VerifyRequest>) {
  return {
    json: async () => body,
  } as unknown as Request;
}

process.env.ETHERSCAN_API_KEY = 'dummy';
process.env.BASESCAN_API_KEY = 'dummy';
process.env.ARBISCAN_API_KEY = 'dummy';

describe('/api/verify API Route', () => {
  it('returns error for missing fields', async () => {
    const req = createRequest({});
    const res = await POST(req);
    const data = await res.json();
    expect(data.status).toBe('error');
    expect(data.errors).toBeDefined();
  });

  it('returns error for invalid contract address', async () => {
    const req = createRequest({
      contractAddress: '0x123',
      sourceCode: 'pragma solidity ^0.8.0; contract A { }',
      compilerVersion: 'v0.8.20',
      networks: ['ethereum'],
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.status).toBe('error');
    expect(data.errors[0]).toMatch(/Invalid contract address/);
  });

  // Add more tests for valid contract, compilation error, etc.
}); 