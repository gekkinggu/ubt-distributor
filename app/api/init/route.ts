import { NextRequest, NextResponse } from 'next/server';
import { initializeSampleData } from '@/lib/initData';

export async function POST(request: NextRequest) {
  try {
    await initializeSampleData();
    return NextResponse.json({ success: true, message: 'Data sampel berhasil diinisialisasi' });
  } catch (error) {
    console.error('Init data error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menginisialisasi data' },
      { status: 500 }
    );
  }
}
