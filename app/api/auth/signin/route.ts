import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please provide email and password' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find user and include password for verification
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await user.updateLastLogin();

    // Remove password from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      lastLogin: user.lastLogin
    };

    return NextResponse.json({
      message: 'Login successful',
      user: userResponse
    });

  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
