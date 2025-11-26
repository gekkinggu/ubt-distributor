import { NextRequest, NextResponse } from 'next/server';
import { usersDb } from '@/lib/db';
import { comparePassword } from '@/lib/auth';
import { generateToken } from '@/lib/jwt';
import { AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username dan password harus diisi' } as AuthResponse,
        { status: 400 }
      );
    }

    const user = await usersDb.getByUsername(username);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Username atau password salah' } as AuthResponse,
        { status: 401 }
      );
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Username atau password salah' } as AuthResponse,
        { status: 401 }
      );
    }

    const token = generateToken({
      id: user._id,
      username: user.username,
      role: user.role,
    });

    const response: AuthResponse = {
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' } as AuthResponse,
      { status: 500 }
    );
  }
}
