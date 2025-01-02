import { NextResponse } from 'next/server';

// List Network Volumes
export async function GET() {
  try {
    const response = await fetch('https://api.gpulab.ai/nas-servers', {
      headers: {
        'api-key': process.env.GPULAB_API_KEY || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list network volumes' }, { status: 500 });
  }
}
