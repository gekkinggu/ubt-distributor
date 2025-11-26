// Client-side types (MongoDB documents serialized to plain objects)
export interface User {
  _id: string;
  username: string;
  password: string; // hashed
  role: 'admin' | 'operator';
  createdAt: string;
  updatedAt: string;
}

export interface Partner {
  _id: string;
  name: string;
  address: string;
  province: string;
  phone: string;
  email: string;
  contactPerson: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  qrCode: string; // UUID format: UBT-2024-ABC123-001
  partnerId: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  status: 'active' | 'scanned' | 'recalled';
  condition: 'terkirim' | 'terpakai' | 'rusak';
  scannedAt?: string;
  scannedBy?: string; // user ID
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    role: string;
  };
  message?: string;
}
