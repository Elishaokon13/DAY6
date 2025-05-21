import { NextRequest, NextResponse } from 'next/server';

// POST /api/verify
export async function POST(_req: NextRequest) {
  // For now, just return a health check response
  return NextResponse.json({ status: 'ok', message: 'API route is running.' });
} 