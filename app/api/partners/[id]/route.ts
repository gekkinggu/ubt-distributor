import { NextRequest, NextResponse } from 'next/server';
import { partnersDb } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, message: 'Token tidak ditemukan' };
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return { success: false, message: 'Token tidak valid' };
  }

  if (decoded.role !== 'admin') {
    return { success: false, message: 'Akses ditolak. Hanya admin yang diizinkan' };
  }

  return { success: true, user: decoded };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyAdmin(request);
  if (!auth.success) {
    return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
  }

  try {
    const { name, address, province, phone, email, contactPerson } = await request.json();
    const { id } = await params;

    if (!name || !address || !province || !phone || !email || !contactPerson) {
      return NextResponse.json(
        { success: false, message: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    const updated = await partnersDb.update(id, { name, address, province, phone, email, contactPerson });
    
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Mitra tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update partner error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengupdate mitra' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyAdmin(request);
  if (!auth.success) {
    return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
  }

  try {
    const { id } = await params;
    const success = await partnersDb.delete(id);

    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Mitra tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Mitra berhasil dihapus' });
  } catch (error) {
    console.error('Delete partner error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus mitra' },
      { status: 500 }
    );
  }
}
