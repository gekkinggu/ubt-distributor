import connectDB from '../lib/mongodb';
import UserModel from '../models/User';
import PartnerModel from '../models/Partner';
import ProductModel from '../models/Product';
import { hashPassword } from '../lib/auth';

async function initMongoDB() {
  console.log('🚀 Initializing MongoDB with sample data...\n');

  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Check if data already exists
    const userCount = await UserModel.countDocuments();
    if (userCount > 0) {
      console.log('⚠️  Database already has data. Skipping initialization.');
      console.log('   To reset, delete all collections in MongoDB Atlas first.\n');
      process.exit(0);
    }

    // Create users
    console.log('👥 Creating users...');
    const hashedAdminPassword = await hashPassword('admin123');
    const hashedOperatorPassword = await hashPassword('operator123');

    await UserModel.create([
      { username: 'admin', password: hashedAdminPassword, role: 'admin' },
      { username: 'operator', password: hashedOperatorPassword, role: 'operator' },
    ]);
    console.log('✅ Created 2 users\n');

    // Create partners
    console.log('🏥 Creating partners...');
    const partners = await PartnerModel.create([
      {
        name: 'RS Umum Jakarta Pusat',
        address: 'Jl. Sudirman No. 123',
        province: 'DKI Jakarta',
        phone: '021-1234567',
        email: 'info@rsjakpus.com',
        contactPerson: 'Dr. Budi Santoso',
        active: true,
      },
      {
        name: 'RS Bersalin Bandung',
        address: 'Jl. Asia Afrika No. 45',
        province: 'Jawa Barat',
        phone: '022-7654321',
        email: 'admin@rsbandung.com',
        contactPerson: 'Dr. Siti Nurhaliza',
        active: true,
      },
      {
        name: 'Klinik Ibu & Anak Surabaya',
        address: 'Jl. Tunjungan No. 88',
        province: 'Jawa Timur',
        phone: '031-9876543',
        email: 'contact@kiasurabaya.com',
        contactPerson: 'Bidan Sri Wahyuni',
        active: true,
      },
    ]);
    console.log(`✅ Created ${partners.length} partners\n`);

    // Create products
    console.log('📦 Creating products...');
    const today = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(today.getFullYear() + 1);

    const products = [];
    for (let i = 0; i < partners.length; i++) {
      const partner = partners[i];
      for (let j = 0; j < 4; j++) {
        const qrCode = `UBT-2024-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${String(j + 1).padStart(3, '0')}`;
        products.push({
          qrCode,
          partnerId: partner._id,
          batchNumber: `BATCH-2024-${String(i * 4 + j + 1).padStart(3, '0')}`,
          manufacturingDate: today,
          expiryDate: oneYearLater,
          status: 'active',
          condition: 'terkirim',
        });
      }
    }

    await ProductModel.insertMany(products);
    console.log(`✅ Created ${products.length} products\n`);

    // Summary
    console.log('📊 Initialization Summary:');
    console.log(`   Users:    2`);
    console.log(`   Partners: ${partners.length}`);
    console.log(`   Products: ${products.length}`);
    console.log('\n✅ MongoDB initialized successfully! 🎉');
    console.log('\nYou can now login with:');
    console.log('   Admin:    admin / admin123');
    console.log('   Operator: operator / operator123\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Initialization failed:', error);
    process.exit(1);
  }
}

initMongoDB();
