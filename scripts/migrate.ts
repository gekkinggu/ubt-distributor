import fs from 'fs';
import path from 'path';
import connectDB from '../lib/mongodb';
import UserModel from '../models/User';
import PartnerModel from '../models/Partner';
import ProductModel from '../models/Product';

const DATA_DIR = path.join(process.cwd(), 'data');

async function migrate() {
  console.log('🚀 Starting migration from JSON to MongoDB...\n');

  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data (optional - remove if you want to keep existing data)
    console.log('🗑️  Clearing existing MongoDB data...');
    await UserModel.deleteMany({});
    await PartnerModel.deleteMany({});
    await ProductModel.deleteMany({});
    console.log('✅ Cleared existing data\n');

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
        console.log(`✅ Migrated ${usersData.length} users\n`);
      } else {
        console.log('⚠️  No users to migrate\n');
      }
    } else {
      console.log('⚠️  users.json not found\n');
    }

    // Migrate Partners
    console.log('🏥 Migrating partners...');
    const partnersPath = path.join(DATA_DIR, 'partners.json');
    if (fs.existsSync(partnersPath)) {
      const partnersData = JSON.parse(fs.readFileSync(partnersPath, 'utf-8'));
      if (partnersData.length > 0) {
        // Create a map of old IDs to new IDs
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
        console.log(`✅ Migrated ${partnersData.length} partners\n`);

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
            console.log(`✅ Migrated ${productsData.length} products\n`);
          } else {
            console.log('⚠️  No products to migrate\n');
          }
        } else {
          console.log('⚠️  products.json not found\n');
        }
      } else {
        console.log('⚠️  No partners to migrate\n');
      }
    } else {
      console.log('⚠️  partners.json not found\n');
    }

    // Verify migration
    console.log('🔍 Verifying migration...');
    const userCount = await UserModel.countDocuments();
    const partnerCount = await PartnerModel.countDocuments();
    const productCount = await ProductModel.countDocuments();

    console.log(`\n📊 Migration Summary:`);
    console.log(`   Users:    ${userCount}`);
    console.log(`   Partners: ${partnerCount}`);
    console.log(`   Products: ${productCount}`);
    console.log('\n✅ Migration completed successfully! 🎉\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
