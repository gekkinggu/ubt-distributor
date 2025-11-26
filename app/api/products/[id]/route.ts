import { NextRequest, NextResponse } from 'next/server';
import { productsDb } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, message: 'Token tidak ditemukan' };
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return { success: false, message: 'Token tidak valid' };
  }

  return { success: true, user: decoded };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyAuth(request);
  if (!auth.success) {
    return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
  }

  try {
    const { condition } = await request.json();
    const { id } = await params;

    if (!condition || !['terkirim', 'terpakai', 'rusak'].includes(condition)) {
      return NextResponse.json(
        { success: false, message: 'Kondisi tidak valid' },
        { status: 400 }
      );
    }

    const updated = await productsDb.update(id, { condition });
    
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update product condition error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengupdate kondisi produk' },
      { status: 500 }
    );
  }
}
