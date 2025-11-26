import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';
import PartnerModel from '@/models/Partner';
import ProductModel from '@/models/Product';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting migration from JSON to MongoDB...');

    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing MongoDB data...');
    await UserModel.deleteMany({});
    await PartnerModel.deleteMany({});
    await ProductModel.deleteMany({});
    console.log('✅ Cleared existing data');

    let userCount = 0;
    let partnerCount = 0;
    let productCount = 0;

    // Migrate Users
    console.log('👥 Migrating users...');
    const usersPath = path.join(DATA_DIR, 'users.json');
    if (fs.existsSync(usersPath)) {
      const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
      if (usersData.length > 0) {
        await UserModel.insertMany(usersData.map((user: any) => ({
          username: user.username,
          password: user.password,
          role: user.role,
        })));
        userCount = usersData.length;
        console.log(`✅ Migrated ${userCount} users`);
      }
    }

    // Migrate Partners
    console.log('🏥 Migrating partners...');
    const partnersPath = path.join(DATA_DIR, 'partners.json');
    if (fs.existsSync(partnersPath)) {
      const partnersData = JSON.parse(fs.readFileSync(partnersPath, 'utf-8'));
      if (partnersData.length > 0) {
        const partnerIdMap: { [key: string]: string } = {};
        
        for (const partner of partnersData) {
          const newPartner = await PartnerModel.create({
            name: partner.name,
            address: partner.address || 'N/A',
            province: partner.province,
            phone: partner.phone || '000-0000-0000',
            email: partner.email || 'email@example.com',
            contactPerson: partner.contactPerson || 'N/A',
            active: partner.active !== false,
          });
          partnerIdMap[partner._id] = newPartner._id.toString();
        }
        partnerCount = partnersData.length;
        console.log(`✅ Migrated ${partnerCount} partners`);

        // Migrate Products
        console.log('📦 Migrating products...');
        const productsPath = path.join(DATA_DIR, 'products.json');
        if (fs.existsSync(productsPath)) {
          const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
          if (productsData.length > 0) {
            const productsToInsert = productsData.map((product: any) => ({
              qrCode: product.qrCode,
              partnerId: partnerIdMap[product.partnerId] || product.partnerId,
              batchNumber: product.batchNumber,
              manufacturingDate: new Date(product.manufacturingDate),
              expiryDate: new Date(product.expiryDate),
              status: product.status,
              condition: product.condition || 'terkirim',
              scannedAt: product.scannedAt ? new Date(product.scannedAt) : undefined,
              scannedBy: product.scannedBy,
            }));
            await ProductModel.insertMany(productsToInsert);
            productCount = productsData.length;
            console.log(`✅ Migrated ${productCount} products`);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      summary: {
        users: userCount,
        partners: partnerCount,
        products: productCount,
      },
    });

  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Migration failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send a POST request to run migration',
  });
}
