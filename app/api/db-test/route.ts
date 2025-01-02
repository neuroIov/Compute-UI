import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';

export async function GET() {
  try {
    // Log the MongoDB URI (but mask the password)
    const uri = process.env.MONGODB_URI || '';
    const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
    console.log('Attempting to connect with URI:', maskedUri);

    // Try to connect
    await dbConnect();
    
    // If connected, get database stats
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Connected to MongoDB!',
      database: mongoose.connection.name,
      collections: collectionNames
    });
  } catch (error) {
    console.error('Full connection error:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to connect to database',
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    );
  }
}
