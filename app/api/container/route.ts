import { NextResponse } from 'next/server';

// Create Container
export async function POST(req: Request) {
  try {
    const apiKey = process.env.GPULAB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GPULab API key not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { model_id, gpu_count, gpu_type, volume_container_identifier, existing_container_address } = body;
    
    const response = await fetch('https://api.gpulab.ai/container/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        model_id,
        gpu_count,
        gpu_type,
        volume_container_identifier,
        existing_container_address,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to create container' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create container' }, { status: 500 });
  }
}

// Delete Container
export async function DELETE(req: Request) {
  try {
    const apiKey = process.env.GPULAB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GPULab API key not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { address } = body;

    const response = await fetch('https://api.gpulab.ai/container', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({ address }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to delete container' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete container' }, { status: 500 });
  }
}

// Get Container Info
export async function GET(req: Request) {
  try {
    const apiKey = process.env.GPULAB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GPULab API key not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const container_id = searchParams.get('container_id');

    if (!container_id) {
      return NextResponse.json({ error: 'Container ID is required' }, { status: 400 });
    }

    const response = await fetch('https://api.gpulab.ai/containerstats', {
      headers: {
        'container_id': container_id,
        'api-key': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to get container info' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get container info' }, { status: 500 });
  }
}
