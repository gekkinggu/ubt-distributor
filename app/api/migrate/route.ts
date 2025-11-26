import { NextRequest, NextResponse } from 'next/server';
import { migrateProductConditions } from '@/lib/migrate';

export async function POST(request: NextRequest) {
  try {
    const result = await migrateProductConditions();
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: `Migration berhasil: ${result.updatedCount} produk diupdate` 
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Migration gagal' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat migration' },
      { status: 500 }
    );
  }
}
