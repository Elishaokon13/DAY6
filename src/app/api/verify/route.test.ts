import { POST } from './route';

// Mock Request helper
function createRequest(body: any) {
  return {
    json: async () => body,
  } as unknown as Request;
}

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