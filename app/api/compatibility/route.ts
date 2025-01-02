import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GPU from '@/models/gpu';
import AiModel from '@/models/aiModel';

export async function GET() {
  try {
    await dbConnect();
    
    // Get a count of GPUs and AI Models
    const gpuCount = await GPU.countDocuments();
    const aiModelCount = await AiModel.countDocuments();
    
    return NextResponse.json({ 
      status: 'Connected to MongoDB!',
      collections: {
        gpus: gpuCount,
        aiModels: aiModelCount
      }
    });
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
