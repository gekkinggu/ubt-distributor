import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  qrCode: string;
  partnerId: mongoose.Types.ObjectId;
  batchNumber: string;
  manufacturingDate: Date;
  expiryDate: Date;
  status: 'active' | 'scanned' | 'recalled';
  condition: 'terkirim' | 'terpakai' | 'rusak';
  scannedAt?: Date;
  scannedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    qrCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: 'Partner',
      required: true,
      index: true,
    },
    batchNumber: {
      type: String,
      required: true,
    },
    manufacturingDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'scanned', 'recalled'],
      default: 'active',
    },
    condition: {
      type: String,
      enum: ['terkirim', 'terpakai', 'rusak'],
      default: 'terkirim',
    },
    scannedAt: {
      type: Date,
    },
    scannedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
