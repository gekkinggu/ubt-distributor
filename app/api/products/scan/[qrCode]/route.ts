import { NextRequest, NextResponse } from 'next/server';
import { productsDb, partnersDb } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { getCurrentDate } from '@/lib/utils';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  const auth = verifyAuth(request);
  if (!auth.success) {
    return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
  }

  try {
    const { qrCode } = await params;
    const product = await productsDb.getByQRCode(decodeURIComponent(qrCode));

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get partner information
    const partner = await partnersDb.getById(product.partnerId);

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        partner: partner ? { name: partner.name, province: partner.province } : null,
      },
    });
  } catch (error) {
    console.error('Get product by QR error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data produk' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  const auth = verifyAuth(request);
  if (!auth.success) {
    return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
  }

  try {
    const { qrCode } = await params;
    const product = await productsDb.getByQRCode(decodeURIComponent(qrCode));

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    // Mark as scanned
    const updated = await productsDb.update(product._id, {
      status: 'scanned',
      scannedAt: getCurrentDate(),
      scannedBy: auth.user!.id,
    });

    // Get partner information
    const partner = await partnersDb.getById(product.partnerId);

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        partner: partner ? { name: partner.name, province: partner.province } : null,
      },
    });
  } catch (error) {
    console.error('Scan product error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memproses scan produk' },
      { status: 500 }
    );
  }
}
