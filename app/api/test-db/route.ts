import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

export async function GET() {
  try {
    console.log('Attempting to connect with URI:', process.env.MONGODB_URI);
    await dbConnect();
    return NextResponse.json({ status: 'Connected to MongoDB!' });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to connect to database',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
