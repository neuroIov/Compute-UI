import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Gpu from '@/models/Gpu';

// Get a single GPU by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const gpu = await Gpu.findById(params.id);
    
    if (!gpu) {
      return NextResponse.json(
        { error: 'GPU not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(gpu, { status: 200 });
  } catch (error) {
    console.error('Error fetching GPU:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Update a GPU
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    await dbConnect();

    const gpu = await Gpu.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!gpu) {
      return NextResponse.json(
        { error: 'GPU not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(gpu, { status: 200 });
  } catch (error) {
    console.error('Error updating GPU:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Delete a GPU
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const gpu = await Gpu.findByIdAndDelete(params.id);

    if (!gpu) {
      return NextResponse.json(
        { error: 'GPU not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'GPU deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting GPU:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
