import { NextRequest, NextResponse } from 'next/server';
import { partnersDb, productsDb } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { Partner } from '@/types';
import { generatePartnerId, getCurrentDate } from '@/lib/utils';

// Middleware to verify admin role
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

export async function GET(request: NextRequest) {
  const auth = verifyAdmin(request);
  if (!auth.success) {
    return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
  }

  try {
    const partners = await partnersDb.getAll();
    
    // Get products for each partner
    const partnersWithProducts = await Promise.all(partners.map(async partner => {
      const products = await productsDb.getByPartnerId(partner._id);
      return {
        ...partner,
        productCount: products.length,
        productDetails: products,
      };
    }));

    return NextResponse.json({ success: true, data: partnersWithProducts });
  } catch (error) {
    console.error('Get partners error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data mitra' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = verifyAdmin(request);
  if (!auth.success) {
    return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
  }

  try {
    const { name, address, province, phone, email, contactPerson } = await request.json();

    if (!name || !address || !province || !phone || !email || !contactPerson) {
      return NextResponse.json(
        { success: false, message: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    const partner = await partnersDb.create({
      name,
      address,
      province,
      phone,
      email,
      contactPerson,
      active: true,
    });
    return NextResponse.json({ success: true, data: partner });
  } catch (error) {
    console.error('Create partner error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan mitra' },
      { status: 500 }
    );
  }
}
