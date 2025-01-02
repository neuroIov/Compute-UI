import { NextResponse } from 'next/server';

// Create Model
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      image_name,
      author_url,
      category_id,
      min_vram,
      isVisible,
      thumbnail_url,
      container_port,
      container_disk,
      credentials_id,
      volume_disk,
      volume_mount_path,
      docker_command,
      env_vars,
      username,
      password,
      readme,
    } = body;

    const response = await fetch('https://api.gpulab.ai/model-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.GPULAB_API_KEY || '',
      },
      body: JSON.stringify({
        name,
        image_name,
        author_url,
        category_id,
        min_vram,
        isVisible,
        thumbnail_url,
        container_port,
        container_disk,
        credentials_id,
        volume_disk,
        volume_mount_path,
        docker_command,
        env_vars,
        username,
        password,
        readme,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create model' }, { status: 500 });
  }
}

// Delete Model
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get('identifier');

    if (!identifier) {
      return NextResponse.json({ error: 'Identifier is required' }, { status: 400 });
    }

    const response = await fetch(`https://api.gpulab.ai/models/${identifier}`, {
      method: 'DELETE',
      headers: {
        'api-key': process.env.GPULAB_API_KEY || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete model' }, { status: 500 });
  }
}
