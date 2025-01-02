import { NextResponse } from 'next/server';

// List All Models
export async function GET() {
  try {
    const apiKey = process.env.GPULAB_API_KEY;
    if (!apiKey) {
      console.error('GPULab API key not found in environment variables');
      return NextResponse.json({ error: 'GPULab API key not configured' }, { status: 500 });
    }

    console.log('Making request to GPULab API with key:', apiKey.substring(0, 4) + '...');
    const response = await fetch('https://api.gpulab.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });

    console.log('GPULab API response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Invalid response from server' }));
      console.error('GPULab API error:', error);
      return NextResponse.json({ error: error.message || 'Failed to fetch models' }, { status: response.status });
    }

    const data = await response.json();
    console.log('GPULab API response data:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in models route:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}
