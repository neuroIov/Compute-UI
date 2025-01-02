import { NextResponse } from 'next/server';

// Create Network Volume
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { template_name, volume_space, unit, region_type } = body;

    const response = await fetch('https://api.gpulab.ai/nas-server', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.GPULAB_API_KEY || '',
      },
      body: JSON.stringify({
        template_name,
        volume_space,
        unit,
        region_type,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create network volume' }, { status: 500 });
  }
}

// Update Network Volume
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { volume_server_identifier, template_name, volume_space, unit, region_type } = body;

    const response = await fetch('https://api.gpulab.ai/nas-server', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.GPULAB_API_KEY || '',
      },
      body: JSON.stringify({
        volume_server_identifier,
        template_name,
        volume_space,
        unit,
        region_type,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update network volume' }, { status: 500 });
  }
}

// Delete Network Volume
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get('identifier');

    if (!identifier) {
      return NextResponse.json({ error: 'Identifier is required' }, { status: 400 });
    }

    const response = await fetch(`https://api.gpulab.ai/nas-server/${identifier}`, {
      method: 'DELETE',
      headers: {
        'api-key': process.env.GPULAB_API_KEY || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete network volume' }, { status: 500 });
  }
}
