import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/app/lib/db';
import User from '@/app/model/User';
import { z } from 'zod'; 

const registrationSchema = z.object({
  name: z.string().min(2, { message: "First name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/, {
      message: "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character"
    })
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Registration body:', body);
    const validatedData = registrationSchema.parse(body);

    await dbConnect();

    const existingEmail = await User.findOne({ email: validatedData.email });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      isVerified: false,
      registeredAt: new Date()
    });

    const { password, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userWithoutPassword 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}

// Optional: Add rate limiting to prevent brute force attacks
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}