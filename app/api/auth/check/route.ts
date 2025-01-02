import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        authenticated: false
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: session.user
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
