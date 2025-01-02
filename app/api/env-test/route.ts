import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    hasUri: !!process.env.MONGODB_URI,
    uriStart: process.env.MONGODB_URI?.substring(0, 50) + '...' // Only show start of URI for security
  });
}
