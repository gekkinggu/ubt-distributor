import { hashPassword } from './auth';
import { usersDb, partnersDb, productsDb } from './db';
import { generateUserId, generatePartnerId, generateProductId, generateQRCode, getCurrentDate } from './utils';
import { User, Partner, Product } from '@/types';

export async function initializeSampleData() {
  // Check if data already exists
  const existingUsers = usersDb.getAll();
  if (existingUsers.length > 0) {
    console.log('Sample data already exists');
    return;
  }

  // Create default users
  const adminPassword = await hashPassword('admin123');
  const operatorPassword = await hashPassword('operator123');

  const adminUser: User = {
    _id: generateUserId(),
    username: 'admin',
    password: adminPassword,
    role: 'admin',
    createdAt: getCurrentDate(),
  };

  const operatorUser: User = {
    _id: generateUserId(),
    username: 'operator',
    password: operatorPassword,
    role: 'operator',
    createdAt: getCurrentDate(),
  };

  usersDb.create(adminUser);
  usersDb.create(operatorUser);

  // Create sample partners
  const partner1: Partner = {
    _id: generatePartnerId(),
    name: 'RS Cipto Mangunkusumo',
    province: 'DKI Jakarta',
    products: [],
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  };

  const partner2: Partner = {
    _id: generatePartnerId(),
    name: 'RS Sardjito',
    province: 'DI Yogyakarta',
    products: [],
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  };

  const partner3: Partner = {
    _id: generatePartnerId(),
    name: 'RS Hasan Sadikin',
    province: 'Jawa Barat',
    products: [],
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  };

  partnersDb.create(partner1);
  partnersDb.create(partner2);
  partnersDb.create(partner3);

  // Create sample products for each partner
  const now = new Date();
  const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  // Partner 1 products (4 items)
  for (let i = 1; i <= 4; i++) {
    const product: Product = {
      _id: generateProductId(),
      qrCode: generateQRCode(),
      partnerId: partner1._id,
      batchNumber: `BATCH-2024-${String(i).padStart(3, '0')}`,
      manufacturingDate: now.toISOString().split('T')[0],
      expiryDate: oneYearLater.toISOString().split('T')[0],
      status: 'active',
      condition: 'terkirim',
      createdAt: getCurrentDate(),
    };
    productsDb.create(product);
  }

  // Partner 2 products (5 items)
  for (let i = 1; i <= 5; i++) {
    const product: Product = {
      _id: generateProductId(),
      qrCode: generateQRCode(),
      partnerId: partner2._id,
      batchNumber: `BATCH-2024-${String(i + 4).padStart(3, '0')}`,
      manufacturingDate: now.toISOString().split('T')[0],
      expiryDate: oneYearLater.toISOString().split('T')[0],
      status: 'active',
      condition: 'terkirim',
      createdAt: getCurrentDate(),
    };
    productsDb.create(product);
  }

  // Partner 3 products (3 items)
  for (let i = 1; i <= 3; i++) {
    const product: Product = {
      _id: generateProductId(),
      qrCode: generateQRCode(),
      partnerId: partner3._id,
      batchNumber: `BATCH-2024-${String(i + 9).padStart(3, '0')}`,
      manufacturingDate: now.toISOString().split('T')[0],
      expiryDate: oneYearLater.toISOString().split('T')[0],
      status: 'active',
      condition: 'terkirim',
      createdAt: getCurrentDate(),
    };
    productsDb.create(product);
  }

  console.log('Sample data initialized successfully');
  console.log('Admin credentials: username=admin, password=admin123');
  console.log('Operator credentials: username=operator, password=operator123');
}
