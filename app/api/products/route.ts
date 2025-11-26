import { NextRequest, NextResponse } from 'next/server';
import { productsDb } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { Product } from '@/types';
import { generateProductId, generateQRCode, getCurrentDate } from '@/lib/utils';

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

export async function POST(request: NextRequest) {
  const auth = verifyAdmin(request);
  if (!auth.success) {
    return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
  }

  try {
    const { partnerId, batchNumber, manufacturingDate, expiryDate, quantity } = await request.json();

    if (!partnerId || !batchNumber || !manufacturingDate || !expiryDate || !quantity) {
      return NextResponse.json(
        { success: false, message: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    if (quantity < 1 || quantity > 100) {
      return NextResponse.json(
        { success: false, message: 'Jumlah produk harus antara 1-100' },
        { status: 400 }
      );
    }

    const products: Product[] = [];

    for (let i = 0; i < quantity; i++) {
      const product = await productsDb.create({
        qrCode: generateQRCode(),
        partnerId,
        batchNumber,
        manufacturingDate,
        expiryDate,
        status: 'active',
        condition: 'terkirim',
      });
      products.push(product);
    }

    return NextResponse.json({ 
      success: true, 
      data: products,
      message: `${quantity} produk berhasil dibuat`
    });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat produk' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const auth = verifyAdmin(request);
  if (!auth.success) {
    return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
  }

  try {
    const products = await productsDb.getAll();
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data produk' },
      { status: 500 }
    );
  }
}
