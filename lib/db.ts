import connectDB from './mongodb';
import UserModel from '@/models/User';
import PartnerModel from '@/models/Partner';
import ProductModel from '@/models/Product';
import { User, Partner, Product } from '@/types';

// Users CRUD
export const usersDb = {
  getAll: async (): Promise<User[]> => {
    await connectDB();
    const users = await UserModel.find({}).lean();
    return users.map(u => ({
      ...u,
      _id: u._id.toString(),
      createdAt: u.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: u.updatedAt?.toISOString() || new Date().toISOString(),
    }));
  },
  
  getById: async (id: string): Promise<User | null> => {
    await connectDB();
    const user = await UserModel.findById(id).lean();
    if (!user) return null;
    return {
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
    };
  },
  
  getByUsername: async (username: string): Promise<User | null> => {
    await connectDB();
    const user = await UserModel.findOne({ username }).lean();
    if (!user) return null;
    return {
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
    };
  },
  
  create: async (userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    await connectDB();
    const user = await UserModel.create(userData);
    return {
      ...user.toObject(),
      _id: user._id.toString(),
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
    };
  },
  
  update: async (id: string, updates: Partial<User>): Promise<User | null> => {
    await connectDB();
    const user = await UserModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!user) return null;
    return {
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
    };
  },
  
  delete: async (id: string): Promise<boolean> => {
    await connectDB();
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  },
};

// Partners CRUD
export const partnersDb = {
  getAll: async (): Promise<Partner[]> => {
    await connectDB();
    const partners = await PartnerModel.find({}).lean();
    return partners.map(p => ({
      ...p,
      _id: p._id.toString(),
      createdAt: p.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: p.updatedAt?.toISOString() || new Date().toISOString(),
    }));
  },
  
  getById: async (id: string): Promise<Partner | null> => {
    await connectDB();
    const partner = await PartnerModel.findById(id).lean();
    if (!partner) return null;
    return {
      ...partner,
      _id: partner._id.toString(),
      createdAt: partner.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: partner.updatedAt?.toISOString() || new Date().toISOString(),
    };
  },
  
  create: async (partnerData: Omit<Partner, '_id' | 'createdAt' | 'updatedAt'>): Promise<Partner> => {
    await connectDB();
    const partner = await PartnerModel.create(partnerData);
    return {
      ...partner.toObject(),
      _id: partner._id.toString(),
      createdAt: partner.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: partner.updatedAt?.toISOString() || new Date().toISOString(),
    };
  },
  
  update: async (id: string, updates: Partial<Partner>): Promise<Partner | null> => {
    await connectDB();
    const partner = await PartnerModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!partner) return null;
    return {
      ...partner,
      _id: partner._id.toString(),
      createdAt: partner.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: partner.updatedAt?.toISOString() || new Date().toISOString(),
    };
  },
  
  delete: async (id: string): Promise<boolean> => {
    await connectDB();
    // Delete all associated products first
    await ProductModel.deleteMany({ partnerId: id });
    const result = await PartnerModel.findByIdAndDelete(id);
    return !!result;
  },
};

// Products CRUD
export const productsDb = {
  getAll: async (): Promise<Product[]> => {
    await connectDB();
    const products = await ProductModel.find({}).lean();
    return products.map(p => ({
      ...p,
      _id: p._id.toString(),
      partnerId: p.partnerId.toString(),
      manufacturingDate: p.manufacturingDate.toISOString(),
      expiryDate: p.expiryDate.toISOString(),
      scannedAt: p.scannedAt?.toISOString(),
      createdAt: p.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: p.updatedAt?.toISOString() || new Date().toISOString(),
    }));
  },
  
  getById: async (id: string): Promise<Product | null> => {
    await connectDB();
    const product = await ProductModel.findById(id).lean();
    if (!product) return null;
    return {
      ...product,
      _id: product._id.toString(),
      partnerId: product.partnerId.toString(),
      manufacturingDate: product.manufacturingDate.toISOString(),
      expiryDate: product.expiryDate.toISOString(),
      scannedAt: product.scannedAt?.toISOString(),
      createdAt: product.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: product.updatedAt?.toISOString() || new Date().toISOString(),
    };
  },
  
  getByQRCode: async (qrCode: string): Promise<Product | null> => {
    await connectDB();
    const product = await ProductModel.findOne({ qrCode }).lean();
    if (!product) return null;
    return {
      ...product,
      _id: product._id.toString(),
      partnerId: product.partnerId.toString(),
      manufacturingDate: product.manufacturingDate.toISOString(),
      expiryDate: product.expiryDate.toISOString(),
      scannedAt: product.scannedAt?.toISOString(),
      createdAt: product.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: product.updatedAt?.toISOString() || new Date().toISOString(),
    };
  },
  
  getByPartnerId: async (partnerId: string): Promise<Product[]> => {
    await connectDB();
    const products = await ProductModel.find({ partnerId }).lean();
    return products.map(p => ({
      ...p,
      _id: p._id.toString(),
      partnerId: p.partnerId.toString(),
      manufacturingDate: p.manufacturingDate.toISOString(),
      expiryDate: p.expiryDate.toISOString(),
      scannedAt: p.scannedAt?.toISOString(),
      createdAt: p.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: p.updatedAt?.toISOString() || new Date().toISOString(),
    }));
  },
  
  create: async (productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    await connectDB();
    const product = await ProductModel.create({
      ...productData,
      manufacturingDate: new Date(productData.manufacturingDate),
      expiryDate: new Date(productData.expiryDate),
      scannedAt: productData.scannedAt ? new Date(productData.scannedAt) : undefined,
    });
    return {
      ...product.toObject(),
      _id: product._id.toString(),
      partnerId: product.partnerId.toString(),
      manufacturingDate: product.manufacturingDate.toISOString(),
      expiryDate: product.expiryDate.toISOString(),
      scannedAt: product.scannedAt?.toISOString(),
      createdAt: product.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: product.updatedAt?.toISOString() || new Date().toISOString(),
    };
  },
  
  update: async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    await connectDB();
    const updateData: any = { ...updates };
    if (updates.manufacturingDate) updateData.manufacturingDate = new Date(updates.manufacturingDate);
    if (updates.expiryDate) updateData.expiryDate = new Date(updates.expiryDate);
    if (updates.scannedAt) updateData.scannedAt = new Date(updates.scannedAt);
    
    const product = await ProductModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!product) return null;
    return {
      ...product,
      _id: product._id.toString(),
      partnerId: product.partnerId.toString(),
      manufacturingDate: product.manufacturingDate.toISOString(),
      expiryDate: product.expiryDate.toISOString(),
      scannedAt: product.scannedAt?.toISOString(),
      createdAt: product.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: product.updatedAt?.toISOString() || new Date().toISOString(),
    };
  },
  
  delete: async (id: string): Promise<boolean> => {
    await connectDB();
    const result = await ProductModel.findByIdAndDelete(id);
    return !!result;
  },
};
