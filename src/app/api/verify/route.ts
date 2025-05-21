import { NextResponse } from 'next/server';

// POST /api/verify
export async function POST() {
  // For now, just return a health check response
  return NextResponse.json({ status: 'ok', message: 'API route is running.' });
} 