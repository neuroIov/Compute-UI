import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.GPULAB_API_KEY;
    
    if (!apiKey) {
      console.error('GPULab API key not found');
      return NextResponse.json({
        success: false,
        error: 'GPULab API key not configured',
        details: 'API key is missing in environment variables'
      }, { status: 500 });
    }

    console.log('Testing connection with API key:', apiKey.substring(0, 4) + '...');

    // Test connection by making a simple request
    const response = await fetch('https://api.gpulab.ai/v1/health', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });

    console.log('GPULab health check status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Invalid response from server' }));
      console.error('GPULab health check failed:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to GPULab',
        details: error.message || `HTTP error! status: ${response.status}`
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('GPULab health check response:', data);

    return NextResponse.json({
      success: true,
      data: {
        status: 'connected',
        apiVersion: data.version || 'v1',
        serverTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}
