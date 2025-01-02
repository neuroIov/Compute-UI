import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ 
      message: 'Successfully connected to MongoDB Atlas'
    });
  } catch (error: any) {
    console.error('Database connection failed:', error);
    return NextResponse.json({ 
      error: 'Failed to connect to database',
      details: error.message
    }, { status: 500 });
  }
}
