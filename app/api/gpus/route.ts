import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Gpu from '@/models/Gpu';

export async function GET() {
  try {
    await dbConnect();
    const gpus = await Gpu.find({});
    return NextResponse.json(gpus, { status: 200 });
  } catch (error) {
    console.error('Error fetching GPUs:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await dbConnect();

    const gpu = await Gpu.create(body);
    return NextResponse.json(gpu, { status: 201 });
  } catch (error) {
    console.error('Error creating GPU:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
