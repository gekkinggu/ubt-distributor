import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    const userCount = await UserModel.countDocuments();
    
    return NextResponse.json({
      success: true,
      initialized: userCount > 0,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      initialized: false,
      error: 'Failed to check initialization',
    }, { status: 500 });
  }
}
